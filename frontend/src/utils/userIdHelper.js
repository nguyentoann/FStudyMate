/**
 * Utility function to retrieve the user ID from various storage locations
 * @returns {number|null} The user ID if found, or null if not found
 */
export const getUserId = () => {
    let userId = null;
    
    // Try to get from auth context user object
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            userId = userData.id || userData.userId;
            console.log('Retrieved userId from localStorage user object:', userId);
        }
    } catch (err) {
        console.error('Error parsing user data from localStorage:', err);
    }
    
    // Try direct localStorage keys
    if (!userId) {
        const possibleKeys = ['userId', 'userid', 'userID', 'user_id'];
        for (const key of possibleKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                userId = parseInt(value, 10);
                console.log(`Retrieved userId from localStorage.${key}:`, userId);
                break;
            }
        }
    }
    
    // Try sessionStorage
    if (!userId) {
        try {
            const sessionUser = sessionStorage.getItem('user');
            if (sessionUser) {
                const userData = JSON.parse(sessionUser);
                userId = userData.id || userData.userId;
                console.log('Retrieved userId from sessionStorage user object:', userId);
            }
        } catch (err) {
            console.error('Error parsing user data from sessionStorage:', err);
        }
    }
    
    // Try direct sessionStorage keys
    if (!userId) {
        const possibleKeys = ['userId', 'userid', 'userID', 'user_id'];
        for (const key of possibleKeys) {
            const value = sessionStorage.getItem(key);
            if (value) {
                userId = parseInt(value, 10);
                console.log(`Retrieved userId from sessionStorage.${key}:`, userId);
                break;
            }
        }
    }
    
    return userId;
};

/**
 * Utility function to check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
    return getUserId() !== null;
};

export default {
    getUserId,
    isAuthenticated
}; 