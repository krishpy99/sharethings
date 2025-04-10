// get.js - Retrieve original URL from shortened hash
const { Client } = require('pg');
const { extractUserId } = require('../../utils/authHelper');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
    
    // Get hash from query parameters
    const hash = event.queryParameters?.hash;
    
    if (!hash) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'Hash parameter is required'
        })
      };
    }
    
    // Get user ID from token for tracking and permissions (if needed)
    const userId = await extractUserId(event);
    
    // Look up in database
    const result = await client.query(`
      SELECT original_url, user_id, description, expires_at 
      FROM url_mappings 
      WHERE hash = $1 AND type = 'url'
    `, [hash]);
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: `URL not found for ${hash}`
        })
      };
    }
    
    const { original_url, user_id, description, expires_at } = result.rows[0];
    
    // Check if URL has expired
    if (new Date(expires_at) < new Date()) {
      return {
        statusCode: 410,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'This URL has expired'
        })
      };
    }
    
    // Update access stats (optional, could track clicks)
    // client.query('UPDATE url_mappings SET access_count = access_count + 1 WHERE hash = $1', [hash]);
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        originalUrl: original_url,
        description: description || "No description provided",
        isOwner: user_id === userId
      })
    };
    
  } catch (error) {
    console.error('Error retrieving original URL:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to retrieve original URL: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};