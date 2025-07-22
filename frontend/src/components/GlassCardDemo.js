import React from 'react';
import GlassCard from './GlassCard';

/**
 * GlassCardDemo Component
 * Demonstrates how to use the GlassCard component and its dark mode support
 */
const GlassCardDemo = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Glass Card Demo</h1>
      
      {/* Standard Glass Card */}
      <GlassCard className="mb-4 delay-100">
        <h2 className="text-lg font-semibold mb-2">Glass Card Component</h2>
        <p>This component automatically adapts to dark mode with proper styling.</p>
      </GlassCard>
      
      {/* Example matching the original HTML */}
      <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border animate-fade-in-up delay-100" 
           id="glass-element-demo"
           style={{
             borderWidth: '0.8px',
             borderStyle: 'solid',
             borderColor: 'rgba(255, 255, 255, 0.35) rgba(255, 255, 255, 0.337) rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1)',
             position: 'relative',
             borderRadius: '8px',
             transition: 'border-image 0.1s ease-out, box-shadow 0.1s ease-out'
           }}>
        <h2 className="text-lg font-semibold mb-2">Original Style Element</h2>
        <p>This element uses the original HTML and CSS structure from the example.</p>
      </div>
      
      {/* Using GlassCard with custom content */}
      <GlassCard className="mb-4 delay-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Custom Content</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">New</span>
        </div>
        <p className="mb-4">You can put any content inside the GlassCard component.</p>
        <div className="bg-opacity-50 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-md">
          <p className="text-sm">This inner container also respects dark mode.</p>
        </div>
      </GlassCard>
      
      {/* Multiple cards with different delays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <GlassCard className="delay-100">
          <h3 className="font-medium mb-2">Card 1</h3>
          <p className="text-sm">This card appears first.</p>
        </GlassCard>
        
        <GlassCard className="delay-200">
          <h3 className="font-medium mb-2">Card 2</h3>
          <p className="text-sm">This card appears second.</p>
        </GlassCard>
        
        <GlassCard className="delay-300">
          <h3 className="font-medium mb-2">Card 3</h3>
          <p className="text-sm">This card appears third.</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default GlassCardDemo; 