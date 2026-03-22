import { Streamdown } from 'streamdown';
import MermaidBlock from './MermaidBlock';

interface Props {
    content: string;
    mermaidConfig: object;
}

/** Splits markdown content into alternating text / mermaid segments and renders each. */
export default function MessageContent({ content, mermaidConfig }: Props) {
    const segments = splitMermaid(content);

    return (
        <>
            {segments.map((seg, i) =>
                seg.type === 'mermaid' ? (
                    <MermaidBlock key={i} chart={seg.text} />
                ) : seg.text.trim() ? (
                    <Streamdown
                        key={i}
                        mermaidConfig={mermaidConfig}
                        className="streamdown-container prose prose-sm max-w-none"
                        shikiTheme={['github-light', 'github-dark']}
                        controls={{ table: true, code: true, mermaid: false }}
                        parseIncompleteMarkdown={true}
                    >
                        {seg.text}
                    </Streamdown>
                ) : null
            )}
        </>
    );
}

interface Segment {
    type: 'text' | 'mermaid';
    text: string;
}

function splitMermaid(content: string): Segment[] {
    const segments: Segment[] = [];
    // Match ```mermaid ... ``` blocks (non-greedy)
    const regex = /```mermaid\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: 'text', text: content.slice(lastIndex, match.index) });
        }
        segments.push({ type: 'mermaid', text: match[1] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        segments.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return segments.length > 0 ? segments : [{ type: 'text', text: content }];
}
