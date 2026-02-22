# Fix for @sylphai/adal-cli-linux-x64 installation

## What’s wrong

The error `fs.cpSync is not a function` happens because:

- The package’s postinstall script uses `fs.cpSync()`.
- `fs.cpSync` exists only in **Node.js 16.7.0 and later**.

So your current Node version is older than 16.7.

## Fix 1: Upgrade Node.js (recommended)

Use Node **16.7+** (or 18 LTS / 20 LTS).

### Check current version (in WSL)

```bash
node -v
```

### Option A: Using nvm (if installed)

```bash
nvm install 20
nvm use 20
node -v   # should show v20.x.x
```

Then in your project (without sudo):

```bash
npm install
# or
npm install @sylphai/adal-cli-linux-x64
```

### Option B: Install Node 20 from NodeSource (Ubuntu/Debian WSL)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

Then:

```bash
cd /mnt/d/Dheerajkumar/Projects/dks_vibe_logg
npm install
```

### Important

- Prefer **not** using `sudo npm install` for project dependencies; use a user-level Node (e.g. via nvm) so you don’t hit permission issues.
- After upgrading Node, remove existing install and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

Then run `adal` again.

## Fix 2: If you cannot upgrade Node (not recommended)

You would have to patch `node_modules/@sylphai/adal-cli-linux-x64/postinstall.cjs` to replace `fs.cpSync` with a recursive copy that works on older Node (e.g. using `fs.copyFileSync` + `fs.readdirSync`). That’s fragile and gets overwritten on every `npm install`, so upgrading Node is the better fix.

## Summary

- **Cause:** Node &lt; 16.7 (no `fs.cpSync`).
- **Fix:** Use Node 16.7+ (ideally 18 or 20 LTS), then `npm install` (no sudo) in the project and run `adal`.
