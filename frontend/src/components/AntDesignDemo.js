import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Button, 
  Card, 
  Table, 
  Input, 
  Select, 
  Tabs, 
  Modal, 
  Form,
  Checkbox,
  Radio,
  DatePicker,
  Menu,
  Dropdown,
  Divider,
  Typography,
  Space
} from 'antd';
import {
  SearchOutlined,
  DownOutlined,
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  MenuOutlined
} from '@ant-design/icons';
import NotificationDropdown from './NotificationDropdown';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * AntDesignDemo Component
 * Demonstrates Ant Design components with dark mode support
 */
const AntDesignDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Sample notifications
  const sampleNotifications = [
    {
      id: '1',
      title: 'New Quiz Available',
      message: 'Quiz for Database System has been published',
      time: '5 minutes ago'
    },
    {
      id: '2',
      title: 'Assignment Due',
      message: 'Your Java assignment is due tomorrow',
      time: '2 hours ago'
    },
    {
      id: '3',
      title: 'Class Cancelled',
      message: 'Tomorrow\'s Math class has been cancelled',
      time: '5 hours ago'
    }
  ];
  
  // Sample data for table
  const dataSource = [
    { key: '1', name: 'John Doe', age: 32, address: 'New York No. 1 Lake Park' },
    { key: '2', name: 'Jane Smith', age: 42, address: 'London No. 1 Lake Park' },
    { key: '3', name: 'Bob Johnson', age: 29, address: 'Sydney No. 1 Lake Park' },
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link">View</Button>,
    },
  ];

  // Menu items for dropdown
  const menu = (
    <Menu
      items={[
        { key: '1', label: 'Profile' },
        { key: '2', label: 'Settings' },
        { key: '3', label: 'Logout' },
      ]}
    />
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Ant Design Demo</Title>
          <div className="flex items-center gap-4">
            <NotificationDropdown 
              notifications={sampleNotifications} 
              onNotificationClick={(notification) => console.log('Clicked notification:', notification)}
            />
            <Button
              type="primary"
              onClick={toggleDarkMode}
            >
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Button>
          </div>
        </div>
        
        <Paragraph>
          This page demonstrates Ant Design components with proper dark mode support.
        </Paragraph>
      </Card>
      
      {/* Notification dropdown section */}
      <Card title="Notification Dropdown" className="mb-6">
        <p className="mb-4">
          This notification dropdown properly changes color in dark mode:
        </p>
        
        <div className="flex items-center gap-8">
          <div>
            <NotificationDropdown notifications={sampleNotifications} />
            <div className="mt-2 text-sm text-gray-500">Notification dropdown (click to see)</div>
          </div>
          
          <div>
            <NotificationDropdown notifications={[]} />
            <div className="mt-2 text-sm text-gray-500">Empty notification dropdown</div>
          </div>
        </div>
      </Card>
      
      {/* Form Elements */}
      <Card title="Form Elements" className="mb-6">
        <Form layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item label="Input">
              <Input placeholder="Type something..." />
            </Form.Item>
            
            <Form.Item label="Input with Icon">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
              />
            </Form.Item>
            
            <Form.Item label="Select">
              <Select defaultValue="option1" style={{ width: '100%' }}>
                <Option value="option1">Option 1</Option>
                <Option value="option2">Option 2</Option>
                <Option value="option3">Option 3</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="DatePicker">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item label="Radio Group">
              <Radio.Group defaultValue="a">
                <Radio value="a">Option A</Radio>
                <Radio value="b">Option B</Radio>
                <Radio value="c">Option C</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item label="Checkbox Group">
              <Checkbox.Group
                options={[
                  { label: 'Option 1', value: '1' },
                  { label: 'Option 2', value: '2' },
                  { label: 'Option 3', value: '3' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Card>
      
      {/* Buttons */}
      <Card title="Buttons" className="mb-6">
        <Space wrap>
          <Button type="primary">Primary Button</Button>
          <Button>Default Button</Button>
          <Button type="dashed">Dashed Button</Button>
          <Button type="text">Text Button</Button>
          <Button type="link">Link Button</Button>
          <Button type="primary" danger>Danger Button</Button>
          <Dropdown overlay={menu}>
            <Button>
              Dropdown <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </Card>
      
      {/* Table */}
      <Card title="Table" className="mb-6">
        <Table dataSource={dataSource} columns={columns} />
      </Card>
      
      {/* Tabs */}
      <Card title="Tabs" className="mb-6">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Tab 1" key="1">
            Content of Tab 1
          </TabPane>
          <TabPane tab="Tab 2" key="2">
            Content of Tab 2
          </TabPane>
          <TabPane tab="Tab 3" key="3">
            Content of Tab 3
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Menu */}
      <Card title="Menu" className="mb-6">
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <AppstoreOutlined />,
              label: 'Dashboard',
            },
            {
              key: '2',
              icon: <UserOutlined />,
              label: 'Users',
            },
            {
              key: '3',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        />
        
        <Divider />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Title level={5}>Vertical Menu</Title>
            <Menu
              mode="vertical"
              defaultSelectedKeys={['1']}
              items={[
                {
                  key: '1',
                  icon: <AppstoreOutlined />,
                  label: 'Dashboard',
                },
                {
                  key: '2',
                  icon: <UserOutlined />,
                  label: 'Users',
                },
                {
                  key: '3',
                  icon: <SettingOutlined />,
                  label: 'Settings',
                },
              ]}
            />
          </div>
          
          <div>
            <Title level={5}>Inline Menu</Title>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              items={[
                {
                  key: 'sub1',
                  icon: <MenuOutlined />,
                  label: 'Navigation',
                  children: [
                    { key: '1', label: 'Option 1' },
                    { key: '2', label: 'Option 2' },
                    { key: '3', label: 'Option 3' },
                  ],
                },
              ]}
            />
          </div>
          
          <div>
            <Title level={5}>Dark Theme Menu</Title>
            <Menu
              mode="vertical"
              theme="dark"
              defaultSelectedKeys={['1']}
              items={[
                {
                  key: '1',
                  icon: <AppstoreOutlined />,
                  label: 'Dashboard',
                },
                {
                  key: '2',
                  icon: <UserOutlined />,
                  label: 'Users',
                },
                {
                  key: '3',
                  icon: <SettingOutlined />,
                  label: 'Settings',
                },
              ]}
            />
          </div>
        </div>
      </Card>
      
      {/* Typography */}
      <Card title="Typography" className="mb-6">
        <Title>h1. Ant Design</Title>
        <Title level={2}>h2. Ant Design</Title>
        <Title level={3}>h3. Ant Design</Title>
        <Title level={4}>h4. Ant Design</Title>
        <Title level={5}>h5. Ant Design</Title>
        
        <Paragraph>
          Ant Design is a React UI library that contains a set of high-quality components for building rich, interactive user interfaces.
        </Paragraph>
        
        <div>
          <Text>Default Text</Text>
          <br />
          <Text type="secondary">Secondary Text</Text>
          <br />
          <Text type="success">Success Text</Text>
          <br />
          <Text type="warning">Warning Text</Text>
          <br />
          <Text type="danger">Danger Text</Text>
          <br />
          <Text disabled>Disabled Text</Text>
          <br />
          <Text strong>Strong Text</Text>
          <br />
          <Text mark>Marked Text</Text>
          <br />
          <Text code>Code Text</Text>
          <br />
          <Text keyboard>Keyboard Text</Text>
          <br />
          <Text underline>Underlined Text</Text>
          <br />
          <Text delete>Deleted Text</Text>
          <br />
          <Text italic>Italic Text</Text>
        </div>
      </Card>
      
      {/* Modal */}
      <Card title="Modal" className="mb-6">
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Open Modal
        </Button>
        
        <Modal 
          title="Modal Example" 
          open={isModalVisible} 
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
        >
          <p>This is a modal dialog that works correctly in both light and dark modes.</p>
          <p>It contains text and form elements that respect the current theme.</p>
          
          <Form layout="vertical" className="mt-4">
            <Form.Item label="Name">
              <Input placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Email">
              <Input placeholder="Enter your email" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AntDesignDemo; 