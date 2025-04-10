// routes/fileOps/index.js - Handler for file operations
const createResource = require('./create');
const getResource = require('./get');
const deleteResource = require('./delete');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

module.exports = async (event) => {
  const { httpMethod } = event;
  
  try {
    if (httpMethod === 'POST' || httpMethod === 'PUT') {
      return await createResource(event);
    } else if (httpMethod === 'GET') {
      return await getResource(event);
    } else if (httpMethod === 'DELETE') {
      return await deleteResource(event);
    } else {
      return {
        statusCode: 405,
        headers: headers,
        body: JSON.stringify({
          success: false,
          error: 'Received method: ' + httpMethod +'. Method not allowed'
        })
      };
    }
  } catch (error) {
    console.error('Error processing fileOps request:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: `Server error: ${error.message}`
      })
    };
  }
};