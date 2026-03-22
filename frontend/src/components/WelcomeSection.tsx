import { useState } from 'react';

type ChatMode = 'grc' | 'docs' | 'analytics' | 'workflow';

interface WelcomeSectionProps {
    onQuestionClick: (question: string) => void;
    onModeChange: (mode: ChatMode) => void;
    mode: ChatMode;
}

const DOCS_QUESTIONS = [
    "How do I configure Segregation of Duties rules in Pathlock?",
    "What is the process for remediating a SoD violation?",
    "How do I set up access certification campaigns?",
    "What are the steps to onboard a new connected system?",
    "How does Pathlock handle emergency access (firefighter IDs)?",
    "How do I create and assign control monitors?",
    "What reports are available for SOX compliance?",
    "How do I configure role risk ratings?",
    "What is the difference between a rule set and a rulebook?",
    "How do I export audit evidence for an external auditor?",
];

const WORKFLOW_QUESTIONS = [
    "Create a workflow that sends an email alert when a user gets a critical SoD violation.",
    "Build an access request approval workflow with manager and IT sign-off.",
    "Create a scheduled workflow that generates a weekly compliance summary report.",
    "Help me set up a workflow that auto-disables accounts that haven't been used in 90 days.",
    "Build a workflow to handle emergency access requests with a 4-hour auto-expiry.",
    "Create a workflow that notifies the security team when a new user is added to a sensitive role.",
    "Show me all existing workflows and their current status.",
    "Help me update an existing workflow to add an extra approval step.",
    "Build a workflow that runs a SQL check daily and creates a ticket if anomalies are found.",
    "Create a workflow triggered by a SoD violation event that starts a remediation process.",
];

const ANALYTICS_QUESTIONS = [
    "Who are the top 10 users by number of sensitive transactions in the last 30 days?",
    "Show me all after-hours access to financial transaction codes this week.",
    "Which departments have the highest rate of failed transactions?",
    "Show me users accessing from unusual IP addresses in the last 7 days.",
    "What are the slowest SAP transaction codes by average response time?",
    "Detect any users who executed sensitive tcodes on weekends this month.",
    "Which modules have the highest number of DB changes per session?",
    "Show me the trend of RFC calls per day over the last 3 months.",
    "List users with high-risk activity who also have active SoD violations.",
    "Which transaction codes are most frequently associated with high risk_level events?",
    "Show me non-human identities with abnormal activity patterns over the last month.",
    "What did SVC_BATCH_INT do on March 21st, and how does it compare to its usual batch jobs?",
    "Show the flow diagram of SVC_BATCH_INT events on March 21st.",
];

