import React, { useState } from 'react';
import { Button, Card, Alert, Spin, Typography, Space } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../services/config';

const { Title, Text } = Typography;

/**
 * Component for administrators to manually trigger Samba directory synchronization
 */
const SambaSyncTool = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/admin/sync/start`);
      setResult(response.data);
    } catch (err) {
      console.error('Error syncing Samba directories:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Samba Synchronization Tool" className="mb-4">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          This tool manually synchronizes the Samba directories with the database. 
          Use this if files have been added, modified, or deleted directly on the Samba server.
        </Text>
        
        <div className="mt-4">
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={loading}
            onClick={handleSync}
            disabled={loading}
          >
            Start Synchronization
          </Button>
        </div>

        {loading && (
          <div className="mt-4">
            <Spin /> <Text>Synchronizing files, please wait...</Text>
          </div>
        )}

        {result && (
          <Alert
            message="Synchronization Complete"
            description={
              <div>
                <p>{result.message}</p>
                <p>Execution time: {result.executionTimeMs}ms</p>
              </div>
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mt-4"
          />
        )}

        {error && (
          <Alert
            message="Synchronization Error"
            description={error}
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            className="mt-4"
          />
        )}
      </Space>
    </Card>
  );
};

export default SambaSyncTool; 