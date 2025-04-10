// authHelper.js - Utility for verifying authentication tokens
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Cache for JWK data to avoid repeated requests
let jwksCache = null;
let jwksCacheTime = 0;
const JWKS_CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Fetch JWKS (JSON Web Key Set) from Clerk
 * @returns {Promise<Object>} - The JWKS data
 */
const fetchJwks = async () => {
  // Check if cache is valid
  const now = Date.now();
  if (jwksCache && (now - jwksCacheTime < JWKS_CACHE_EXPIRY)) {
    return jwksCache;
  }

  // Fetch fresh JWKS data
  try {
    const clerkIssuer = process.env.CLERK_ISSUER || 'https://clerk.your-domain.com';
    const response = await axios.get(`${clerkIssuer}/.well-known/jwks.json`);
    
    if (response.status === 200 && response.data && response.data.keys) {
      jwksCache = response.data;
      jwksCacheTime = now;
      return jwksCache;
    } else {
      throw new Error('Invalid JWKS response');
    }
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    throw error;
  }
};

/**
 * Find the key that matches the kid (key ID) in the token header
 * @param {Object} header - The JWT header
 * @returns {Promise<Object>} - The matching JWK
 */
const getSigningKey = async (header) => {
  const jwks = await fetchJwks();
  const key = jwks.keys.find(k => k.kid === header.kid);
  
  if (!key) {
    throw new Error('Unable to find matching key for JWT verification');
  }
  
  return key;
};

/**
 * Extract and convert a JWK to a PEM format for verification
 * @param {Object} jwk - The JWK object
 * @returns {string} - PEM formatted key
 */
const jwkToPem = (jwk) => {
  // This is a simplified version - in production, use a library like 'jwk-to-pem'
  // For this example, we're assuming the jwk-to-pem library exists
  const jwkToPem = require('jwk-to-pem');
  return jwkToPem(jwk);
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object|null>} - The decoded token payload or null if invalid
 */
const verifyToken = async (token) => {
  if (!token) {
    return null;
  }
  
  try {
    // Decode the token header first to get the kid
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('Invalid token format');
    }
    
    // Get the signing key that matches the token's kid
    const key = await getSigningKey(decoded.header);
    const pem = jwkToPem(key);
    
    // Verify the token
    const clerkIssuer = process.env.CLERK_ISSUER || 'https://clerk.your-domain.com';
    const verified = jwt.verify(token, pem, {
      algorithms: ['RS256'],
      issuer: clerkIssuer
    });
    
    return verified;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Extract user ID from authenticated request
 * @param {Object} event - Lambda event object
 * @returns {Promise<string>} - User ID or 'anon' if not authenticated
 */
const extractUserId = async (event) => {
  // Extract bearer token from authorization header
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'anon';
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Verify the token
  const payload = await verifyToken(token);
  
  if (payload && payload.sub) {
    return payload.sub; // Subject claim contains the user ID
  }
  
  return authHeader;
};

module.exports = {
  verifyToken,
  extractUserId
};