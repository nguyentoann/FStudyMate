import React, { useEffect, useState, useRef } from 'react';
import { Badge, Dropdown, Button, List, Tooltip, Typography, Space, Divider, notification, Avatar } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import NotificationModal from './NotificationModal';
import NotificationButton from './NotificationButton';
import './NotificationStyles.css';

// Load dayjs plugins
dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// Notification sound
const NOTIFICATION_SOUND = new Audio('https://toandz.ddns.net/fstudy/sound/notification.mp3');

// Store shown count in a variable outside the component to persist between renders
let globalShownCount = 0;

// Default avatar placeholder
const DEFAULT_AVATAR = '/images/default-avatar.svg';

// Cache for sender profile images
const senderProfileCache = new Map();

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [lastCheckedCount, setLastCheckedCount] = useState(0);
  const [shownNotificationCount, setShownNotificationCount] = useState(globalShownCount);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Update global count when state changes
  useEffect(() => {
    globalShownCount = shownNotificationCount;
  }, [shownNotificationCount]);

  // Make debugging tools accessible
  window.debugNotifications = {
    getShownCount: () => globalShownCount,
    resetShownCount: () => {
      globalShownCount = 0;
      setShownNotificationCount(0);
    },
    currentCount: () => unreadCount,
    lastCount: () => lastCheckedCount,
    forceUpdate: (count) => {
      globalShownCount = count;
      setShownNotificationCount(count);
    }
  };

  // Check if user is admin or lecturer
  const canCreateNotifications = user?.role === 'ADMIN' || user?.role === 'LECTURER' || user?.role === 'admin' || user?.role === 'lecturer';

  // Get sender profile image URL
  const getSenderProfileImage = (senderId, senderName, profileImageUrl) => {
    // Check cache first
    if (senderProfileCache.has(senderId)) {
      return senderProfileCache.get(senderId);
    }

    // If the notification contains a profile image URL, use it and cache it
    if (profileImageUrl) {
      senderProfileCache.set(senderId, profileImageUrl);
      return profileImageUrl;
    }

    // Otherwise return default avatar
    return DEFAULT_AVATAR;
  };

  // Process notifications to add profile images
  const processNotifications = (notifs) => {
    return notifs.map(notif => ({
      ...notif,
      senderProfileImage: getSenderProfileImage(notif.senderId, notif.senderName, notif.senderProfileImage)
    }));
  };

  // Load notifications when dropdown is opened
  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user.id);
      // Add profile images to notifications
      const processedData = processNotifications(data);
      setNotifications(processedData);
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

      // Using the suggested approach with global variable
      if (globalShownCount < count) {
        // We have new notifications that haven't been shown

        // Play notification sound
        playNotificationSound();

        // Fetch and show the latest notification
        fetchLatestNotification();

        // Update the shown count directly
        globalShownCount = count;
        setShownNotificationCount(count);
      } else if (globalShownCount > count) {
        // Some notifications were read elsewhere
        globalShownCount = count;
        setShownNotificationCount(count);
      }

      // Always update the counts
      setUnreadCount(count);
      setLastCheckedCount(count);
    } catch (error) {
      console.error('Error fetching unread count', error);
    }
  };

  // Fetch the latest notification for the popup
  const fetchLatestNotification = async () => {
    if (!user?.id) return;

    try {
      const data = await notificationService.getUnreadNotifications(user.id);

      if (data && data.length > 0) {
        // Get the most recent notification
        const latestNotification = data[0];

        // Add profile image to notification
        const processedNotification = {
          ...latestNotification,
          senderProfileImage: getSenderProfileImage(latestNotification.senderId, latestNotification.senderName, latestNotification.senderProfileImage)
        };

        // Show popup with this notification
        showNotificationPopup(processedNotification);
      }
    } catch (error) {
      console.error('Error fetching latest notification', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      NOTIFICATION_SOUND.currentTime = 0;
      NOTIFICATION_SOUND.play().catch(err => {
        console.error('Error playing notification sound:', err);
      });
    } catch (error) {
      console.error('Error with audio playback:', error);
    }
  };

  // Show small popup notification
  const showNotificationPopup = (notificationData) => {
    // Get bell position for placement
    const bellPosition = bellRef.current?.getBoundingClientRect();

    notification.open({
      message: notificationData.title,
      description: (
        <div className="notification-popup-content">
          <div className="notification-content markdown-preview" style={{ maxHeight: '60px', overflow: 'hidden' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{notificationData.content}</ReactMarkdown>
          </div>
          <div className="notification-meta">
            <span className="notification-time">{formatTime(notificationData.createdAt)}</span>
            {notificationData.senderName && (
              <span className="notification-sender">From: {notificationData.senderName}</span>
            )}
          </div>
        </div>
      ),
      icon: (
        <Avatar
          src={notificationData.senderProfileImage}
          size="small"
          icon={<UserOutlined />}
        />
      ),
      placement: 'topRight',
      duration: 3,
      className: 'notification-popup',
      onClick: () => handleNotificationClick(notificationData),
      style: { marginTop: '60px' } // Add some margin to position below the bell
    });
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      // Set initial counts to prevent notifications on first load
      const initializeNotifications = async () => {
        try {
          const count = await notificationService.countUnreadNotifications(user.id);
          setUnreadCount(count);
          setLastCheckedCount(count);

          // Initialize both local and global shown count
          globalShownCount = count;
          setShownNotificationCount(count);
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      };

      initializeNotifications();

      // Set up interval to check for new notifications every 3 seconds (3000ms)
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 3000);

      return () => {
        clearInterval(interval);
      };
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

      // Update unread count and shown count
      setUnreadCount(0);
      setLastCheckedCount(0);
      globalShownCount = 0;
      setShownNotificationCount(0);
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
        <div style={{ width: 450, maxHeight: 500, overflow: 'auto' }}>
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
                  avatar={
                    <div className="notification-avatar-container left-[-10px] top-[10px]">
                      <Avatar
                        src={item.senderProfileImage}
                        size={50}
                        icon={<UserOutlined />}
                      />
                      {!item.isRead && (
                        <div
                          aria-label="Notification bell icon"
                          className="absolute right-[-10px] top-2/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-green-600"
                          style={{
                            width: 22,
                            height: 22,
                            boxShadow: '0 0 0 2px #fff',
                          }}
                        >
                          <i className="fas fa-bell text-white text-[10px]"></i>
                        </div>
                      )}
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.title}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{formatTime(item.createdAt)}</Text>
                    </div>
                  }
                  description={
                    <div>
                      {item.senderName && (
                        <div className="notification-sender-name" style={{ marginBottom: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            From: {item.senderName}
                          </Text>
                        </div>
                      )}
                      <div className="notification-content markdown-preview" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
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
      <div ref={bellRef}>
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
      </div>

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