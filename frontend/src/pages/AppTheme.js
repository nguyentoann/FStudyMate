import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import BackgroundCustomizer from '../components/BackgroundCustomizer';

const AppTheme = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">App Theme</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Theme Customization</h2>
            <p className="text-gray-600">
              Customize your app's appearance by changing the background image, adjusting opacity levels,
              and configuring visual effects. Your settings will be saved automatically and applied across the application.
            </p>
          </div>
        </div>
        
        {/* Background Customizer */}
        <BackgroundCustomizer />
      </div>
    </DashboardLayout>
  );
};

export default AppTheme; 