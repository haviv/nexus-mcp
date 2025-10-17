import { useState, forwardRef } from 'react';

interface ChatInputProps {
    status: string;
    onSubmit: (text: string) => void;
    stop?: () => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(function ChatInput({
    status,
    onSubmit,
    stop,
}, ref) {
    const [text, setText] = useState('');
    const isLoading = status === 'streaming' || status === 'submitted';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() === '' || isLoading) return;
        onSubmit(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
                <input
                    ref={ref}
                    className="pathlock-input flex-1 min-w-0 px-3 py-2 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={isLoading ? "Waiting for response..." : "Ask about users, roles, violations, compliance..."}
                    disabled={status !== 'ready'}
                    value={text}
                    onChange={e => setText(e.target.value)}
                />

                {!isLoading ? (
                    <button
                        type="submit"
                        disabled={text.trim() === '' || status !== 'ready'}
                        className="absolute right-1 p-1.5 text-white bg-pathlock-green hover:bg-pathlock-green-dark rounded-md focus:outline-none focus:ring-2 focus:ring-pathlock-green focus:ring-offset-2 focus:ring-offset-pathlock-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={stop}
                        className="absolute right-1 p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-pathlock-dark transition-all duration-200"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between mt-1 px-1">
                <div className="text-xs text-gray-400">
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="w-2 h-2 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Press Enter to send'
                    )}
                </div>

                <div className="text-xs text-gray-500">
                    {text.length > 0 && `${text.length} characters`}
                </div>
            </div>
        </form>
    );
});

export default ChatInput;
