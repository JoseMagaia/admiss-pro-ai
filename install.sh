#!/usr/bin/env sh
#
# One-click installer for fliq — AI Lead Generation & Appointment Platform
# (admiss-pro-ai / TanStack Start + local PGlite database).
#
# Usage:
#   ./install.sh [options]
#   curl -fsSL https://raw.githubusercontent.com/JoseMagaia/admiss-pro-ai/main/install.sh | sh
#
# What it does:
#   1. Verifies Node.js 20+ and Bun (auto-installs both when missing:
#      Node -> ~/.local, Bun -> ~/.bun — no root required).
#   2. Clones the repository (or uses the current directory when run from it).
#   3. Installs dependencies and builds the app:
#        - static client  -> dist/          (bun run build)
#        - self-hosted SSR server -> dist-server/ (bun run build:server)
#   4. Bootstraps the local database (PGlite): schema + default space +
#      super-admin seed (admin@linkmoore.local / admin1234 by default).
#   5. Starts the server on 0.0.0.0:3000 (foreground, or as a systemd
#      service with --systemd) and prints the admin login + management
#      commands.
#
set -eu

# ---------------------------------------------------------------- config
REPO_URL="https://github.com/JoseMagaia/admiss-pro-ai.git"
DEFAULT_DIR="admiss-pro-ai"
INSTALL_DIR=""
DATA_DIR=""
ADMIN_EMAIL="admin@linkmoore.local"
ADMIN_PASSWORD="admin1234"
PORT="3000"
HOST="0.0.0.0"
NODE_VERSION="v22.17.0"
USE_SYSTEMD=0
SKIP_DEPS=0
NO_START=0

log()  { printf '\033[1;34m[install]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[install]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[install]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[install]\033[0m ERROR: %s\n' "$*" >&2; exit 1; }
has()  { command -v "$1" >/dev/null 2>&1; }

usage() {
  cat <<'EOF'
One-click installer for fliq — AI Lead Generation & Appointment Platform

Options:
  -d, --dir DIR          Install directory (default: ./admiss-pro-ai; the
                         current directory is used when it already contains
                         package.json)
  -r, --repo URL         Git repository to clone (default: JoseMagaia/admiss-pro-ai)
      --data-dir PATH    PGlite database directory
                         (default: <install-dir>/data/pglite)
      --admin-email X    Super-admin login email (default: admin@linkmoore.local)
      --admin-password X Super-admin login password (default: admin1234)
      --port N           HTTP port (default: 3000)
      --host H           Bind address (default: 0.0.0.0)
      --systemd          Install and start a systemd service (requires root)
      --skip-deps        Skip installing/verifying Node.js and Bun
      --no-start         Build and seed only; do not start the server
  -h, --help             Show this help
EOF
  exit 0
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -d|--dir)          INSTALL_DIR="${2:?--dir requires a value}"; shift 2 ;;
    -r|--repo)         REPO_URL="${2:?--repo requires a value}"; shift 2 ;;
    --data-dir)        DATA_DIR="${2:?--data-dir requires a value}"; shift 2 ;;
    --admin-email)     ADMIN_EMAIL="${2:?--admin-email requires a value}"; shift 2 ;;
    --admin-password)  ADMIN_PASSWORD="${2:?--admin-password requires a value}"; shift 2 ;;
    --port)            PORT="${2:?--port requires a value}"; shift 2 ;;
    --host)            HOST="${2:?--host requires a value}"; shift 2 ;;
    --systemd)         USE_SYSTEMD=1; shift ;;
    --skip-deps)       SKIP_DEPS=1; shift ;;
    --no-start)        NO_START=1; shift ;;
    -h|--help)         usage ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

# ------------------------------------------------------------ tool checks
ensure_curl_git() {
  has curl || die "curl is required (apt-get install curl / brew install curl)"
  has git  || die "git is required (apt-get install git / brew install git)"
}

