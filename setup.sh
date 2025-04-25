#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

echo "======================================="
echo "   LaaS GUI Setup Script (LOCAL GUI)   "
echo "======================================="

# Step 0: Run from LOCAL_GUI directory
cd "$(dirname "$0")"

# Step 0.5: Ensure user has passwordless sudo
echo -e "\n🛠️ Enabling passwordless sudo for user $USER..."
echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$USER > /dev/null
sudo chmod 440 /etc/sudoers.d/$USER

# Step 1: Install required packages
echo -e "\n📦 Installing system dependencies..."
sudo apt update && sudo apt install -y curl git openssh-server postgresql postgresql-contrib

# Step 2: Install Node.js v18 and PM2
echo -e "\n📦 Installing Node.js v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Step 3: SSH key setup
echo -e "\n🔐 Generating SSH key..."
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

echo -e "\n🔐 Setting up authorized_keys for local access..."
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
sudo systemctl enable ssh
sudo systemctl start ssh

# Step 4: Configure PostgreSQL (default port 5432)
echo -e "\n🗄️ Configuring PostgreSQL..."

# Create user if not exists
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anthony') THEN CREATE USER anthony WITH PASSWORD 'LaaS_GUI_2024'; END IF; END \$\$;"

# Create database if not exists
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'laas_gui'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE laas_gui OWNER anthony;"

# Enable access
echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Step 5: Install backend dependencies
echo -e "\n📦 Installing backend dependencies..."
cd ~/LOCAL_GUI/5g_GUI
npm install || echo "❌ Failed to install NPM packages. Check your network connection."

# Step 6: Start backend and frontend with PM2
echo -e "\n🚀 Starting services with PM2..."
pm2 start server.js --name 5g_backend --update-env
pm2 start "npm run dev" --name 5g_frontend
pm2 save
pm2 startup systemd -u $USER --hp $HOME

echo -e "\n✅ LaaS GUI setup complete!"
echo "Frontend: http://localhost:8200"
echo "Backend API: http://localhost:8500"
