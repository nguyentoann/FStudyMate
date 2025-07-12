import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Typography, Breadcrumb, List, Space, Button, Card,
  Upload, Input, Modal, Spin, Empty, Tooltip, notification,
  Table, Tabs, Tag, Divider
} from 'antd';
import {
  FileOutlined, FolderOutlined, FileTextOutlined, UploadOutlined,
  DownloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined,
  PlusOutlined, FolderAddOutlined, ArrowLeftOutlined, HomeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import DashboardLayout from '../components/DashboardLayout';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/config';
import FileViewer from '../components/FileViewer';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const SubjectMaterialsPage = () => {
  const { subjectCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Parse path from query params
  const query = new URLSearchParams(location.search);
  const currentPath = query.get('path') || '/';
  
  const [materials, setMaterials] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readmeContent, setReadmeContent] = useState('');
  const [readmeMaterialId, setReadmeMaterialId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [canModify, setCanModify] = useState(false);
  
  // Modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editDescModalVisible, setEditDescModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentViewFile, setCurrentViewFile] = useState(null);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Fetch materials and check permissions
  useEffect(() => {
    fetchMaterials();
    checkPermissions();
  }, [subjectCode, currentPath]);

  // Debug log for permissions
  useEffect(() => {
    console.log('Can modify materials:', canModify);
  }, [canModify]);

  // Parse breadcrumbs from current path
  useEffect(() => {
    const pathParts = currentPath.split('/').filter(part => part !== '');
    const crumbs = [{ name: 'Root', path: '/' }];
    
    let currentBuildPath = '';
    pathParts.forEach(part => {
      currentBuildPath += '/' + part;
      crumbs.push({
        name: part,
        path: currentBuildPath,
      });
    });
    
    setBreadcrumbs(crumbs);
  }, [currentPath]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/materials/subject/${subjectCode}`, {
        params: { path: currentPath }
      });
      
      const data = response.data;
      setMaterials(data.materials || []);
      
      if (data.readme && data.readme.content) {
        setReadmeContent(data.readme.content);
        setReadmeMaterialId(data.readme.materialId);
      } else {
        setReadmeContent('');
        setReadmeMaterialId(null);
      }
      
      // Try to get subject details
      if (data.materials && data.materials.length > 0) {
        setSubject(data.materials[0].subject);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load learning materials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      // First check user role directly from localStorage
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      const userRole = userData.role?.toLowerCase() || '';
      const isAdminOrLecturer = userRole === 'admin' || userRole === 'lecturer';
      
      console.log('Checking permissions - User role:', userRole);
      
      if (isAdminOrLecturer) {
        console.log('Setting canModify=true based on user role:', userRole);
        setCanModify(true);
        return;
      }
      
      // If not admin/lecturer by role, try the API
      const response = await axios.get(`${API_URL}/materials/permissions`);
      setCanModify(response.data.canModify);
    } catch (error) {
      console.error('Error checking permissions:', error);
      
      // Default to false if all checks fail
      setCanModify(false);
    }
  };
  
  const navigateToPath = (path) => {
    navigate(`/materials/subject/${subjectCode}?path=${encodeURIComponent(path)}`);
  };
  
  const navigateToFile = (file) => {
    // Log for debugging
    console.log('Subject info:', { subject, subjectCode });
    console.log('File info:', file);
    
    // Store in recent files
    storeRecentFile({
      id: file.id,
      fileName: file.fileName,
      subject: subject ? subject.name : 'Unknown',
      subjectCode: subject && subject.code ? subject.code : `CEA${subjectCode}`,
      subjectId: subject ? subject.id : subjectCode, // Use subjectCode as fallback
      fileType: file.fileCategory,
      path: file.filePath,
      viewable: true // Always set to true to enable view button
    });
    
    // Show the file in modal instead of opening in new tab
    setCurrentViewFile(file);
    setViewModalVisible(true);
  };
  
  const storeRecentFile = (file) => {
    const storedFiles = localStorage.getItem('recentMaterialFiles');
    let recentFiles = storedFiles ? JSON.parse(storedFiles) : [];
    
    recentFiles = recentFiles.filter(f => f.id !== file.id);
    recentFiles.unshift(file);
    recentFiles = recentFiles.slice(0, 10);
    
    localStorage.setItem('recentMaterialFiles', JSON.stringify(recentFiles));
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      notification.warning({
        message: 'No File Selected',
        description: 'Please select a file to upload.',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subjectCode', subjectCode);
    formData.append('path', currentPath);
    if (fileDescription) {
      formData.append('description', fileDescription);
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/materials/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      notification.success({
        message: 'File Uploaded',
        description: 'File has been uploaded successfully.',
      });
      
      setUploadModalVisible(false);
      setSelectedFile(null);
      setFileDescription('');
      fetchMaterials();
    } catch (error) {
      console.error('Error uploading file:', error);
      notification.error({
        message: 'Upload Failed',
        description: error.response?.data?.error || 'Failed to upload file.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      notification.warning({
        message: 'No Folder Name',
        description: 'Please enter a folder name.',
      });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/materials/directory`, {
        subjectCode,
        directoryName: newFolderName,
        path: currentPath,
      }, {
        params: {
          subjectCode,
          directoryName: newFolderName,
          path: currentPath,
        }
      });
      
      notification.success({
        message: 'Folder Created',
        description: 'Folder has been created successfully.',
      });
      
      setFolderModalVisible(false);
      setNewFolderName('');
      fetchMaterials();
    } catch (error) {
      console.error('Error creating folder:', error);
      notification.error({
        message: 'Creation Failed',
        description: error.response?.data?.error || 'Failed to create folder.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedMaterial) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/materials/${selectedMaterial.id}`);
      
      notification.success({
        message: 'Deleted',
        description: `${selectedMaterial.isDirectory ? 'Folder' : 'File'} has been deleted.`,
      });
      
      setDeleteModalVisible(false);
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      notification.error({
        message: 'Deletion Failed',
        description: error.response?.data?.error || 'Failed to delete item.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateDescription = async () => {
    if (!selectedMaterial) return;
    
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/materials/${selectedMaterial.id}`, null, {
        params: {
          description: fileDescription
        }
      });
      
      notification.success({
        message: 'Updated',
        description: 'Description has been updated.',
      });
      
      setEditDescModalVisible(false);
      setSelectedMaterial(null);
      setFileDescription('');
      fetchMaterials();
    } catch (error) {
      console.error('Error updating description:', error);
      notification.error({
        message: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update description.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const showDeleteConfirm = (material) => {
    setSelectedMaterial(material);
    setDeleteModalVisible(true);
  };
  
  const showEditDescriptionModal = (material) => {
    setSelectedMaterial(material);
    setFileDescription(material.description || '');
    setEditDescModalVisible(true);
  };

  const getFileIcon = (material) => {
    if (material.isDirectory) {
      return <FolderOutlined style={{ fontSize: '24px', color: '#ffc53d' }} />;
    }
    
    switch (material.fileCategory) {
      case 'Image':
        return <FileOutlined style={{ fontSize: '24px', color: '#73d13d' }} />;
      case 'Video':
        return <FileOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
      case 'Audio':
        return <FileOutlined style={{ fontSize: '24px', color: '#40a9ff' }} />;
      case 'PDF':
        return <FileOutlined style={{ fontSize: '24px', color: '#ff7a45' }} />;
      case 'Document':
        return <FileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      case 'Spreadsheet':
        return <FileOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
      case 'Presentation':
        return <FileOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />;
      case 'Markdown':
        return <FileTextOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
      default:
        return <FileOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />;
    }
  };

  const renderBreadcrumb = () => (
    <Breadcrumb style={{ marginBottom: '16px' }}>
      <Breadcrumb.Item href="/materials">
        <HomeOutlined /> Materials
      </Breadcrumb.Item>
      {breadcrumbs.map((crumb, index) => (
        <Breadcrumb.Item 
          key={index}
          onClick={() => navigateToPath(crumb.path)}
          style={{ cursor: 'pointer' }}
        >
          {crumb.name}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
  
  const renderControls = () => {
    // Check if user is admin or lecturer from localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const userRole = userData.role?.toLowerCase() || '';
    const isAdminOrLecturer = userRole === 'admin' || userRole === 'lecturer';
    
    // Debug log for user role
    console.log('User role:', userRole, 'isAdminOrLecturer:', isAdminOrLecturer);
    
    return (
      <Space style={{ marginBottom: '16px' }}>
        {(isAdminOrLecturer && canModify) && (
          <>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              Upload File
            </Button>
            <Button
              icon={<FolderAddOutlined />}
              onClick={() => setFolderModalVisible(true)}
            >
              New Folder
            </Button>
          </>
        )}
        {!canModify && isAdminOrLecturer && (
          <Button
            type="dashed"
            onClick={() => {
              console.log('Manual override for admin controls');
              setCanModify(true);
            }}
            title="Click here if you're an admin but don't see upload controls"
          >
            Enable Admin Controls
          </Button>
        )}
        {currentPath !== '/' && (
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
              navigateToPath(parentPath || '/');
            }}
          >
            Up
          </Button>
        )}
      </Space>
    );
  };
  
  const columns = [
    {
      title: 'Type',
      dataIndex: 'fileCategory',
      key: 'type',
      width: '60px',
      render: (_, material) => getFileIcon(material)
    },
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'name',
      render: (_, material) => (
        <span className="material-name">
          {material.fileName}
          {material.description && (
            <Tooltip title={material.description}>
              <InfoCircleOutlined style={{ marginLeft: '5px', color: '#1890ff' }} />
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'size',
      width: '120px',
      render: (size) => {
        if (!size) return '—';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
        return `${Math.round(size / 1024 / 1024)} MB`;
      }
    },
    {
      title: 'Date',
      dataIndex: 'uploadDate',
      key: 'date',
      width: '180px',
      render: (date) => date ? new Date(date).toLocaleString() : '—'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '150px',
      render: (_, material) => (
        <Space size="small">
          {!material.isDirectory && (
            <>
              <Tooltip title="Download">
                <Button 
                  size="small" 
                  icon={<DownloadOutlined />} 
                  onClick={() => window.open(`${API_URL}/materials/download/${material.id}`, '_blank')} 
                />
              </Tooltip>
              <Tooltip title="View">
                <Button 
                  size="small" 
                  type="primary"
                  icon={<EyeOutlined />} 
                  onClick={() => navigateToFile(material)} 
                />
              </Tooltip>
            </>
          )}
          
          {canModify && (
            <>
              <Tooltip title="Edit Description">
                <Button 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => showEditDescriptionModal(material)} 
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => showDeleteConfirm(material)} 
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="subject-materials-page">
        <Spin spinning={loading}>
          {/* Header */}
          <div className="page-header">
            {renderBreadcrumb()}
            <Title level={2}>
              {subject ? (
                <>
                  {subject.code && <span className="subject-code">{subject.code}</span>}
                  {subject.name}
                </>
              ) : (
                `Subject ${subjectCode}`
              )} 
              Materials
              {currentPath !== '/' && ` - ${currentPath.split('/').filter(Boolean).pop()}`}
            </Title>
            {renderControls()}
          </div>
          
          {/* Files Table (Always shown) */}
          <div className="files-container">
            <Title level={4}>Files</Title>
            {materials.length === 0 ? (
              <Empty 
                description="No materials found in this location"
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              <Table 
                dataSource={materials}
                columns={columns}
                rowKey="id"
                onRow={(material) => ({
                  onClick: () => {
                    if (material.isDirectory) {
                      navigateToPath(currentPath + (currentPath.endsWith('/') ? '' : '/') + material.fileName);
                    } else {
                      navigateToFile(material);
                    }
                  },
                  style: { cursor: material.isDirectory ? 'pointer' : 'default' }
                })}
              />
            )}
          </div>
          
          {/* README Section (Only shown if README exists) */}
          {readmeContent && (
            <div className="readme-container">
              <Divider />
              <Title level={4}>README</Title>
              <Card className="markdown-card">
                <div className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {readmeContent}
                  </ReactMarkdown>
                </div>
              </Card>
            </div>
          )}
        </Spin>
        
        {/* Upload Modal */}
        <Modal
          title="Upload File"
          visible={uploadModalVisible}
          onCancel={() => setUploadModalVisible(false)}
          onOk={handleUpload}
          okButtonProps={{ disabled: !selectedFile }}
        >
          <Upload
            beforeUpload={(file) => {
              setSelectedFile(file);
              return false;
            }}
            fileList={selectedFile ? [selectedFile] : []}
            onRemove={() => setSelectedFile(null)}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <div style={{ marginTop: '16px' }}>
            <TextArea
              placeholder="Description (optional)"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              rows={4}
            />
          </div>
        </Modal>
        
        {/* New Folder Modal */}
        <Modal
          title="Create Folder"
          visible={folderModalVisible}
          onCancel={() => setFolderModalVisible(false)}
          onOk={handleCreateFolder}
        >
          <Input
            placeholder="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Deletion"
          visible={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={handleDelete}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <p>
            Are you sure you want to delete{' '}
            <strong>{selectedMaterial?.fileName}</strong>?
            {selectedMaterial?.isDirectory && ' This will delete all files inside this folder.'}
          </p>
        </Modal>
        
        {/* Edit Description Modal */}
        <Modal
          title="Edit Description"
          visible={editDescModalVisible}
          onCancel={() => setEditDescModalVisible(false)}
          onOk={handleUpdateDescription}
        >
          <TextArea
            placeholder="Description"
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            rows={4}
          />
        </Modal>
        
        {/* File View Modal */}
        <Modal
          title={currentViewFile?.fileName || "File Preview"}
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="download" icon={<DownloadOutlined />} onClick={() => window.open(`${API_URL}/materials/download/${currentViewFile?.id}`, '_blank')}>
              Download
            </Button>,
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          ]}
          width="80%"
          style={{ top: 20 }}
          styles={{
            body: { 
              maxHeight: '80vh', 
              overflow: 'auto', 
              padding: '0'
            }
          }}
        >
          {currentViewFile && <FileViewer file={currentViewFile} />}
        </Modal>
      </div>
      <style jsx="true">{`
        .subject-materials-page {
          padding: 24px;
        }
        .page-header {
          margin-bottom: 24px;
        }
        .material-name {
          cursor: pointer;
          color: #1890ff;
        }
        .ant-table-row:hover .material-name {
          text-decoration: underline;
        }
        .subject-code {
          font-size: 1.2em;
          font-weight: bold;
          color: #1890ff;
          margin-right: 8px;
          background-color: #e6f7ff;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .files-container {
          margin-bottom: 24px;
        }
        .readme-container {
          margin-top: 24px;
        }
        .markdown-card {
          padding: 0;
        }
        .markdown-card .ant-card-body {
          padding: 24px;
        }
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #24292e;
        }
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }
        .markdown-body h1 {
          padding-bottom: 0.3em;
          font-size: 2em;
          border-bottom: 1px solid #eaecef;
        }
        .markdown-body h2 {
          padding-bottom: 0.3em;
          font-size: 1.5em;
          border-bottom: 1px solid #eaecef;
        }
        .markdown-body p {
          margin-top: 0;
          margin-bottom: 16px;
        }
        .markdown-body blockquote {
          padding: 0 1em;
          color: #6a737d;
          border-left: 0.25em solid #dfe2e5;
          margin: 0 0 16px 0;
        }
        .markdown-body pre {
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: #f6f8fa;
          border-radius: 3px;
        }
        .markdown-body code {
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          background-color: rgba(27, 31, 35, 0.05);
          border-radius: 3px;
        }
        .markdown-body pre code {
          background-color: transparent;
          padding: 0;
        }
        .markdown-body table {
          display: block;
          width: 100%;
          overflow: auto;
          border-spacing: 0;
          border-collapse: collapse;
        }
        .markdown-body table th,
        .markdown-body table td {
          padding: 6px 13px;
          border: 1px solid #dfe2e5;
        }
        .markdown-body table tr {
          background-color: #fff;
          border-top: 1px solid #c6cbd1;
        }
        .markdown-body table tr:nth-child(2n) {
          background-color: #f6f8fa;
        }
        .markdown-body img {
          max-width: 100%;
          box-sizing: content-box;
        }
        .markdown-body ul,
        .markdown-body ol {
          padding-left: 2em;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .markdown-body hr {
          height: 0.25em;
          padding: 0;
          margin: 24px 0;
          background-color: #e1e4e8;
          border: 0;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default SubjectMaterialsPage; 