ensure_node() {
  if has node; then
    node_major="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')"
    if [ "${node_major:-0}" -ge 20 ]; then
      ok "Node.js $(node -v) found ($(command -v node))"
      return 0
    fi
    warn "Node.js $(node -v) is too old (>=20 required) — installing $NODE_VERSION locally"
  fi
  case "$(uname -s)" in
    Linux)
      case "$(uname -m)" in
        x86_64)         NODE_ARCH="x64" ;;
        aarch64|arm64)  NODE_ARCH="arm64" ;;
        *) die "unsupported architecture: $(uname -m)" ;;
      esac
      PREFIX="$HOME/.local"
      TARBALL="node-$NODE_VERSION-linux-$NODE_ARCH.tar.gz"
      URL="https://nodejs.org/dist/$NODE_VERSION/$TARBALL"
      log "Downloading Node.js $NODE_VERSION ..."
      curl -fsSL "$URL" -o "/tmp/$TARBALL"
      mkdir -p "$PREFIX/lib" "$PREFIX/bin"
      tar -xzf "/tmp/$TARBALL" -C "$PREFIX/lib"
      ln -sf "$PREFIX/lib/node-$NODE_VERSION-linux-$NODE_ARCH/bin/node" "$PREFIX/bin/node"
      ln -sf "$PREFIX/lib/node-$NODE_VERSION-linux-$NODE_ARCH/bin/npm"   "$PREFIX/bin/npm"
      rm -f "/tmp/$TARBALL"
      export PATH="$PREFIX/bin:$PATH"
      ok "Node.js $NODE_VERSION installed at $PREFIX/bin/node"
      ;;
    Darwin)
      if has brew; then brew install node; else die "macOS: install Node.js 20+ (brew install node) and re-run"; fi
      ;;
    *) die "unsupported operating system: $(uname -s)" ;;
  esac
}

ensure_bun() {
  if has bun; then
    ok "Bun found ($(command -v bun))"
    return 0
  fi
  BUN_DIR="$HOME/.bun"
  if [ -x "$BUN_DIR/bin/bun" ]; then
    export PATH="$BUN_DIR/bin:$PATH"
    ok "Bun found ($BUN_DIR/bin/bun)"
    return 0
  fi
  log "Installing Bun ..."
  curl -fsSL https://bun.sh/install | bash || true
  [ -x "$BUN_DIR/bin/bun" ] || die "Bun installation failed"
  export PATH="$BUN_DIR/bin:$PATH"
  ok "Bun installed ($BUN_DIR/bin/bun)"
}

# ------------------------------------------------------------- source code
prepare_source() {
  if [ -n "$INSTALL_DIR" ]; then
    mkdir -p "$INSTALL_DIR" 2>/dev/null || true
    INSTALL_DIR="$(cd "$INSTALL_DIR" && pwd)"
  elif [ -f package.json ]; then
    INSTALL_DIR="$(pwd)"
    ok "Running from an existing project: $INSTALL_DIR"
  else
    mkdir -p "$DEFAULT_DIR"
    INSTALL_DIR="$(pwd)/$DEFAULT_DIR"
  fi

  if [ -f "$INSTALL_DIR/package.json" ]; then
    ok "Using source at $INSTALL_DIR"
  else
    log "Cloning $REPO_URL into $INSTALL_DIR ..."
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
  fi
  cd "$INSTALL_DIR"
}

# -------------------------------------------------------------- app build
install_deps() {
  log "Installing dependencies (bun install) ..."
  bun install
}

build_app() {
  log "Building static client (bun run build) ..."
  bun run build
  log "Building self-hosted server (bun run build:server) ..."
  bun run build:server
  [ -f dist-server/server/index.mjs ] || die "server build did not produce dist-server/server/index.mjs"
}

