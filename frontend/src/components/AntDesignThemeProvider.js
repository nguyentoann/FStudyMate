import React, { useMemo, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useTheme } from '../context/ThemeContext';

/**
 * AntDesignThemeProvider
 * Provides Ant Design theme configuration based on dark mode state
 */
const AntDesignThemeProvider = ({ children }) => {
  const { darkMode } = useTheme();

  // Add CSS override to ensure dropdown menus are styled in dark mode
  useEffect(() => {
    // Create a style element for dropdown menu overrides
    let dropdownStyle = document.getElementById('dropdown-dark-mode-style');
    if (!dropdownStyle) {
      dropdownStyle = document.createElement('style');
      dropdownStyle.id = 'dropdown-dark-mode-style';
      document.head.appendChild(dropdownStyle);
    }

    // If in dark mode, add styles for dropdown menus
    if (darkMode) {
      dropdownStyle.textContent = `
        .ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical.ant-dropdown-menu-light,
        .ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical.ant-dropdown-menu-light *,
        .ant-dropdown .ant-dropdown-menu,
        .css-dev-only-do-not-override-2y4vty,
        [class*="ant-dropdown"] [class*="ant-dropdown-menu"],
        .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
          border-color: #475569 !important;
        }
        
        .ant-dropdown-menu-item:hover,
        .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item:hover {
          background-color: #334155 !important;
        }
      `;
    } else {
      // Remove styles if not in dark mode
      dropdownStyle.textContent = '';
    }

    return () => {
      if (dropdownStyle && dropdownStyle.parentNode) {
        dropdownStyle.parentNode.removeChild(dropdownStyle);
      }
    };
  }, [darkMode]);

  // Define theme configurations for light and dark mode
  const themeConfig = useMemo(() => {
    if (darkMode) {
      return {
        token: {
          colorPrimary: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          colorTextBase: '#f1f5f9',
          colorBgBase: '#0f172a',
          colorBorder: '#475569',
          borderRadius: 6,
        },
        components: {
          Table: {
            colorBgContainer: '#1e293b',
            colorText: '#f1f5f9',
            colorBorderSecondary: '#475569',
            colorFillAlter: '#334155',
            colorFillContent: '#334155',
            colorIcon: '#94a3b8',
          },
          Card: {
            colorBgContainer: '#1e293b',
            colorTextHeading: '#f1f5f9',
            colorTextDescription: '#94a3b8',
            colorBorderSecondary: '#475569',
            colorSplit: '#475569',
          },
          Modal: {
            colorBgElevated: '#1e293b',
            colorTextHeading: '#f1f5f9',
            colorIcon: '#94a3b8',
            colorBgMask: 'rgba(0, 0, 0, 0.75)',
            colorSplit: '#475569',
          },
          Menu: {
            colorItemBg: '#1e293b',
            colorItemText: '#f1f5f9',
            colorItemTextSelected: '#3b82f6',
            colorItemBgSelected: '#334155',
            colorItemTextHover: '#3b82f6',
            colorItemBgHover: '#334155',
            colorSplit: '#475569',
            colorActiveBarWidth: 3,
            colorActiveBarBorderSize: 0,
          },
          Dropdown: {
            colorBgElevated: '#1e293b',
            colorText: '#f1f5f9',
            colorTextDescription: '#94a3b8',
            colorBgTextHover: '#334155',
            colorBgTextActive: '#334155',
            controlItemBgHover: '#334155',
            controlItemBgActive: '#334155',
            colorBorderSecondary: '#475569',
            colorSplit: '#475569',
          },
          Button: {
            colorBgContainer: '#1e293b',
            colorText: '#f1f5f9',
            colorBorder: '#475569',
            colorPrimaryHover: '#2563eb',
            colorPrimaryActive: '#1d4ed8',
          },
          Input: {
            colorBgContainer: '#1e293b',
            colorText: '#f1f5f9',
            colorTextPlaceholder: '#64748b',
            colorBorder: '#475569',
            colorPrimaryHover: '#3b82f6',
            controlOutlineWidth: 2,
            controlOutline: 'rgba(59, 130, 246, 0.2)',
          },
          Select: {
            colorBgContainer: '#1e293b',
            colorText: '#f1f5f9',
            colorTextPlaceholder: '#64748b',
            colorBorder: '#475569',
            colorPrimaryHover: '#3b82f6',
            controlOutline: 'rgba(59, 130, 246, 0.2)',
            colorBgElevated: '#1e293b',
          },
          Tabs: {
            colorBgContainer: 'transparent',
            colorText: '#94a3b8',
            colorTextHeading: '#f1f5f9',
            colorTextActive: '#3b82f6',
          },
        },
      };
    } else {
      // Light theme - use default Ant Design theme or customize as needed
      return {
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 6,
        },
      };
    }
  }, [darkMode]);

  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};

export default AntDesignThemeProvider; 