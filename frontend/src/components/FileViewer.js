import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { API_URL } from '../services/config';

const FileViewer = ({ file }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };
  
  const isImageFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  };
  
  const isPdfFile = (filename) => {
    const ext = getFileExtension(filename);
    return ext === 'pdf';
  };
  
  const isPptxFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['ppt', 'pptx'].includes(ext);
  };
  
  const isDocFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['doc', 'docx'].includes(ext);
  };
  
  const isVideoFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };
  
  const isAudioFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['mp3', 'wav', 'ogg'].includes(ext);
  };

  const getFileUrl = () => {
    if (!file || !file.id) return '';
    return `${API_URL}/materials/view/${file.id}`;
  };

  const getDownloadUrl = () => {
    if (!file || !file.id) return '';
    return `${API_URL}/materials/download/${file.id}`;
  };

  if (!file) {
    return <Alert message="No file selected" type="info" />;
  }

  const renderFilePreview = () => {
    const fileUrl = getFileUrl();
    const downloadUrl = getDownloadUrl();
    
    if (isImageFile(file.fileName)) {
      return (
        <div style={{ textAlign: 'center' }}>
          <img 
            src={fileUrl} 
            alt={file.fileName} 
            style={{ maxWidth: '100%', maxHeight: '70vh' }} 
          />
        </div>
      );
    } else if (isPdfFile(file.fileName) || isPptxFile(file.fileName) || isDocFile(file.fileName)) {
      // For PDF, PPTX, and DOC files - use Google Docs Viewer with download URL instead of view URL
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`;
      
      return (
        <div>
          <iframe 
            src={googleDocsUrl}
            title={file.fileName}
            width="100%" 
            height="600px"
            style={{ border: 'none' }}
          />
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <p>If the document doesn't load correctly, you can:</p>
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => window.open(googleDocsUrl, '_blank')}
              style={{ marginRight: '10px' }}
            >
              Open in Google Docs Viewer
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => window.open(downloadUrl, '_blank')}
            >
              Download
            </Button>
          </div>
        </div>
      );
    } else if (isVideoFile(file.fileName)) {
      return (
        <div style={{ textAlign: 'center' }}>
          <video controls width="100%" style={{ maxHeight: '70vh' }}>
            <source src={fileUrl} type={`video/${getFileExtension(file.fileName)}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (isAudioFile(file.fileName)) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <audio controls style={{ width: '100%' }}>
            <source src={fileUrl} type={`audio/${getFileExtension(file.fileName)}`} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    } else {
      // For other file types
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Alert
            message="Preview Not Available"
            description={`The file type "${getFileExtension(file.fileName)}" cannot be previewed directly.`}
            type="info"
            showIcon
          />
          <div style={{ marginTop: '20px' }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => window.open(downloadUrl, '_blank')}
            >
              Download File
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="file-viewer">
      {renderFilePreview()}
    </div>
  );
};

export default FileViewer; 