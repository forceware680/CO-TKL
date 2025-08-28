import React, { useState } from 'react';

interface LoginProps {
    onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLogin(username, password);
        if (!success) {
            setError('Username atau password salah.');
        } else {
            setError('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">Aplikasi Kasir</h1>
                    <p className="text-slate-500 mt-2">Taman Kyai Langgeng - Magelang</p>
                </header>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-semibold text-center text-slate-700 mb-6">Silakan Login</h2>
                    {error && <p className="bg-red-100 text-red-700 text-center p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full rounded-md border border-slate-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full rounded-md border border-slate-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            Login
                        </button>
                    </form>
                </div>
                 <p className="text-center text-xs text-slate-400 mt-6">
                    Login awal: username 'admin', password 'admin'
                </p>
            </div>
        </div>
    );
};

export default Login;
