import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PathlockLogo from '../components/PathlockLogo';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(import.meta.env.VITE_API_URL?.replace('/mcp-nexus/chat', '/auth/login') || '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Login failed');
                return;
            }
            const { token } = await res.json();
            // Use the auth context to login (this will update the auth state)
            login(token);
            // The auth context will automatically redirect due to the route protection
        } catch (e) {
            console.error(e);
            setError('Network error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-full max-w-md">
                <div className="pathlock-card p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <PathlockLogo size="lg" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Pathlock IQ
                        </h1>
                        <p className="text-gray-600">
                            Chat with Your Data - Powered by Pathlock AI
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="pathlock-input w-full"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="pathlock-input w-full"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-red-700 text-sm">{error}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full pathlock-button py-3 px-4 font-medium focus:ring-2 focus:ring-pathlock-green focus:ring-offset-2 focus:ring-offset-white transition-all duration-200"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Secure access to your Pathlock database
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
