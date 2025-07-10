import React from 'react';
import { Modal, Typography, Divider, Space, Button, Image } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import remarkGfm from 'remark-gfm';

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
        <div>
          <Title level={4}>{notification.title}</Title>
          <Text type="secondary">
            From: {notification.senderName} • {formatDate(notification.createdAt)}
          </Text>
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
        <div className="markdown-content">
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