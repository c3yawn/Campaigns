# Self-Hosting Roadmap — The Yawniverse

Written as a pick-up-and-go reference. Everything here assumes you are migrating
from the current setup (hosted Supabase + GitHub Pages) to a self-hosted VPS stack
managed by Coolify.

---

## Why bother

- OAuth consent screen shows your domain instead of `ogwmphbvlhqslkinhagn.supabase.co`
- Full control over the database (backups, extensions, direct SQL access)
- Campaign images served from your own S3-compatible storage (Minio) instead of GitHub
- Plausible analytics without sending data to Google
- Supabase Realtime (WebSockets) already included — enables live chat and real-time
  campaign updates with zero extra infrastructure
- One monthly VPS bill covers everything

---

## Stack overview

| Service | Role | Port (internal) |
|---|---|---|
| **Coolify** | PaaS layer — deploys and manages everything else | 8000 |
| **Supabase** | Auth, database (Postgres), Realtime, Storage API | 8000 (Kong) |
| **Minio** | S3-compatible object storage for campaign images | 9000 / 9001 |
| **Plausible** | Privacy-friendly analytics | 8001 |
| **Vaultwarden** | Personal password manager (see note below) | 80 |

### A note on Vaultwarden

Vaultwarden is a self-hosted Bitwarden-compatible password manager. It does **not**
add any feature to the campaign tracker itself — your site's users will never
interact with it. What it gives **you**:

- A secure place to store all the secrets involved in running this stack (Supabase
  service key, Minio root credentials, Plausible secret key, Google OAuth secret, etc.)
- Accessible from any device via the Bitwarden browser extension or mobile app
- Keeps you from storing secrets in Notion, a notes app, or your browser

Worth running on the same VPS since it's extremely lightweight (~50MB RAM).
Whether to include it is purely a personal preference call.

---

## Infrastructure requirements

### VPS sizing

Minimum for this full stack:

| Tier | Spec | Est. cost | Notes |
|---|---|---|---|
| Minimum | 4 vCPU / 8GB RAM / 80GB disk | ~€8/mo (Hetzner CX32) | Tight but works |
| Comfortable | 4 vCPU / 16GB RAM / 160GB disk | ~€16/mo (Hetzner CX42) | Recommended |

Supabase alone needs ~3-4GB RAM. Minio, Plausible, and Vaultwarden add ~500MB total.

**Recommended provider: Hetzner** (cheapest per spec, datacenter in Nuremberg/Helsinki/Ashburn)
Alternatives: DigitalOcean (more beginner-friendly UI), Vultr, Linode

### Domain setup

You need a domain. Assume `yawniverse.com` for this doc — substitute yours.

DNS records to create (all A records pointing to your VPS IP):

```
yawniverse.com          → VPS IP   (future: serve the React app from here instead of GitHub Pages)
supabase.yawniverse.com → VPS IP   (Supabase Studio dashboard)
auth.yawniverse.com     → VPS IP   (GoTrue auth — this fixes the Google consent screen)
db.yawniverse.com       → VPS IP   (optional: direct Postgres access)
storage.yawniverse.com  → VPS IP   (Minio API)
storage-ui.yawniverse.com → VPS IP (Minio console)
analytics.yawniverse.com → VPS IP  (Plausible)
vault.yawniverse.com    → VPS IP   (Vaultwarden, if included)
```

Coolify handles SSL for all of these automatically via Let's Encrypt.

---

## Phase 1 — Coolify installation

SSH into your VPS as root, then:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This installs Docker, Docker Compose, and Coolify itself. Takes ~5 minutes.
Access Coolify at `http://YOUR_VPS_IP:8000` and create your admin account.

**First things to configure in Coolify:**
1. Settings → Domain → set to `coolify.yawniverse.com` (add that DNS record too)
2. Settings → SSL → enable Let's Encrypt, add your email
3. Add your server (it asks to SSH back into itself — follow the UI)

---

## Phase 1.5 — Server hardening

Do this immediately after Coolify is installed, before exposing any services.

