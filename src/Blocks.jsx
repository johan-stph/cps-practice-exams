import React from 'react';
import { MathText, MathBlock } from './Math.jsx';
import Figure from './Figure.jsx';

/** Renders the block list used in questions.json statements/solutions. */
export default function Blocks({ blocks }) {
  if (!blocks) return null;
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return <p key={i}><MathText text={b.text} /></p>;
          case 'math':
            return <MathBlock key={i} tex={b.tex} />;
          case 'fig':
            return <Figure key={i} src={b.src} caption={b.caption} width={b.width} />;
          case 'ul':
            return <ul key={i}>{b.items.map((it, j) => <li key={j}><MathText text={it} /></li>)}</ul>;
          case 'ol':
            return <ol key={i}>{b.items.map((it, j) => <li key={j}><MathText text={it} /></li>)}</ol>;
          case 'subq':
            return <p key={i} className="subq"><MathText text={b.text} /></p>;
          case 'mc':
            return (
              <div key={i} className="mcblock">
                <p className="subq"><MathText text={b.prompt} /></p>
                <ul className="mc">
                  {b.options.map((o, j) => <li key={j}><MathText text={o} /></li>)}
                </ul>
              </div>
            );
          case 'table':
            return (
              <div key={i} className="scroll">
                <table className="plain">
                  {b.head && <thead><tr>{b.head.map((h, j) => <th key={j}><MathText text={h} /></th>)}</tr></thead>}
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j}>{row.map((c, k) => <td key={k}><MathText text={c} /></td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
