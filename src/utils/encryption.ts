// Encryption utilities for decrypting Node.js encrypted data
export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
}

export async function decryptData(encryptedData: EncryptedData, passcode: string): Promise<string> {
  try {
    // Convert hex strings back to Uint8Arrays
    const salt = new Uint8Array(encryptedData.salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const iv = new Uint8Array(encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Import the passcode as a raw key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passcode),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive the key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    );
    
    // Convert hex encrypted data to ArrayBuffer
    const encryptedBytes = new Uint8Array(encryptedData.encrypted.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encryptedBytes
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt data. Invalid passcode or corrupted data.');
  }
}

// Store either the passcode or the decrypted data in localStorage
export function storeAccessData(data: string): void {
  localStorage.setItem('screenplayData', data);
}

export function loadAccessData(): string {
  return localStorage.getItem('screenplayData') || '';
}

export function clearAccessData(): void {
  localStorage.removeItem('screenplayData');
} 
