import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/config';

const GoogleOAuthStatus = ({ email }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (email) {
      checkEmailStatus(email);
    }
  }, [email]);

  const checkEmailStatus = async (email) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/google/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking email status:', error);
      setStatus({ error: 'Failed to check email status' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Checking email status...
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.error) {
    return (
      <div className="text-sm text-red-500">
        {status.error}
      </div>
    );
  }

  return (
    <div className="text-sm">
      {status.exists ? (
        <div className="space-y-1">
          <div className="text-green-600">
            ✓ Email is registered
          </div>
          {status.hasLocalAuth && (
            <div className="text-blue-600">
              ℹ This account can be linked to Google
            </div>
          )}
          {status.verified ? (
            <div className="text-green-600">
              ✓ Account is verified
            </div>
          ) : (
            <div className="text-yellow-600">
              ⚠ Account needs verification
            </div>
          )}
        </div>
      ) : (
        <div className="text-blue-600">
          ℹ New account will be created with Google
        </div>
      )}
    </div>
  );
};

export default GoogleOAuthStatus; 