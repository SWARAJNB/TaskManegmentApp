import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone } from 'lucide-react';
import './Auth.css';

const Register = () => {

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Refs for 3D tilt effect
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!cardRef.current) return;

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            const xRotation = ((clientY - innerHeight / 2) / innerHeight) * 20;
            const yRotation = ((clientX - innerWidth / 2) / innerWidth) * 20;

            cardRef.current.style.transform = `rotateX(${-xRotation}deg) rotateY(${yRotation}deg)`;
        };

        const handleMouseLeave = () => {
            if (cardRef.current) {
                cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password) {
            setError('Please fill in all required fields');
            return;
        }
        if (password.length < 3) {
            setError('Password must be at least 3 characters');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create User (with optional mobile number)
            await api.post('/users/', {
                email,
                full_name: fullName,
                password,
                mobile_number: mobile || null,
            });

            // 2. Auto Login
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const loginResponse = await api.post('/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const success = await login(loginResponse.data.access_token);

            if (success) {
                navigate('/home');
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.response) {
                const detail = err.response.data.detail || JSON.stringify(err.response.data);
                if (err.response.status === 400 && detail.includes('already registered')) {
                    setError('Email already exists. Please sign in.');
                } else {
                    setError(`Registration failed: ${detail}`);
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-3d-container" ref={containerRef}>
            <div className="auth-3d-card" ref={cardRef}>
                <div className="auth-3d-content">
                    {/* Left Side - Register Form */}
                    <div className="auth-3d-form-section">
                        <h2 className="auth-3d-title">Sign Up</h2>

                        {error && <div className="auth-error-text">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-3d-form">
                            {/* Full Name */}
                            <div className="auth-3d-input-group">
                                <label>Full Name <span style={{ color: '#ff4d4d' }}>*</span></label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                        placeholder="Enter your full name"
                                    />
                                    <User size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            {/* Mobile Number */}
                            <div className="auth-3d-input-group">
                                <label>Mobile Number <span style={{ color: '#aaa', fontSize: '0.8rem' }}>(optional)</span></label>
                                <div className="input-wrapper">
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="auth-3d-input"
                                        placeholder="e.g. +91 98765 43210"
                                    />
                                    <Phone size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="auth-3d-input-group">
                                <label>Email Address <span style={{ color: '#ff4d4d' }}>*</span></label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                        placeholder="Enter your email"
                                    />
                                    <Mail size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="auth-3d-input-group">
                                <label>Password <span style={{ color: '#ff4d4d' }}>*</span></label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                        placeholder="Min. 3 characters"
                                    />
                                    <Lock size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="auth-3d-btn"
                            >
                                {isLoading ? 'Creating...' : 'Register'}
                            </button>

                            <div className="auth-3d-footer">
                                <span>Already have an account? </span>
                                <Link to="/login" className="auth-3d-link">Sign In</Link>
                            </div>
                        </form>
                    </div>

                    {/* Right Side - Welcome */}
                    <div className="auth-3d-welcome-section">
                        <div className="welcome-content">
                            <h2>JOIN<br />THE TEAM</h2>
                        </div>
                        <div className="diagonal-shape"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
