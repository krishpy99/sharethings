// routes/pgHelper/index.js - Handler for PostgreSQL operations
const getRequests = require('./get');
const headRequest = require('./head');
const getMeRequest = require('./getMe');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

module.exports = async (event) => {
  const { httpMethod, path } = event;
  
  try {
    // Check if this is a /pg/me request
    if (path && path.endsWith('/me')) {
      if (httpMethod === 'GET') {
        return await getMeRequest(event.queryParameters, event.headers);
      } else {
        return {
          statusCode: 405,
          headers: headers,
          body: JSON.stringify({
            success: false,
            error: `Method ${httpMethod} not allowed for /pg/me`
          })
        };
      }
    }
    
    // Regular /pg route handling
    switch (httpMethod) {
      case 'GET':
        return await getRequests(event);
      case 'HEAD':
        return await headRequest(event);
      default:
        return {
          statusCode: 405,
          headers: headers,
          body: JSON.stringify({
            success: false,
            error: `Method ${httpMethod} not allowed`
          })
        };
    }
  } catch (error) {
    console.error('Error in pgHelper handler:', error);
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