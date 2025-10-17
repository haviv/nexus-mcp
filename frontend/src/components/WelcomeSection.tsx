import { useState } from 'react';

interface WelcomeSectionProps {
    onQuestionClick: (question: string) => void;
}

export default function WelcomeSection({ onQuestionClick }: WelcomeSectionProps) {
    const [hoveredTile, setHoveredTile] = useState<number | null>(null);

    const exampleQuestions = [
        "Show me users with privileged access in SAP.",
        "Show my control exceptions that have expired.",
        "Show me violation trends by system and department over last six months."
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-3">
            {/* Chat Bubble Icon */}
            <div className="mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
            </div>

            {/* Welcome Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                Welcome to Pathlock IQ
            </h1>

            {/* Description */}
            <p className="text-base text-gray-600 max-w-2xl text-center mb-6 leading-relaxed font-medium">
                Chat with Your Data - Powered by Pathlock AI
            </p>

            {/* Secondary Description */}
            <p className="text-sm text-gray-500 max-w-xl text-center mb-8 leading-relaxed">
                Ask questions about users, roles, violations, compliance status, and more from your Pathlock database.
            </p>

            {/* From Insight to Assurance Section */}
            <div className="pathlock-card-dark p-4 mb-6 max-w-3xl w-full">
                <h2 className="text-lg font-bold text-pathlock-green mb-2 text-center">
                    From Insight to Assurance
                </h2>
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                    Get real-time insights into your data governance landscape. Our AI explains risks, provides remediation guidance,
                    and automatically generates remediation plans to ensure compliance and security across your organization.
                </p>
            </div>

            {/* Try asking section */}
            <div className="w-full max-w-3xl">
                <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">
                    Try asking:
                </h3>

                {/* Example Questions Grid */}
                <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
                    {exampleQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => onQuestionClick(question)}
                            onMouseEnter={() => setHoveredTile(index)}
                            onMouseLeave={() => setHoveredTile(null)}
                            className={`pathlock-card p-3 text-left transition-all duration-200 cursor-pointer group ${hoveredTile === index
                                ? 'shadow-lg transform scale-[1.02] bg-pathlock-green/5 border border-pathlock-green/20'
                                : 'shadow-sm hover:shadow-md border border-gray-100 hover:border-pathlock-green/15'
                                }`}
                        >
                            <div className="flex items-start space-x-2">
                                {/* Sparkle Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg
                                        className={`w-3 h-3 transition-colors duration-200 ${hoveredTile === index ? 'text-pathlock-green' : 'text-pathlock-green/70'
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>

                                {/* Question Text */}
                                <p className="text-gray-700 text-sm leading-relaxed group-hover:text-pathlock-green transition-colors duration-200 font-medium">
                                    {question}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
