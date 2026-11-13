const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Credentials
const config = {
  host: '72.61.238.132',
  username: 'root',
  password: 'Jaishreeram@1234#',
  domain: 'walktheplan.in'
};

const localZipPath = path.join(__dirname, 'deployment.zip');
const remoteDestDir = `/var/www/${config.domain}`;
const remoteZipPath = `/var/www/deployment.zip`;

// 1. Package the project locally (excluding node_modules, .git, builds, logs)
function zipProject() {
  return new Promise((resolve, reject) => {
    console.log('Building latest frontend production bundle...');
    try {
      execSync('npm run build', { cwd: path.join(__dirname, 'main/frontend'), stdio: 'inherit' });
    } catch (err) {
      return reject(new Error('Frontend build failed. Deployment aborted.'));
    }

    console.log('Packaging project files into deployment.zip...');
    const output = fs.createWriteStream(localZipPath);
    const archive = new archiver.ZipArchive({ zlib: { level: 5 } });

    output.on('close', () => {
      console.log(`Successfully packed project! Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add files and folders
    archive.directory('main/backend/', 'backend', (entry) => {
      const name = entry.name;
      if (
        name.startsWith('node_modules') || 
        name.includes('/node_modules/') ||
        name.endsWith('.mp4') ||
        name === 'database.db'
      ) {
        return false;
      }
      return entry;
    });
    archive.glob('**/*', {
      cwd: 'main/frontend/dist',
      ignore: ['**/*.mp4']
    }, {
      prefix: 'frontend/dist'
    });
    archive.file('package.json', { name: 'package.json' });
    archive.file('package-lock.json', { name: 'package-lock.json' });

    archive.finalize();
  });
}

// Helper to execute command over SSH
function runRemoteCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`Executing remote: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code, signal) => {
        if (code !== 0) {
          console.error(`Command failed with code ${code}. Error: ${stderr}`);
          reject(new Error(`Command failed with exit code ${code}`));
        } else {
          resolve(stdout);
        }
      }).on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      }).stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
    });
  });
}

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    console.log(`Uploading ${localPath} to remote ${remotePath}...`);
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      
      const stats = fs.statSync(localPath);
      const totalBytes = stats.size;
      let lastReport = 0;

      sftp.fastPut(localPath, remotePath, {
        chunkSize: 64 * 1024,
        concurrency: 4,
        step: (transferred) => {
          const percent = ((transferred / totalBytes) * 100).toFixed(1);
          const now = Date.now();
          if (now - lastReport > 2000 || transferred === totalBytes) {
            console.log(`Upload progress: ${percent}% (${(transferred / 1024 / 1024).toFixed(2)} / ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
            lastReport = now;
          }
        }
      }, (fastPutErr) => {
        if (fastPutErr) {
          console.error('FastPut error:', fastPutErr.message);
          return reject(fastPutErr);
        } else {
          console.log('File upload completed successfully via fastPut.');
          resolve();
        }
      });
    });
  });
}

async function deploy() {
  try {
    // 1. Pack the project
    await zipProject();

    // 2. Connect to VPS
    console.log(`Connecting to VPS at ${config.host}...`);
    const conn = new Client();
    
    conn.on('error', (err) => {
      console.error('SSH connection error:', err.message);
    });

    conn.on('ready', async () => {
      console.log('SSH connection established successfully.');
      try {
        // Create destination directory
        await runRemoteCommand(conn, `mkdir -p ${remoteDestDir}`);

        // Upload zip file
        await uploadFile(conn, localZipPath, remoteZipPath);

        // Install system dependencies on server
        console.log('Installing server dependencies (Node.js, Nginx, PM2, unzip)...');
        const setupScript = `
          if ! command -v node &> /dev/null; then
            echo "Installing Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
          fi
          
          if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
          fi

          if ! command -v nginx &> /dev/null; then
            echo "Installing Nginx..."
            apt-get update
            apt-get install -y nginx
          fi

          if ! command -v unzip &> /dev/null; then
            echo "Installing unzip..."
            apt-get install -y unzip
          fi
        `;
        await runRemoteCommand(conn, setupScript);

        // Extract files on the server
        console.log('Extracting project files...');
        await runRemoteCommand(conn, `unzip -o ${remoteZipPath} -d ${remoteDestDir} && rm ${remoteZipPath}`);

        // Install dependencies on remote server
        console.log('Installing npm dependencies on server...');
        await runRemoteCommand(conn, `cd ${remoteDestDir} && rm -rf backend/node_modules && npm install --production --legacy-peer-deps && npm install --prefix backend --production --legacy-peer-deps`);

        // Update database settings, admin password, and seed 10 blogs on remote server
        console.log('Updating database settings and seeding blogs on server...');
        const remoteSeedCode = [
          `const sqlite3 = require('${remoteDestDir}/backend/node_modules/sqlite3').verbose();`,
          `const bcrypt = require('${remoteDestDir}/backend/node_modules/bcryptjs');`,
          `const db = new sqlite3.Database('${remoteDestDir}/backend/database.db');`,
          `const hash = bcrypt.hashSync('walk@321', 10);`,
          `db.serialize(() => {`,
          `  db.run("DELETE FROM users WHERE username = 'parth'");`,
          `  db.run("DELETE FROM crm_users WHERE email IN ('admin@walktheplant.com', 'admin@walktheplan.com')");`,
          `  db.run("INSERT OR REPLACE INTO users (username, password_hash) VALUES ('fitscalez', '" + hash + "')");`,
          `  db.run("UPDATE users SET password_hash = '" + hash + "' WHERE username IN ('admin', 'fitscalez')");`,
          `  db.run("DELETE FROM push_subscriptions WHERE is_admin = 1");`,
          `  db.run("INSERT OR REPLACE INTO website_settings (key, value) VALUES ('whatsapp_number', '+91 97110 22075')");`,
          `  db.run("INSERT OR REPLACE INTO website_settings (key, value) VALUES ('show_leads_public', '1')");`,
          `  db.run("UPDATE studio_locations SET phone = '+91 97110 22075' WHERE phone LIKE '%92177%'");`,
          `  try {`,
          `    const { seedBlogsAndImages } = require('${remoteDestDir}/backend/blogs_data.js');`,
          `    seedBlogsAndImages(db, '${remoteDestDir}/backend/uploads');`,
          `  } catch(e) { console.error('Blog seed error:', e); }`,
          `});`,
          `setTimeout(() => db.close(), 2500);`
        ].join(' ');
        await runRemoteCommand(conn, `node -e ${JSON.stringify(remoteSeedCode)} || true`);

        // Start backend server via PM2
        console.log('Starting backend server with PM2...');
        await runRemoteCommand(conn, `cd ${remoteDestDir} && pm2 delete walktheplan-backend || true`);
        await runRemoteCommand(conn, `cd ${remoteDestDir} && PORT=5001 pm2 start backend/server.js --name "walktheplan-backend" --update-env`);
        await runRemoteCommand(conn, `pm2 save`);

        // Configure Nginx
        console.log('Configuring Nginx Reverse Proxy...');
        const nginxConfig = `
server {
    listen 80;
    server_name ${config.domain} www.${config.domain};

    # Allow large video uploads up to 300MB
    client_max_body_size 300M;
    client_body_timeout 300s;

    location / {
        root ${remoteDestDir}/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 300M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_request_buffering off;
    }

    location /uploads/ {
        alias ${remoteDestDir}/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
`;
        
        // Write Nginx config
        const writeNginxCmd = `cat << 'EOF' > /etc/nginx/sites-available/${config.domain}
${nginxConfig}
EOF
        `;
        await runRemoteCommand(conn, writeNginxCmd);

        // Enable Nginx site configuration
        console.log('Enabling Nginx configurations...');
        await runRemoteCommand(conn, `ln -sf /etc/nginx/sites-available/${config.domain} /etc/nginx/sites-enabled/`);
        await runRemoteCommand(conn, `rm -f /etc/nginx/sites-enabled/default || true`);
        await runRemoteCommand(conn, `nginx -t`);
        await runRemoteCommand(conn, `systemctl restart nginx`);

        // Install SSL via Certbot Let's Encrypt
        console.log('Configuring SSL certificates...');
        const sslScript = `
          if ! command -v certbot &> /dev/null; then
            apt-get install -y certbot python3-certbot-nginx
          fi
          # Run certbot non-interactively
          certbot --nginx --non-interactive --agree-tos --email admin@${config.domain} -d ${config.domain} -d www.${config.domain} || echo "SSL configuration skipped or failed (check DNS propagation)"
        `;
        await runRemoteCommand(conn, sslScript);

        console.log('\n=========================================');
        console.log(`DEPLOYMENT COMPLETE SUCCESSFULLY!`);
        console.log(`Your site is live at: https://${config.domain}`);
        console.log('=========================================\n');

      } catch (err) {
        console.error('Error during remote execution:', err);
      } finally {
        conn.end();
        if (fs.existsSync(localZipPath)) {
          fs.unlinkSync(localZipPath);
        }
      }
    }).connect({
      host: config.host,
      username: config.username,
      password: config.password,
      keepaliveInterval: 10000,
      keepaliveCountMax: 10
    });

  } catch (err) {
    console.error('Deployment script error:', err);
  }
}

deploy();
