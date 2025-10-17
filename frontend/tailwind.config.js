/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Pathlock brand colors
                'pathlock': {
                    'green': '#33CC66',
                    'green-dark': '#2BB55A',
                    'green-light': '#4DD673',
                    'dark': '#1A1D24',
                    'dark-light': '#2C2F3B',
                    'dark-lighter': '#3A3D4B',
                },
                // Additional accent colors from Pathlock UI
                'accent': {
                    'purple': '#8B5CF6',
                    'orange': '#F59E0B',
                    'blue': '#3B82F6',
                }
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.6rem', { lineHeight: '0.8rem' }],
                'sm': ['0.7rem', { lineHeight: '1rem' }],
                'base': ['0.8rem', { lineHeight: '1.2rem' }],
                'lg': ['0.9rem', { lineHeight: '1.4rem' }],
                'xl': ['1rem', { lineHeight: '1.4rem' }],
                '2xl': ['1.2rem', { lineHeight: '1.6rem' }],
                '3xl': ['1.5rem', { lineHeight: '1.8rem' }],
                '4xl': ['1.8rem', { lineHeight: '2rem' }],
                '5xl': ['2.4rem', { lineHeight: '1' }],
                '6xl': ['3rem', { lineHeight: '1' }],
            },
            spacing: {
                '18': '3.6rem',
                '88': '17.6rem',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'pathlock': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'pathlock-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
