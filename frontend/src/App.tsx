import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import TaskManagement from './pages/TaskManagement';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';


function App() {
    return (
        <Router>
            <AuthProvider>
                <WebSocketProvider>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route element={<PrivateRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/home" element={<Home />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/tasks" element={<TaskManagement />} />
                                <Route path="/tasks/:id" element={<TaskDetail />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>
                        </Route>
                        <Route path="*" element={<div style={{ padding: 20 }}>Page not found (404)</div>} />
                    </Routes>
                </WebSocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
