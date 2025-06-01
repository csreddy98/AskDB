# Deployment Setup Guide

This document explains how to set up the GitHub workflow for automatic deployment to your SSH server.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings:

### Go to: Repository → Settings → Secrets and variables → Actions

1. **SSH_HOST** - Your server's IP address or domain name
   ```
   Example: 192.168.1.100 or yourserver.com
   ```

2. **SSH_USERNAME** - Username for SSH connection
   ```
   Example: ubuntu, root, or your-username
   ```

3. **SSH_PASSWORD** - Password for SSH connection
   ```
   Your SSH user password for authentication
   ```

4. **SSH_PORT** - SSH port (optional, defaults to 22)
   ```
   Example: 22 (default) or 2222
   ```

5. **REACT_APP_API_BASE_URL** - Your backend API URL
   ```
   Example: https://api.yourserver.com or http://192.168.1.100:8000
   ```

## Server Setup Requirements

### 1. Enable Password Authentication and Configure Sudo
```bash
# On your server, ensure password authentication is enabled
sudo nano /etc/ssh/sshd_config

# Make sure these lines are set:
PasswordAuthentication yes
PubkeyAuthentication yes

# Restart SSH service
sudo systemctl restart ssh

# Configure passwordless sudo for deployment commands (RECOMMENDED)
sudo visudo

# Add this line at the end (replace 'username' with your actual username):
username ALL=(ALL) NOPASSWD: /bin/mkdir, /bin/cp, /bin/chown, /bin/chmod, /usr/bin/systemctl reload nginx, /usr/bin/systemctl reload apache2, /bin/mv

# Or for more security, create a specific sudoers file:
sudo tee /etc/sudoers.d/github-deploy << EOF
username ALL=(ALL) NOPASSWD: /bin/mkdir -p /var/www/askdb, /bin/cp -r * /var/www/askdb/, /bin/chown -R www-data:www-data /var/www/askdb, /bin/chmod -R 755 /var/www/askdb, /usr/bin/systemctl reload nginx, /usr/bin/systemctl reload apache2, /bin/mv /var/www/askdb /var/www/askdb_backup_*
EOF
```

### 2. Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nginx (or apache2)
sudo apt install nginx -y

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. Configure Web Server

#### For Nginx:
```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/askdb << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain
    root /var/www/askdb;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Optional: Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/askdb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### For Apache2:
```bash
# Create apache virtual host
sudo tee /etc/apache2/sites-available/askdb.conf << EOF
<VirtualHost *:80>
    DocumentRoot /var/www/askdb
    ServerName your-domain.com  # Replace with your domain
    
    <Directory /var/www/askdb>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
EOF

# Enable the site and required modules
sudo a2enmod rewrite
sudo a2ensite askdb.conf
sudo systemctl reload apache2
```

### 4. Set Directory Permissions
```bash
# Create and set permissions for web directory
sudo mkdir -p /var/www/askdb
sudo chown -R www-data:www-data /var/www/askdb
sudo chmod -R 755 /var/www/askdb
```

### 5. Firewall Configuration (if applicable)
```bash
# Allow HTTP and SSH
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (if using SSL)
sudo ufw enable
```

## Testing the Deployment

1. **Test SSH Connection:**
   ```bash
   ssh username@your-server-ip
   # Enter password when prompted
   ```

2. **Manual Test Build:**
   ```bash
   # On your local machine
   npm run build
   scp -r build/* username@server-ip:/var/www/askdb/
   # Enter password when prompted
   ```

3. **Verify Website:**
   ```
   http://your-server-ip
   or
   http://your-domain.com
   ```

## Workflow Triggers

The deployment will trigger automatically on:
- Push to `main` or `master` branch
- Pull request to `main` or `master` branch

## Troubleshooting

### Common Issues:

1. **Permission Denied:**
   - Check SSH key is properly configured
   - Verify user has sudo privileges

2. **Build Fails:**
   - Check if all dependencies are in package.json
   - Verify Node.js version compatibility

3. **Website Not Loading:**
   - Check nginx/apache configuration
   - Verify file permissions
   - Check server logs: `sudo tail -f /var/log/nginx/error.log`

4. **Environment Variables:**
   - Ensure all GitHub secrets are set correctly
   - Check .env file is created during build

### Useful Commands:
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check deployed files
ls -la /var/www/askdb/

# Test SSH connection
ssh -vvv username@server-ip
```