# ------------------------------------------------------------- database
init_db() {
  if [ -z "$DATA_DIR" ]; then DATA_DIR="$INSTALL_DIR/data/pglite"; fi
  mkdir -p "$DATA_DIR"
  log "Bootstrapping local database (PGlite) at $DATA_DIR ..."
  PGLITE_DATA_DIR="$DATA_DIR" \
  LOCAL_ADMIN_EMAIL="$ADMIN_EMAIL" \
  LOCAL_ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    bun run scripts/init-db.ts
}

write_runtime_env() {
  ENV_FILE="$INSTALL_DIR/.env.production"
  umask 077
  cat > "$ENV_FILE" <<EOF
# Generated by install.sh — runtime environment. Do not commit.
PORT=$PORT
HOST=$HOST
PGLITE_DATA_DIR=$DATA_DIR
EOF
  printf 'Admin login: %s / %s\n' "$ADMIN_EMAIL" "$ADMIN_PASSWORD" > "$INSTALL_DIR/.admin-credentials"
  chmod 600 "$ENV_FILE" "$INSTALL_DIR/.admin-credentials"
  ok "Runtime env written to $ENV_FILE (credentials in .admin-credentials)"
}

# ------------------------------------------------------------ systemd
install_systemd() {
  [ "$(id -u)" = "0" ] || die "--systemd requires root (run: sudo ./install.sh --systemd)"
  RUN_USER="${SUDO_USER:-$(id -un)}"
  NODE_BIN="$(command -v node)"
  NODE_DIR="$(dirname "$NODE_BIN")"
  UNIT="/etc/systemd/system/admiss-pro.service"

  cat > "$UNIT" <<EOF
[Unit]
Description=fliq — AI Lead Generation & Appointment Platform
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$INSTALL_DIR
Environment=PORT=$PORT
Environment=HOST=$HOST
Environment=PGLITE_DATA_DIR=$DATA_DIR
Environment=PATH=$NODE_DIR:/usr/local/bin:/usr/bin:/bin
ExecStart=$NODE_BIN $INSTALL_DIR/dist-server/server/index.mjs
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable admiss-pro >/dev/null 2>&1 || true
  systemctl restart admiss-pro
  sleep 2
  if [ "$(systemctl is-active admiss-pro)" = "active" ]; then
    ok "systemd service 'admiss-pro' is active"
  else
    warn "service not active — inspect with: journalctl -u admiss-pro -e"
  fi
}

# --------------------------------------------------------------- summary
print_summary() {
  printf '\n'
  ok "Installation complete."
  printf '\n'
  printf '  URL:        http://%s:%s\n' "$HOST" "$PORT"
  printf '  Admin login: %s / %s\n' "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
  printf '  Database:   %s (PGlite)\n' "$DATA_DIR"
  printf '  Install dir: %s\n' "$INSTALL_DIR"
  printf '\n'
  if [ "$USE_SYSTEMD" = "1" ]; then
    printf '  Manage:     systemctl status admiss-pro | restart | stop | logs (journalctl -u admiss-pro -f)\n'
  else
    printf '  Start:      cd %s && . ./.env.production && node dist-server/server/index.mjs\n' "$INSTALL_DIR"
    printf '  Stop:       Ctrl-C\n'
  fi
  printf '\n'
}

# ------------------------------------------------------------------ main
main() {
  log "fliq — AI Lead Generation & Appointment Platform installer"
  ensure_curl_git
  if [ "$SKIP_DEPS" != "1" ]; then
    ensure_node
    ensure_bun
  else
    has node || die "--skip-deps given but node was not found"
    has bun  || die "--skip-deps given but bun was not found"
  fi
  prepare_source
  install_deps
  build_app
  init_db
  write_runtime_env
  print_summary

  if [ "$NO_START" = "1" ]; then
    ok "Done (--no-start). Start the server with the command printed above."
    exit 0
  fi

  if [ "$USE_SYSTEMD" = "1" ]; then
    install_systemd
    exit 0
  fi

  log "Starting server on $HOST:$PORT ..."
  cd "$INSTALL_DIR"
  set -a
  . "$ENV_FILE"
  set +a
  exec node dist-server/server/index.mjs
}

main "$@"
