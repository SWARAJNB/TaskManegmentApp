import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [debugLink, setDebugLink] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Note: Backend endpoint will be implemented next
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.reset_link) {
                setDebugLink(response.data.reset_link);
            }
            setSubmitted(true);
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                setError('Email address not found.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fade-in" style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.75rem' }}>Check your email</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '1rem' }}>
                            We've sent a password reset link to <br />
                            <span style={{ fontWeight: '700', color: 'var(--text)' }}>{email}</span>
                        </p>

                        {/* DEBUG: Show link directly for user convenience */}
                        {debugLink && (
                            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Development Mode - Debug Link:</p>
                                <a href={debugLink} style={{ fontSize: '0.85rem', color: 'var(--primary)', wordBreak: 'break-all' }}>Click here to reset password</a>
                            </div>
                        )}

                        <Link to="/login" style={buttonStyle}>
                            Back to Log In
                        </Link>
                        <button
                            onClick={() => setSubmitted(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                        >
                            Didn't receive the email? Click to retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={containerStyle}>
            <div style={cardStyle}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.2s' }}>
                    <ArrowLeft size={18} /> Back to Log In
                </Link>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Mail size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Forgot password?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {error && (
                    <div style={errorStyle}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <div style={inputWrapperStyle}>
                            <Mail size={20} style={iconStyle} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
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
                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
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
    marginTop: '0.5rem',
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

export default ForgotPassword;
