import React, { useState, useEffect } from 'react';
import { 
  List, Typography, Tag, Space, Button, Empty, Spin, 
  message, Modal, Tooltip, Badge
} from 'antd';
import { 
  EyeOutlined, DeleteOutlined, UndoOutlined, 
  CheckOutlined, DownloadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import notificationService from '../services/notificationService';
import NotificationModal from './NotificationModal';

const { Text, Paragraph } = Typography;
const { confirm } = Modal;

const NotificationList = ({ userId, type = 'received' }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load notifications on component mount
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, type]);

  // Fetch notifications based on type
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let data;
      if (type === 'received') {
        data = await notificationService.getNotifications(userId);
      } else {
        data = await notificationService.getSentNotifications(userId);
      }
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // View notification details
  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    // Mark as read if it's a received notification
    if (type === 'received' && !notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId, userId);
      setNotifications(prevState => 
        prevState.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Unsend notification
  const handleUnsendNotification = async (notificationId) => {
    confirm({
      title: 'Are you sure you want to unsend this notification?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will make the notification unavailable to recipients',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await notificationService.unsendNotification(notificationId, userId);
          setNotifications(prevState => 
            prevState.map(n => 
              n.id === notificationId ? { ...n, isUnsent: true } : n
            )
          );
          message.success('Notification unsent successfully');
        } catch (error) {
          console.error('Error unsending notification:', error);
          message.error('Failed to unsend notification');
        }
      },
    });
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    confirm({
      title: 'Are you sure you want to delete this notification?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await notificationService.deleteNotification(notificationId, userId);
          setNotifications(prevState => 
            prevState.filter(n => n.id !== notificationId)
          );
          message.success('Notification deleted successfully');
        } catch (error) {
          console.error('Error deleting notification:', error);
          message.error('Failed to delete notification');
        }
      },
    });
  };

  // Format relative time
  const formatTime = (dateTime) => {
    return dayjs(dateTime).fromNow();
  };

  // Format absolute time
  const formatDateTime = (dateTime) => {
    return dayjs(dateTime).format('MMM DD, YYYY HH:mm');
  };

  // Render the notification list
  const renderNotificationList = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '24px' }}><Spin size="large" /></div>;
    }

    if (notifications.length === 0) {
      return <Empty description="No notifications found" />;
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={notifications}
        renderItem={(notification) => (
          <List.Item
            key={notification.id}
            actions={[
              <Tooltip title="View Details">
                <Button 
                  type="text" 
                  icon={<EyeOutlined />} 
                  onClick={() => handleViewNotification(notification)}
                />
              </Tooltip>,
              type === 'sent' && !notification.isUnsent && (
                <Tooltip title="Unsend">
                  <Button 
                    type="text" 
                    icon={<UndoOutlined />} 
                    onClick={() => handleUnsendNotification(notification.id)}
                  />
                </Tooltip>
              ),
              <Tooltip title="Delete">
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteNotification(notification.id)}
                />
              </Tooltip>
            ].filter(Boolean)}
            style={{
              opacity: notification.isUnsent ? 0.6 : 1,
              backgroundColor: type === 'received' && !notification.isRead ? '#f0f8ff' : 'transparent'
            }}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {type === 'received' && !notification.isRead && (
                    <Badge status="processing" style={{ marginRight: 8 }} />
                  )}
                  <span>{notification.title}</span>
                  {notification.isUnsent && (
                    <Tag color="default" style={{ marginLeft: 8 }}>Unsent</Tag>
                  )}
                </div>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    {type === 'received' 
                      ? `From: ${notification.senderName}` 
                      : 'Sent to recipients'}
                    {' • '}
                    <Tooltip title={formatDateTime(notification.createdAt)}>
                      {formatTime(notification.createdAt)}
                    </Tooltip>
                  </Text>
                  {type === 'received' && notification.isRead && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <CheckOutlined /> Read {notification.readAt ? formatTime(notification.readAt) : ''}
                    </Text>
                  )}
                </Space>
              }
            />
            <Paragraph ellipsis={{ rows: 2 }}>
              {notification.content}
            </Paragraph>
            {notification.attachmentPath && (
              <div>
                <Text type="secondary">
                  <DownloadOutlined />{' '}
                  {notification.attachmentType === 'image' ? 'Image attachment' : 'File attachment'}
                </Text>
              </div>
            )}
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="notification-list">
      {renderNotificationList()}
      
      <NotificationModal 
        visible={modalVisible} 
        notification={selectedNotification}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default NotificationList; 