import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Streamdown } from 'streamdown';
import ChatInput from './ChatInput';

export default function Chat() {
    const { logout } = useAuth();
    const { error, status, sendMessage, messages, regenerate, stop } = useChat({
        transport: new DefaultChatTransport({
            api: import.meta.env.VITE_API_URL || '/mcp-nexus/chat',
            headers: () => {
                const token = localStorage.getItem('jwt_token');
                return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' };
            },
        }),
        onFinish: (message) => {
            console.log('🏁 Chat finished with message:', message);
        },
        onError: (error) => {
            console.error('❌ Chat error:', error);
        }
    });

    // Debug logging for all messages changes
    useEffect(() => {
        console.log('📬 Messages updated:', {
            count: messages.length,
            status,
            latestMessage: messages[messages.length - 1],
            allMessages: messages
        });
    }, [messages, status]);

    // Handle token expiration and logout
    const handleLogout = () => {
        logout(); // This will update the auth state and trigger redirect
    };

    useEffect(() => {
        if (error) {
            console.log('Chat error:', error);
            // Check if it's a 401 error (unauthorized) which indicates token expiration
            if (error.message && (
                error.message.includes('Token expired or invalid') ||
                error.message.includes('Unauthorized') ||
                error.message.includes('401')
            )) {
                console.log('Token expired or unauthorized, redirecting to login');
                logout(); // This will update the auth state and trigger redirect
            }
        }
    }, [error]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

    // Mermaid configuration for dark/light themes
    const mermaidConfig = {
        theme: 'base' as const,
        themeVariables: {
            darkMode: false,
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#e5e7eb',
            lineColor: '#6b7280',
            sectionBkgColor: '#f3f4f6',
            altSectionBkgColor: '#ffffff',
            gridColor: '#e5e7eb',
            secondaryColor: '#06b6d4',
            tertiaryColor: '#f3f4f6',
        },
    };

    // Check if user is at bottom of scroll area
    const isAtBottom = useCallback(() => {
        if (!scrollContainerRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // Consider "at bottom" if within 100px of the bottom
        return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    // Handle scroll events to detect if user scrolled away from bottom
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        setIsUserScrolledUp(!isAtBottom());
    }, [isAtBottom]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Only auto-scroll if user hasn't manually scrolled up
        if (!isUserScrolledUp) {
            scrollToBottom();
        }

        // Focus input after response is complete
        if (status === 'ready' && messages.length > 0) {
            setTimeout(() => {
                chatInputRef.current?.focus();
            }, 100);
        }
    }, [messages, status, isUserScrolledUp]);

    // Reset scroll state when messages are cleared or first message arrives
    useEffect(() => {
        if (messages.length <= 1) {
            setIsUserScrolledUp(false);
        }
    }, [messages.length]);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                GRC Assistant
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Governance, Risk & Compliance Database Assistant
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                            <button
                                onClick={() => {
                                    logout(); // This will update the auth state and trigger redirect
                                }}
                                className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                Test Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-hidden">
                <div 
                    ref={scrollContainerRef}
                    className="h-full overflow-y-auto"
                    onScroll={handleScroll}
                >
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        {messages.length === 0 && (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Welcome to GRC Assistant
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    Ask questions about users, roles, violations, compliance status, and more from your Pathlock database.
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {messages.map((m: any) => {
                                // Essential debug logging for markdown issues
                                if (m.role === 'assistant') {
                                    const extractedContent = m.parts
                                        ? m.parts
                                            .map((part: any) => (part.type === 'text' ? part.text : ''))
                                            .join('')
                                        : String(m.content || '');
                                    
                                    console.log('🎨 AI Message Content:', extractedContent.substring(0, 200) + '...');
                                }

                                const extractedContent = m.parts
                                    ? m.parts
                                        .map((part: any) => (part.type === 'text' ? part.text : ''))
                                        .join('')
                                    : String(m.content || '');

                                return (
                                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`flex-shrink-0 ${m.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user'
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                                                    }`}>
                                                    {m.role === 'user' ? (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className={`rounded-2xl px-4 py-3 ${m.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                                }`}>
                                                {m.role === 'user' ? (
                                                    // For user messages, use simple text rendering
                                                    <div className="prose prose-sm max-w-none">
                                                        <pre className="whitespace-pre-wrap font-sans text-white">
                                                            {extractedContent}
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    // For AI messages, use Streamdown for rich formatting
                                                    <Streamdown
                                                        mermaidConfig={mermaidConfig}
                                                        className="streamdown-container prose prose-sm max-w-none dark:prose-invert"
                                                        shikiTheme={['github-light', 'github-dark']}
                                                        controls={{
                                                            table: true,
                                                            code: true,
                                                            mermaid: true
                                                        }}
                                                        parseIncompleteMarkdown={true}
                                                    >
                                                        {extractedContent}
                                                    </Streamdown>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Loading State */}
                        {(status === 'submitted' || status === 'streaming') && (
                            <div className="flex justify-start mt-6">
                                <div className="flex">
                                    <div className="flex-shrink-0 mr-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="mt-6">
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-red-800 dark:text-red-400 font-medium">An error occurred</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                                        onClick={() => regenerate()}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Scroll to bottom button when user scrolled up */}
                {isUserScrolledUp && (
                    <div className="absolute bottom-4 right-4">
                        <button
                            onClick={() => {
                                setIsUserScrolledUp(false);
                                scrollToBottom();
                            }}
                            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            title="Scroll to bottom"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <ChatInput
                        ref={chatInputRef}
                        status={status}
                        onSubmit={text => sendMessage({ text })}
                        stop={stop}
                    />
                </div>
            </div>
        </div>
    );
}
