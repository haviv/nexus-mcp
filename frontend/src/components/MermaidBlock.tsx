import { useEffect, useRef, useState } from 'react';import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#e5e7eb',
        lineColor: '#6b7280',
        secondaryColor: '#06b6d4',
        tertiaryColor: '#f3f4f6',
    },
    securityLevel: 'loose',
});

let idCounter = 0;

interface Props {
    chart: string;
}

export default function MermaidBlock({ chart }: Props) {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [zoomed, setZoomed] = useState(false);
    const id = useRef(`mermaid-${++idCounter}`);

    useEffect(() => {
        let cancelled = false;
        const render = async () => {
            try {
                const { svg } = await mermaid.render(id.current, chart.trim());
                if (!cancelled) setSvg(svg);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? 'Diagram error');
            }
        };
        render();
        return () => { cancelled = true; };
    }, [chart]);

    if (error) {
        return (
            <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
                <strong>Diagram error:</strong> {error}
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="my-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-400 animate-pulse">
                Rendering diagram…
            </div>
        );
    }

    return (
        <>
            {/* Inline diagram with zoom button */}
            <div className="relative my-4 rounded-xl border border-gray-200 bg-white p-4 group">
                <div
                    className="overflow-auto cursor-zoom-in"
                    onClick={() => setZoomed(true)}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
                <button
                    onClick={() => setZoomed(true)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 hover:text-gray-800 hover:border-gray-400 shadow-sm flex items-center gap-1"
                    title="Zoom in"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zm3-8H8m5-3v6" />
                    </svg>
                    Zoom
                </button>
            </div>

            {/* Full-screen modal */}
            {zoomed && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
                    onClick={() => setZoomed(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-[92vw] max-h-[90vh] overflow-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setZoomed(false)}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10"
                            title="Close (Esc)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div
                            className="[&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[80vw]"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
