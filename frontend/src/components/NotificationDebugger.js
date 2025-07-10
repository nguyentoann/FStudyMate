import React, { useState, useEffect } from 'react';
import { 
  Collapse, Typography, Input, Button, Table, Space, Divider, 
  Switch, message, Card, Tag, Alert, Tabs
} from 'antd';
import { 
  SearchOutlined, SendOutlined, ReloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import apiHelper from '../services/apiHelper';
import notificationService from '../services/notificationService';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const NotificationDebugger = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testUserId, setTestUserId] = useState('');
  const [sendResult, setSendResult] = useState(null);

  // Load API status and test data on component mount
  useEffect(() => {
    checkApiStatus();
    fetchTestData();
  }, []);

  // Check API connectivity
  const checkApiStatus = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/health');
      setApiStatus({
        status: 'success',
        message: 'API is online',
        details: response.data
      });
    } catch (error) {
      console.error('API health check failed', error);
      setApiStatus({
        status: 'error',
        message: 'API is offline or unreachable',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch test data (users and classes)
  const fetchTestData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await apiHelper.get('/user', { params: { role: 'ALL' } });
      setUsers(usersResponse.data || []);
      
      // Fetch classes
      const classesResponse = await apiHelper.get('/classes');
      setClasses(classesResponse.data || []);
    } catch (error) {
      console.error('Error fetching test data', error);
      message.error('Failed to fetch test data');
    } finally {
      setLoading(false);
    }
  };

  // Send a test notification
  const sendTestNotification = async () => {
    if (!testUserId || !testMessage) {
      message.error('Please enter both user ID and message');
      return;
    }

    setLoading(true);
    setSendResult(null);
    
    try {
      // Create a simple notification
      const response = await notificationService.createNotification({
        title: 'Test Notification',
        content: testMessage,
        senderId: 1, // Assuming admin ID is 1
        recipientType: 'INDIVIDUAL',
        recipientIds: [parseInt(testUserId, 10)]
      });
      
      setSendResult({
        status: 'success',
        message: 'Test notification sent successfully',
        data: response
      });
      
      message.success('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification', error);
      setSendResult({
        status: 'error',
        message: 'Failed to send test notification',
        error: error.message
      });
      
      message.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  // User table columns
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : role === 'LECTURER' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'ADMIN' },
        { text: 'Lecturer', value: 'LECTURER' },
        { text: 'Student', value: 'STUDENT' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => setTestUserId(record.id.toString())}
        >
          Select
        </Button>
      ),
    },
  ];

  // Class table columns
  const classColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="default" size="small" disabled>View Students</Button>
      ),
    },
  ];

  return (
    <div className="notification-debugger">
      <Tabs defaultActiveKey="1">
        <TabPane tab="API Status" key="1">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>API Connection Status</Title>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={checkApiStatus}
                  loading={loading}
                >
                  Refresh
                </Button>
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              {apiStatus ? (
                <Alert
                  message={apiStatus.status === 'success' ? 'API Connection Successful' : 'API Connection Failed'}
                  description={apiStatus.message}
                  type={apiStatus.status === 'success' ? 'success' : 'error'}
                  showIcon
                />
              ) : (
                <Alert
                  message="API Status Unknown"
                  description="Click refresh to check API status"
                  type="info"
                  showIcon
                />
              )}
              
              {apiStatus && apiStatus.status === 'success' && apiStatus.details && (
                <Paragraph>
                  <pre>{JSON.stringify(apiStatus.details, null, 2)}</pre>
                </Paragraph>
              )}
            </Space>
          </Card>
        </TabPane>
        
        <TabPane tab="Test Data" key="2">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>Available Test Data</Title>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={fetchTestData}
                  loading={loading}
                >
                  Refresh
                </Button>
          </div>
          
              <Divider style={{ margin: '12px 0' }} />
              
              <Collapse defaultActiveKey={['users']}>
                <Panel header="Users" key="users">
                  <Table
                    dataSource={users}
                    columns={userColumns}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                </Panel>
              
                <Panel header="Classes" key="classes">
                  <Table
                    dataSource={classes}
                    columns={classColumns}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                </Panel>
              </Collapse>
            </Space>
          </Card>
        </TabPane>
        
        <TabPane tab="Send Test" key="3">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Send Test Notification</Title>
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Text strong>Recipient User ID</Text>
                  <Input
                    placeholder="Enter user ID"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                  />
        </div>
        
                <div>
                  <Text strong>Test Message</Text>
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter test message content"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                  />
          </div>
          
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendTestNotification}
                  loading={loading}
                  disabled={!testUserId || !testMessage}
                >
                  Send Test Notification
                </Button>
                
                {sendResult && (
                  <Alert
                    message={sendResult.status === 'success' ? 'Notification Sent' : 'Sending Failed'}
                    description={sendResult.message}
                    type={sendResult.status === 'success' ? 'success' : 'error'}
                    showIcon
                  />
                )}
              </div>
            </Space>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default NotificationDebugger; 