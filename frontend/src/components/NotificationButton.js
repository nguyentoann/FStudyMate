import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import CreateNotification from './CreateNotification';
import { useAuth } from '../context/AuthContext';

const NotificationButton = ({ 
  type = "primary", 
  size = "middle", 
  tooltip = "Send Notification", 
  isFloating = false,
  children
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  
  // Only allow admin and lecturers to send notifications
  const canSendNotifications = user && (user.role === 'admin' || user.role === 'lecturer');
  
  if (!canSendNotifications) {
    return null;
  }
  
  // If it's a floating button in the dashboard layout
  if (isFloating || size === "large") {
    return (
      <>
        <button
          onClick={() => setModalVisible(true)}
          className="bg-amber-500 text-white p-3 rounded-full shadow-xl hover:bg-amber-600 focus:outline-none relative"
          title="Send Notification"
        >
          <svg 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        
        <CreateNotification 
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </>
    );
  }
  
  // Default button style for other places
  return (
    <>
      <Tooltip title={tooltip}>
        <Button
          type={type}
          size={size}
          icon={<NotificationOutlined />}
          onClick={() => setModalVisible(true)}
        >
          {children || "Send Notification"}
        </Button>
      </Tooltip>
      
      <CreateNotification 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default NotificationButton; 