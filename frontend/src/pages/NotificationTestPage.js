import React, { useState, useEffect } from 'react';
import { 
  Tabs, Card, Typography, Row, Col, Button, 
  Modal, Divider 
} from 'antd';
import { useAuth } from '../context/AuthContext';
import CreateNotification from '../components/CreateNotification';
import NotificationList from '../components/NotificationList';
import NotificationDebugger from '../components/NotificationDebugger';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NotificationTestPage = ({ defaultTab = '1' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [debugModalVisible, setDebugModalVisible] = useState(false);

  // Update active tab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Check if user is admin or lecturer
  const isAdminOrLecturer = user?.role === 'ADMIN' || user?.role === 'LECTURER' || 
                            user?.role === 'admin' || user?.role === 'lecturer';

  return (
    <div className="notification-page" style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Notification System</Title>
            <Text type="secondary">
              Create and manage notifications for users and classes. Supports markdown formatting and file attachments.
            </Text>
            
            <Divider />
            
            {isAdminOrLecturer && (
              <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <Button 
                  type="default" 
                  onClick={() => setDebugModalVisible(true)}
            >
                  Debug Notification System
                </Button>
          </div>
        )}
        
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              {isAdminOrLecturer && (
                <TabPane tab="Create Notification" key="1">
                  <CreateNotification />
                </TabPane>
              )}
              <TabPane tab="My Notifications" key="2">
                <NotificationList userId={user?.id} type="received" />
              </TabPane>
              {isAdminOrLecturer && (
                <TabPane tab="Sent Notifications" key="3">
                  <NotificationList userId={user?.id} type="sent" />
                </TabPane>
        )}
            </Tabs>
          </Card>
        </Col>
      </Row>
      
      {isAdminOrLecturer && (
        <Modal
          title="Notification System Debugger"
          open={debugModalVisible}
          onCancel={() => setDebugModalVisible(false)}
          footer={null}
          width={800}
        >
            <NotificationDebugger />
        </Modal>
        )}
    </div>
  );
};

export default NotificationTestPage; 