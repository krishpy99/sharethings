// get.js - Get file content by hash
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');
const { extractUserId } = require('../../utils/authHelper');

const s3Client = new S3Client();

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
    
    // Get hash from path parameters
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
    
    // Get user ID from auth token for access control
    const userId = await extractUserId(event);
    
    // Look up in database
    const result = await client.query(`
      SELECT file_key, user_id, content_type, expires_at
      FROM url_mappings 
      WHERE hash = $1 AND type = 'file'
    `, [hash]);
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'File not found'
        })
      };
    }
    
    const file = result.rows[0];
    
    // Check if file has expired
    if (new Date(file.expires_at) < new Date()) {
      return {
        statusCode: 410,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'This file has expired'
        })
      };
    }
    
    // We allow access to all files regardless of owner
    // Content access control could be added here if needed
    
    // Get file from S3
    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: file.file_key
    }));
    
    // Convert S3 response stream to base64
    const chunks = [];
    for await (const chunk of s3Response.Body) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    const base64Content = fileBuffer.toString('base64');
    
    // Extract filename from the S3 key
    const fileName = file.file_key.split('/').pop();
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        fileName,
        contentType: file.content_type,
        content: base64Content,
        isOwner: file.user_id === userId
      })
    };
    
  } catch (error) {
    console.error('Error retrieving file:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to retrieve file: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};