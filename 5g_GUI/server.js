import express from 'express';
import cors from 'cors';
import { Client } from 'ssh2';
import bodyParser from 'body-parser';
import vmConfig from './vmConfig.js';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import { createUserTable } from './models/userModel.js'; // Use named import
import fs from 'fs';
const app = express();
const PORT = vmConfig.server_port;
const sshhost = vmConfig.ssh_host;
const AppPort = vmConfig.app_port;

// Connect to the database and ensure user table is created
(async () => {
    try {
        const client = await connectDB();
        await createUserTable(client);  // Ensure user table exists
        client.end();
    } catch (err) {
        console.error('Database initialization error:', err);
        process.exit(1);  // Exit the app if DB setup fails
    }
})();

// Middleware
app.use(cors({
    origin: [`http://localhost:${AppPort}`,`http://${sshhost}:${AppPort}`], // Allow requests from your React app
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
}));

app.use(bodyParser.json()); // Parse incoming request bodies
app.use(express.json());    // Alternative JSON parsing

// Routes
app.use('/api/auth', authRoutes); // Use consistent route for auth

const privateKey = fs.readFileSync(vmConfig.privateKeyPath, 'utf8');




app.post('/git-clone', (req, res) => {
    const conn = new Client();
    const privateKeyPath = vmConfig.privateKeyPath;

    // Check if the private key is being read correctly
    let privateKey;
    try {
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        console.log(`Private Key loaded successfully from: ${privateKeyPath}`);
    } catch (err) {
        console.error(`Error reading private key: ${err.message}`);
        return res.status(500).send({ message: `Error reading private key: ${err.message}` });
    }

    conn.on('ready', () => {
        console.log('SSH Connection Established.');
	
        
	const repoUrl = 'https://${process.env.GITHUB_TOKEN}@github.com/b-yond-infinite-network/laas-5gsa-k8s.git';
        const targetDirectory = 'laas-5gsa-k8s';
        const command = `
            rm -rf ${targetDirectory} &&
            git clone ${repoUrl} ${targetDirectory}
        `;

        console.log(`Executing command: ${command}`);
        conn.exec(command, { pty: true }, (err, stream) => {
            if (err) {
                console.error(`SSH Command Error: ${err.message}`);
                conn.end();
                return res.status(500).send({ message: `SSH Command Error: ${err.message}` });
            }

            let output = '', errorOutput = '';

            stream.on('data', (data) => {
                console.log(data.toString());
                output += data.toString();
            });

            stream.stderr.on('data', (data) => {
                console.error(data.toString());
                errorOutput += data.toString();
            });

            stream.on('close', (code) => {
                console.log(`Git clone completed with exit code: ${code}`);
                conn.end();

                if (code === 0) {
                    res.status(200).send({ success: true, message: 'Repository cloned successfully.', output });
                } else {
                    res.status(500).send({ success: false, message: 'Git clone failed.', output, errorOutput });
                }
            });
        });
    });

    conn.on('error', (err) => {
        console.error(`SSH Connection Error: ${err.message}`);
        res.status(500).send({ message: `SSH Connection Error: ${err.message}` });
    });

    // Establish SSH connection with the correct private key usage
    conn.connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey: privateKey, // Corrected key loading
        debug: (info) => console.log('SSH Debug:', info), // Enable SSH debugging
    });
});

// Helper function to list folders
const listFolders = (conn, callback) => {
    const command = `ls -d ${vmConfig.baseLocation}/laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case/*/`;
    conn.exec(command, (err, stream) => {
        if (err) return callback(err);

        let output = '';
        let errorOutput = '';

        stream.on('close', (code) => {
            if (code === 0) {
                const folderNames = output.split('\n').filter(line => line.trim() !== '').map(line => line.trim());
                callback(null, folderNames);
            } else {
                callback(new Error(errorOutput || 'Failed to list folders'));
            }
        }).on('data', (data) => {
            output += data.toString();
        }).stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
    });
};

