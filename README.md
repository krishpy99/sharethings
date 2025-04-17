# ShareThings

ShareThings is a simple service for uploading files and shortening URLs, with optional QR code generation for easy sharing. It combines a file-sharing tool with a URL shortener and supports user-specific management through Clerk.js authentication.

## Features
- File uploads with size limit (5MB).
- URL shortening for easy sharing.
- QR code generation for any URL or text.
- Optional user authentication for managing uploads.
- Automatic expiration and deletion of files.

## Architecture
ShareThings follows a serverless approach:
1. Clerk.js handles user authentication (users can stay anonymous or log in).
2. AWS API Gateway routes requests to AWS Lambda functions.
3. Lambda functions handle:
   - File uploads (using S3 for storage).
   - Metadata and URL mappings (using a relational database like RDS).
   - QR code generation.
4. Responses are sent back via the API Gateway.

## Core Entities
- **User**: Anonymous or authenticated (via Clerk.js).
- **URL Mapping**: Stores info about files or shortened URLs, including expiration, content type, and descriptions.

## Endpoints
- **POST /upload**  
  Uploads a file to S3 and returns a sharable hash.
- **POST /shorten**  
  Shortens a given URL and returns the shortened hash.
- **POST /generate**  
  Generates a QR code for supplied text or URL.
- **GET /view/:hash**  
  Retrieves and optionally previews a file by hash.
- **GET /r/:hash**  
  Redirects from a shortened hash to the original URL.
- **GET /manage**  
  Lists and manages resources associated with a user.

## Getting Started
1. Install dependencies:  
   ```bash
   npm install
   ```
2. Create a .env file containing your environment variables (e.g., API endpoints).
3. Start development server:  
   ```bash
   npm run dev
   ```
4. Build for production:  
   ```bash
   npm run build
   ```

## Contributing
Pull requests and issues are welcome. For major changes, please discuss them first. Thank you for using and improving ShareThings!
