import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 3) {
            setError("Password must be at least 3 characters");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token: token,
                new_password: password
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data.detail || "Failed to reset password");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="fade-in" style={containerStyle}>
                <div style={cardStyle}>
                    <div style={errorStyle}>
                        <AlertCircle size={18} />
                        <span>Invalid or missing reset token. Please request a new link.</span>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="fade-in" style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.75rem' }}>Password Reset!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
                            Your password has been successfully reset. You will be redirected to login shortly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 25px -5px var(--primary-light)'
                    }}>
                        <Lock size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Set New Password</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Must be at least 3 characters long</p>
                </div>

                {error && (
                    <div style={errorStyle}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>New Password</label>
                        <div style={inputWrapperStyle}>
                            <Lock size={20} style={iconStyle} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                style={inputStyle}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={eyeButtonStyle}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Confirm Password</label>
                        <div style={inputWrapperStyle}>
                            <Lock size={20} style={iconStyle} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            ...buttonStyle,
                            opacity: isLoading ? 0.8 : 1,
                            cursor: isLoading ? 'wait' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle at top right, var(--primary-light) 0%, transparent 40%), radial-gradient(circle at bottom left, var(--surface) 0%, var(--background) 100%)',
    padding: '1rem',
} as React.CSSProperties;

const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glassmorphism base
    backdropFilter: 'blur(12px)',
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid rgba(255,255,255,0.2)',
} as React.CSSProperties;

const labelStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '0.5rem',
    display: 'block',
} as React.CSSProperties;

const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
} as React.CSSProperties;

const iconStyle = {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-tertiary)',
    pointerEvents: 'none',
    zIndex: 1,
} as React.CSSProperties;

const inputStyle = {
    width: '100%',
    padding: '1rem 3rem 1rem 3rem', // Padding for left icon
    borderRadius: '12px',
    border: '2px solid transparent',
    backgroundColor: 'var(--background)',
    color: 'var(--text)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02) inset',
} as React.CSSProperties;

const buttonStyle = {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: 'white',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    fontSize: '1.05rem',
    marginTop: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px var(--primary-light)',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    textDecoration: 'none',
} as React.CSSProperties;

const errorStyle = {
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid var(--danger-border)',
} as React.CSSProperties;

const eyeButtonStyle = {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-tertiary)',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
} as React.CSSProperties;

export default ResetPassword;