// Route to list folders
app.get('/list-folders', (req, res) => {
    const conn = new Client();

    conn.on('ready', () => {
        listFolders(conn, (err, folderNames) => {
            if (err) return res.status(500).json({ message: `SSH Command Error: ${err.message}` });
            conn.end();
            res.json({ success: true, folders: folderNames });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });

    conn.on('error', (err) => res.status(500).json({ message: `SSH Connection Error: ${err.message}` }));
});


// Route to list .tar.gz files
const formatFileSize = (sizeInBytes) => {
    const units = ["B", "K", "M", "G", "T"];
    let unitIndex = 0;
    let size = sizeInBytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
};

// Helper function to format date as "YYYY-MM-DD HH:mm:ss"
function formatReadableDate(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('en-GB', options).replace(",", ""); // Change locale if needed
}

app.get('/list-tar-gz-files', (req, res) => {
    const conn = new Client();

    conn.on('ready', () => {
        conn.sftp((err, sftp) => {
            if (err) {
                conn.end();
                return res.status(500).json({ message: `SFTP Error: ${err.message}` });
            }

            const dirPath = '/home/ubuntu/laas-5gsa-k8s/SCRIPTS/Common';
            sftp.readdir(dirPath, (err, list) => {
                if (err) {
                    conn.end();
                    return res.status(500).json({ message: `Directory Read Error: ${err.message}` });
                }

                const files = list
                    .filter(file => file.filename.endsWith('.tar.gz'))
                    .map(file => ({
                        name: file.filename,
                        size: formatFileSize(file.attrs.size),
                        mtime: file.attrs.mtime, // Keep raw mtime for sorting
                        lastModified: formatReadableDate(new Date(file.attrs.mtime * 1000)) // Format for display
                    }))
                    .sort((a, b) => b.mtime - a.mtime); // Sort by mtime in descending order

                conn.end();
                res.json({ success: true, files });
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });
});








// Route to run a script with output streaming to client
app.post('/run-script', (req, res) => {
    const { scriptName, scriptLocation } = req.body;

    if (!scriptName || !scriptLocation) {
        return res.status(400).send({ message: 'Script name and location are required' });
    }

    const conn = new Client();

    conn.on('ready', () => {
        const command = `cd ${vmConfig.baseLocation}/${scriptLocation} && ${scriptName}`; // Fixed command syntax

        // Log the command
        console.log(`Executing script on VM: ${command}`);

        conn.exec(command, { pty: true }, (err, stream) => {
            if (err) {
                console.error(`SSH Command Error: ${err.message}`);
                conn.end();
                return res.status(500).send({ message: `SSH Command Error: ${err.message}` });
            }

            let output = '', errorOutput = '';

            stream.on('data', (data) => {
                console.log(data.toString());
                output += data.toString();
            });

            stream.stderr.on('data', (data) => {
                console.error(data.toString());
                errorOutput += data.toString();
            });

            stream.on('close', (code) => {
                console.log(`Script execution completed with code: ${code}`);
                conn.end();

                if (code === 0) {
                    res.status(200).send({ output });
                } else {
                    res.status(500).send({ output, errorOutput });
                }
            });
        });
    });

    conn.on('error', (err) => {
        console.error(`SSH Connection Error: ${err.message}`);
        res.status(500).send({ message: `SSH Connection Error: ${err.message}` });
    });

    conn.connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });
});

// Route to create UEs
app.post('/create-ues', (req, res) => {
    const { numberOfUsers } = req.body;

    const conn = new Client();

    conn.on('ready', () => {
        const command = `cd ${vmConfig.baseLocation}/laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case && echo ${numberOfUsers} | ./ue_create.sh`; // Corrected command syntax
        conn.exec(command, (err, stream) => {
            if (err) {
                return res.status(500).json({ message: `SSH Command Error: ${err.message}` }); // Removed extra closing brace
            }

            let output = '', errorOutput = '';

            stream.on('close', (code) => {
                conn.end();
                res.json({ success: true, message: 'UEs creation command executed', output, errorOutput });
            }).on('data', (data) => {
                output += data.toString();
            }).stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });

    conn.on('error', (err) => {
        console.error(`SSH Connection Error: ${err.message}`);
        res.status(500).send({ message: `SSH Connection Error: ${err.message}` });
    });
});
// Route to create UEs
app.post('/create-ues', (req, res) => {
    const { numberOfUsers } = req.body;

    const conn = new Client();

    conn.on('ready', () => {
        conn.exec(`cd laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case && echo ${numberOfUsers} | ./ue_create.sh`, (err, stream) => {
            if (err) return res.status(500).json({ message: `SSH Command Error: ${err.message}` });

            let output = '', errorOutput = '';

            stream.on('close', (code) => {
                conn.end();
                res.json({ success: true, message: 'UEs creation command executed', output, errorOutput });
            }).on('data', (data) => {
                output += data.toString();
            }).stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });
});
app.post('/delete-ue', (req, res) => {
    const { ueCode } = req.body;
    if (!ueCode) return res.status(400).json({ message: 'UE code is required' });

    const conn = new Client();
    const removeUEFromMongo = `minikube kubectl -- exec mongodb-0 -- /CLI remove ${ueCode}`;
    const removeUEFolder = `rm -rf ue${ueCode}/`;
    const removeUEFiles = `rm -rf *_ue.sh`;
    const changeDir = `cd ${vmConfig.baseLocation}/laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case && `;

    let combinedOutput = ''; // Capture combined output from all commands

    conn.on('ready', () => {
        console.log('SSH Connection established');

        // Log the command being executed
        console.log(`Executing command: ${removeUEFromMongo}`);

        // First command: remove UE from MongoDB
        conn.exec(removeUEFromMongo, (err, stream) => {
            if (err) {
                console.error('Error executing removeUEFromMongo:', err);
                return res.status(500).json({ message: `SSH Command Error: ${err.message}`, output: combinedOutput });
            }

            stream.on('close', (code, signal) => {
                console.log(`MongoDB removal stream closed with code: ${code}, signal: ${signal}`);
                if (code !== 0) {
                    console.error('Failed to remove UE from MongoDB, exit code:', code);
                    return res.status(500).json({ message: 'Failed to remove UE from MongoDB', output: combinedOutput });
                }

                console.log('Successfully removed UE from MongoDB, proceeding to remove UE folder');

                // Proceed with folder and file deletion commands
                conn.exec(changeDir + removeUEFolder, (err2, stream2) => {
                    if (err2) {
                        console.error('Error executing removeUEFolder:', err2);
                        return res.status(500).json({ message: `SSH Command Error: ${err2.message}`, output: combinedOutput });
                    }

                    stream2.on('data', (data) => {
                        const output = data.toString();
                        combinedOutput += output; // Append the output
                        console.log(`Folder Removal Output: ${output}`);
                    });

                    stream2.stderr.on('data', (data) => {
                        const errorOutput = data.toString();
                        combinedOutput += errorOutput; // Append error output
                        console.error(`Folder Removal Error: ${errorOutput}`);
                    });

                    stream2.on('close', (code2, signal2) => {
                        console.log(`Folder removal stream closed with code: ${code2}, signal: ${signal2}`);
                        if (code2 !== 0) {
                            console.error('Failed to remove UE folder, exit code:', code2);
                            return res.status(500).json({ message: 'Failed to remove UE folder', output: combinedOutput });
                        }

                        console.log('Successfully removed UE folder, proceeding to remove UE files');

                        conn.exec(changeDir + removeUEFiles, (err3, stream3) => {
                            if (err3) {
                                console.error('Error executing removeUEFiles:', err3);
                                return res.status(500).json({ message: `SSH Command Error: ${err3.message}`, output: combinedOutput });
                            }

                            stream3.on('data', (data) => {
                                const output = data.toString();
                                combinedOutput += output; // Append the output
                                console.log(`File Removal Output: ${output}`);
                            });

                            stream3.stderr.on('data', (data) => {
                                const errorOutput = data.toString();
                                combinedOutput += errorOutput; // Append error output
                                console.error(`File Removal Error: ${errorOutput}`);
                            });

                            stream3.on('close', (code3, signal3) => {
                                console.log(`File removal stream closed with code: ${code3}, signal: ${signal3}`);
                                if (code3 !== 0) {
                                    console.error('Failed to remove UE files, exit code:', code3);
                                    return res.status(500).json({ message: 'Failed to remove UE files', output: combinedOutput });
                                }

                                console.log('Successfully removed UE files, listing remaining folders');

                                // Optionally list folders after deletion
                                listFolders(conn, (err4, folderNames) => {
                                    conn.end(); // Close the SSH connection
                                    if (err4) {
                                        console.error('Failed to list folders after deletion:', err4);
                                        return res.status(500).json({ message: `Failed to list folders after deletion: ${err4.message}`, output: combinedOutput });
                                    }
                                    res.json({
                                        success: true,
                                        message: `UE ${ueCode} deleted successfully.`,
                                        folders: folderNames,
                                        output: combinedOutput
                                    });
                                });
                            });
                        });
                    });
                });
            });

            stream.on('data', (data) => {
                const output = data.toString();
                combinedOutput += output; // Append the output
                console.log(`MongoDB Removal Output: ${output}`);
            });

            stream.stderr.on('data', (data) => {
                const errorOutput = data.toString();
                combinedOutput += errorOutput; // Append error output
                console.error(`MongoDB Removal Error: ${errorOutput}`);
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });
});

app.post('/detach-ue', (req, res) => {
    const { ueCode } = req.body;
    if (!ueCode) return res.status(400).json({ message: 'UE code is required' });

    const conn = new Client();
    const prefixedUECode = `ue${ueCode}`;
    const deleteDeployment = `minikube kubectl -- delete deployment ueransim-${prefixedUECode}`;
    const deleteConfigMap = `minikube kubectl -- delete cm ${prefixedUECode}-configmap`;
    const changeDir = `cd ${vmConfig.baseLocation}/laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case && `;

    let combinedOutput = ''; // Capture combined output from all commands

    conn.on('ready', () => {
        console.log('SSH Connection established');

        // Log the command being executed for deletion of deployment
        console.log(`Executing command: ${deleteDeployment}`);

        // First command: delete deployment
        conn.exec(changeDir + deleteDeployment, (err, stream) => {
            if (err) {
                console.error('Error executing deleteDeployment:', err);
                return res.status(500).json({ message: `SSH Command Error: ${err.message}`, output: combinedOutput });
            }

            stream.on('data', (data) => {
                const output = data.toString();
                combinedOutput += output; // Append the output
                console.log(`Deployment Deletion Output: ${output}`);
            });

            stream.stderr.on('data', (data) => {
                const errorOutput = data.toString();
                combinedOutput += errorOutput; // Append error output
                console.error(`Deployment Deletion Error: ${errorOutput}`);
            });

            stream.on('close', (code, signal) => {
                console.log(`Deployment deletion stream closed with code: ${code}, signal: ${signal}`);
                if (code !== 0) {
                    console.error('Failed to delete deployment, exit code:', code);
                    return res.status(500).json({ message: 'Failed to delete deployment', output: combinedOutput });
                }

                console.log('Successfully deleted deployment, proceeding to delete config map');

                // Proceed with config map deletion
                conn.exec(changeDir + deleteConfigMap, (err2, stream2) => {
                    if (err2) {
                        console.error('Error executing deleteConfigMap:', err2);
                        return res.status(500).json({ message: `SSH Command Error: ${err2.message}`, output: combinedOutput });
                    }

                    stream2.on('data', (data) => {
                        const output = data.toString();
                        combinedOutput += output; // Append the output
                        console.log(`ConfigMap Deletion Output: ${output}`);
                    });

                    stream2.stderr.on('data', (data) => {
                        const errorOutput = data.toString();
                        combinedOutput += errorOutput; // Append error output
                        console.error(`ConfigMap Deletion Error: ${errorOutput}`);
                    });

                    stream2.on('close', (code2, signal2) => {
                        console.log(`ConfigMap deletion stream closed with code: ${code2}, signal: ${signal2}`);
                        conn.end(); // Close the connection after all commands are done

                        if (code2 === 0) {
                            res.json({
                                success: true,
                                message: `UE ${ueCode} detached successfully.`,
                                output: combinedOutput
                            });
                        } else {
                            console.error('Failed to delete config map, exit code:', code2);
                            res.status(500).json({ message: 'Failed to delete config map', output: combinedOutput });
                        }
                    });
                });
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });
});
app.post('/traffic-ue', (req, res) => {
    const conn = new Client();

    // Path to the traffic script on the remote VM
    const scriptPath = 'cd /home/ubuntu/5g_lab/src/components/ && ./traffic_ue.sh';

    conn.on('ready', () => {
        console.log('SSH Connection established');

        // Command to execute the traffic script
        const runScriptCommand = `${scriptPath}`;

        conn.exec(runScriptCommand, (err, stream) => {
            if (err) {
                console.error('Error executing traffic script:', err);
                return res.status(500).json({ message: `SSH Command Error: ${err.message}` });
            }

            let combinedOutput = '';

            stream.on('data', (data) => {
                const output = data.toString();
                combinedOutput += output; // Append the output
                console.log(`Traffic Script Output: ${output}`);
            });

            stream.stderr.on('data', (data) => {
                const errorOutput = data.toString();
                combinedOutput += errorOutput; // Append error output
                console.error(`Traffic Script Error: ${errorOutput}`);
            });

            stream.on('close', (code) => {
                console.log(`Traffic script stream closed with code: ${code}`);
                conn.end(); // Close the SSH connection

                if (code === 0) {
                    res.json({
                        success: true,
                        message: 'Traffic script executed successfully.',
                        output: combinedOutput
                    });
                } else {
                    console.error('Failed to execute traffic script, exit code:', code);
                    res.status(500).json({ message: 'Failed to execute traffic script', output: combinedOutput });
                }
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey: privateKey
    });
});



app.post('/attach-ue', (req, res) => {
    const { ueCode } = req.body;
    if (!ueCode) return res.status(400).json({ message: 'UE code is required' });

    const conn = new Client();
    const prefixedUECode = `ue${ueCode}`;
    const changeDir = `cd ${vmConfig.baseLocation}/laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case && `;

    const createConfigMap = `minikube kubectl -- create configmap ${prefixedUECode}-configmap --from-file=${prefixedUECode}/${prefixedUECode}.yaml --from-file=${prefixedUECode}/wrapper.sh`;
    const applyDeployment = `minikube kubectl -- apply -f ${prefixedUECode}/ue-deployment.yaml`;

    conn.on('ready', () => {
        console.log('SSH Connection established');

        // Execute the commands sequentially
        const combinedCommand = `${changeDir}${createConfigMap} && ${applyDeployment}`;
        console.log(`Executing command: ${combinedCommand}`);

        conn.exec(combinedCommand, (err, stream) => {
            if (err) {
                console.error('Error executing commands:', err);
                return res.status(500).json({ message: `SSH Command Error: ${err.message}` });
            }

            let combinedOutput = '';

            // Capture output data
            stream.on('data', (data) => {
                const output = data.toString().trim();
                combinedOutput += output + '\n';
                console.log(`Command Output: ${output}`);
            });

            // Capture error data
            stream.stderr.on('data', (data) => {
                const errorOutput = data.toString().trim();
                combinedOutput += errorOutput + '\n';
                console.error(`Command Error: ${errorOutput}`);
            });

            stream.on('close', (code) => {
                console.log(`Command stream closed with code: ${code}`);
                conn.end();

                // Return combined output regardless of success or failure
                res.json({ message: `UE attachment attempted for ${ueCode}.`, output: combinedOutput });
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey: privateKey
    });
});

app.get('/download/:fileName', (req, res) => {
    const conn = new Client();
    const fileName = req.params.fileName;
    const remoteFilePath = `/home/ubuntu/laas-5gsa-k8s/SCRIPTS/Common/${fileName}`; // Adjust path as needed

    conn.on('ready', () => {
        conn.sftp((err, sftp) => {
            if (err) {
                conn.end();
                return res.status(500).json({ message: `SFTP Error: ${err.message}` });
            }

            // Open a read stream for the remote file
            const readStream = sftp.createReadStream(remoteFilePath);

            // Set headers to prompt download in the browser
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Type', 'application/octet-stream');

            // Pipe the read stream to the response
            readStream.pipe(res);

            // Close the connection when the download is done
            readStream.on('close', () => {
                conn.end();
            });

            // Handle errors in the stream
            readStream.on('error', (err) => {
                conn.end();
                res.status(500).json({ message: `File Download Error: ${err.message}` });
            });
        });
    }).connect({
        host: vmConfig.host,
        port: vmConfig.port,
        username: vmConfig.username,
        privateKey
    });
});


// Root route to indicate the server is running
app.get('/', (req, res) => {
    res.send('Backend Server is Running');
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

        
});
