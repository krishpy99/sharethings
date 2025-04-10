// delete.js - Delete resources by hash
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');
const { extractUserId } = require('../../utils/authHelper');

const s3Client = new S3Client();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // Or restrict to your domain
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
    
    if (!hash) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing hash parameter'
        })
      };
    }
    
    // Get user ID from auth token
    const userId = await extractUserId(event);
    
    // Look up in database
    const result = await client.query(`
      SELECT file_key, user_id 
      FROM url_mappings 
      WHERE hash = $1
    `, [hash]);
    
    // If not found
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'URL not found'
        })
      };
    }
    
    const record = result.rows[0];
    
    // Check if user has permission
    if (record.user_id !== 'anon' && record.user_id !== userId) {
      return {
        statusCode: 403,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'You do not have permission to delete this resource'
        })
      };
    }
    
    // Delete from S3 if it's a file
    if (record.file_key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: record.file_key
      }));
    }
    
    // Delete from database
    await client.query('DELETE FROM url_mappings WHERE hash = $1', [hash]);
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        message: 'Resource deleted successfully'
      })
    };
    
  } catch (error) {
    console.error('Error deleting resource:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to delete resource: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};