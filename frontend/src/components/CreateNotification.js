import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, Radio, Card, Typography, Divider, Upload, 
  Collapse, List, Checkbox, Avatar, Spin, message, Space, Alert
} from 'antd';
import { UploadOutlined, SearchOutlined, SendOutlined, SaveOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import apiHelper from '../services/apiHelper';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const CreateNotification = () => {
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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Fetch classes and users on component mount
  useEffect(() => {
    fetchClasses();
    fetchUsers();
  }, []);

  // Handle recipient type change
  useEffect(() => {
    form.setFieldsValue({ recipientIds: undefined });
    setSelectedClasses([]);
    setSelectedUsers([]);
  }, [recipientType, form]);

  // Filter users based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = allUsers.filter(
        user => 
          user.username.toLowerCase().includes(searchText.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
  }, [searchText, allUsers]);

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      message.error('Failed to load classes');
    } finally {
      setLoading(false);
        }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get('/user', { params: { role: 'ALL' } });
      setAllUsers(response.data);
      setFilteredUsers(response.data);
      } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
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
      
      // Reset form
      form.resetFields();
      setFileList([]);
      setPreviewContent('');
      setSelectedClasses([]);
      setSelectedUsers([]);
      setSelectedStudents({});
      
    } catch (error) {
      console.error('Error sending notification:', error);
      message.error('Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle content preview
  const handlePreview = () => {
    setPreviewContent(form.getFieldValue('content') || '');
    setPreviewVisible(!previewVisible);
  };

  // Render recipient selection based on type
  const renderRecipientSelection = () => {
    switch (recipientType) {
      case 'INDIVIDUAL':
  return (
          <div>
            <Input
              placeholder="Search users by name or email"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <List
              bordered
              loading={loading}
              dataSource={filteredUsers}
              renderItem={user => (
                <List.Item
                  key={user.id}
                  onClick={() => handleUserSelection(user.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Checkbox checked={selectedUsers.includes(user.id)} />
                  <Avatar src={user.profilePicture} style={{ marginLeft: 8 }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <span style={{ marginLeft: 8 }}>
                    {user.username} {user.email ? `(${user.email})` : ''}
                  </span>
                </List.Item>
      )}
            />
            {selectedUsers.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text>Selected Users: {selectedUsers.length}</Text>
        </div>
      )}
          </div>
        );
      
      case 'CLASS':
        return (
          <div>
            {loading ? (
              <Spin />
            ) : (
              <List
                bordered
                dataSource={classes}
                renderItem={classItem => (
                  <List.Item
                    key={classItem.id}
                    style={{ display: 'block', padding: 0 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 24px',
                        cursor: 'pointer'
                      }}
              >
                      <Checkbox
                        checked={selectedClasses.includes(classItem.id)}
                        onChange={(e) => handleClassSelection(classItem.id, e.target.checked)}
                      />
                      <div
                        style={{ marginLeft: 8, flex: 1 }}
                        onClick={() => handleClassExpansion(classItem.id)}
                      >
                        {classItem.name} ({classItem.code})
                      </div>
                    </div>
                    
                    {expandedClass === classItem.id && (
                      <div style={{ padding: '0 24px 12px 48px' }}>
                        {classStudents[classItem.id] ? (
                          classStudents[classItem.id].length > 0 ? (
                            <>
                              <Text type="secondary">Select specific students:</Text>
                              <List
                                size="small"
                                dataSource={classStudents[classItem.id]}
                                renderItem={student => (
                                  <List.Item key={student.id}>
                                    <Checkbox
                                      checked={
                                        selectedStudents[classItem.id] &&
                                        selectedStudents[classItem.id].includes(student.id)
                                      }
                                      onChange={(e) => handleStudentSelection(
                                        classItem.id, student.id, e.target.checked
                                      )}
                                    />
                                    <span style={{ marginLeft: 8 }}>
                                      {student.username} {student.email ? `(${student.email})` : ''}
                                    </span>
                                  </List.Item>
                                )}
                              />
                            </>
                          ) : (
                            <Text type="secondary">No students in this class</Text>
                          )
                        ) : (
                          <Spin size="small" />
              )}
            </div>
                    )}
                  </List.Item>
                )}
              />
            )}
            {selectedClasses.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text>Selected Classes: {selectedClasses.length}</Text>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card title={<Title level={4}>Create Notification</Title>} style={{ width: '100%' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Title */}
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Notification title" />
        </Form.Item>
        
        {/* Content */}
        <Form.Item
          name="content"
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Content (Supports Markdown)</span>
              <Button type="link" onClick={handlePreview}>
                {previewVisible ? 'Edit' : 'Preview'}
              </Button>
            </div>
          }
          rules={[{ required: true, message: 'Please enter content' }]}
        >
          {previewVisible ? (
            <div
              className="markdown-preview"
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '2px',
                padding: '16px',
                minHeight: '200px'
              }}
            >
              <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
          ) : (
            <TextArea
              rows={6}
              placeholder="Notification content (supports Markdown formatting)"
            />
          )}
        </Form.Item>
        
        {/* Attachment */}
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
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
        </Form.Item>
        
        <Divider />
        
        {/* Recipient Selection */}
        <Form.Item
          name="recipientType"
          label="Send To"
          initialValue={recipientType}
        >
          <Radio.Group
            onChange={(e) => setRecipientType(e.target.value)}
            value={recipientType}
          >
            <Radio value="INDIVIDUAL">Specific User(s)</Radio>
            <Radio value="CLASS">Class(es)</Radio>
            <Radio value="ALL_STUDENTS">All Students</Radio>
            <Radio value="ALL_OUTSRC_STUDENTS">All Outsource Students</Radio>
            <Radio value="ALL_LECTURERS">All Lecturers</Radio>
            <Radio value="ALL">Everyone</Radio>
          </Radio.Group>
        </Form.Item>
        
        {/* Recipient selection based on type */}
        <Form.Item name="recipientIds">
          {renderRecipientSelection()}
        </Form.Item>
        
        {/* Send Email Option */}
        <Form.Item name="sendEmail" valuePropName="checked">
          <Checkbox>Also send via email (if available)</Checkbox>
        </Form.Item>
        
        <Divider />
        
        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<SendOutlined />}
            size="large"
            style={{ marginRight: 8 }}
          >
            Send Notification
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              form.resetFields();
              setFileList([]);
              setSelectedClasses([]);
              setSelectedUsers([]);
              setSelectedStudents({});
            }}
          >
            Reset
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateNotification; 