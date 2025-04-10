// create.js - Handle URL shortening
const { Client } = require('pg');
const crypto = require('crypto');
const { extractUserId } = require('../../utils/authHelper');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

module.exports = async (event) => {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Parse request body
    const body = event.body;
    const { url, description = "No description provided" } = body;
    
    // Extract user ID from the auth token
    const userId = await extractUserId(event);
    const isAuthenticated = userId !== 'anon';
    
    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid URL provided'
        })
      };
    }
    
    // Create timestamp for hash generation
    const timestamp = Date.now().toString();
    
    // Generate 8-char hash using timestamp and URL
    const hash = crypto.createHash('sha256')
      .update(`${timestamp}${url}`)
      .digest('hex')
      .substring(0, 8);
    
    // Calculate expiration based on authentication status
    const ttlDays = isAuthenticated ? 30 : 7; // Longer TTL for authenticated users
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    
    // Store in database with description
    await client.query(`
      INSERT INTO url_mappings 
        (hash, original_url, user_id, expires_at, created_at, type, description) 
      VALUES 
        ($1, $2, $3, $4, to_timestamp($5/1000.0), 'url', $6)
    `, [hash, url, userId, expiresAt, timestamp, description]);
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        hash,
        description,
        expiresAt: expiresAt.toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error creating shortened URL:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to create shortened URL: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};