> **Critical order of operations — read before touching SSH:**
> 1. Add your public key to `~/.ssh/authorized_keys` first
> 2. Edit `sshd_config` but do NOT restart SSH yet
> 3. Open your new SSH port in UFW **before** restarting SSH
> 4. Restart SSH, then test from a **second terminal**
> 5. Only close port 22 after confirming the new port works

### SSH hardening

On Ubuntu 24.04, drop a file in `/etc/ssh/sshd_config.d/` rather than editing the main config:

```bash
sudo nano /etc/ssh/sshd_config.d/99-hardening.conf
```

```
Port 2222                        # any non-standard port 1024–65535
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
PermitEmptyPasswords no
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256
KexAlgorithms sntrup761x25519-sha512@openssh.com,curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group18-sha512,diffie-hellman-group16-sha512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com
```

```bash
# Validate syntax (no output = OK)
sudo sshd -t
# Open new port in UFW BEFORE restarting
sudo ufw allow 2222/tcp comment 'SSH'
# Restart, keep old terminal open, test from second terminal
sudo systemctl restart ssh
ssh -p 2222 -i ~/.ssh/id_ed25519 youruser@your-server-ip
```

### UFW firewall

> **Critical Docker gotcha:** Docker writes its own iptables NAT rules that bypass UFW's INPUT chain. A container with `-p 5432:5432` is publicly reachable even if you `ufw deny 5432`. Fix this with `ufw-docker` (see Docker section below).

```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw allow 8000/tcp comment 'Coolify dashboard'  # close after custom domain configured
sudo ufw allow 6001/tcp comment 'Coolify WebSocket'  # close after custom domain configured
sudo ufw allow 6002/tcp comment 'Coolify terminal'   # close after custom domain configured
sudo ufw enable
sudo ufw status verbose
```

**Never open these publicly:**

| Service | Port | Why |
|---|---|---|
| PostgreSQL | 5432 | Access via Supabase API only |
| Supabase Studio | 3000 | Proxy via Traefik |
| Minio API/Console | 9000/9001 | Proxy via Traefik |
| Plausible | internal | Proxy via Traefik |
| Vaultwarden | internal | Proxy via Traefik |

After Coolify's custom domain is set up and serving via Traefik on 443:
```bash
sudo ufw delete allow 8000/tcp
sudo ufw delete allow 6001/tcp
sudo ufw delete allow 6002/tcp
```

### Docker UFW bypass fix

```bash
sudo wget -O /usr/local/bin/ufw-docker \
  https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker
sudo chmod +x /usr/local/bin/ufw-docker
sudo ufw-docker install
sudo systemctl restart ufw
# Explicitly allow only Traefik through
sudo ufw route allow proto tcp from any to any port 80
sudo ufw route allow proto tcp from any to any port 443
```

### fail2ban (SSH) + CrowdSec (HTTP)

**Recommendation:** run fail2ban for SSH (simple, proven) and CrowdSec for HTTP services (community threat intelligence, handles high log volume better).

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 4
backend  = systemd
ignoreip = 127.0.0.1/8 ::1 YOUR.HOME.IP.HERE
banaction = iptables-allports

[sshd]
enabled  = true
port     = 2222
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
bantime  = 86400

[vaultwarden]
enabled  = true
port     = http,https
filter   = vaultwarden
logpath  = /var/lib/docker/volumes/*vaultwarden*/_data/vaultwarden.log
maxretry = 3
bantime  = 14400
```

Create Vaultwarden filter:
```bash
sudo nano /etc/fail2ban/filter.d/vaultwarden.conf
```
```ini
[Definition]
failregex = ^.*Username or password is incorrect\. Try again\. IP: <ADDR>\..*$
            ^.*TOTP or recovery code not found for user.*IP: <ADDR>.*$
ignoreregex =
```

Install CrowdSec for HTTP/Traefik:
```bash
curl -s https://install.crowdsec.net | sudo bash
sudo apt install crowdsec crowdsec-firewall-bouncer-nftables -y
sudo cscli scenarios list   # see what attack patterns are detected
sudo cscli decisions list   # see currently blocked IPs
```

### Automatic security updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Key settings to enable:
```
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

