import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
// Ensure the secret is exactly 32 bytes for aes-256
// If SESSION_SECRET is not 32 bytes, we hash it to derive a 32-byte key
const secretKeyString = process.env.SESSION_SECRET || 'nocturne_fallback_secret_key_1234567890';
const key = crypto.createHash('sha256').update(String(secretKeyString)).digest();

export function encryptText(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptText(encryptedData: string): string {
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) return encryptedData; // Return as-is if not in encrypted format (backward compatibility)
        
        const [ivHex, authTagHex, encryptedText] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error("Decryption failed, returning original text.");
        return encryptedData;
    }
}
