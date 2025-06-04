# Storage Information Feature for Admin Dashboard

## Overview
This feature adds real-time Samba storage information to the admin dashboard, allowing administrators to monitor disk usage, file distribution, and storage allocation across different share directories.

## Features
- Real-time disk space usage statistics
- File type distribution (images, videos, documents, other)
- Individual Samba share statistics with accurate file counts
- Smart file categorization by extension
- Automatic fallback to mock data if server connection fails

## Implementation Details

### Backend Components
1. **StorageService.java**
   - Connects to Samba server using jCIFS library
   - Recursively analyzes directories to gather statistics with depth limits
   - Calculates actual used space by summing file sizes
   - Categorizes files by type (images, videos, documents, other)
   - Provides fallback mock data if server connection fails

2. **AdminController.java**
   - Exposes `/api/admin/storage-info` REST endpoint
   - Uses StorageService to get real storage information
   - Returns formatted JSON data to frontend
   - Provides `/api/admin/set-dev-mode` endpoint for testing

### Frontend Components
1. **api.js**
   - Implements `getSambaStorageInfo()` method to fetch storage data
   - Includes fallback mock data if API call fails

2. **AdminDashboard.js**
   - Displays storage usage bar with color-coded status
   - Shows file type distribution in a grid layout
   - Lists individual shares with usage bars and file counts
   - Handles loading and error states

## Authentication
The Samba connection requires credentials which are stored as environment variables in your existing env file:
- SMB_USERNAME
- SMB_PASSWORD

## Setup Instructions

### 1. Use Existing Environment File
Ensure your environment file is loaded before starting the application. Your existing env file already contains the required Samba credentials.

### 2. Start the Application
Start the backend and frontend as usual. The storage information will automatically appear on the admin dashboard.

### 3. Development Mode (for testing)
If you're having trouble seeing file counts in the UI, you can enable development mode which will show test data:

```
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/set-dev-mode?enabled=true" -Method POST

# Alternative using curl-compatible client
curl -X POST "http://localhost:8080/api/admin/set-dev-mode?enabled=true"
```

## Technical Details

### File Type Detection
Files are categorized by extension:
- **Images**: jpg, jpeg, png, gif, bmp, webp, svg, ico
- **Videos**: mp4, avi, mov, wmv, mkv, webm, flv, m4v, mpg, mpeg
- **Documents**: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, md, csv, rtf, odt, json, xml
- **Other**: All other file types

### Performance Optimizations
To prevent excessive resource usage, the following limits are enforced:
- Maximum directory recursion depth: 10
- Maximum files processed per directory: 5,000

## API Response Format
```json
{
  "totalSpace": 1024.0,
  "usedSpace": 803.1,
  "freeSpace": 220.9,
  "usagePercentage": 78.4,
  "files": {
    "total": 1865,
    "images": 523,
    "videos": 115,
    "documents": 897,
    "other": 330,
    "processedDirectories": 5
  },
  "shares": [
    {
      "name": "ChatFiles",
      "size": 212.8,
      "files": 342
    },
    {
      "name": "GroupChatFiles",
      "size": 356.7,
      "files": 523
    },
    {
      "name": "ProfilePictures",
      "size": 78.2,
      "files": 721
    },
    {
      "name": "LessonFiles",
      "size": 155.4,
      "files": 279
    }
  ]
}
```

## Troubleshooting
1. If the storage information shows mock data, check:
   - The environment file is properly loaded with SMB credentials
   - Network connectivity to the Samba server
   - The server path and share name are correct
   
2. If file counts appear as zeros:
   - Try enabling development mode using the endpoint mentioned above
   - Check the server logs for any access permission issues
   - Verify that the directories being scanned actually contain files
   
3. For slow loading times:
   - Large directories may cause delays during recursive scanning
   - Consider implementing pagination or caching for better performance
   - The service implements limits on recursion depth and files per directory to prevent excessive resource usage 