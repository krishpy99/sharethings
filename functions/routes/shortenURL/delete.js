// delete.js - Handle URL deletion
const { Client } = require('pg');
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
    
    // Get hash from path parameters
    const hash = event.queryParameters?.hash;
    
    // Extract user ID from the auth token
    const userId = await extractUserId(event);
    
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
    
    // Delete URL mapping if it belongs to the user
    const result = await client.query(`
      DELETE FROM url_mappings 
      WHERE hash = $1 AND user_id = $2
      RETURNING hash
    `, [hash, userId]);
    
    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'URL not found or you do not have permission to delete it'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        message: 'URL successfully deleted'
      })
    };
    
  } catch (error) {
    console.error('Error deleting URL:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to delete URL: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};