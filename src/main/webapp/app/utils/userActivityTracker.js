import axios from 'axios';
import deviceDetector from './deviceDetector';

/**
 * User Activity Tracker
 * Collects and sends user activity data to the server
 */
class UserActivityTracker {
    constructor() {
        // Check for existing session token or create placeholder
        this.sessionToken = localStorage.getItem('session_token');
        
        // Placeholder used until a real token is assigned from the server
        // In a real app, this would be obtained during login/authentication
        if (!this.sessionToken) {
            // For guest users, we'll use a temporary token and create a session later
            this.sessionToken = 'temp_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('session_token', this.sessionToken);
        }
        
        // Initialize activity tracking data
        this.userData = {
            userId: null,
            username: null
        };
        
        this.activityData = {
            startTime: Date.now(),
            currentPage: window.location.pathname,
            pageViews: 1,
            lastActivity: Date.now()
        };
        
        // Setup activity tracking events
        this.setupEventListeners();
        
        // Send initial activity data
        this.sendActivityData();
        
        // Set up periodic updates every 60 seconds
        this.updateInterval = setInterval(() => this.sendActivityData(), 60000);
        
        // Detect device information
        this.deviceInfo = deviceDetector.getDeviceInfo();
    }
    
    /**
     * Set up event listeners to track user activity
     */
    setupEventListeners() {
        // Track page navigation events
        window.addEventListener('popstate', () => this.handlePageChange());
        
        // Track clicks, keypress, and scroll events to detect user activity
        document.addEventListener('click', () => this.updateLastActivity());
        document.addEventListener('keypress', () => this.updateLastActivity());
        document.addEventListener('scroll', () => this.updateLastActivity());
        
        // Handle page unload to send final activity data
        window.addEventListener('beforeunload', () => {
            this.sendActivityData(true);
            clearInterval(this.updateInterval);
        });
    }
    
    /**
     * Update activity data when page changes
     */
    handlePageChange() {
        this.activityData.currentPage = window.location.pathname;
        this.activityData.pageViews++;
        this.updateLastActivity();
        this.sendActivityData();
    }
    
    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        this.activityData.lastActivity = Date.now();
    }
    
    /**
     * Set user information and session token when available (e.g., after login)
     * This should be called after successful authentication
     */
    setUserData(userData, sessionToken) {
        this.userData = {
            ...this.userData,
            ...userData
        };
        
        // Update session token if provided (e.g., from login response)
        if (sessionToken) {
            this.sessionToken = sessionToken;
            localStorage.setItem('session_token', sessionToken);
        }
    }
    
    /**
     * Calculate session duration in seconds
     */
    calculateDuration() {
        return Math.round((Date.now() - this.activityData.startTime) / 1000);
    }
    
    /**
     * Send activity data to the server
     * @param {boolean} isFinal Whether this is the final update before the page unloads
     */
    async sendActivityData(isFinal = false) {
        try {
            const payload = {
                sessionToken: this.sessionToken,
                userId: this.userData.userId,
                username: this.userData.username,
                duration: this.calculateDuration(),
                currentPage: this.activityData.currentPage,
                pageViews: this.activityData.pageViews,
                device: this.deviceInfo,
                ipAddress: '', // Server will detect this
                isFinal: isFinal
            };
            
            // Use a sendBeacon if this is the final call (page unloading)
            // This increases the chances of the request being completed
            if (isFinal && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon('/api/user-activity', blob);
            } else {
                const response = await axios.post('/api/user-activity', payload);
                
                // Check if we received a session ID from the server
                if (response.data && response.data.sessionId) {
                    // Store session ID for future reference if needed
                    localStorage.setItem('session_id', response.data.sessionId);
                }
            }
        } catch (error) {
            console.error('Error sending activity data', error);
        }
    }
}

// Create a singleton instance
const userActivityTracker = new UserActivityTracker();

export default userActivityTracker; 