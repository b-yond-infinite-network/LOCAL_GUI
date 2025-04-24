const vmConfig = {
    host: '127.0.0.1',
    port: 22,
    username: 'ubuntu',
    privateKeyPath: '/home/ubuntu/.ssh/id_rsa',  // Pre-generated key
    baseLocation: '/home/ubuntu',
    httpsPrivateKey: '/home/ubuntu/5g_lab/ssh/Laas-Key/key.pem',
    httpsPrivateCert: '/home/ubuntu/5g_lab/ssh/Laas-Key/cert.pem',
    httpsPort: 8443,
    ssh_host: '127.0.0.1',
    server_port: '8500',
    app_port: '8200'
};

console.log(`Using key-based authentication. Key path: ${vmConfig.privateKeyPath}`);
export default vmConfig;
