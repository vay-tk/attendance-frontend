const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

const hashData = (data) => {
  // Simple hash function for client-side use
  let hash = 0;
  if (data.length === 0) return hash.toString();
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
};

export const generateSecureToken = () => {
  const timestamp = Date.now().toString();
  const random = generateRandomString(16);
  return hashData(timestamp + random);
};

export const validateIntegrity = (data, hash) => {
  return hashData(data) === hash;
};

export const encryptLocal = (text) => {
  // Simple client-side obfuscation (not real encryption)
  return btoa(text);
};

export const decryptLocal = (ciphertext) => {
  try {
    return atob(ciphertext);
  } catch (error) {
    console.error('Decryption error:', error);
    return ciphertext;
  }
};

export const generateQRPayload = (sessionId, token) => {
  return JSON.stringify({
    sessionId,
    token,
    timestamp: Date.now(),
    version: '1.0'
  });
};

export const parseQRPayload = (qrString) => {
  try {
    const data = JSON.parse(qrString);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Invalid QR code format' };
  }
};