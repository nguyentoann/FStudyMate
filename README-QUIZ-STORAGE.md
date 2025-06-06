# Quiz Image Storage on Samba Server

## Overview
This document explains the implementation of quiz image storage on the Samba server for FStudyMate. The solution provides a robust way to store and retrieve quiz images, improving scalability and centralizing file management.

## Features
- Storage of quiz images on the Samba server instead of local filesystem
- Automatic fallback to local filesystem for backward compatibility
- Organized directory structure by subject code and exam code
- Unique file naming with UUID to prevent collisions
- Proper error handling and logging

## Implementation Details

### Directory Structure
Images are stored on the Samba server with the following path structure:
```
\\toandz.ddns.net\SWP391\QuizImages\{subjectCode}\{examCode}\{imageFileName}
```

### Components Modified

1. **FileStorageService.java**
   - Added `QUIZ_IMAGES_DIR` constant for the quiz images directory
   - Implemented `storeQuizImage()` method to upload images to Samba
   - Implemented `getQuizImage()` method to retrieve images from Samba
   - Added fallback to local filesystem for backward compatibility

2. **ImageController.java**
   - Updated to retrieve images from Samba server first
   - Falls back to local filesystem if Samba retrieval fails
   - Improved error handling and debugging

3. **Frontend Components**
   - Updated `Quiz.js` to handle image loading from Samba
   - Added better error handling and fallback mechanisms
   - Enhanced logging for troubleshooting

4. **JSP Pages**
   - Updated `quiz.jsp` to use the new image API endpoint
   - Added fallback to local path if API fails

## Migration
A migration script (`migrate-quiz-images.bat`) has been provided to copy existing quiz images from the local filesystem to the Samba server. The script:

1. Connects to the Samba server using credentials from `.env`
2. Creates the necessary directory structure on the Samba server
3. Copies all images from the local filesystem to the corresponding directories on Samba
4. Maintains the same directory structure for easy reference

## How to Use

### Migrating Existing Images
1. Ensure your `.env` file contains valid SMB credentials
2. Run the migration script:
   ```
   migrate-quiz-images.bat
   ```
3. Verify that images were copied successfully

### Adding New Quiz Images
Use the `FileStorageService.storeQuizImage()` method to store new quiz images:

```java
// Example usage
InputStream imageStream = new FileInputStream(localFile);
String storedPath = FileStorageService.storeQuizImage(imageStream, "MAS291", "FA24_RE_349112", "question1.png");
```

### Retrieving Quiz Images
Images can be retrieved via the API endpoint:
```
GET /api/images/direct?path={subjectCode}/{examCode}/{imageFileName}
```

## Troubleshooting
- If images fail to load, check the browser console for error messages
- Verify that the Samba server is accessible and credentials are correct
- Check that the required directories exist on the Samba server
- Ensure proper permissions are set for the QuizImages directory

## Environment Configuration
The system uses the following environment variables:
- `SMB_USERNAME`: Username for Samba authentication
- `SMB_PASSWORD`: Password for Samba authentication

These should be set in your `.env` file and loaded using `load-env.bat` or `load-env.sh`. 