export default function WelcomeSection({ onQuestionClick, onModeChange, mode }: WelcomeSectionProps) {
    const [hoveredTile, setHoveredTile] = useState<number | null>(null);

    const exampleQuestions = [
        "Which orphaned accounts have been active within the last 120 days and pose a risk to my critical financial systems.",
        "Show my control exceptions that have expired.",
        "Show me violation trends by system and department over last six months.",
        "What is the trend in our risk posture over the last 12 months (improving or deteriorating)?",
        "Which business-critical systems pose the greatest compliance risk?",
        "What is the financial exposure from unmitigated high-risk violations?",
        "Where should we prioritize our access governance investments for maximum risk reduction?",
        "Which compliance gaps could result in material audit findings or regulatory penalties?",
        "What are the top 3 strategic priorities for improving our access governance posture?",
        "How many violations could delay critical business processes (e.g., financial close)?"
    ];

    if (mode === 'docs') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-3">
                <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Pathlock Docs Assistant</h1>
                <p className="text-base text-gray-600 max-w-2xl text-center mb-2 leading-relaxed font-medium">
                    Ask anything about how to use Pathlock
                </p>
                <p className="text-sm text-gray-500 max-w-xl text-center mb-6 leading-relaxed">
                    Get step-by-step guidance on configuration, features, and best practices — powered by the Pathlock product documentation.
                </p>
                <button onClick={() => onModeChange('grc')} className="mb-8 text-xs text-gray-400 hover:text-blue-600 transition-colors duration-200 underline underline-offset-2">
                    ← Back to GRC Assistant
                </button>
                <div className="w-full max-w-3xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">Try asking:</h3>
                    <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
                        {DOCS_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => onQuestionClick(question)}
                                onMouseEnter={() => setHoveredTile(index)}
                                onMouseLeave={() => setHoveredTile(null)}
                                className={`pathlock-card p-3 text-left transition-all duration-200 cursor-pointer group ${
                                    hoveredTile === index
                                        ? 'shadow-lg transform scale-[1.02] bg-blue-50 border border-blue-300'
                                        : 'shadow-sm hover:shadow-md border border-gray-100 hover:border-blue-200'
                                }`}
                            >
                                <div className="flex items-start space-x-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className={`w-3 h-3 transition-colors duration-200 ${
                                            hoveredTile === index ? 'text-blue-500' : 'text-blue-400'
                                        }`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium transition-colors duration-200 ${
                                        hoveredTile === index ? 'text-blue-700' : 'text-gray-700'
                                    }`}>{question}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'workflow') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-3">
                <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Workflow Builder</h1>
                <p className="text-base text-gray-600 max-w-2xl text-center mb-2 leading-relaxed font-medium">
                    Create and manage automation workflows through conversation
                </p>
                <p className="text-sm text-gray-500 max-w-xl text-center mb-6 leading-relaxed">
                    Describe what you want to automate and the assistant will help you design, build, test, and publish workflows on the Pathlock platform.
                </p>
                <button onClick={() => onModeChange('grc')} className="mb-8 text-xs text-gray-400 hover:text-orange-600 transition-colors duration-200 underline underline-offset-2">
                    ← Back to GRC Assistant
                </button>
                <div className="w-full max-w-3xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">Try asking:</h3>
                    <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
                        {WORKFLOW_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => onQuestionClick(question)}
                                onMouseEnter={() => setHoveredTile(index)}
                                onMouseLeave={() => setHoveredTile(null)}
                                className={`pathlock-card p-3 text-left transition-all duration-200 cursor-pointer group ${
                                    hoveredTile === index
                                        ? 'shadow-lg transform scale-[1.02] bg-orange-50 border border-orange-300'
                                        : 'shadow-sm hover:shadow-md border border-gray-100 hover:border-orange-200'
                                }`}
                            >
                                <div className="flex items-start space-x-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className={`w-3 h-3 transition-colors duration-200 ${
                                            hoveredTile === index ? 'text-orange-500' : 'text-orange-400'
                                        }`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium transition-colors duration-200 ${
                                        hoveredTile === index ? 'text-orange-700' : 'text-gray-700'
                                    }`}>{question}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'analytics') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-3">
                <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Analytics Assistant</h1>
                <p className="text-base text-gray-600 max-w-2xl text-center mb-2 leading-relaxed font-medium">
                    Analyze SAP activity logs and event data
                </p>
                <p className="text-sm text-gray-500 max-w-xl text-center mb-6 leading-relaxed">
                    Threat hunting, security analysis, usage patterns, and process mining — powered by your analytics data lake.
                </p>
                <button onClick={() => onModeChange('grc')} className="mb-8 text-xs text-gray-400 hover:text-purple-600 transition-colors duration-200 underline underline-offset-2">
                    ← Back to GRC Assistant
                </button>
                <div className="w-full max-w-3xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">Try asking:</h3>
                    <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
                        {ANALYTICS_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => onQuestionClick(question)}
                                onMouseEnter={() => setHoveredTile(index)}
                                onMouseLeave={() => setHoveredTile(null)}
                                className={`pathlock-card p-3 text-left transition-all duration-200 cursor-pointer group ${
                                    hoveredTile === index
                                        ? 'shadow-lg transform scale-[1.02] bg-purple-50 border border-purple-300'
                                        : 'shadow-sm hover:shadow-md border border-gray-100 hover:border-purple-200'
                                }`}
                            >
                                <div className="flex items-start space-x-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className={`w-3 h-3 transition-colors duration-200 ${
                                            hoveredTile === index ? 'text-purple-500' : 'text-purple-400'
                                        }`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium transition-colors duration-200 ${
                                        hoveredTile === index ? 'text-purple-700' : 'text-gray-700'
                                    }`}>{question}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default: GRC mode
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

            {/* Mode Switch Cards */}
            <div className="w-full max-w-3xl mb-8">
                <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">
                    Or start a focused conversation:
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Docs Mode */}
                    <button
                        onClick={() => onModeChange('docs')}
                        className="group pathlock-card p-4 text-left border-2 border-transparent hover:border-blue-400/50 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200 text-sm">
                                    Chat with your docs
                                </p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Ask how-to questions about Pathlock features, configuration, and best practices — powered by the product documentation.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Analytics Mode */}
                    <button
                        onClick={() => onModeChange('analytics')}
                        className="group pathlock-card p-4 text-left border-2 border-transparent hover:border-purple-400/50 hover:bg-purple-50/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-200 text-sm">
                                    Chat with your analytics
                                </p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Analyze SAP activity logs, detect threats, explore usage patterns, and run security investigations on your event data.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Workflow Mode */}
                    <button
                        onClick={() => onModeChange('workflow')}
                        className="group pathlock-card p-4 text-left border-2 border-transparent hover:border-orange-400/50 hover:bg-orange-50/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 group-hover:text-orange-700 transition-colors duration-200 text-sm">
                                    Build a workflow
                                </p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Design, build, and publish automation workflows through conversation — approvals, alerts, access requests, and more.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
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
