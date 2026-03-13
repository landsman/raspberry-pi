# Pi 5 — Rootless Docker Setup

Running Docker as root is a security risk: a container escape gives full system access.
This guide migrates all Docker and Compose workloads to a non-root user.

---

## Why rootless Docker?

| Issue with root Docker                         | Rootless Docker                             |
|------------------------------------------------|---------------------------------------------|
| Container escape = full root access            | Escape lands in unprivileged user namespace |
| Any process can talk to `/var/run/docker.sock` | Socket only accessible to your user         |
| Containers run as root inside by default       | UIDs are remapped to unprivileged ranges    |

---

## Prerequisites

```bash
# Install required packages
sudo apt update
sudo apt install -y uidmap slirp4netns fuse-overlayfs dbus-user-session

# Verify your user has a subuid/subgid range allocated
grep ^pi /etc/subuid   # should show something like: pi:100000:65536
grep ^pi /etc/subgid

# If missing, add them manually
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 pi
```

---

## 1. Stop and disable the root Docker daemon

```bash
sudo systemctl disable --now docker.socket docker.service containerd.service
```

> Keep the Docker package installed — the binaries are still needed for rootless mode.

---

## 2. Install rootless Docker for your user

Run this as the **pi** user (not root):

```bash
dockerd-rootless-setuptool.sh install
```

This sets up `~/.config/docker/` and a systemd user unit at
`~/.config/systemd/user/docker.service`.

---

## 3. Enable and start the user Docker daemon

```bash
# Start immediately
systemctl --user start docker

# Enable on login
systemctl --user enable docker

# Enable "lingering" so the daemon survives after you log out
# (required for services that should start at boot)
sudo loginctl enable-linger pi
```

Verify the daemon is running:

```bash
systemctl --user status docker
```

---

## 4. Configure environment variables

Add these to `~/.bashrc` (and `~/.profile` for non-interactive sessions):

```bash
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock
export PATH=$HOME/bin:$PATH
```

Apply immediately:

```bash
source ~/.bashrc
```

Test it:

```bash
docker info   # should show rootless: true under Server
```

---

## 5. Docker Compose

Compose V2 (the `docker compose` plugin) works natively with rootless Docker — no extra setup needed once `DOCKER_HOST` is set.

```bash
# From any project directory
docker compose up -d
docker compose build
docker compose logs -f
```

### Starting Compose services at boot

Because you're rootless, use a **systemd user service** instead of `--restart always`.

Create `~/.config/systemd/user/my-stack.service` (replace paths as needed):

```ini
[Unit]
Description=My Docker Compose stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=%h/nas/dev/docker_scripts/my-stack
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

Enable it:

```bash
systemctl --user daemon-reload
systemctl --user enable --now my-stack.service
```

---

## 6. Port binding below 1024

Rootless containers cannot bind to privileged ports (< 1024) by default.

**Option A — use high ports** (recommended): expose `8080` instead of `80`, `8443` instead of `443`.

**Option B — allow via sysctl**:

```bash
# Allow all unprivileged users to bind down to port 80
echo "net.ipv4.ip_unprivileged_port_start=80" | sudo tee /etc/sysctl.d/99-rootless-ports.conf
sudo sysctl --system
```

---

## 7. Volume permissions

Rootless Docker remaps UIDs. Files written by a container appear owned by a high UID on the host
(`100000+` range). Fix ownership for bind-mounted directories:

```bash
# Find what UID the container writes as on the host
ls -ln /path/to/volume

# Allow your user to own the directory
sudo chown -R pi:pi /path/to/volume
```

For persistent data directories it is simplest to pre-create them as your user before first `docker compose up`:

```bash
mkdir -p ~/nas/dev/docker_scripts/my-stack/data
```

---

## Troubleshooting

### `dial unix /run/user/1000/docker.sock: no such file or directory`

The rootless Docker daemon is not running for your session.

```bash
# Start it
systemctl --user start docker

# Check why it failed to start automatically
systemctl --user status docker
journalctl --user -u docker -n 50
```

If the daemon never starts at boot, verify lingering is enabled:

```bash
loginctl show-user pi | grep Linger   # should be Linger=yes
```

If not:
```bash
sudo loginctl enable-linger pi
```

### `DOCKER_HOST` not set after SSH login

Add the export to both `~/.bashrc` **and** `~/.profile`:

```bash
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock
```

### Permission denied on `/var/run/docker.sock`

You're accidentally hitting the old root socket. Confirm `DOCKER_HOST` is set:

```bash
echo $DOCKER_HOST
```

### Checking which Docker is in use

```bash
docker context ls
docker info | grep -i rootless
```

---

## Quick reference

```bash
# Daemon
systemctl --user start|stop|restart|status docker

# Run containers as usual
docker compose up -d
docker ps
docker compose logs -f

# View user daemon logs
journalctl --user -u docker -f
```
