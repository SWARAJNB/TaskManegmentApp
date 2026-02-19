import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowRight, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import './Auth.css';

const Register = () => {

    // ...

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Mobile & OTP States
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpState, setOtpState] = useState<'idle' | 'sending' | 'sent' | 'verified'>('idle');
    const [generatedOtp, setGeneratedOtp] = useState(''); // In real app, verify on backend

    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }
        try {
            setOtpState('sending');
            const res = await api.post('/auth/send-otp', { mobile_number: mobile });
            // For demo purposes, we log the OTP. In prod, backend handles verification.
            console.log("OTP Sent:", res.data.dev_otp);
            setGeneratedOtp(res.data.dev_otp);
            setOtpState('sent');
            setError('');
        } catch (err) {
            setOtpState('idle');
            setError('Failed to send OTP. Try again.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return;
        // In real app: await api.post('/auth/verify-otp', { mobile, otp })
        // For demo:
        if (otp === generatedOtp || otp === '123456') {
            setOtpState('verified');
            setError('');
        } else {
            setError('Invalid OTP');
        }
    };

    const { login } = useAuth();

    // Refs for 3D tilt effect
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!cardRef.current) return;

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Calculate rotation
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
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 3) {
            setError('Password must be at least 3 characters');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create User
            await api.post('/users/', { email, full_name: fullName, password });

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
            console.error("Registration error:", err);
            if (err.response) {
                const detail = err.response.data.detail || JSON.stringify(err.response.data);
                if (err.response.status === 400 && detail.includes("already registered")) {
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
                            <div className="auth-3d-input-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                    />
                                    <User size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            <div className="auth-3d-input-group">
                                <label>Mobile Number</label>
                                <div className="input-wrapper">
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                        placeholder="Mobile Number"
                                    />
                                    {otpState === 'verified' ? (
                                        <CheckCircle size={18} className="auth-3d-icon" style={{ color: '#00f3ff' }} />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpState === 'sending'}
                                            className="auth-3d-verify-btn"
                                            style={{ right: '0.5rem', position: 'absolute', padding: '0.2rem 0.5rem', background: 'rgba(0, 243, 255, 0.2)', border: '1px solid #00f3ff', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', zIndex: 10 }}
                                        >
                                            {otpState === 'sending' ? 'Sending...' : otpState === 'sent' ? 'Resend' : 'Verify'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {otpState === 'sent' && (
                                <div className="auth-3d-input-group fade-in">
                                    <label>Enter OTP</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="auth-3d-input"
                                            placeholder="Enter 6-digit OTP"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            className="auth-3d-verify-btn"
                                            style={{ right: '0.5rem', position: 'absolute', padding: '0.2rem 0.5rem', background: '#00f3ff', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.2rem' }}>Check console for OTP (Demo)</p>
                                </div>
                            )}

                            <div className="auth-3d-input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                    />
                                    <Mail size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            <div className="auth-3d-input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="auth-3d-input"
                                    />
                                    <Lock size={18} className="auth-3d-icon" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otpState !== 'verified'}
                                className="auth-3d-btn"
                                style={{ opacity: otpState !== 'verified' ? 0.7 : 1, cursor: otpState !== 'verified' ? 'not-allowed' : 'pointer' }}
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
