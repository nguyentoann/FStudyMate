import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Row, Col, Typography, List, Tag, Spin, Button, Modal, Collapse } from 'antd';
import DashboardLayout from '../components/DashboardLayout';
import { BookOutlined, BookFilled, ClockCircleOutlined, FolderOutlined, EyeOutlined, DownloadOutlined, FileOutlined, CaretRightOutlined } from '@ant-design/icons';
import { API_URL } from '../services/config';
import FileViewer from '../components/FileViewer';
import { px } from 'framer-motion';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const LearningMaterialsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentFiles, setRecentFiles] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentViewFile, setCurrentViewFile] = useState(null);
  const [expandedTerms, setExpandedTerms] = useState([]);



  useEffect(() => {
    // Load subjects
    fetchSubjects();
    
    // Load recent files from localStorage
    const storedFiles = localStorage.getItem('recentMaterialFiles');
    if (storedFiles) {
      setRecentFiles(JSON.parse(storedFiles));
    }
  }, []);

  useEffect(() => {
    // Group subjects by TermNo when subjects change
    if (subjects && subjects.length > 0) {
      const grouped = {};
      
      // Group by termNo
      subjects.forEach(subject => {
        const termNo = subject.termNo || 0; // Use 0 for undefined/null termNo
        if (!grouped[termNo]) {
          grouped[termNo] = [];
        }
        grouped[termNo].push(subject);
      });
      
      // Sort subjects within each term by name
      Object.keys(grouped).forEach(termNo => {
        grouped[termNo].sort((a, b) => {
          // Sort by code first if available
          if (a.code && b.code) {
            return a.code.localeCompare(b.code);
          }
          // Fall back to name
          return a.name.localeCompare(b.name);
        });
      });
      
      setGroupedSubjects(grouped);
      
      // Set all terms to be expanded by default
      const termKeys = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b));
      setExpandedTerms(termKeys);
    }
  }, [subjects]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/subjects`);
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeRecentFile = (file) => {
    // Get current stored files
    const storedFiles = localStorage.getItem('recentMaterialFiles');
    let recentFiles = storedFiles ? JSON.parse(storedFiles) : [];
    
    // Add the new file at the beginning, ensure it's unique
    recentFiles = recentFiles.filter(f => f.id !== file.id);
    recentFiles.unshift(file);
    
    // Keep only the 10 most recent files
    recentFiles = recentFiles.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('recentMaterialFiles', JSON.stringify(recentFiles));
    
    // Update state
    setRecentFiles(recentFiles);
  };
  
  const handleViewFile = (file) => {
    setCurrentViewFile(file);
    setViewModalVisible(true);
  };
  
  const getFileIcon = (fileType) => {
    const iconStyle = { fontSize: '16px', marginRight: '8px' };
    
    switch (fileType?.toUpperCase()) {
      case 'PDF':
        return <FileOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
      case 'DOCX':
      case 'DOC':
      case 'DOCUMENT':
        return <FileOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
      case 'XLSX':
      case 'XLS':
      case 'SPREADSHEET':
        return <FileOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'PPTX':
      case 'PPT':
      case 'PRESENTATION':
        return <FileOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'GIF':
      case 'IMAGE':
        return <FileOutlined style={{ ...iconStyle, color: '#73d13d' }} />;
      case 'MP4':
      case 'AVI':
      case 'MOV':
      case 'VIDEO':
        return <FileOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
      case 'MP3':
      case 'WAV':
      case 'AUDIO':
        return <FileOutlined style={{ ...iconStyle, color: '#40a9ff' }} />;
      case 'MD':
      case 'MARKDOWN':
        return <FileOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
      default:
        return <FileOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="learning-materials-page">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={2}>Learning Materials</Title>
            <Text type="secondary">
              Access course materials organized by subject. Click on a subject to view its materials.
            </Text>
          </Col>
          
          {/* Recent Files Section */}
          {recentFiles.length > 0 && (
            <Col span={24}>
              <Card title={<><ClockCircleOutlined /> Recent Files</>}>
                <List
                  dataSource={recentFiles}
                  renderItem={file => (
                    <List.Item
                      actions={[
                        <Button 
                          size="small" 
                          icon={<FolderOutlined />}
                          onClick={() => {
                            // Log for debugging
                            console.log('Opening location for file:', file);
                            
                            // Determine the correct subject ID to use
                            let subjectId = null;
                            
                            // First try to use the stored subjectId
                            if (file.subjectId && file.subjectId !== "null" && file.subjectId !== "undefined") {
                              subjectId = file.subjectId;
                            } 
                            // If subjectId is a number stored as string, use it
                            else if (file.subjectCode && !isNaN(file.subjectCode)) {
                              subjectId = file.subjectCode;
                            }
                            // Fallback to 288 if no valid ID is found
                            else {
                              subjectId = 288;
                            }
                            
                            console.log('Using subject ID:', subjectId);
                            // Navigate directly to the subject page without the path parameter
                            window.location.href = `/materials/subject/${subjectId}`;
                          }}
                        >
                          Subject
                        </Button>,
                        <Button 
                          size="small" 
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewFile(file)}
                        >
                          View
                        </Button>,
                        <Button 
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => window.open(`${API_URL}/materials/download/${file.id}`, '_blank')}
                        >
                          Download
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <span className="file-name">
                            <span className="file-icon">{getFileIcon(file.fileType)}</span>
                            {file.fileName}
                          </span>
                        }
                        description={
                          <>
                            <Text type="secondary">
                              Subject: {file.subjectCode || file.subject || "SUB288"}
                            </Text>
                            <Tag color="blue">{file.fileType}</Tag>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          )}
          
          {/* Subjects Section */}
          <Col span={24}>
            <Spin spinning={loading}>
              <Collapse
                bordered={false}
                defaultActiveKey={expandedTerms}
                onChange={(key) => setExpandedTerms(key)}
                className="term-collapse"
              >
                {Object.keys(groupedSubjects)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map(termNo => (
                    <Panel
                      header={
                        <div className="term-header">
                          <span className="term-title">
                            {termNo === "0" ? "Uncategorized" : `Term ${termNo}`}
                          </span>
                          <Tag color="blue">{groupedSubjects[termNo].length} subjects</Tag>
                        </div>
                      }
                      key={termNo}
                    >
                      <Row gutter={[24, 16]}>
                        {groupedSubjects[termNo].map(subject => (
                          <Col xs={24} sm={12} md={8} lg={4} key={subject.id}>
                            <Link to={`/materials/subject/${subject.id}`}>
                              <Card
                                hoverable
                                className="subject-card"
                                style={{ background: 'linear-gradient(135deg, rgba(255, 247, 161, 0.3), rgba(198, 248, 255, 0.3))' }}
                                cover={
                                  <div className="subject-card-cover">
                                    {subject.active ? 
                                      <BookFilled style={{ fontSize: 48, color: '#1890ff' }} /> :
                                      <BookOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />
                                    }
                                  </div>
                                }
                              >
                                <Card.Meta 
                                  title={
                                    <div>
                                      {subject.code && (
                                        <div className="subject-code">{subject.code}</div>
                                      )}
                                      <div>{subject.name}</div>
                                    </div>
                                  }
                                  description={
                                    <>
                                      <Tag color={subject.active ? 'green' : 'default'}>
                                        {subject.active ? 'Active' : 'Inactive'}
                                      </Tag>
                                    </>
                                  } 
                                />
                              </Card>
                            </Link>
                          </Col>
                        ))}
                      </Row>
                    </Panel>
                  ))}
              </Collapse>
            </Spin>
          </Col>
        </Row>
      </div>
      
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
      
      <style jsx="true">{`
        .learning-materials-page {
          padding: 24px;
        }
        .subject-card-cover {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-card-meta-title {
          white-space: normal;
        }
        .subject-code {
          font-size: 1.2em;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 4px;
        }
        .ant-list-item {
          padding: 12px 16px;
        }
        .ant-list-item:hover {
          background-color: #f0f5ff;
        }
        .ant-list-item-meta-title {
          font-weight: 500;
          margin-bottom: 8px;
        }
        .ant-list-item-action {
          margin-left: 16px;
        }
        .file-name {
          display: flex;
          align-items: center;
        }
        .file-icon {
          margin-right: 8px;
        }
        .term-collapse {
          background: transparent;
        }
        .term-collapse .ant-collapse-header {
          padding: 12px 16px;
          background-color: #f5f7fa;
          border-radius: 4px !important;
          margin-bottom: 16px;
        }
        .term-collapse .ant-collapse-content {
          border-top: none;
        }
        .term-collapse .ant-collapse-item {
          border-bottom: none;
          margin-bottom: 24px;
        }
        .term-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .term-title {
          font-size: 1.2em;
          font-weight: bold;
          color: #1890ff;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default LearningMaterialsPage; 