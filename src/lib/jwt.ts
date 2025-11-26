const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-please-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Helper function to encode base64url (Edge Runtime compatible)
function base64urlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper function to decode base64url (Edge Runtime compatible)
function base64urlDecode(data: string): string {
  const padding = '='.repeat((4 - (data.length % 4)) % 4);
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return atob(base64);
}

// Helper to convert string to ArrayBuffer
function stringToArrayBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create HMAC signature using Web Crypto API
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  // Import the key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Create signature
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // Convert to base64url
  const signatureArray = new Uint8Array(signature);
  const signatureString = String.fromCharCode(...signatureArray);
  return base64urlEncode(signatureString);
}

// Verify HMAC signature
async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  try {
    const expectedSignature = await createSignature(data, secret);
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Create JWT token (Edge Runtime compatible with proper HMAC)
export async function signToken(payload: TokenPayload): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };
  
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload));
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await createSignature(data, JWT_SECRET);
  
  return `${data}.${signature}`;
}

// Verify JWT token (Edge Runtime compatible with proper HMAC verification)
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.log('Invalid token structure - expected 3 parts, got:', parts.length);
      throw new Error('Invalid token format - please login again');
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Basic format check
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error('Invalid token parts');
    }

    const data = `${encodedHeader}.${encodedPayload}`;
    
    // Verify signature
    const isValid = await verifySignature(data, signature, JWT_SECRET);
    if (!isValid) {
      throw new Error('Invalid token signature');
    }
    
    // Decode and validate payload
    const payload = JSON.parse(base64urlDecode(encodedPayload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    // Validate required fields
    if (!payload.userId || !payload.email || !payload.role) {
      throw new Error('Invalid token payload');
    }
    
    // Return the payload
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token - please login again');
  }
}