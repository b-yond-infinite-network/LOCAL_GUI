#!/bin/bash

echo "======================================="
echo "   LaaS GUI Setup Script (LOCAL GUI)   "
echo "======================================="

# Step 1: Update and install dependencies
sudo apt update && sudo apt install -y curl git openssh-server nodejs npm postgresql postgresql-contrib

# Step 2: Generate SSH key (no passphrase)
echo -e "\nGenerating SSH key..."
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# Step 3: Enable key-based auth for localhost
echo -e "\nSetting up authorized keys for localhost SSH access..."
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
sudo systemctl enable ssh
sudo systemctl start ssh

# Step 4: Setup PostgreSQL
echo -e "\nSetting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER anthony WITH PASSWORD 'LaaS_GUI_2024';"
sudo -u postgres psql -c "CREATE DATABASE laas_gui OWNER anthony;"
sudo sed -i 's/#port = 5432/port = 8080/' /etc/postgresql/*/main/postgresql.conf
echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Step 5: Install pm2
sudo npm install -g pm2

# Step 6: Install backend dependencies
cd ~/LOCAL_GUI/5g_GUI
npm install

# Step
