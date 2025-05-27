import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import UserActivityDashboard from './components/admin/UserActivityDashboard';

// Import other components as needed
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
// ... other imports

// Initialize user activity tracking on app startup
import './utils/userActivityTracker';

// Protected route component for admin routes
const AdminRoute = ({ component: Component, ...rest }) => {
    const { currentUser, loading } = useContext(AuthContext);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <Route
            {...rest}
            render={props => 
                currentUser && currentUser.roles && currentUser.roles.includes('ADMIN') ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
};

// Protected route component for authenticated users
const PrivateRoute = ({ component: Component, ...rest }) => {
    const { currentUser, loading } = useContext(AuthContext);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <Route
            {...rest}
            render={props =>
                currentUser ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
};

// Placeholder components until actual ones are implemented
const ProfileComponent = () => <div>User Profile Page</div>;
const UserDashboardComponent = () => <div>User Dashboard</div>;

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Switch>
                    {/* Public routes */}
                    <Route exact path="/" component={Home} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    
                    {/* Admin routes */}
                    <AdminRoute path="/admin/dashboard" component={UserActivityDashboard} />
                    
                    {/* Protected routes */}
                    <PrivateRoute path="/profile" component={ProfileComponent} />
                    <PrivateRoute path="/dashboard" component={UserDashboardComponent} />
                    
                    {/* Add other routes as needed */}
                    
                    {/* 404 route */}
                    <Route path="*" component={() => <h1>404 - Not Found</h1>} />
                </Switch>
            </Router>
        </AuthProvider>
    );
};

export default App; 