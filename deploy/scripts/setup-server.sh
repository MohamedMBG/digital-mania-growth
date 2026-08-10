#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${TRENDK_DOMAIN:?Set TRENDK_DOMAIN to the production domain.}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg nginx certbot ufw

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
fi

. /etc/os-release
cat >/etc/apt/sources.list.d/docker.list <<APT
deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable
APT

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
systemctl enable --now nginx

if ! swapon --show=NAME | grep -qx "/swapfile"; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
fi

grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
cat >/etc/sysctl.d/99-trendk-swap.conf <<'SYSCTL'
vm.swappiness=10
vm.vfs_cache_pressure=50
SYSCTL
sysctl --system >/dev/null

install -d -m 755 /opt/trendk/releases /var/www/trendk/frontend /var/www/html
install -d -m 700 /etc/trendk /var/backups/trendk/postgres
install -d -m 755 /var/www/trendk/releases/bootstrap
cat >/var/www/trendk/releases/bootstrap/index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TrendK</title>
  </head>
  <body>TrendK server is ready.</body>
</html>
HTML
ln -sfn /var/www/trendk/releases/bootstrap /var/www/trendk/current

cat >/etc/nginx/sites-available/trendk.conf <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    root /var/www/trendk/current;
    index index.html;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(?:css|js|mjs|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
NGINX

ln -sfn /etc/nginx/sites-available/trendk.conf /etc/nginx/sites-enabled/trendk.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

if [[ -f /var/run/reboot-required ]]; then
  echo "Reboot required: yes (/var/run/reboot-required exists)"
else
  echo "Reboot required: no (/var/run/reboot-required does not exist)"
fi

echo "Server baseline complete. Create /etc/trendk/backend.env and /etc/trendk/postgres.env with mode 600 before deploying."
