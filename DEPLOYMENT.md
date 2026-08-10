# TrendK VPS Deployment Proposal

This deployment uses host Nginx for the React SPA and HTTPS, and Docker Compose for the NestJS backend, PostgreSQL, and Redis.

## Network Model

- Nginx serves the frontend through the stable symlink `/var/www/trendk/current`.
- Nginx proxies `/api/` to `http://127.0.0.1:4000/api/`.
- The backend publishes only `127.0.0.1:4000:4000`.
- PostgreSQL and Redis publish no host ports and are reachable only inside Docker.
- Docker Compose uses the explicit project name `trendk`.
- UFW allows only SSH, HTTP, and HTTPS.

## Proposal Files

- `docker-compose.prod.yml`
- `backend/Dockerfile`
- `backend/.dockerignore`
- `deploy/nginx/trendk-http.conf`
- `deploy/nginx/trendk.conf`
- `deploy/env/backend.env.example`
- `deploy/env/postgres.env.example`
- `deploy/env/frontend.env.production.example`
- `deploy/scripts/setup-server.sh`
- `deploy/scripts/enable-https.sh`
- `deploy/scripts/deploy.ps1`
- `deploy/scripts/rollback.sh`
- `deploy/scripts/backup-db.sh`
- `deploy/scripts/restore-db.sh`

## Secrets

Production secrets must stay outside Git on the VPS:

- Backend secrets: `/etc/trendk/backend.env`
- Postgres initialization secrets: `/etc/trendk/postgres.env`

Start from `deploy/env/backend.env.example` and `deploy/env/postgres.env.example`, replace every placeholder, then install the edited files on the VPS with owner `root` and mode `600`.

Generate strong values with:

```powershell
ssh trendk-vps "openssl rand -base64 48"
```

The application refuses obvious placeholder JWT secrets in production.

## Approval Commands

Run these from Windows PowerShell only after approval.

Set local variables:

```powershell
$env:TRENDK_HOST = "trendk-vps"
$env:TRENDK_DOMAIN = "trendk.example.com"
$env:TRENDK_LETSENCRYPT_EMAIL = "admin@example.com"
```

Create the HTTP-only VPS baseline. This installs pending package updates, Docker Engine and the Compose plugin from Docker's official Ubuntu repository, Nginx, Certbot, UFW, and 2 GB swap. It does not request certificates and does not reboot automatically. It reports whether `/var/run/reboot-required` exists.

```powershell
scp deploy/scripts/setup-server.sh "${env:TRENDK_HOST}:/tmp/setup-server.sh"
ssh $env:TRENDK_HOST "sudo env TRENDK_DOMAIN='$env:TRENDK_DOMAIN' bash /tmp/setup-server.sh"
```

Upload env templates, install them with restricted permissions, remove the temporary copies, then edit each file in a separate interactive SSH session:

```powershell
scp deploy/env/backend.env.example "${env:TRENDK_HOST}:/tmp/backend.env"
scp deploy/env/postgres.env.example "${env:TRENDK_HOST}:/tmp/postgres.env"
ssh $env:TRENDK_HOST "sudo install -m 600 -o root -g root /tmp/backend.env /etc/trendk/backend.env && sudo install -m 600 -o root -g root /tmp/postgres.env /etc/trendk/postgres.env && rm -f /tmp/backend.env /tmp/postgres.env"
ssh -t $env:TRENDK_HOST "sudo nano /etc/trendk/backend.env"
ssh -t $env:TRENDK_HOST "sudo nano /etc/trendk/postgres.env"
```

Deploy a release from Windows PowerShell. This uses local `npm`, `tar`, `scp`, and `ssh`; it does not require local Bash or `rsync`.

```powershell
powershell -ExecutionPolicy Bypass -File deploy/scripts/deploy.ps1 -HostName $env:TRENDK_HOST
```

Enable HTTPS only after DNS resolves to the VPS:

```powershell
scp deploy/scripts/enable-https.sh "${env:TRENDK_HOST}:/tmp/enable-https.sh"
ssh $env:TRENDK_HOST "sudo env TRENDK_DOMAIN='$env:TRENDK_DOMAIN' TRENDK_LETSENCRYPT_EMAIL='$env:TRENDK_LETSENCRYPT_EMAIL' bash /tmp/enable-https.sh"
```

Back up PostgreSQL on the VPS. Retention defaults to 14 days and can be changed with `TRENDK_BACKUP_RETENTION_DAYS`; the newest successful backup is never deleted by retention cleanup.

```powershell
ssh $env:TRENDK_HOST "sudo bash /opt/trendk/current/deploy/scripts/backup-db.sh"
ssh $env:TRENDK_HOST "sudo env TRENDK_BACKUP_RETENTION_DAYS=30 bash /opt/trendk/current/deploy/scripts/backup-db.sh"
```

Same-VPS backups protect against bad migrations and operator mistakes, but they are not sufficient for disaster recovery. Copy backups to external storage.

Roll back to the previous release:

```powershell
ssh $env:TRENDK_HOST "sudo bash /opt/trendk/current/deploy/scripts/rollback.sh"
```

Roll back to a specific release:

```powershell
ssh $env:TRENDK_HOST "sudo bash /opt/trendk/current/deploy/scripts/rollback.sh 20260802120000"
```

Restore a database backup:

```powershell
ssh $env:TRENDK_HOST "sudo env TRENDK_CONFIRM_RESTORE=yes bash /opt/trendk/current/deploy/scripts/restore-db.sh /var/backups/trendk/postgres/trendk-postgres-YYYYMMDDHHMMSS.dump"
```

## Verification

After deployment:

```powershell
ssh $env:TRENDK_HOST "hostname && whoami"
ssh $env:TRENDK_HOST "test -f /var/run/reboot-required && echo reboot-required || echo no-reboot-required"
ssh $env:TRENDK_HOST "sudo ufw status verbose"
ssh $env:TRENDK_HOST "sudo docker compose -p trendk -f /opt/trendk/current/docker-compose.prod.yml ps"
ssh $env:TRENDK_HOST "curl -fsS http://127.0.0.1:4000/api/health"
curl.exe -fsS "https://$env:TRENDK_DOMAIN/api/health"
```

Then verify the user flows:

- Register and log in.
- Confirm `/api/auth/me` works after refresh.
- Create a Stripe checkout session.
- Complete a payment and confirm the webhook updates the wallet.
- Create an order and confirm queue processing.
- Confirm dashboard data stays consistent after refresh.
