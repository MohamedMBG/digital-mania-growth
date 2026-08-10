#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${TRENDK_DOMAIN:?Set TRENDK_DOMAIN to the production domain.}"
EMAIL="${TRENDK_LETSENCRYPT_EMAIL:?Set TRENDK_LETSENCRYPT_EMAIL for Let us Encrypt.}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

PUBLIC_IP="$(curl -fsS https://api.ipify.org || true)"
if [[ -z "${PUBLIC_IP}" ]]; then
  read -r PUBLIC_IP _ <<<"$(hostname -I)"
fi

RESOLVED_IPS="$(getent ahostsv4 "${DOMAIN}" | cut -d " " -f 1)"
if ! grep -Fxq "${PUBLIC_IP}" <<<"${RESOLVED_IPS}"; then
  echo "DNS for ${DOMAIN} does not resolve to this VPS IPv4 (${PUBLIC_IP})." >&2
  printf "%s\n" "${RESOLVED_IPS}" >&2
  exit 1
fi

certbot certonly --webroot -w /var/www/html -d "${DOMAIN}" --email "${EMAIL}" --agree-tos --no-eff-email

test -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
test -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

cat >/etc/nginx/sites-available/trendk.conf <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    root /var/www/trendk/current;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

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

nginx -t
systemctl reload nginx

echo "HTTPS enabled for ${DOMAIN}."