> Note: `unattended-upgrades` does NOT update Docker container images. That requires Coolify's built-in update mechanism or manual pulls.

### GeoIP blocking (optional)

Worth doing for SSH and Vaultwarden. Not recommended for Plausible (analytics is global by nature).

```bash
git clone https://github.com/friendly-bits/geoip-shell
cd geoip-shell
sudo bash geoip-shell-install.sh
# Whitelist only your country (e.g. US) on SSH port
sudo geoip-shell apply -c US -m whitelist -p tcp:2222
```

GeoIP is defense-in-depth, not a replacement for fail2ban. VPNs bypass it trivially, and geolocation databases have ~1-2% misclassification.

### Coolify-specific security

> **⚠ Critical:** Coolify disclosed 11 critical vulnerabilities in early 2026 affecting versions before `4.0.0-beta.445`. Highlights:
> - CVE-2025-64420 (CVSS 10.0): low-privileged user can read the **root private SSH key**
> - CVE-2025-66209/66210/66211 (CVSS 10.0): command injection in DB scripts — any authenticated user gets a root shell on the host
> - CVE-2025-59156 (CVSS 9.4): arbitrary Docker Compose directive injection → root RCE
>
> **Verify your version:** Coolify UI → Settings → About. Must be ≥ `4.0.0-beta.445`.

- Never share the Coolify admin account. Anyone with Coolify UI access effectively has near-root on the host.
- After setting up your custom domain via Traefik, close ports 8000/6001/6002 (see UFW section).
- Consider restricting Coolify dashboard to your home IP only:
  ```bash
  sudo ufw allow from YOUR.HOME.IP to any port 8000 proto tcp
  ```
- Best option: run Coolify management ports over **Tailscale** so they're never on the public internet:
  ```bash
  curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up
  ```

### Docker hardening

```bash
sudo nano /etc/docker/daemon.json
```

```json
{
  "icc": false,
  "no-new-privileges": true,
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "userland-proxy": false,
  "live-restore": true
}
```

> **Do NOT add** `"userns-remap"` — Coolify requires root container management and this breaks it.
> **Do NOT add** `"iptables": false` — this breaks Docker networking entirely.

```bash
sudo systemctl restart docker
```

Check the Docker socket is not exposed over TCP (it should return nothing):
```bash
sudo ss -tlnp | grep 2375
```

Audit which containers mount the Docker socket:
```bash
docker ps -q | xargs -I{} docker inspect {} | grep docker.sock
```

---

## Phase 2 — Supabase self-hosted

### Deploy via Coolify

