import React from 'react';
import { Modal, Typography, Divider, Space, Button, Image, Avatar } from 'antd';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import remarkGfm from 'remark-gfm';
import './NotificationStyles.css';

const { Title, Text } = Typography;

const NotificationModal = ({ open, notification, onClose }) => {
  if (!notification) {
    return null;
  }

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY HH:mm');
  };

  const handleDownload = (attachmentPath) => {
    // Implement download functionality
    window.open(attachmentPath, '_blank');
  };

  return (
    <Modal
      title={
        <div className="notification-modal-header">
          <div className="notification-modal-avatar">
            <div className="notification-avatar-container">
              <Avatar 
                src={notification.senderProfileImage} 
                size={40} 
                icon={<UserOutlined />}
              />
              {!notification.isRead && (
                <div 
                  className="notification-dot-indicator"
                  style={{
                    width: 8,
                    height: 8,
                    left: 30,
                    top: 40
                  }}
                />
              )}
            </div>
          </div>
          <div className="notification-modal-title">
            <Title level={4}>{notification.title}</Title>
            <Text type="secondary">
              From: {notification.senderName} • {formatDate(notification.createdAt)}
            </Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      centered
    >
      <Divider />
      
      <div className="notification-content">
        {/* Render markdown content */}
        <div className="markdown-content markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {notification.content || ''}
          </ReactMarkdown>
        </div>
      </div>
      
      {notification.attachmentPath && (
        <>
          <Divider />
          <div className="notification-attachment">
            <Title level={5}>Attachment</Title>
            
            {notification.attachmentType === 'image' ? (
              <Image
                src={notification.attachmentPath}
                alt="Attachment"
                style={{ maxWidth: '100%', maxHeight: 300 }}
              />
            ) : (
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(notification.attachmentPath)}
              >
                Download {notification.attachmentPath.split('/').pop()}
              </Button>
            )}
          </div>
        </>
      )}
      
      <Divider />
      
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>Close</Button>
        </Space>
      </div>
    </Modal>
  );
};

export default NotificationModal; 