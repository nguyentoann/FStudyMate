import React, { useEffect, useRef } from 'react';
import { Dropdown, Badge, Avatar } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import '../styles/notification-dropdown.css';

/**
 * NotificationDropdown Component
 * A dropdown menu for notifications that properly supports dark mode
 * 
 * @param {Object} props
 * @param {Array} props.notifications - Array of notification objects
 * @param {Function} props.onNotificationClick - Function to call when a notification is clicked
 */
const NotificationDropdown = ({ notifications = [], onNotificationClick }) => {
  const { darkMode } = useTheme();
  const dropdownRef = useRef(null);
  
  // Effect to ensure dark mode is properly applied to dropdown
  useEffect(() => {
    // Function to apply dark mode to dropdown when it opens
    const applyDarkMode = () => {
      setTimeout(() => {
        const dropdowns = document.querySelectorAll('.ant-dropdown-menu');
        dropdowns.forEach(dropdown => {
          if (darkMode) {
            dropdown.style.backgroundColor = '#1e293b';
            dropdown.style.boxShadow = '0 6px 16px 0 rgba(0, 0, 0, 0.3)';
            dropdown.style.borderColor = '#475569';
            
            // Apply style to all items
            const items = dropdown.querySelectorAll('.ant-dropdown-menu-item');
            items.forEach(item => {
              item.style.color = '#f1f5f9';
              
              // Add hover event listener to each item
              item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#334155';
              });
              
              item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
              });
            });
          }
        });
      }, 10);
    };
    
    // Add event listener to the document to detect dropdown opening
    document.addEventListener('click', applyDarkMode);
    
    return () => {
      document.removeEventListener('click', applyDarkMode);
    };
  }, [darkMode]);
  
  // Sample empty state
  const emptyNotifications = (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      No new notifications
    </div>
  );
  
  // Create dropdown items from notifications
  const notificationItems = notifications.length > 0 
    ? notifications.map(notification => ({
        key: notification.id,
        label: (
          <div className="notification-item">
            <div className="notification-title">{notification.title}</div>
            <div>{notification.message}</div>
            <div className="notification-time">{notification.time}</div>
          </div>
        ),
        onClick: () => onNotificationClick && onNotificationClick(notification)
      }))
    : [{
        key: 'empty',
        label: emptyNotifications,
        disabled: true
      }];
    
  // Add "View all" option if there are notifications
  if (notifications.length > 0) {
    notificationItems.push({
      type: 'divider'
    });
    
    notificationItems.push({
      key: 'view-all',
      label: (
        <div style={{ textAlign: 'center', fontWeight: 500 }}>
          View all notifications
        </div>
      ),
      onClick: () => onNotificationClick && onNotificationClick({ id: 'view-all' })
    });
  }
  
  return (
    <Dropdown
      menu={{ items: notificationItems }}
      placement="bottomRight"
      arrow
      trigger={['click']}
      getPopupContainer={trigger => trigger.parentNode}
      overlayClassName={darkMode ? 'dark-mode-dropdown' : ''}
      ref={dropdownRef}
    >
      <Badge count={notifications.length} size="small" offset={[-2, 2]}>
        <Avatar 
          icon={<BellOutlined />} 
          style={{ backgroundColor: darkMode ? '#334155' : '#f3f4f6', color: darkMode ? '#f1f5f9' : '#111827', cursor: 'pointer' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown; 