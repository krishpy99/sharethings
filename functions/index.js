// index.js - Main handler for shareThings consolidated function
const fileOpsHandler = require('./routes/fileOps');
const generateQRHandler = require('./routes/generateQR');
const pgHelperHandler = require('./routes/pgHelper');
const shortenURLHandler = require('./routes/shortenURL');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

module.exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));
  
  // Extract HTTP method - handle different event formats
  const httpMethod = event.httpMethod || 
                    (event.requestContext?.http?.method) || 
                    (event.requestContext?.httpMethod) || 
                    'UNKNOWN';

  // Standardize path parameters
  const pathParameters = event.pathParameters || {};
  
  // Standardize query parameters
  const queryParameters = event.queryStringParameters || {};
  
  // Standardize body - parse if it's a string
  let body = null;
  if (event.body) {
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
      console.error('Error parsing body:', error);
    }
  }
  
  // Extract the path to determine which handler to use
  const path = event.path || event.rawPath || '';
  const pathSegments = path.split('/').filter(segment => segment !== '');
  const mainRoute = pathSegments[0]?.toLowerCase() || '';
  
  // Standardize headers
  const standardizedHeaders = {
    ...event.headers,
    // Ensure consistent case for Authorization header
    Authorization: event.headers?.Authorization || event.headers?.authorization
  };

  // Create standardized event object
  const standardizedEvent = {
    httpMethod,
    pathParameters,
    queryParameters,
    body,
    path,
    pathSegments,
    headers: standardizedHeaders,
    rawEvent: event
  };
  
  try {
    if (httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ success: true })
      };
    }
    
    // Route based on the first path segment
    switch (mainRoute) {
      case 'file':
        return await fileOpsHandler(standardizedEvent);
      case 'generate':
        return await generateQRHandler(standardizedEvent);
      case 'pg':
        return await pgHelperHandler(standardizedEvent);
      case 'shorten':
        return await shortenURLHandler(standardizedEvent);
      default:
        return {
          statusCode: 404,
          headers: headers,
          body: JSON.stringify({
            success: false,
            error: `Route '${mainRoute}' not found. Available routes: file, generate, pg, shorten`
          })
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
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