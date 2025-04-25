# LOCAL_GUI Setup

This project provides a ready-to-run local version of the 5G Lab GUI. It includes everything needed to clone, configure, and launch the full stack (frontend and backend) locally on a VirtualBox Ubuntu VM.

---

## ⚙️ Prerequisites


Before you begin, make sure you have:

- A VirtualBox VM running Ubuntu 22.04 LTS
- Port forwarding set up in your VM's network config:

  
![image](https://github.com/user-attachments/assets/9ae0be13-8440-4a31-888d-6eadd1a09746)



## 📥 How to Install

### 1. Clone the Repository

```bash
git clone https://github.com/b-yond-infinite-network/LOCAL_GUI.git
cd LOCAL_GUI


2. Run the Setup Script

chmod +x setup.sh
./setup.sh


This will:

Install dependencies (Node.js, PM2, PostgreSQL, etc.)

Set up SSH keys for local operations

Copy configuration files

Start the backend and frontend using PM2

🔐 SSH Authentication
During setup, the script will:

Generate an SSH key pair (if not already present)

Ensure it is usable without a password prompt

Apply correct permissions (600)

Register the key for internal use

🛠️ Default Credentials
Username	Password
ubuntu	123456 (or as configured in your VM)
🚀 Access the GUI
Frontend: http://localhost:8200

Backend API: http://localhost:8500

📂 Directory Structure

LOCAL_GUI/
├── 5g_GUI/               # The full application code
├── setup.sh              # Script to initialize everything
├── README.md             # This file


 Troubleshooting
SSH Authentication Issues?

Ensure your private key is present and has correct permissions:

chmod 600 ~/.ssh/id_rsa
chown ubuntu:ubuntu ~/.ssh/id_rsa


You should not be prompted for a password.

PostgreSQL Errors?
Ensure PostgreSQL is listening on port 8080

Check that your .env or vmConfig.js points to:

host: 127.0.0.1
port: 5432

📬 Need Help?
If anything breaks, feel free to:

Open an issue in the repository

Contact the lab maintainer

💡 Notes
The setup is optimized for a local-only VM setup.

If port conflicts occur, adjust server_port, app_port, and db_port in vmConfig.js.
