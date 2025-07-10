import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, Radio, Card, Typography, Divider, Upload, 
  Collapse, List, Checkbox, Avatar, Spin, message, Space, Alert, Modal, Tabs, Tag
} from 'antd';
import { 
  UploadOutlined, SearchOutlined, SendOutlined, SaveOutlined, 
  LoadingOutlined, EyeOutlined, ReloadOutlined 
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import apiHelper from '../services/apiHelper';
import './ClickSpark.css'; // Reusing existing CSS

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// Custom CSS styles
const styles = {
  container: {
    padding: '0',
  },
  formSection: {
    marginBottom: '24px',
  },
  recipientSelection: {
    marginTop: '16px',
  },
  userList: {
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
  },
  selectedUser: {
    backgroundColor: '#f0f8ff',
  },
  classHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  className: {
    fontWeight: 'bold',
  },
  classInfo: {
    color: '#888',
    fontSize: '0.9em',
  },
  studentList: {
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '8px 0',
  },
  studentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    gap: '12px',
    borderBottom: '1px solid #f0f0f0',
  },
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  studentName: {
    fontWeight: 'bold',
  },
  studentEmail: {
    fontSize: '0.8em',
    color: '#888',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
  },
  previewCard: {
    marginTop: '16px',
  },
  selectAll: {
    padding: '8px 16px',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '8px',
  },
  noStudents: {
    padding: '16px',
    textAlign: 'center',
    color: '#888',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
  }
};

