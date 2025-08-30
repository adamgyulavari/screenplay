const fs = require('fs');
const crypto = require('crypto');

// Configuration
const INPUT_FILE = './src/data/screenplay.json';
const OUTPUT_FILE = './src/data/screenplay-encrypted.json';
const PASSPHRASE = process.argv[2] || 'default-passcode';
const CUSTOM_TEXT = process.argv[3]; // Optional second parameter for custom text

if (!process.argv[2]) {
  console.log('Usage: node encrypt-screenplay.cjs <passcode> [custom-text]');
  console.log('No passcode provided, using default: "default-passcode"');
  console.log('If custom-text is provided, it will be encrypted instead of the screenplay file');
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
  let dataToEncrypt;
  
  if (CUSTOM_TEXT) {
    // Encrypt the custom text parameter
    dataToEncrypt = CUSTOM_TEXT;
    console.log(`🔤 Encrypting custom text: "${CUSTOM_TEXT}"`);
  } else {
    // Read the original screenplay data
    console.log(`📖 Reading ${INPUT_FILE}...`);
    dataToEncrypt = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  }
  
  // Encrypt the data
  console.log('🔐 Encrypting data...');
  const encryptedData = encryptData(dataToEncrypt, PASSPHRASE);
  
  if (CUSTOM_TEXT) {
    // For custom text, just print the encrypted result
    console.log('\n🔒 Encrypted Result:');
    console.log(JSON.stringify(encryptedData, null, 2));
    console.log(`\n🔑 Passcode used: ${PASSPHRASE}`);
    console.log(`📊 Original size: ${CUSTOM_TEXT.length} characters`);
    console.log(`🔒 Encrypted size: ${JSON.stringify(encryptedData).length} bytes`);
  } else {
    // Write encrypted data to file for screenplay
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(encryptedData, null, 2));
    console.log(`✅ Encrypted data written to ${OUTPUT_FILE}`);
    console.log(`🔑 Passcode used: ${PASSPHRASE}`);
    console.log(`📊 Original size: ${JSON.stringify(dataToEncrypt).length} bytes`);
    console.log(`🔒 Encrypted size: ${JSON.stringify(encryptedData).length} bytes`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 
