#!/bin/bash

echo "======================================="
echo "   LaaS GUI Setup Script (LOCAL GUI)   "
echo "======================================="

# Step 0: Ensure script is run from LOCAL_GUI directory
cd "$(dirname "$0")"

# Step 1: Update and install dependencies
echo -e "\nInstalling system dependencies..."
sudo apt update && sudo apt install -y curl git openssh-server postgresql postgresql-contrib

# Install compatible Node.js (v18 LTS)
echo -e "\nInstalling Node.js v18.x ..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Step 2: Generate SSH key (no passphrase)
echo -e "\nGenerating SSH key..."
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

# Step 3: Enable key-based auth for localhost
echo -e "\nConfiguring SSH for localhost access..."
cat ~/.ssh/id_rsa.pub | sudo tee -a /root/.ssh/authorized_keys > /dev/null
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
sudo systemctl enable ssh
sudo systemctl start ssh

# Step 4: Configure PostgreSQL
echo -e "\nSetting up PostgreSQL user and database..."
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'anthony') THEN CREATE USER anthony WITH PASSWORD 'LaaS_GUI_2024'; END IF; END \$\$;"
sudo -u postgres psql -c "SELECT 'CREATE DATABASE laas_gui WITH OWNER anthony' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'laas_gui')\\gexec"
sudo sed -i 's/^#port = 5432/port = 8080/' /etc/postgresql/*/main/postgresql.conf
echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Step 5: Install backend dependencies
echo -e "\nInstalling backend dependencies..."
cd ~/LOCAL_GUI/5g_GUI
npm install || echo "❌ Failed to install NPM packages. Please check your internet connection."

# Step 6: Launch services with PM2
echo -e "\nStarting services using PM2..."
pm2 start server.js --name 5g_backend --update-env
pm2 start "npm run dev" --name 5g_frontend
pm2 save
pm2 startup systemd -u $USER --hp $HOME

echo -e "\n✅ LaaS GUI setup complete!"
echo "Frontend: http://localhost:8200"
echo "Backend API: http://localhost:8500"