1. Coolify dashboard → **New Resource** → **Service** → search **Supabase**
2. Coolify generates a full `docker-compose.yml` with all Supabase services:
   - `supabase-db` — Postgres 15
   - `supabase-auth` — GoTrue (handles OAuth)
   - `supabase-rest` — PostgREST
   - `supabase-realtime` — Phoenix-based WebSocket server
   - `supabase-storage` — Storage API (you'll point this at Minio later)
   - `supabase-kong` — API gateway
   - `supabase-studio` — the dashboard UI
3. Set the domain to `supabase.yawniverse.com`
4. Set these critical environment variables in Coolify's UI:

```env
SITE_URL=https://yawniverse.com
API_EXTERNAL_URL=https://supabase.yawniverse.com
SUPABASE_PUBLIC_URL=https://supabase.yawniverse.com
JWT_SECRET=<generate: openssl rand -base64 64>
ANON_KEY=<generate using supabase-js or the JWT tool below>
SERVICE_ROLE_KEY=<generate using the JWT tool below>
POSTGRES_PASSWORD=<strong random password>
DASHBOARD_USERNAME=<your choice>
DASHBOARD_PASSWORD=<strong password>
```

To generate ANON_KEY and SERVICE_ROLE_KEY, use the Supabase JWT tool:
https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

5. Deploy. First boot takes 2-3 minutes.
6. Access Studio at `https://supabase.yawniverse.com` — log in with DASHBOARD credentials.

### Update Google OAuth

In Google Cloud Console → APIs & Services → Credentials → your OAuth client:
- Remove: `https://ogwmphbvlhqslkinhagn.supabase.co/auth/v1/callback`
- Add: `https://auth.yawniverse.com/auth/v1/callback`

In Supabase Studio (self-hosted) → Authentication → Providers → Google:
- Paste the same Client ID and Secret from Google Cloud Console

### Migrate data from hosted Supabase

```bash
# On your local machine — export from hosted
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.ogwmphbvlhqslkinhagn.supabase.co:5432/postgres" > backup.sql

# Import into self-hosted
psql "postgresql://postgres:[POSTGRES_PASSWORD]@db.yawniverse.com:5432/postgres" < backup.sql
```

Auth users can be exported from hosted Supabase dashboard:
Authentication → Users → Export (CSV), then re-import via SQL or the Auth API.
In practice for a small personal app it may be easier to just have users re-register.

### Supabase security hardening

The Supabase Docker Compose repo ships with insecure defaults. Change **every single one** before exposing the instance:

```bash
# Generate strong secrets
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
# After setting JWT_SECRET, regenerate ANON_KEY and SERVICE_ROLE_KEY
# The old default keys are publicly known and must not be reused
bash generate-keys.sh --update-env
```

- **Never put `SERVICE_ROLE_KEY` in client-side code.** It bypasses RLS entirely. Use it only in server-side scripts.
- **RLS is non-negotiable.** The `ANON_KEY` is public-facing and anyone with it can read all rows from any table without RLS.

```sql
-- Verify all tables have RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;

-- Typical user-data policy
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can access own data"
  ON your_table FOR ALL USING (auth.uid() = user_id);
```

Verify Postgres is NOT exposed to the internet (should show nothing or `127.0.0.1` only):
```bash
docker port supabase-db
```

### Secrets management

```bash
# .env files readable only by owner
chmod 600 /path/to/.env
# Coolify's own env file
chmod 600 /data/coolify/source/.env

# Scan git history for accidentally committed secrets
go install github.com/gitleaks/gitleaks/v8@latest
gitleaks detect --source .
```

### SSL/TLS — Traefik hardening

Create `/data/coolify/proxy/dynamic/tls.yml`:
```yaml
tls:
  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
      sniStrict: true
```

Add security headers middleware in `/data/coolify/proxy/dynamic/headers.yml`:
```yaml
http:
  middlewares:
    secure-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        forceSTSHeader: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
        customFrameOptionsValue: "SAMEORIGIN"
```

---

## Phase 3 — Minio (object storage)

### Deploy via Coolify

1. New Resource → Service → search **Minio**
2. Set domains:
   - API: `storage.yawniverse.com`
   - Console: `storage-ui.yawniverse.com`
3. Environment variables:

```env
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<strong password — save in Vaultwarden>
```

4. Deploy. Access console at `https://storage-ui.yawniverse.com`.

### Configure Minio for campaign images

In the Minio console:
1. Create a bucket: `campaign-images`
2. Set bucket policy to **public read** (so images load without auth tokens)
3. Create an access key for the app — save the key ID and secret

### Wire Minio into Supabase Storage (optional but clean)

Supabase Storage can use an S3-compatible backend. In your self-hosted Supabase
`docker-compose.yml`, update the storage service environment:

```env
STORAGE_BACKEND=s3
GLOBAL_S3_BUCKET=supabase-storage
GLOBAL_S3_ENDPOINT=https://storage.yawniverse.com
GLOBAL_S3_PROTOCOL=https
GLOBAL_S3_FORCE_PATH_STYLE=true
AWS_ACCESS_KEY_ID=<minio access key>
AWS_SECRET_ACCESS_KEY=<minio secret key>
```

This makes Supabase Storage use your Minio instance as the backend, so you only
interact with one API (Supabase Storage) and Minio handles the actual files.

### Update the app to serve images from Minio

Currently campaign images are in `public/images/campaigns/` (served by GitHub Pages).
After migration, images go in the Minio bucket and the `image` field in `campaigns.js`
changes from a relative path to a full URL:

```js
// Before
image: '/images/campaigns/strahd.jpg'

// After
image: 'https://storage.yawniverse.com/campaign-images/strahd.jpg'
```

`CampaignCard.jsx` already passes the `image` field directly to MUI's `CardMedia`
as the `image` prop — no code changes needed, just update the URLs in `campaigns.js`.

### Update environment variables in the app

```env
# .env.local
VITE_SUPABASE_URL=https://supabase.yawniverse.com
VITE_SUPABASE_ANON_KEY=<new anon key from self-hosted instance>
VITE_STORAGE_URL=https://storage.yawniverse.com
```

---

## Phase 4 — Plausible analytics

### Deploy via Coolify

1. New Resource → Service → search **Plausible**
2. Domain: `analytics.yawniverse.com`
3. Environment variables:

```env
BASE_URL=https://analytics.yawniverse.com
SECRET_KEY_BASE=<generate: openssl rand -base64 64>
DISABLE_REGISTRATION=true
```

4. Deploy. Create your admin account on first visit.
5. Add a site: `yawniverse.com` (or `c3yawn.github.io` if staying on GitHub Pages for now)

### Add tracking snippet to the app

In `index.html`, add before `</head>`:

```html
<script defer data-domain="yawniverse.com" src="https://analytics.yawniverse.com/js/script.js"></script>
```

That's the entire integration. Plausible is cookieless and GDPR-compliant — no
consent banner needed.

---

## Phase 5 — Vaultwarden (optional)

### Deploy via Coolify

1. New Resource → Service → search **Vaultwarden**
2. Domain: `vault.yawniverse.com`
3. Environment variables:

```env
SIGNUPS_ALLOWED=false
ADMIN_TOKEN=<generate: openssl rand -base64 48>
```

Setting `SIGNUPS_ALLOWED=false` means only you can use it (via admin token).

4. Deploy. Visit `https://vault.yawniverse.com/admin` to create your account.
5. Install the Bitwarden browser extension → point it at `https://vault.yawniverse.com`

**What to store here:** Minio root credentials, Supabase service role key, Postgres
password, Google OAuth secret, VPS root SSH key passphrase, Coolify admin password.

---

## Phase 6 — Realtime (WebSockets for chat + live updates)

### What you already have

Supabase Realtime is **already running** as part of your self-hosted Supabase stack.
No additional service needed. It provides three channels:

| Channel type | Use case |
|---|---|
| **Postgres Changes** | Listen to DB inserts/updates/deletes in real time |
| **Broadcast** | Send ephemeral messages between clients (chat) |
| **Presence** | Track who is currently online / viewing a page |

### Database schema for chat

When you're ready to implement, create this table in Supabase:

```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  campaign_id text not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS
alter table messages enable row level security;
create policy "authenticated users can read messages"
  on messages for select using (auth.role() = 'authenticated');
create policy "users can insert their own messages"
  on messages for insert with check (auth.uid() = user_id);
```

### React integration (Supabase Realtime)

Install is already done (`@supabase/supabase-js` includes Realtime).

**Chat messages (Broadcast + Postgres Changes):**

```js
// Subscribe to new messages for a campaign
const channel = supabase
  .channel(`campaign:${campaignId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `campaign_id=eq.${campaignId}` },
    (payload) => setMessages((prev) => [...prev, payload.new])
  )
  .subscribe();

