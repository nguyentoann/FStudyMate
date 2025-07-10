import React, { useEffect, useState, useRef } from 'react';
import { Badge, Dropdown, Button, List, Tooltip, Typography, Space, Divider } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import NotificationModal from './NotificationModal';
import NotificationButton from './NotificationButton';

// Load dayjs plugins
dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Check if user is admin or lecturer
  const canCreateNotifications = user?.role === 'ADMIN' || user?.role === 'LECTURER' || user?.role === 'admin' || user?.role === 'lecturer';
  
  // Load notifications when dropdown is opened
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Count unread notifications
  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const count = await notificationService.countUnreadNotifications(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count', error);
    }
  };
  
  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      
      // Set up interval to check for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  // Mark a notification as read
  const handleNotificationClick = async (notification) => {
    try {
      await notificationService.markAsRead(notification.id, user.id);
      
      // Update local state
      setNotifications(prevState => 
        prevState.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      
      // Update unread count
      fetchUnreadCount();
      
      // Open notification details
      // navigate(`/notifications/${notification.id}`);
      
      // Show notification modal
      showNotificationModal(notification);
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prevState => 
        prevState.map(n => ({ ...n, isRead: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };
  
  // Show notification modal
  const showNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    setOpen(false);  // Close dropdown when modal opens
  };
  
  // Navigate to create notification page
  const goToCreateNotification = () => {
    setOpen(false); // Close dropdown
    navigate('/create-notification');
  };
  
  // Format relative time
  const formatTime = (dateTime) => {
    return dayjs(dateTime).fromNow();
  };
  
  // Notification dropdown menu items
  const items = [
    {
      key: 'menu',
      label: (
        <div style={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={5} style={{ margin: 0 }}>Notifications</Title>
            <Space>
              {canCreateNotifications && (
                <NotificationButton size="small" type="primary" tooltip="Create Notification">
                  <SendOutlined />
                </NotificationButton>
              )}
              <Button 
                type="link" 
                size="small" 
                disabled={unreadCount === 0}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            </Space>
          </div>
          
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            loading={loading}
            locale={{ emptyText: 'No notifications' }}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{ 
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: item.isRead ? 'white' : '#f0f8ff'
                }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.title}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{formatTime(item.createdAt)}</Text>
                    </div>
                  }
                  description={
                    <div>
                      <Text ellipsis={{ rows: 2 }}>{item.content}</Text>
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
          
          <div style={{ textAlign: 'center', padding: '8px', borderTop: '1px solid #f0f0f0' }}>
            <Space>
              <Button type="link" onClick={() => navigate('/notifications')}>
                View All Notifications
              </Button>
              {canCreateNotifications && (
                <NotificationButton type="link" size="small">
                  Create Notification
                </NotificationButton>
              )}
            </Space>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <>
      <Dropdown 
        menu={{ items }}
        trigger={['click']} 
        placement="bottomRight"
        arrow
        onOpenChange={(visible) => {
          setOpen(visible);
          if (visible) {
            fetchNotifications();
          }
        }}
        open={open}
      >
        <Badge count={unreadCount} size="small" onClick={(e) => e.preventDefault()}>
          <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        </Badge>
      </Dropdown>
      
      {/* Notification detail modal */}
      <NotificationModal 
        open={modalVisible} 
        notification={selectedNotification}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default NotificationBell; 