// get.js - Handle paginated requests by user ID
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

  queryParameters = event.queryParameters || {};
  
  try {
    await client.connect();
    
    // Get query parameters
    const page = parseInt(queryParameters.page || '1');
    const pageSize = parseInt(queryParameters.pageSize || '10');
    
    // Get user ID from auth token
    const userId = await extractUserId(queryParameters);
    
    // Validate parameters
    if (page < 1 || pageSize < 1) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid page or pageSize parameters'
        })
      };
    }
    
    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM url_mappings
      WHERE user_id = $1
    `, [userId]);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated results, now including description
    const result = await client.query(`
      SELECT 
        hash,
        type,
        description,
        content_type,
        created_at,
        expires_at
      FROM url_mappings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, pageSize, offset]);
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        data: {
          items: result.rows.map(row => ({
            ...row,
            description: row.description || "No description provided"
          })),
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      })
    };
    
  } catch (error) {
    console.error('Error fetching requests:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to fetch requests: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};