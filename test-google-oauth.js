// Test script for Google OAuth functionality
// Run this in browser console to test the implementation

const testGoogleOAuth = {
  // Test backend endpoints
  async testBackendEndpoints() {
    console.log('Testing backend endpoints...');
    
    try {
      // Test email check endpoint
      const emailCheckResponse = await fetch('http://localhost:8080/api/auth/google/check-email?email=test@example.com');
      const emailCheckData = await emailCheckResponse.json();
      console.log('Email check response:', emailCheckData);
      
      // Test Google login endpoint (with mock data)
      const mockGoogleRequest = {
        idToken: 'mock-google-id-token',
        accessToken: 'mock-access-token',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      };
      
      const loginResponse = await fetch('http://localhost:8080/api/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockGoogleRequest)
      });
      
      const loginData = await loginResponse.json();
      console.log('Google login response:', loginData);
      
    } catch (error) {
      console.error('Backend test failed:', error);
    }
  },
  
  // Test frontend Google OAuth
  testFrontendOAuth() {
    console.log('Testing frontend Google OAuth...');
    
    // Check if Google OAuth provider is configured
    const googleProvider = document.querySelector('[data-testid="google-oauth-provider"]');
    if (googleProvider) {
      console.log('✓ Google OAuth provider found');
    } else {
      console.log('✗ Google OAuth provider not found');
    }
    
    // Check if Google login button exists
    const googleLoginButton = document.querySelector('[data-testid="google-login-button"]');
    if (googleLoginButton) {
      console.log('✓ Google login button found');
    } else {
      console.log('✗ Google login button not found');
    }
  },
  
  // Test environment variables
  testEnvironmentVariables() {
    console.log('Testing environment variables...');
    
    const requiredVars = [
      'REACT_APP_GOOGLE_CLIENT_ID',
      'REACT_APP_API_URL',
      'REACT_APP_OPEN_URL'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✓ ${varName} is set`);
      } else {
        console.log(`✗ ${varName} is not set`);
      }
    });
  },
  
  // Test user authentication flow
  async testAuthFlow() {
    console.log('Testing authentication flow...');
    
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      console.log('✓ User is logged in:', JSON.parse(user));
    } else {
      console.log('✗ No user logged in');
    }
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✓ JWT token exists');
    } else {
      console.log('✗ No JWT token found');
    }
  },
  
  // Run all tests
  async runAllTests() {
    console.log('=== Google OAuth Test Suite ===');
    
    await this.testBackendEndpoints();
    this.testFrontendOAuth();
    this.testEnvironmentVariables();
    await this.testAuthFlow();
    
    console.log('=== Test Suite Complete ===');
  }
};

// Export for use in browser console
window.testGoogleOAuth = testGoogleOAuth;

// Auto-run tests if in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testGoogleOAuth.runAllTests();
  }, 2000);
}

export default testGoogleOAuth; 