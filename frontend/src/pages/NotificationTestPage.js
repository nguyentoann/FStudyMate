import React from 'react';
import { Card, Divider, Typography, Row, Col, Alert } from 'antd';
import NotificationButton from '../components/NotificationButton';
import NotificationDebugger from '../components/NotificationDebugger';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const NotificationTestPage = () => {
  const { user } = useAuth();
  const isAdminOrLecturer = user && (user.role === 'admin' || user.role === 'lecturer');

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>Notification System Test Page</Title>
      
      {!isAdminOrLecturer && (
        <Alert
          message="Restricted Access"
          description="You need to be an admin or lecturer to access all features on this page."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Send Notification">
            <Text>Use this button to create and send a new notification:</Text>
            <div className="mt-4">
              {isAdminOrLecturer ? (
                <NotificationButton type="primary" />
              ) : (
                <Alert message="You don't have permission to send notifications" type="info" showIcon />
              )}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Notification Information">
            <Text>
              The notification system allows admins and lecturers to send notifications to:
            </Text>
            <ul className="list-disc ml-6 mt-2">
              <li>Individual users</li>
              <li>Specific classes</li>
              <li>All students</li>
              <li>All outsource students</li>
              <li>All lecturers</li>
              <li>Everyone in the system</li>
            </ul>
            <Text className="mt-2">
              Notifications support markdown formatting and optional file attachments.
            </Text>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={3}>Notification Debugger</Title>
      <Card>
        <NotificationDebugger />
      </Card>
    </div>
  );
};

export default NotificationTestPage; 