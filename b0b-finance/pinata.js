#!/usr/bin/env node
/**
 * 📁 PINATA IPFS INTEGRATION
 * ══════════════════════════════════════════════════════════════
 * 
 * Upload content to IPFS via Pinata.
 * Store trading history, brain states, and artifacts permanently.
 * 
 * Features:
 * - Upload trading history to IPFS
 * - Pin brain memory snapshots
 * - Store L0RE artifacts
 * - x402 payment integration (future)
 * 
 * Usage:
 *   node pinata.js status         - Check Pinata account status
 *   node pinata.js upload <file>  - Upload file to IPFS
 *   node pinata.js snapshot       - Upload brain memory snapshot
 *   node pinata.js trades         - Upload trading history
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.PINATA_JWT}`,
});

// ═══════════════════════════════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function checkStatus() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📁 PINATA IPFS — STATUS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  
  if (!process.env.PINATA_JWT && !process.env.PINATA_API_KEY) {
    console.log('❌ Pinata credentials not configured');
    console.log('   Add to .env:');
    console.log('   PINATA_API_KEY=your_api_key');
    console.log('   PINATA_API_SECRET=your_api_secret');
    console.log('   PINATA_JWT=your_jwt_token');
    return;
  }
  
  try {
    const response = await axios.get(`${PINATA_API_URL}/data/testAuthentication`, {
      headers: getHeaders(),
    });
    
    console.log('  ✅ Connected to Pinata');
    console.log('  Message:', response.data.message);
    
    // Get pin count
    const pins = await axios.get(`${PINATA_API_URL}/data/pinList?pageLimit=1`, {
      headers: getHeaders(),
    });
    
    console.log('  📌 Total Pins:', pins.data.count || 0);
    console.log();
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.response?.data?.error || error.message);
  }
}

async function uploadFile(filePath) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📁 PINATA IPFS — UPLOAD');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ File not found:', filePath);
    return;
  }
  
  const fileName = path.basename(filePath);
  console.log('  📄 File:', fileName);
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const pinataMetadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        source: 'b0b-platform',
        timestamp: new Date().toISOString(),
      },
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          ...getHeaders(),
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );
    
    const { IpfsHash, PinSize, Timestamp } = response.data;
    
    console.log();
    console.log('  ✅ UPLOAD COMPLETE');
    console.log('  ─────────────────────────────────────────');
    console.log('  IPFS Hash:', IpfsHash);
    console.log('  Size:', PinSize, 'bytes');
    console.log('  Timestamp:', Timestamp);
    console.log();
    console.log('  Gateway URLs:');
    console.log('  • https://gateway.pinata.cloud/ipfs/' + IpfsHash);
    console.log('  • https://ipfs.io/ipfs/' + IpfsHash);
    console.log('  • ipfs://' + IpfsHash);
    console.log();
    console.log('═══════════════════════════════════════════════════════════════');
    
    return IpfsHash;
    
  } catch (error) {
    console.log('❌ Upload failed:', error.response?.data?.error || error.message);
  }
}

async function uploadJSON(data, name) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📁 PINATA IPFS — JSON UPLOAD');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('  📄 Name:', name);
  
  try {
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      {
        pinataContent: data,
        pinataMetadata: {
          name: name,
          keyvalues: {
            source: 'b0b-platform',
            timestamp: new Date().toISOString(),
          },
        },
      },
      { headers: getHeaders() }
    );
    
    const { IpfsHash, PinSize, Timestamp } = response.data;
    
    console.log();
    console.log('  ✅ UPLOAD COMPLETE');
    console.log('  IPFS Hash:', IpfsHash);
    console.log('  Gateway: https://gateway.pinata.cloud/ipfs/' + IpfsHash);
    console.log();
    console.log('═══════════════════════════════════════════════════════════════');
    
    return IpfsHash;
    
  } catch (error) {
    console.log('❌ Upload failed:', error.response?.data?.error || error.message);
  }
}

async function snapshotBrain() {
  console.log('  📸 Creating brain memory snapshot...');
  
  const brainMemory = path.join(__dirname, '..', 'brain', 'brain-memory.json');
  if (fs.existsSync(brainMemory)) {
    const memory = JSON.parse(fs.readFileSync(brainMemory, 'utf8'));
    const snapshot = {
      timestamp: new Date().toISOString(),
      type: 'brain-snapshot',
      version: 'L0RE-v0.2.0',
      memory: memory,
    };
    
    await uploadJSON(snapshot, `b0b-brain-snapshot-${Date.now()}`);
  } else {
    console.log('❌ Brain memory not found');
  }
}

async function snapshotTrades() {
  console.log('  📸 Creating trading history snapshot...');
  
  const turb0b00stState = path.join(__dirname, 'turb0b00st-state.json');
  if (fs.existsSync(turb0b00stState)) {
    const state = JSON.parse(fs.readFileSync(turb0b00stState, 'utf8'));
    const snapshot = {
      timestamp: new Date().toISOString(),
      type: 'trading-snapshot',
      version: 'TURB0B00ST-v1.0',
      state: state,
    };
    
    await uploadJSON(snapshot, `turb0b00st-trades-${Date.now()}`);
  } else {
    console.log('❌ TURB0B00ST state not found');
  }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'status':
    checkStatus();
    break;
    
  case 'upload':
    if (!args[1]) {
      console.log('Usage: node pinata.js upload <file_path>');
    } else {
      uploadFile(args[1]);
    }
    break;
    
  case 'snapshot':
    snapshotBrain();
    break;
    
  case 'trades':
    snapshotTrades();
    break;
    
  default:
    console.log('');
    console.log('📁 PINATA IPFS INTEGRATION');
    console.log('');
    console.log('Commands:');
    console.log('  status     - Check Pinata connection');
    console.log('  upload     - Upload file to IPFS');
    console.log('  snapshot   - Upload brain memory snapshot');
    console.log('  trades     - Upload trading history');
    console.log('');
    console.log('Examples:');
    console.log('  node pinata.js status');
    console.log('  node pinata.js upload ./my-file.json');
    console.log('  node pinata.js trades');
}

module.exports = { uploadFile, uploadJSON, checkStatus };
