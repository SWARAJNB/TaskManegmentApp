import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // New States
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    // Forgot Password Flow States
    const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetStatus, setResetStatus] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Refs for 3D tilt effect
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) return;

        try {
            setResetStatus('Sending...');
            await api.post('/auth/forgot-password', { email: resetEmail });
            setResetStatus('Reset link sent to your email!');
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetStatus('');
                setResetEmail('');
            }, 3000);
        } catch (err) {
            setResetStatus('Failed to send reset link. User may not exist.');
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!cardRef.current) return;

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Calculate rotation based on cursor position relative to center
            const xRotation = ((clientY - innerHeight / 2) / innerHeight) * 20; // Max 10 deg
            const yRotation = ((clientX - innerWidth / 2) / innerWidth) * 20; // Max 10 deg

            // Apply transform
            cardRef.current.style.transform = `rotateX(${-xRotation}deg) rotateY(${yRotation}deg)`;
        };

        const handleMouseLeave = () => {
            if (cardRef.current) {
                cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
            }
        };

        // Attach to window to ensure we catch events even if container isn't full width/height or during transitions
        window.addEventListener('mousemove', handleMouseMove);
        // Optional: Reset on mouse leave or window blur if desired, but for full screen effect window is better
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await api.post('/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const success = await login(response.data.access_token);
            if (success) {
                navigate('/home');
            } else {
                setError('Failed to load user profile. Please try again.');
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-3d-container" ref={containerRef}>
            <div className="auth-3d-card" ref={cardRef}>
                <div className="auth-3d-content">
                    {/* Left Side - Login Form */}
                    <div className="auth-3d-form-section">
                        <h2 className="auth-3d-title">Login</h2>

                        {error && <div className="auth-error-text">{error}</div>}

                        {!showForgotPassword ? (
                            <form onSubmit={handleSubmit} className="auth-3d-form">
                                <div className="auth-3d-input-group">
                                    <label>Username</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="auth-3d-input"
                                        />
                                        <User size={18} className="auth-3d-icon" />
                                    </div>
                                </div>

                                <div className="auth-3d-input-group">
                                    <label>Password</label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="auth-3d-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="auth-3d-eye-btn"
                                            style={{ right: '2rem' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <Lock size={18} className="auth-3d-icon" />
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className="auth-3d-forgot-btn"
                                        onClick={() => setShowForgotPassword(true)}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <button type="submit" disabled={isLoading} className="auth-3d-btn">
                                    {isLoading ? 'Loading...' : 'Login'}
                                </button>

                                <div className="auth-3d-footer">
                                    <span>Don't have an account? </span>
                                    <Link to="/register" className="auth-3d-link">Sign Up</Link>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="auth-3d-form fade-in">
                                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Reset Password</h3>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

                                {resetStatus && (
                                    <div className={`auth-error-text ${resetStatus.includes('sent') ? 'success' : ''}`} style={{ color: resetStatus.includes('sent') ? '#00f3ff' : '#ff4d4d' }}>
                                        {resetStatus}
                                    </div>
                                )}

                                <div className="auth-3d-input-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                            className="auth-3d-input"
                                            placeholder="Enter your email"
                                        />
                                        <User size={18} className="auth-3d-icon" />
                                    </div>
                                </div>

                                <button type="submit" className="auth-3d-btn">
                                    Send Reset Link
                                </button>

                                <button
                                    type="button"
                                    className="auth-3d-btn-secondary"
                                    onClick={() => setShowForgotPassword(false)}
                                    style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #333', color: '#fff' }}
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right Side - Welcome Back */}
                    <div className="auth-3d-welcome-section">
                        <div className="welcome-content">
                            <h2>WELCOME<br />BACK!</h2>
                        </div>
                        {/* Decorative Diagonal Shape */}
                        <div className="diagonal-shape"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
