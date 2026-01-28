# Railway GitHub Auto-Deploy Setup

## Current State
The brain server currently requires manual `railway up` commands to deploy changes.

## Steps to Enable Auto-Deploy

### 1. Go to Railway Dashboard
- Navigate to: https://railway.app/project/[your-project-id]
- Select the **b0b-brain** service

### 2. Connect GitHub Repository
1. Click **Settings** tab
2. Under **Source**, click **Connect GitHub**
3. Select the `1800bobrossdotcom-byte/b0b-dashboard` repository
4. Set the branch to `main`

### 3. Configure Build Settings
1. Root Directory: `brain/`
2. Build Command: `npm install`
3. Start Command: `node brain-server.js`

### 4. Environment Variables
Ensure these are set in Railway:
- `PHANTOM_PRIVATE_KEY` - Trading wallet key
- `TRADING_WALLET` - Wallet address
- `COLD_WALLET` - Cold storage address
- `ANTHROPIC_API_KEY` - For Claude AI (optional)
- `OPENAI_API_KEY` - For GPT (optional)
- `GITHUB_TOKEN` - For repo access (optional)

### 5. Enable Auto-Deploy
1. In Settings, find **Deploy Triggers**
2. Toggle ON: **Auto Deploy on Push**
3. Ensure **Branch** is set to `main`

## After Setup
- Every push to `main` will automatically deploy to Railway
- No more manual `railway up` needed
- Deploys typically take 1-2 minutes

## Verification
After enabling, push a small change and check:
1. Railway dashboard shows new deployment
2. Brain server `/health` returns updated timestamp
