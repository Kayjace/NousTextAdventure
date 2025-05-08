import { ethers } from 'ethers';

// Authentication token creation function
export const createAuthToken = (address: string, signature: string): string => {
  // Create a simple JWT format
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    address: address.toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // Valid for 24 hours
  }));
  
  // Use part of the signature as the secret key
  const secret = signature.substring(2, 42);
  
  // Generate a simple signature
  const signatureData = ethers.keccak256(
    ethers.toUtf8Bytes(`${header}.${payload}.${secret}`)
  );
  
  return `${header}.${payload}.${signatureData}`;
};

// Authentication token verification function
export const verifyAuthToken = (token: string, storedSignature: string): boolean => {
  try {
    const [header, payload, tokenSignature] = token.split('.');
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp < Date.now()) {
      return false;
    }
    
    // Verify signature
    const secret = storedSignature.substring(2, 42);
    const expectedSignature = ethers.keccak256(
      ethers.toUtf8Bytes(`${header}.${payload}.${secret}`)
    );
    
    return tokenSignature === expectedSignature;
  } catch (e) {
    return false;
  }
};