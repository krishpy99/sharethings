// create.js - Handle file uploads and create shortened URLs
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');
const crypto = require('crypto');
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
    
    // Parse request body
    const body = event.body;
    const { file, description = "No description provided" } = body;
    
    // Extract user ID from auth token
    const userId = await extractUserId(event);
    const isAuthenticated = userId !== 'anon';
    
    // Extract file information
    const fileBuffer = Buffer.from(file.content.replace(/^data:.*?;base64,/, ''), 'base64');
    const fileType = file.type;
    const fileName = file.name;
    
    // Create timestamp for hash generation
    const timestamp = Date.now().toString();
    
    // Generate 8-char hash using timestamp and file content
    const hash = crypto.createHash('sha256')
      .update(`${timestamp}${fileBuffer.toString('base64')}`)
      .digest('hex')
      .substring(0, 8);
    
    // Define S3 key using hash
    const userFolder = isAuthenticated ? userId.toString() : 'anon';
    const s3Key = `${userFolder}/${hash}/${fileName}`;
    
    // Calculate expiration based on authentication status
    const ttlDays = isAuthenticated ? 7 : 1;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    
    // Upload to S3
    const s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: fileType,
      Metadata: {
        'user-id': userId.toString(),
        'description': description
      }
    };
    
    await s3Client.send(new PutObjectCommand(s3Params));
    
    // Store in database with description
    await client.query(`
      INSERT INTO url_mappings 
        (hash, file_key, user_id, expires_at, content_type, created_at, type, description) 
      VALUES 
        ($1, $2, $3, $4, $5, to_timestamp($6/1000.0), 'file', $7)
    `, [hash, s3Key, userId, expiresAt, fileType, timestamp, description]);

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
    console.error('Error creating resource:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to create resource: ${error.message}`
      })
    };
  } finally {
    await client.end();
  }
};