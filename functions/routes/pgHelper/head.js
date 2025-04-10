// head.js - Check content type based on hash
const { Client } = require('pg');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'HEAD,OPTIONS',
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
        headers: {
          ...headers, 
          'Content-Type': event.queryParameters
        }
      };
    }
    
    // Get content type, type and description from database
    const result = await client.query(`
      SELECT type
      FROM url_mappings
      WHERE hash = $1 AND expires_at > NOW()
    `, [hash]);
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: headers
      };
    }
    
    const { type } = result.rows[0];
    const contentType = type === 'url' ? 'url' : 'file';
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': contentType,
      }
    };
    
  } catch (error) {
    console.error('Error checking content type:', error);
    return {
      statusCode: 500,
      headers: headers
    };
  } finally {
    await client.end();
  }
};