// Cleanup
return () => supabase.removeChannel(channel);
```

**Send a message:**

```js
await supabase.from('messages').insert({
  campaign_id: campaignId,
  user_id: user.id,
  content: text,
});
```

**Presence (who's online):**

```js
const channel = supabase.channel(`campaign:${campaignId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    setOnlineUsers(Object.values(state).flat());
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: user.id, name: user.user_metadata.full_name });
    }
  });
```

### Files to create/modify when implementing chat

| File | Change |
|---|---|
| `src/pages/CampaignPage.jsx` | Add chat panel, Realtime subscription |
| `src/components/ChatPanel.jsx` | New — message list + input |
| `src/hooks/useMessages.js` | New — Realtime subscription logic |
| `src/hooks/usePresence.js` | New — online users tracking |
| `src/data/campaigns.js` | No change needed |

---

## Monitoring and backups

### Uptime Kuma monitors to configure

Add monitors for: Coolify dashboard URL, Supabase API endpoint, Vaultwarden login page, Plausible URL, Minio health (`http://localhost:9000/minio/health/live`), SSH port (TCP monitor on port 2222). Set up Telegram/Discord/ntfy.sh notifications.

### Disk full alert (silent killer — set this up on day one)

```bash
sudo nano /usr/local/bin/disk-alert.sh
```
```bash
#!/bin/bash
THRESHOLD=85
df -H | grep -vE '^Filesystem|tmpfs|cdrom|udev' | awk '{print $5 " " $1}' | while read output; do
    usage=$(echo "$output" | awk '{print $1}' | cut -d'%' -f1)
    partition=$(echo "$output" | awk '{print $2}')
    if [ "$usage" -ge "$THRESHOLD" ]; then
        echo "DISK ALERT: $partition at ${usage}%" | mail -s "Disk Alert" you@example.com
    fi
done
```
```bash
sudo chmod +x /usr/local/bin/disk-alert.sh
echo "0 8 * * * root /usr/local/bin/disk-alert.sh" | sudo tee /etc/cron.d/disk-alert
```

### PostgreSQL backups

> **Important Supabase note:** Use `pg_dumpall`, not `pg_dump`. Supabase uses a role hierarchy that `pg_dump` alone cannot capture — restores will fail with role errors.

```bash
sudo mkdir -p /backups
# Nightly backup at 2am, keep 7 days
echo "0 2 * * * root docker exec supabase-db pg_dumpall -U postgres | gzip > /backups/supabase-\$(date +\%Y\%m\%d).sql.gz && find /backups -name 'supabase-*.sql.gz' -mtime +7 -delete" | sudo tee /etc/cron.d/postgres-backup
```

Push offsite to Backblaze B2 or Wasabi (cheap S3-compatible storage — do not use the same Minio instance your app uses):
```bash
mc alias set offsite https://s3.us-west-001.backblazeb2.com KEY SECRET
echo "0 3 * * * root mc mirror /backups offsite/your-bucket/postgres/ >> /var/log/backup.log 2>&1" | sudo tee /etc/cron.d/offsite-backup
```

### Vaultwarden backup

```bash
echo "0 1 * * * root tar -czf /backups/vaultwarden-\$(date +\%Y\%m\%d).tar.gz /data/coolify/services/vaultwarden/data/ && find /backups -name 'vaultwarden-*.tar.gz' -mtime +14 -delete" | sudo tee /etc/cron.d/vaultwarden-backup
```

**Test restores quarterly.** Backups you have never restored are not backups.

---

## Cloudflare (optional but recommended)

### Pros
- Hides your server's real IP from attackers
- Free DDoS absorption at Cloudflare's edge
- Free CDN/caching for static assets
- Automatic HTTPS redirect

### Cons
- Cloudflare decrypts your TLS at their edge (they see plaintext). Use "Full (Strict)" mode to re-encrypt to your origin.
- If your server IP leaked in DNS history or SSL cert logs (crt.sh), attackers can bypass Cloudflare entirely.
- Supabase Realtime WebSocket long-lived connections may be dropped on the free tier.
- Do not route Vaultwarden through Cloudflare if you'd prefer no third party in the path of your password manager.

### Setup: lock origin to Cloudflare IPs only

After enabling the orange cloud proxy in Cloudflare DNS, restrict your VPS to only accept 80/443 from Cloudflare:

```bash
sudo nano /usr/local/bin/ufw-cloudflare.sh
```
```bash
#!/bin/bash
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  ufw allow from $ip to any port 80,443 proto tcp comment "cloudflare"
done
ufw deny 80/tcp
ufw deny 443/tcp
ufw reload
```
```bash
sudo chmod +x /usr/local/bin/ufw-cloudflare.sh
sudo /usr/local/bin/ufw-cloudflare.sh
echo "0 4 * * 0 root /usr/local/bin/ufw-cloudflare.sh" | sudo tee /etc/cron.d/ufw-cloudflare
```

Set Cloudflare SSL mode to **Full (Strict)** in the Cloudflare dashboard.

---

## Security checklist (deploy day)

**SSH**
- [ ] ED25519 key in `authorized_keys` before touching `sshd_config`
- [ ] Port changed from 22, `PasswordAuthentication no`, `PermitRootLogin no`
- [ ] New port opened in UFW before SSH restart
- [ ] Verified new config from a second terminal

**Firewall**
- [ ] UFW default deny inbound
- [ ] Only 80, 443, SSH port open publicly
- [ ] ufw-docker installed
- [ ] Coolify ports closed after custom domain configured

**Intrusion prevention**
- [ ] fail2ban running, SSH jail configured with 24h ban
- [ ] CrowdSec running for HTTP services
- [ ] Vaultwarden fail2ban filter active
- [ ] Home IP in fail2ban `ignoreip`

**Coolify**
- [ ] Version ≥ `4.0.0-beta.445` (patches 11 critical CVEs from Jan 2026)
- [ ] Admin account not shared
- [ ] Dashboard restricted to trusted IP or behind Tailscale

**Docker**
- [ ] `/etc/docker/daemon.json` hardened (`icc: false`, `no-new-privileges: true`)
- [ ] Docker socket not exposed over TCP (`ss -tlnp | grep 2375` returns nothing)
- [ ] ufw-docker installed and route rules added for 80/443

**Supabase**
- [ ] `POSTGRES_PASSWORD` and `JWT_SECRET` changed from defaults
- [ ] `ANON_KEY` and `SERVICE_ROLE_KEY` regenerated from new `JWT_SECRET`
- [ ] RLS enabled on all public schema tables
- [ ] Postgres port not exposed to internet
- [ ] `SERVICE_ROLE_KEY` never in client-side code

**Secrets**
- [ ] All `.env` files `chmod 600`
- [ ] No secrets in git history (`gitleaks detect` clean)
- [ ] `/data/coolify/source/.env` secured

**SSL/TLS**
- [ ] Let's Encrypt email set in Coolify
- [ ] Traefik TLS minimum version set to 1.2
- [ ] Security headers middleware configured

**Backups**
- [ ] `pg_dumpall` cron running nightly
- [ ] Offsite push to Backblaze B2 / Wasabi configured
- [ ] Vaultwarden backup cron running
- [ ] Restore tested at least once
- [ ] Disk alert cron running

**Monitoring**
- [ ] Uptime Kuma monitors all services with notifications
- [ ] Disk full alert active

---

## Migration checklist (when ready to pull the trigger)

- [ ] Spin up VPS, point DNS
- [ ] Install Coolify
- [ ] Deploy Supabase, verify Studio accessible
- [ ] Update Google OAuth redirect URI
- [ ] Export data from hosted Supabase, import to self-hosted
- [ ] Deploy Minio, create `campaign-images` bucket
- [ ] Upload existing campaign images to Minio, update `campaigns.js` URLs
- [ ] Wire Supabase Storage → Minio backend
- [ ] Deploy Plausible, add snippet to `index.html`
- [ ] Deploy Vaultwarden (optional), migrate saved secrets
- [ ] Update `.env.local` and GitHub secrets with new URLs/keys
- [ ] Update Supabase Auth URL config (Site URL + redirect URLs)
- [ ] Test sign-in flow end to end
- [ ] Verify OAuth consent screen now shows your domain
- [ ] Cancel hosted Supabase project

---

## Current state of the codebase (as of this writing)

All auth code is already written and compatible with self-hosted Supabase —
the only change needed at migration time is updating two environment variables:

```env
VITE_SUPABASE_URL=https://supabase.yawniverse.com   # was: https://ogwmphbvlhqslkinhagn.supabase.co
VITE_SUPABASE_ANON_KEY=<new key>                     # was: eyJhbGci...
```

Update these in:
1. `.env.local` (local dev)
2. GitHub repository secrets (production build)

No code changes needed in any `.jsx` or `.js` file.
