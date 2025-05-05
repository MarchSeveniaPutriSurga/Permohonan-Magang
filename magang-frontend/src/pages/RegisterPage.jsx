import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Auth.css';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            alert("Password dan konfirmasi password tidak cocok!");
            return;
        }

        // Kirim data registrasi ke backend
        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.message === "Registrasi berhasil") {
                alert("Registrasi berhasil, silakan login.");
                navigate('/login');  // Redirect ke halaman login setelah registrasi berhasil
            } else {
                alert("Terjadi kesalahan, coba lagi.");
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registrasi gagal. Silakan coba lagi.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="auth-title">REGISTER</h2>
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
                    
                    <div className="input-group">
                        <span className="input-icon">🔒</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-btn">REGISTER</button>
                </form>
                <p className="auth-switch">Sudah punya akun? <a href="/login">Login disini</a></p>
            </div>
        </div>
    );
}

export default RegisterPage;