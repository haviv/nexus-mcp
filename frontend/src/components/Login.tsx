import { useState } from 'react';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

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
            // Clear any existing token and set new one
            localStorage.removeItem('jwt_token');
            localStorage.setItem('jwt_token', token);
            onSuccess();
        } catch (e) {
            console.error(e);
            setError('Network error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
                <h1 className="text-lg font-semibold mb-4">Sign in</h1>
                <div className="space-y-3">
                    <input className="w-full border rounded px-3 py-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
                <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Login</button>
            </form>
        </div>
    );
}


