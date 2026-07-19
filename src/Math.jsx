import React, { useMemo } from 'react';
import katex from 'katex';

function renderTex(tex, displayMode) {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: false,
  });
}

/** Display-mode equation. */
export function MathBlock({ tex }) {
  const html = useMemo(() => renderTex(tex, true), [tex]);
  return <div className="mathblock" dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Text with inline math: pieces between $…$ are rendered with KaTeX,
 * **…** becomes bold, *…* becomes italic.
 */
export function MathText({ text }) {
  const nodes = useMemo(() => {
    const out = [];
    // split into math ($…$) and plain segments
    const parts = String(text).split(/(\$[^$]+\$)/g);
    parts.forEach((part, i) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        out.push(
          <span key={i} dangerouslySetInnerHTML={{ __html: renderTex(part.slice(1, -1), false) }} />
        );
      } else if (part) {
        // bold / italic markers in plain segments
        const sub = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        sub.forEach((s, j) => {
          if (s.startsWith('**') && s.endsWith('**')) out.push(<b key={`${i}-${j}`}>{s.slice(2, -2)}</b>);
          else if (s.startsWith('*') && s.endsWith('*')) out.push(<em key={`${i}-${j}`}>{s.slice(1, -1)}</em>);
          else if (s) out.push(<React.Fragment key={`${i}-${j}`}>{s}</React.Fragment>);
        });
      }
    });
    return out;
  }, [text]);
  return <>{nodes}</>;
}
