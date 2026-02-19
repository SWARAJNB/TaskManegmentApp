import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, Shield, Layout } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <nav className="landing-nav">
                <div className="logo">
                    <Layout fill="currentColor" />
                    TaskFlow
                </div>
                <div className="nav-links">
                    <Link to="/login" className="nav-link">Log In</Link>
                    <Link to="/register" className="btn-landing-secondary">Sign Up</Link>
                </div>
            </nav>

            <header className="landing-hero">
                <h1 className="hero-title">
                    Manage Tasks with <br />
                    Context & Clarity
                </h1>
                <p className="hero-subtitle">
                    Streamline your workflow, collaborate seamlessly, and achieve more with our intuitive task management platform.
                </p>
                <div className="cta-group">
                    <Link to="/register" className="btn-landing-primary">
                        Get Started <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </Link>
                </div>
            </header>

            <section className="landing-features">
                <div className="feature-card">
                    <div className="feature-icon">
                        <Zap size={24} />
                    </div>
                    <h3 className="feature-title">Lightning Fast</h3>
                    <p className="feature-desc">
                        Built for speed and efficiency. Experience instant updates and a responsive interface that keeps up with you.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <h3 className="feature-title">Stay Organized</h3>
                    <p className="feature-desc">
                        Categorize, prioritize, and track your tasks with ease. Never let an important deadline slip through the cracks.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">
                        <Shield size={24} />
                    </div>
                    <h3 className="feature-title">Secure & Reliable</h3>
                    <p className="feature-desc">
                        Your data is safe with us. Enterprise-grade security ensures your projects and information are protected.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Landing;
