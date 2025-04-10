# QR Code File Sharing App

A Vue 3 application for sharing files using QR codes. This app allows users to:

- Upload files and generate QR codes for sharing
- View shared files using a hash or URL
- Manage uploaded files (for authenticated users)

## Features

- File upload with size limit (5MB)
- QR code generation for easy sharing
- File preview for images and PDFs
- File management interface
- Responsive design

## Project Structure

```
src/
├── components/
│   ├── QRCodeGenerator.vue
│   ├── FileUploader.vue
│   ├── FileViewer.vue
│   └── FileList.vue
├── pages/
│   ├── HomePage.vue
│   ├── UploadPage.vue
│   ├── ViewPage.vue
│   └── ManagePage.vue
├── utils/
│   ├── api.js
│   └── auth.js
├── App.vue
└── main.js
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your API URL:
```
VITE_API_URL=http://your-api-url
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Dependencies

- Vue 3
- Axios
- QRCode.js

## API Integration

The app uses the following API endpoints:

- POST `/` - Upload a file
- GET `/?hash={hash}` - Get a file by hash
- DELETE `/?hash={hash}&userId={userId}` - Delete a file

## Environment Variables

- `VITE_API_URL`: The base URL for the API (default: http://localhost:3000)
