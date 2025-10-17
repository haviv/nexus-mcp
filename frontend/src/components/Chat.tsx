import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Streamdown } from 'streamdown';
import ChatInput from './ChatInput';
import WelcomeSection from './WelcomeSection';
import PathlockLogo from './PathlockLogo';

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

    const handleQuestionClick = (question: string) => {
        sendMessage({ text: question });
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <PathlockLogo size="lg" />
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-pathlock-green transition-colors duration-200"
                        >
                            <span className="mr-2">Logout</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
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
                    <div className="max-w-6xl mx-auto px-6 py-6">
                        {messages.length === 0 && (
                            <WelcomeSection onQuestionClick={handleQuestionClick} />
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
                                                    ? 'bg-pathlock-green'
                                                    : 'bg-gray-100 border border-gray-200'
                                                    }`}>
                                                    {m.role === 'user' ? (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <PathlockLogo size="sm" showText={false} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className={`rounded-2xl px-4 py-3 ${m.role === 'user'
                                                ? 'bg-pathlock-green text-white border-2 border-pathlock-green'
                                                : 'bg-white border border-gray-200 shadow-sm'
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
                                                        className="streamdown-container prose prose-sm max-w-none"
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
                                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            <PathlockLogo size="sm" showText={false} />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-pathlock-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-pathlock-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-pathlock-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-600">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="mt-6">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-red-700 font-medium">An error occurred</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-3 pathlock-button-secondary text-red-700 border-red-300 hover:bg-red-50"
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
                            className="flex items-center justify-center w-12 h-12 bg-pathlock-green hover:bg-pathlock-green-dark text-white rounded-full shadow-pathlock-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pathlock-green focus:ring-offset-2 focus:ring-offset-white"
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
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
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
