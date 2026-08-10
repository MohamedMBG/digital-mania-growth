param(
  [string]$HostName = $env:TRENDK_HOST,
  [string]$AppDir = "/opt/trendk",
  [string]$BackendEnvFile = "/etc/trendk/backend.env",
  [string]$PostgresEnvFile = "/etc/trendk/postgres.env",
  [string]$ViteApiUrl = "/api"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($HostName)) {
  $HostName = "trendk-vps"
}

function ConvertTo-ShellLiteral {
  param([string]$Value)
  return "'" + ($Value -replace "'", "'\''") + "'"
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$Release = (Get-Date).ToUniversalTime().ToString("yyyyMMddHHmmss")
$Archive = Join-Path ([System.IO.Path]::GetTempPath()) "trendk-release-$Release.tar.gz"
$RemoteArchive = "/tmp/trendk-release-$Release.tar.gz"

Push-Location $RootDir
try {
  npm ci

  $PreviousViteApiUrl = $env:VITE_API_URL
  $env:VITE_API_URL = $ViteApiUrl
  try {
    npm run build
  } finally {
    if ($null -eq $PreviousViteApiUrl) {
      Remove-Item Env:\VITE_API_URL -ErrorAction SilentlyContinue
    } else {
      $env:VITE_API_URL = $PreviousViteApiUrl
    }
  }

  if (Test-Path $Archive) {
    Remove-Item $Archive -Force
  }

  tar `
    --exclude=.git `
    --exclude=node_modules `
    --exclude=backend/node_modules `
    --exclude=backend/dist `
    --exclude=.env `
    --exclude=.env.* `
    --exclude=backend/.env `
    --exclude=backend/.env.* `
    -czf $Archive `
    -C $RootDir `
    .

  scp $Archive "${HostName}:$RemoteArchive"

  $AppDirLiteral = ConvertTo-ShellLiteral $AppDir
  $BackendEnvLiteral = ConvertTo-ShellLiteral $BackendEnvFile
  $PostgresEnvLiteral = ConvertTo-ShellLiteral $PostgresEnvFile
  $ReleaseLiteral = ConvertTo-ShellLiteral $Release
  $ArchiveLiteral = ConvertTo-ShellLiteral $RemoteArchive

  $RemoteScript = @"
set -euo pipefail

APP_DIR=$AppDirLiteral
BACKEND_ENV_FILE=$BackendEnvLiteral
POSTGRES_ENV_FILE=$PostgresEnvLiteral
RELEASE=$ReleaseLiteral
ARCHIVE=$ArchiveLiteral
REMOTE_RELEASE="`${APP_DIR}/releases/`${RELEASE}"
PREVIOUS_RELEASE="`$(readlink -f "`${APP_DIR}/current" 2>/dev/null || true)"

sudo test -f "`${BACKEND_ENV_FILE}"
sudo test -f "`${POSTGRES_ENV_FILE}"

sudo mkdir -p "`${REMOTE_RELEASE}" "`${APP_DIR}/releases" /var/www/trendk
sudo tar -xzf "`${ARCHIVE}" -C "`${REMOTE_RELEASE}"
sudo test -f "`${REMOTE_RELEASE}/dist/index.html"

cd "`${REMOTE_RELEASE}"
sudo env COMPOSE_PROJECT_NAME=trendk TRENDK_BACKEND_ENV_FILE="`${BACKEND_ENV_FILE}" TRENDK_POSTGRES_ENV_FILE="`${POSTGRES_ENV_FILE}" docker compose -p trendk -f docker-compose.prod.yml config --quiet
sudo env COMPOSE_PROJECT_NAME=trendk TRENDK_BACKEND_ENV_FILE="`${BACKEND_ENV_FILE}" TRENDK_POSTGRES_ENV_FILE="`${POSTGRES_ENV_FILE}" docker compose -p trendk -f docker-compose.prod.yml build

if ! sudo env COMPOSE_PROJECT_NAME=trendk TRENDK_BACKEND_ENV_FILE="`${BACKEND_ENV_FILE}" TRENDK_POSTGRES_ENV_FILE="`${POSTGRES_ENV_FILE}" docker compose -p trendk -f docker-compose.prod.yml up -d; then
  if [[ -n "`${PREVIOUS_RELEASE}" && -d "`${PREVIOUS_RELEASE}" ]]; then
    cd "`${PREVIOUS_RELEASE}"
    sudo env COMPOSE_PROJECT_NAME=trendk TRENDK_BACKEND_ENV_FILE="`${BACKEND_ENV_FILE}" TRENDK_POSTGRES_ENV_FILE="`${POSTGRES_ENV_FILE}" docker compose -p trendk -f docker-compose.prod.yml up -d --build
  fi
  exit 1
fi

healthy=0
for _ in `$(seq 1 30); do
  if curl -fsS http://127.0.0.1:4000/api/health >/dev/null; then
    healthy=1
    break
  fi
  sleep 2
done

if [[ "`${healthy}" != "1" ]]; then
  if [[ -n "`${PREVIOUS_RELEASE}" && -d "`${PREVIOUS_RELEASE}" ]]; then
    cd "`${PREVIOUS_RELEASE}"
    sudo env COMPOSE_PROJECT_NAME=trendk TRENDK_BACKEND_ENV_FILE="`${BACKEND_ENV_FILE}" TRENDK_POSTGRES_ENV_FILE="`${POSTGRES_ENV_FILE}" docker compose -p trendk -f docker-compose.prod.yml up -d --build
  fi
  exit 1
fi

sudo ln -sfn "`${REMOTE_RELEASE}/dist" /var/www/trendk/current.next
sudo test -f /var/www/trendk/current.next/index.html
sudo nginx -t
sudo mv -T /var/www/trendk/current.next /var/www/trendk/current
sudo ln -sfn "`${REMOTE_RELEASE}" "`${APP_DIR}/current"
rm -f "`${ARCHIVE}"

echo "Deployed release `${RELEASE}."
"@

  $RemoteScript | ssh $HostName "bash -s"
if ($LASTEXITCODE -ne 0) {
  throw "Remote deployment failed with exit code $LASTEXITCODE."
}
} finally {
  Pop-Location
  if (Test-Path $Archive) {
    Remove-Item $Archive -Force
  }
}
