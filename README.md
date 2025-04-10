# LOCAL_GUI

This project contains the complete configuration and setup of the LaaS 5G GUI environment that runs locally on a VM. It includes the backend, frontend, and automated SSH key generation to ensure a smooth installation experience with zero manual configuration.

---

## 🧰 Prerequisites

Before you begin, ensure:

- You're using a **VirtualBox VM running Ubuntu 22.04** or similar.
- Your VM has internet access.
- You’ve configured the following **port forwarding rules** in VirtualBox:

| Name         | Protocol | Host Port | Guest Port |
|--------------|----------|-----------|-------------|
| SSH          | TCP      | 2222      | 22          |
| React Frontend | TCP      | 8200      | 8200        |
| Node Backend | TCP      | 8500      | 8500        |
| PostgreSQL   | TCP      | 8080      | 8080        |

You can configure port forwarding from **Settings > Network > Advanced > Port Forwarding** in VirtualBox.

---

## ⚙️ Installation Steps

### 1. Clone the Repository

From your VM terminal:

```bash
git clone https://github.com/b-yond-infinite-network/LOCAL_GUI.git
cd LOCAL_GUI

2. Run the Setup Script
bash
Copy
Edit
chmod +x setup.sh
./setup.sh
This will:

Install dependencies (Node.js, PM2, PostgreSQL, etc.)

Set up SSH keys for local operations

Copy configuration files

Start the backend and frontend using PM2

🛠️ Default Credentials
Username	Password
ubuntu	123456 (or as configured in your VM)
🚀 Access the GUI
After setup:

Frontend: http://localhost:8200

Backend API: http://localhost:8500

📂 Directory Structure
bash
Copy
Edit
LOCAL_GUI/
├── 5g_GUI/               # The full application code
├── setup.sh              # Script to initialize everything
├── README.md             # This file
🧪 Troubleshooting
If you see errors related to SSH authentication, make sure:

You’re not prompted for passwords (key is auto-configured).

SSH key permissions are 600 and owned by ubuntu.

PostgreSQL connection issues?

Make sure the database is listening on port 8080.

Check the .env or config files if needed.