const CreateNotification = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [recipientType, setRecipientType] = useState('INDIVIDUAL');
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [expandedClass, setExpandedClass] = useState(null);
  const [classStudents, setClassStudents] = useState({});
  const [selectedStudents, setSelectedStudents] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchTextDebounced, setSearchTextDebounced] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [sentNotifications, setSentNotifications] = useState([]);
  const [filteredSentNotifications, setFilteredSentNotifications] = useState([]);
  const [sentSearchText, setSentSearchText] = useState('');
  const [loadingSent, setLoadingSent] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  
  // Fetch classes and users when modal becomes visible
  useEffect(() => {
    if (visible) {
      if (activeTab === 'create') {
        fetchClasses();
      } else if (activeTab === 'sent') {
        fetchSentNotifications();
      }
    }
  }, [visible, activeTab]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  // Handle recipient type change
  useEffect(() => {
    form.setFieldsValue({ recipientIds: undefined });
    setSelectedClasses([]);
    setSelectedUsers([]);
  }, [recipientType, form]);

  // Debounce search text to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTextDebounced(searchText);
    }, 300); // 300ms delay
    
    return () => clearTimeout(timer);
  }, [searchText]);

  // Filter users based on search text
  useEffect(() => {
    if (!searchTextDebounced) {
      setFilteredUsers(allUsers);
    } else {
      const searchLower = searchTextDebounced.toLowerCase();
      const filtered = allUsers.filter(
        user => 
          (user.username && user.username.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.fullName && user.fullName.toLowerCase().includes(searchLower))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTextDebounced, allUsers]);

  // Filter sent notifications when search text changes
  useEffect(() => {
    if (sentSearchText) {
      const filtered = sentNotifications.filter(
        notification => 
          notification.title.toLowerCase().includes(sentSearchText.toLowerCase()) ||
          notification.content.toLowerCase().includes(sentSearchText.toLowerCase())
      );
      setFilteredSentNotifications(filtered);
    } else {
      setFilteredSentNotifications(sentNotifications);
    }
  }, [sentSearchText, sentNotifications]);

  // Reset form
  const resetForm = () => {
    form.resetFields();
    setFileList([]);
    setPreviewContent('');
    setSelectedClasses([]);
    setSelectedUsers([]);
    setSelectedStudents({});
    setSearchText('');
    setRecipientType('INDIVIDUAL');
    setPreviewVisible(false);
    setActiveTab('create');
  };

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await apiHelper.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      message.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // First fetch with pagination
      const response = await apiHelper.get('/user', { 
        params: { 
          role: 'ALL',
          page: 0,
          size: 100 // Fetch first 100 users
        } 
      });
      
      if (response.data && Array.isArray(response.data)) {
        setAllUsers(response.data);
        setFilteredUsers(response.data);
        setTotalUsers(response.data.length >= 100 ? 1000 : response.data.length); // Estimate total
        setCurrentUserPage(0);
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // Handle paginated response format
        setAllUsers(response.data.content);
        setFilteredUsers(response.data.content);
        setTotalUsers(response.data.totalElements || 1000);
        setCurrentUserPage(0);
      } else {
        console.error('Unexpected response format:', response);
        message.error('Failed to load users: unexpected data format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load more users
  const loadMoreUsers = async () => {
    if (loadingMoreUsers) return;
    
    try {
      setLoadingMoreUsers(true);
      const nextPage = currentUserPage + 1;
      
      const response = await apiHelper.get('/user', { 
        params: { 
          role: 'ALL',
          page: nextPage,
          size: 100
        } 
      });
      
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          setAllUsers(prev => [...prev, ...response.data]);
          setCurrentUserPage(nextPage);
        }
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // Handle paginated response format
        if (response.data.content.length > 0) {
          setAllUsers(prev => [...prev, ...response.data.content]);
          setCurrentUserPage(nextPage);
        }
      }
    } catch (error) {
      console.error('Error loading more users:', error);
      message.error('Failed to load more users');
    } finally {
      setLoadingMoreUsers(false);
    }
  };

  // Fetch sent notifications
  const fetchSentNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingSent(true);
      const response = await notificationService.getSentNotifications(user.id);
      setSentNotifications(response || []);
      setFilteredSentNotifications(response || []);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      message.error('Failed to load sent notifications');
    } finally {
      setLoadingSent(false);
    }
  };

  // Fetch students in a class
  const fetchClassStudents = async (classId) => {
    if (classStudents[classId]) return;
    
    try {
      setLoading(true);
      const response = await apiHelper.get(`/classes/${classId}/students`);
      setClassStudents(prev => ({
        ...prev,
        [classId]: response.data
      }));
      setSelectedStudents(prev => ({
        ...prev,
        [classId]: []
      }));
    } catch (error) {
      console.error('Error fetching class students:', error);
      message.error('Failed to load class students');
    } finally {
      setLoading(false);
    }
  };

  // Handle class selection
  const handleClassSelection = (classId, checked) => {
    if (checked) {
      setSelectedClasses(prev => [...prev, classId]);
    } else {
      setSelectedClasses(prev => prev.filter(id => id !== classId));
      setSelectedStudents(prev => ({
        ...prev,
        [classId]: []
      }));
    }
  };

  // Handle class expansion
  const handleClassExpansion = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      fetchClassStudents(classId);
    }
  };

  // Handle student selection within a class
  const handleStudentSelection = (classId, studentId, checked) => {
    if (checked) {
      setSelectedStudents(prev => ({
        ...prev,
        [classId]: [...(prev[classId] || []), studentId]
      }));
    } else {
      setSelectedStudents(prev => ({
        ...prev,
        [classId]: (prev[classId] || []).filter(id => id !== studentId)
      }));
    }
  };

  // Handle user selection for individual recipients
  const handleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  // Handle file upload
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Prepare recipient IDs based on recipient type
      let recipientIds = [];
      
      switch (recipientType) {
        case 'INDIVIDUAL':
          recipientIds = selectedUsers;
          break;
        case 'CLASS':
          // If specific students are selected, use those. Otherwise, use whole classes.
          let hasSelectedStudents = false;
          selectedClasses.forEach(classId => {
            if (selectedStudents[classId] && selectedStudents[classId].length > 0) {
              hasSelectedStudents = true;
              recipientIds = [...recipientIds, ...selectedStudents[classId]];
            }
          });
          
          if (!hasSelectedStudents) {
            recipientIds = selectedClasses;
          }
          break;
        default:
          // For other types, recipientIds are not needed
          recipientIds = [];
          break;
      }

      // Create form data for file upload
      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('senderId', user.id);
        formData.append('recipientType', recipientType);
        formData.append('sendEmail', values.sendEmail || false);
        
        if (recipientIds.length > 0) {
          recipientIds.forEach(id => {
            formData.append('recipientIds', id);
          });
        }
        
        if (fileList[0].originFileObj) {
          formData.append('attachment', fileList[0].originFileObj);
        }
        
        await notificationService.createNotificationWithAttachment(formData);
      } else {
        // Create notification without attachment
        await notificationService.createNotification({
          title: values.title,
          content: values.content,
          senderId: user.id,
          recipientType,
          recipientIds: recipientIds.length > 0 ? recipientIds : undefined,
          sendEmail: values.sendEmail || false
        });
      }
      
      message.success('Notification sent successfully');
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error sending notification:', error);
      message.error('Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // Load data based on tab
    if (key === 'create' && allUsers.length === 0) {
      fetchUsers();
    } else if (key === 'sent' && sentNotifications.length === 0) {
      fetchSentNotifications();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // View notification details
  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setNotificationModalVisible(true);
  };

  // Render notification detail modal
  const renderNotificationDetailModal = () => {
    if (!selectedNotification) return null;

    return (
      <Modal
        title="Notification Details"
        open={notificationModalVisible}
        onCancel={() => setNotificationModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNotificationModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <Title level={4}>{selectedNotification.title}</Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Text type="secondary">Sent: {formatDate(selectedNotification.createdAt)}</Text>
              <Tag color={selectedNotification.unsent ? 'red' : 'green'}>
                {selectedNotification.unsent ? 'Unsent' : 'Active'}
              </Tag>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ marginBottom: '16px' }}>
              <div className="markdown-preview">
                <ReactMarkdown>{selectedNotification.content}</ReactMarkdown>
              </div>
            </div>
            {selectedNotification.attachmentPath && (
              <div style={{ marginTop: '16px' }}>
                <Text strong>Attachment:</Text>
                <div>
                  <a 
                    href={`/api/notifications/${selectedNotification.id}/attachment`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {selectedNotification.attachmentType === 'image' ? '📷' : '📎'} 
                    Download attachment
                  </a>
                </div>
              </div>
            )}
            <Divider style={{ margin: '16px 0' }} />
            <div>
              <Text strong>Recipient Type:</Text> 
              <Text> {
                selectedNotification.recipientType === 'INDIVIDUAL' ? 'Individual Users' : 
                selectedNotification.recipientType === 'CLASS' ? 'Classes' : 
                selectedNotification.recipientType === 'ALL_STUDENTS' ? 'All Students' :
                selectedNotification.recipientType === 'ALL_OUTSRC_STUDENTS' ? 'All Outsource Students' :
                selectedNotification.recipientType === 'ALL_LECTURERS' ? 'All Lecturers' : 'Everyone'
              }</Text>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Render sent notifications tab
  const renderSentNotifications = () => {
    // Handle unsend notification
    const handleUnsendNotification = async (notificationId) => {
      Modal.confirm({
        title: 'Unsend Notification',
        content: 'Are you sure you want to unsend this notification? Recipients will no longer be able to see it.',
        okText: 'Yes, Unsend',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            setLoading(true);
            await notificationService.unsendNotification(notificationId, user.id);
            message.success('Notification unsent successfully');
            fetchSentNotifications(); // Refresh the list
          } catch (error) {
            console.error('Error unsending notification:', error);
            message.error('Failed to unsend notification');
          } finally {
            setLoading(false);
          }
        }
      });
    };

    // Handle delete notification
    const handleDeleteNotification = async (notificationId) => {
      Modal.confirm({
        title: 'Delete Notification',
        content: 'Are you sure you want to delete this notification? This action cannot be undone.',
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            setLoading(true);
            await notificationService.deleteNotification(notificationId, user.id);
            message.success('Notification deleted successfully');
            fetchSentNotifications(); // Refresh the list
          } catch (error) {
            console.error('Error deleting notification:', error);
            message.error('Failed to delete notification');
          } finally {
            setLoading(false);
          }
        }
      });
    };

    return (
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search notifications..."
            prefix={<SearchOutlined />}
            value={sentSearchText}
            onChange={(e) => setSentSearchText(e.target.value)}
            allowClear
            style={{ width: 'calc(100% - 100px)' }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchSentNotifications}
            loading={loadingSent}
          >
            Refresh
          </Button>
        </div>
        
        <List
          loading={loadingSent}
          locale={{ emptyText: 'No notifications found' }}
          itemLayout="horizontal"
          dataSource={filteredSentNotifications}
          pagination={{
            onChange: (page) => {
              setPage(page);
            },
            pageSize: pageSize,
            showSizeChanger: true,
            onShowSizeChange: (current, size) => {
              setPage(1);
              setPageSize(size);
            },
          }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  key="view" 
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => viewNotificationDetails(item)}
                >
                  View
                </Button>,
                <Button 
                  key="unsend" 
                  type="link" 
                  danger
                  onClick={() => handleUnsendNotification(item.id)}
                  disabled={item.unsent}
                >
                  Unsend
                </Button>,
                <Button 
                  key="delete" 
                  type="link" 
                  danger
                  onClick={() => handleDeleteNotification(item.id)}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Text strong>{item.title}</Text>
                      {item.unsent && (
                        <Tag color="red" style={{ marginLeft: '8px' }}>
                          Unsent
                        </Tag>
                      )}
                      {!item.unsent && (
                        <Tag color="green" style={{ marginLeft: '8px' }}>
                          Active
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary">{formatDate(item.createdAt)}</Text>
                  </div>
                }
                description={
                  <div>
                    <Text ellipsis={{ rows: 2 }}>{item.content}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Sent to: {item.recipientType === 'INDIVIDUAL' ? 'Individual Users' : 
                                 item.recipientType === 'CLASS' ? 'Classes' : 
                                 item.recipientType === 'ALL_STUDENTS' ? 'All Students' :
                                 item.recipientType === 'ALL_OUTSRC_STUDENTS' ? 'All Outsource Students' :
                                 item.recipientType === 'ALL_LECTURERS' ? 'All Lecturers' : 'Everyone'}
                      </Text>
                    </div>
                    {item.attachmentPath && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">
                          {item.attachmentType === 'image' ? '📷' : '📎'} Attachment
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Render recipient selection based on recipient type
  const renderRecipientSelection = () => {
    switch (recipientType) {
      case 'INDIVIDUAL':
        return (
          <div className="recipient-selection">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div className="user-list" style={styles.userList}>
              {loadingUsers ? (
                <div className="loading-container" style={styles.loadingContainer}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </div>
              ) : (
                <>
                  <List
                    dataSource={filteredUsers}
                    renderItem={user => (
                      <List.Item 
                        onClick={() => handleUserSelection(user.id)}
                        style={selectedUsers.includes(user.id) ? styles.selectedUser : {}}
                      >
                        <Checkbox checked={selectedUsers.includes(user.id)} />
                        <List.Item.Meta
                          avatar={<Avatar src={user.profileImageUrl || '/images/default-avatar.svg'} />}
                          title={user.fullName || user.username}
                          description={user.email}
                        />
                      </List.Item>
                    )}
                    pagination={{
                      pageSize: 20,
                      size: 'small',
                      showSizeChanger: false,
                      showTotal: (total) => `Total ${total} users`,
                    }}
                    locale={{ emptyText: 'No users found' }}
                  />
                  
                  {allUsers.length < totalUsers && (
                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                      <Button 
                        onClick={loadMoreUsers}
                        loading={loadingMoreUsers}
                        type="link"
                      >
                        Load more users
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={{ marginTop: '10px', textAlign: 'right' }}>
              <Text type="secondary">
                {selectedUsers.length} user(s) selected
              </Text>
              {selectedUsers.length > 0 && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => setSelectedUsers([])}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        );
      case 'CLASS':
        return (
          <div className="class-selection">
            {loadingClasses ? (
              <div className="loading-container" style={styles.loadingContainer}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            ) : (
              <Collapse 
                accordion
                activeKey={expandedClass}
                onChange={(key) => key && handleClassExpansion(key)}
              >
                {classes.map(classObj => (
                  <Panel 
                    key={classObj.classId}
                    header={
                      <div style={styles.classHeader}>
                        <Checkbox 
                          checked={selectedClasses.includes(classObj.classId)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleClassSelection(classObj.classId, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span style={styles.className}>{classObj.className}</span>
                        <span style={styles.classInfo}>
                          {classObj.department || (classObj.academicMajor && classObj.academicMajor.name) || 'No Department'} | 
                          {classObj.semester || (classObj.term && classObj.term.name) || 'No Term'}
                        </span>
                      </div>
                    }
                  >
                    {loading && expandedClass === classObj.classId ? (
                      <div style={styles.loadingContainer}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                      </div>
                    ) : (
                      <div style={styles.studentList}>
                        <div style={styles.selectAll}>
                          <Checkbox 
                            checked={
                              classStudents[classObj.classId] && 
                              selectedStudents[classObj.classId] && 
                              classStudents[classObj.classId].length === selectedStudents[classObj.classId].length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(prev => ({
                                  ...prev,
                                  [classObj.classId]: classStudents[classObj.classId].map(s => s.id)
                                }));
                              } else {
                                setSelectedStudents(prev => ({
                                  ...prev,
                                  [classObj.classId]: []
                                }));
                              }
                            }}
                          >
                            Select All Students
                          </Checkbox>
                        </div>
                        {classStudents[classObj.classId]?.map(student => (
                          <div key={student.id} style={styles.studentItem}>
                            <Checkbox 
                              checked={selectedStudents[classObj.classId]?.includes(student.id)}
                              onChange={(e) => handleStudentSelection(classObj.classId, student.id, e.target.checked)}
                            />
                            <Avatar src={student.profileImageUrl || '/images/default-avatar.svg'} />
                            <div style={styles.studentInfo}>
                              <div style={styles.studentName}>{student.fullName || student.username}</div>
                              <div style={styles.studentEmail}>{student.email}</div>
                            </div>
                          </div>
                        ))}
                        {classStudents[classObj.classId]?.length === 0 && (
                          <div style={styles.noStudents}>No students in this class</div>
                        )}
                      </div>
                    )}
                  </Panel>
                ))}
              </Collapse>
            )}
          </div>
        );
      case 'ALL_STUDENTS':
      case 'ALL_OUTSRC_STUDENTS':
      case 'ALL_LECTURERS':
      case 'ALL':
        return (
          <Alert
            message={`Notification will be sent to all ${recipientType === 'ALL_STUDENTS' ? 'students' : 
              recipientType === 'ALL_OUTSRC_STUDENTS' ? 'outsource students' : 
              recipientType === 'ALL_LECTURERS' ? 'lecturers' : 'users'}`}
            type="info"
          />
        );
      default:
        return null;
    }
  };

  // Render the component
  return (
    <Modal
      //title="Notifications"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose={true}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Create Notification" key="create">
          <div style={styles.container}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                recipientType: 'INDIVIDUAL',
                sendEmail: false
              }}
            >
              {/* Notification Content */}
              <div style={styles.formSection}>
                <Title level={5}>Notification Content</Title>
                
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please enter a title' }]}
                >
                  <Input placeholder="Enter notification title" maxLength={100} />
                </Form.Item>
                
                <Form.Item
                  name="content"
                  label="Content"
                  rules={[{ required: true, message: 'Please enter content' }]}
                >
                  <TextArea 
                    placeholder="Enter notification content (supports markdown)" 
                    rows={4} 
                    onChange={(e) => setPreviewContent(e.target.value)}
                  />
                </Form.Item>
                
                <Form.Item
                  name="attachment"
                  label="Attachment (Optional)"
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    fileList={fileList}
                    onChange={handleFileChange}
                  >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                  </Upload>
                </Form.Item>
                
                {previewContent && (
                  <div style={styles.previewCard}>
                    <Card 
                      size="small"
                      title="Content Preview" 
                      extra={
                        <Button 
                          type="text" 
                          onClick={() => setPreviewVisible(!previewVisible)}
                        >
                          {previewVisible ? 'Hide' : 'Show'}
                        </Button>
                      }
                    >
                      {previewVisible && (
                        <div className="markdown-preview">
                          <ReactMarkdown>{previewContent}</ReactMarkdown>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
              
              {/* Recipient Selection */}
              <div style={styles.formSection}>
                <Title level={5}>Send to</Title>
                
                <Form.Item
                  name="recipientType"
                  
                  rules={[{ required: true, message: 'Please select recipient type' }]}
                >
                  <Radio.Group onChange={(e) => setRecipientType(e.target.value)}>
                    <Radio value="INDIVIDUAL">Specific User(s)</Radio>
                    <Radio value="CLASS">Class(es)</Radio>
                    <Radio value="ALL_STUDENTS">All Students</Radio>
                    <Radio value="ALL_OUTSRC_STUDENTS">All Outsource Students</Radio>
                    <Radio value="ALL_LECTURERS">All Lecturers</Radio>
                    <Radio value="ALL">Everyone</Radio>
                  </Radio.Group>
                </Form.Item>
                
                <div style={styles.recipientSelection}>
                  {renderRecipientSelection()}
                </div>
              </div>
              
              {/* Options */}
              <div style={styles.formSection}>
                <Title level={5}>Options</Title>
                
                <Form.Item
                  name="sendEmail"
                  valuePropName="checked"
                >
                  <Checkbox>Also send as email</Checkbox>
                </Form.Item>
              </div>
              
              {/* Submit Button */}
              <div style={styles.modalFooter}>
                <Button onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SendOutlined />}
                  loading={submitting}
                >
                  Send Notification
                </Button>
              </div>
            </Form>
          </div>
        </TabPane>
        
        <TabPane tab="Sent Notifications" key="sent">
          {renderSentNotifications()}
        </TabPane>
      </Tabs>
      
      {/* Notification detail modal */}
      {renderNotificationDetailModal()}
    </Modal>
  );
};

export default CreateNotification; 