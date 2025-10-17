import logoImage from '../assets/logo.png';

interface PathlockLogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function PathlockLogo({ size = 'md', showText = true, className = '' }: PathlockLogoProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const textSizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl'
    };

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* Pathlock Logo Image */}
            <div className={`${sizeClasses[size]} relative`}>
                <img
                    src={logoImage}
                    alt="Pathlock Logo"
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Text */}
            {showText && (
                <div className="flex flex-col">
                    <span className={`font-semibold text-white ${textSizeClasses[size]}`}>
                        Pathlock IQ
                    </span>
                    {size === 'lg' && (
                        <span className="text-sm text-gray-300">
                            Chat with Your Data - Powered by Pathlock AI
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
