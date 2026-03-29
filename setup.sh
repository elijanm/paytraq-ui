#!/bin/bash
# PayTraq Sidecar Setup Script
# Installs Node.js, npm packages, and registers server.js as a systemd service.
# Run as pi user with sudo privileges:  bash setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="paytraq-sidecar"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
SUDOERS_FILE="/etc/sudoers.d/paytraq-wifi"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step()  { echo -e "\n${YELLOW}──── $1 ────${NC}"; }

# ── Must run as pi (not root) ─────────────────────────────────────────────────
if [ "$EUID" -eq 0 ]; then
  error "Run as pi, not root: bash setup.sh"
fi

step "Installing Node.js via NodeSource (LTS)"

# Remove conflicting packages
sudo apt-get remove -y nodejs npm 2>/dev/null || true

# Install NodeSource LTS (v22)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
info "Node.js $(node -v) installed at $(which node)"
info "npm $(npm -v) installed"

# ── System dependencies ───────────────────────────────────────────────────────
step "Installing system dependencies"

sudo apt-get install -y \
  wireless-tools \
  build-essential \
  python3 \
  i2c-tools

info "System dependencies installed"

# ── Enable I2C ────────────────────────────────────────────────────────────────
step "Enabling I2C interface"

if ! grep -q "^dtparam=i2c_arm=on" /boot/config.txt 2>/dev/null && \
   ! grep -q "^dtparam=i2c_arm=on" /boot/firmware/config.txt 2>/dev/null; then
  CONFIG_FILE="/boot/firmware/config.txt"
  [ -f /boot/config.txt ] && CONFIG_FILE="/boot/config.txt"
  echo "dtparam=i2c_arm=on" | sudo tee -a "$CONFIG_FILE" > /dev/null
  info "I2C enabled in $CONFIG_FILE (will take effect after reboot)"
else
  info "I2C already enabled"
fi

# Load i2c-dev module now without rebooting
sudo modprobe i2c-dev 2>/dev/null && info "i2c-dev module loaded" || warn "Could not load i2c-dev (may need reboot)"

# ── npm packages ──────────────────────────────────────────────────────────────
step "Installing npm packages"

cd "$SCRIPT_DIR"
npm install
info "npm packages installed"

# ── sudoers rule for iwlist ───────────────────────────────────────────────────
step "Configuring passwordless iwlist for WiFi scanning"

IWLIST_PATH="$(which iwlist 2>/dev/null || echo /usr/sbin/iwlist)"
SUDOERS_LINE="pi ALL=(ALL) NOPASSWD: ${IWLIST_PATH}"

if [ ! -f "$SUDOERS_FILE" ] || ! grep -qF "$SUDOERS_LINE" "$SUDOERS_FILE"; then
  echo "$SUDOERS_LINE" | sudo tee "$SUDOERS_FILE" > /dev/null
  sudo chmod 440 "$SUDOERS_FILE"
  info "sudoers rule added: $SUDOERS_LINE"
else
  info "sudoers rule already present"
fi

# ── systemd service ───────────────────────────────────────────────────────────
step "Registering systemd service: ${SERVICE_NAME}"

NODE_PATH="$(which node)"

sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=PayTraq WiFi/Battery Sidecar
After=network.target

[Service]
ExecStart=${NODE_PATH} ${SCRIPT_DIR}/server.js
WorkingDirectory=${SCRIPT_DIR}
Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=5
User=pi
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"

# Stop any manually running instances first
pkill -f "node.*server.js" 2>/dev/null || true
sleep 1

sudo systemctl restart "$SERVICE_NAME"
sleep 2

if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
  info "Service ${SERVICE_NAME} is running"
else
  warn "Service failed to start — checking logs:"
  sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
fi

# ── GitHub SSH key ───────────────────────────────────────────────────────────
step "Setting up GitHub SSH key"

SSH_KEY="$HOME/.ssh/id_ed25519"

if [ -f "$SSH_KEY" ]; then
  info "SSH key already exists at $SSH_KEY"
else
  # Prompt for email to embed in key comment
  read -rp "  Enter your GitHub email address: " GH_EMAIL
  ssh-keygen -t ed25519 -C "$GH_EMAIL" -f "$SSH_KEY" -N ""
  info "SSH key generated at $SSH_KEY"
fi

# Ensure ssh-agent is running and key is loaded
eval "$(ssh-agent -s)" > /dev/null 2>&1
ssh-add "$SSH_KEY" 2>/dev/null
info "Key added to ssh-agent"

# Write GitHub SSH config entry if not already present
SSH_CONFIG="$HOME/.ssh/config"
if ! grep -q "Host github.com" "$SSH_CONFIG" 2>/dev/null; then
  mkdir -p "$HOME/.ssh"
  cat >> "$SSH_CONFIG" <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile ${SSH_KEY}
  StrictHostKeyChecking no
EOF
  chmod 600 "$SSH_CONFIG"
  info "~/.ssh/config updated for github.com"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}  PayTraq Sidecar Setup Complete${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo ""
echo "  Node.js : $(node -v) at ${NODE_PATH}"
echo "  Project : ${SCRIPT_DIR}"
echo "  Service : ${SERVICE_NAME}"
echo "  Port    : 3001"
echo "  iwlist  : ${IWLIST_PATH}"
echo ""
echo "  Test:  curl http://fullpageos:3001/wifi/scan"
echo "         curl http://fullpageos:3001/battery"
echo "         curl http://fullpageos:3001/debug"
echo ""
echo "  Logs:  sudo journalctl -u ${SERVICE_NAME} -f"
echo ""

# ── GitHub SSH key display ────────────────────────────────────────────────────
echo -e "${YELLOW}══ Add this SSH key to GitHub ══════════════════════════${NC}"
echo -e "  GitHub → Settings → SSH and GPG keys → New SSH key"
echo ""
cat "${HOME}/.ssh/id_ed25519.pub"
echo ""
echo -e "  Then test:  ${GREEN}ssh -T git@github.com${NC}"
echo ""

if ! sudo systemctl is-active --quiet "$SERVICE_NAME"; then
  echo -e "${RED}  ⚠ Service not running — check logs above${NC}"
  echo ""
fi
