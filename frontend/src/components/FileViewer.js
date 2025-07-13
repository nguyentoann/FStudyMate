import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert } from 'antd';
import { DownloadOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { API_URL } from '../services/config';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const FileViewer = ({ file }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [codeContent, setCodeContent] = useState(null);

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };
  
  const isImageFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
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
  
  const isCodeFile = (filename) => {
    const ext = getFileExtension(filename);
    return getLanguageForExtension(ext, filename) !== null;
  };
  
  const isTextFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['txt', 'log'].includes(ext);
  };
  
  const getLanguageForExtension = (ext, filename = '') => {
    // Programming Languages
    if (['c', 'h'].includes(ext)) return 'c';
    if (['cpp', 'cc', 'cxx', 'hpp', 'hh'].includes(ext)) return 'cpp';
    if (ext === 'cs') return 'csharp';
    if (['java', 'class', 'jar'].includes(ext)) return 'java';
    if (['py', 'pyc', 'pyo', 'pyw', 'pyi'].includes(ext)) return 'python';
    if (['js', 'mjs', 'cjs'].includes(ext)) return 'javascript';
    if (['ts', 'tsx'].includes(ext)) return 'typescript';
    if (ext === 'go') return 'go';
    if (['rs', 'rlib'].includes(ext)) return 'rust';
    if (['rb', 'erb'].includes(ext)) return 'ruby';
    if (['kt', 'kts'].includes(ext)) return 'kotlin';
    if (ext === 'swift') return 'swift';
    if (['m', 'mm'].includes(ext)) return 'objectivec';
    if (['pl', 'pm'].includes(ext)) return 'perl';
    if (['php', 'phtml', 'php5'].includes(ext)) return 'php';
    if (['r', 'R', 'Rmd'].includes(ext)) return 'r';
    if (ext === 'dart') return 'dart';
    if (['scala', 'sc'].includes(ext)) return 'scala';
    if (ext === 'lua') return 'lua';
    
    // Web & Markup
    if (['html', 'htm'].includes(ext)) return 'html';
    if (['css', 'scss', 'sass', 'less'].includes(ext)) return 'css';
    if (['xml', 'xsl', 'xslt', 'svg'].includes(ext)) return 'xml';
    if (['md', 'markdown', 'mdx'].includes(ext)) return 'markdown';
    if (['json', 'jsonc'].includes(ext)) return 'json';
    if (['yml', 'yaml'].includes(ext)) return 'yaml';
    
    // Scripting
    if (['sh', 'bash', 'zsh', 'ksh'].includes(ext)) return 'bash';
    if (['bat', 'cmd'].includes(ext)) return 'dos';
    if (['ps1', 'psm1'].includes(ext)) return 'powershell';
    if (ext === 'mk' || filename.toLowerCase() === 'makefile') return 'makefile';
    
    // Data / Config / DevOps
    if (['ini', 'conf', 'cfg'].includes(ext)) return 'ini';
    if (ext === 'toml') return 'toml';
    if (filename.toLowerCase() === 'dockerfile' || ext === 'dockerignore') return 'dockerfile';
    if (ext === 'tf' || ext === 'tfvars') return 'hcl';
    
    // SQL
    if (ext === 'sql' || ext === 'psql') return 'sql';
    
    // Frontend Frameworks
    if (ext === 'jsx') return 'jsx';
    if (ext === 'vue') return 'html'; // Vue files are similar to HTML
    if (ext === 'svelte') return 'html'; // Svelte files are similar to HTML
    
    // Plain text
    if (['txt', 'log'].includes(ext)) return 'plaintext';
    
    return null;
  };

  const getFileUrl = () => {
    if (!file || !file.id) return '';
    return `${API_URL}/materials/view/${file.id}`;
  };

  const getDownloadUrl = () => {
    if (!file || !file.id) return '';
    return `${API_URL}/materials/download/${file.id}`;
  };
  
  useEffect(() => {
    if (file && (isCodeFile(file.fileName) || isTextFile(file.fileName))) {
      setLoading(true);
      fetch(getFileUrl())
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          setCodeContent(text);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching code file:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [file]);

  if (!file) {
    return <Alert message="No file selected" type="info" />;
  }

  const renderFilePreview = () => {
    const fileUrl = getFileUrl();
    const downloadUrl = getDownloadUrl();
    
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <Spin />
          <span style={{ marginLeft: '10px' }}>Loading file content...</span>
        </div>
      );
    }
    
    if (error) {
      return <Alert message="Error" description={error} type="error" />;
    }
    
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
    } else if (isCodeFile(file.fileName)) {
      const ext = getFileExtension(file.fileName);
      const language = getLanguageForExtension(ext, file.fileName);
      
      // If we have code content, highlight it
      if (codeContent) {
        const highlightedCode = language 
          ? hljs.highlight(codeContent, { language }).value 
          : hljs.highlightAuto(codeContent).value;
          
        return (
          <div style={{ padding: '20px' }}>
            <div className="code-header">
              <span><CodeOutlined /> {file.fileName}</span>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => window.open(downloadUrl, '_blank')}
                size="small"
              >
                Download
              </Button>
            </div>
            <pre className="hljs-code">
              <code 
                dangerouslySetInnerHTML={{ __html: highlightedCode }} 
                className={`language-${language || 'plaintext'}`}
              />
            </pre>
          </div>
        );
      }
      
      // Fallback if code content couldn't be loaded
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Alert
            message="Code Preview"
            description="Failed to load code content. You can download the file instead."
            type="warning"
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
    } else if (isTextFile(file.fileName)) {
      // Handle text files similar to code files
      if (codeContent) {
        return (
          <div style={{ padding: '20px' }}>
            <div className="code-header">
              <span><CodeOutlined /> {file.fileName}</span>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => window.open(downloadUrl, '_blank')}
                size="small"
              >
                Download
              </Button>
            </div>
            <pre className="hljs-code" style={{ whiteSpace: 'pre-wrap' }}>
              {codeContent}
            </pre>
          </div>
        );
      }
      
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Alert
            message="Text Preview"
            description="Failed to load text content. You can download the file instead."
            type="warning"
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
      <style jsx="true">{`
        .hljs-code {
          margin: 0;
          padding: 16px;
          border-radius: 6px;
          overflow: auto;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          font-size: 14px;
          line-height: 1.5;
          max-height: 70vh;
        }
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background-color: #f5f5f5;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          border: 1px solid #e8e8e8;
          border-bottom: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        pre.hljs-code {
          margin-top: 0;
          border: 1px solid #e8e8e8;
          border-top: none;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default FileViewer; 