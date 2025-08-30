const fs = require('fs');
const crypto = require('crypto');

// Configuration
const INPUT_FILE = './src/data/screenplay.json';
const OUTPUT_FILE = './src/data/screenplay-encrypted.json';
const PASSPHRASE = process.argv[2] || 'default-passcode';

if (!process.argv[2]) {
  console.log('Usage: node encrypt-screenplay.cjs <passcode>');
  console.log('No passcode provided, using default: "default-passcode"');
}

function encryptData(data, passphrase) {
  // Generate a random salt and IV
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  
  // Derive key using PBKDF2
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
  
  // Create cipher using createCipheriv (the secure version)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex')
  };
}

try {
  // Read the original screenplay data
  console.log(`Reading ${INPUT_FILE}...`);
  const screenplayData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  
  // Encrypt the data
  console.log('Encrypting data...');
  const encryptedData = encryptData(screenplayData, PASSPHRASE);
  
  // Write encrypted data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(encryptedData, null, 2));
  
  console.log(`✅ Encrypted data written to ${OUTPUT_FILE}`);
  console.log(`🔑 Passcode used: ${PASSPHRASE}`);
  console.log(`📊 Original size: ${JSON.stringify(screenplayData).length} bytes`);
  console.log(`🔒 Encrypted size: ${JSON.stringify(encryptedData).length} bytes`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 