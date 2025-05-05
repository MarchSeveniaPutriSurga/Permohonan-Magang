import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Auth.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Kirim data login ke backend
        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.token) {
                // Simpan token ke local storage
                localStorage.setItem('token', data.token);

                // Redirect ke halaman user setelah login berhasil
                navigate('/pendaftaran-magang');
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login gagal. Silakan coba lagi.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="auth-title">LOGIN</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <span className="input-icon">✉</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email ID"
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <span className="input-icon">🔒</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    
                    <div className="login-options">
                        <div className="remember-me">
                            <input 
                                type="checkbox" 
                                id="remember-me" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember-me">Remember me</label>
                        </div>
                        <div className="forgot-password">
                            <a href="/forgot-password">Forgot Password?</a>
                        </div>
                    </div>
                    
                    <button type="submit" className="login-btn">LOGIN</button>
                </form>
                <p className="auth-switch">Belum punya akun? <a href="/register">Daftar disini</a></p>
            </div>
        </div>
    );
}

export default LoginPage;