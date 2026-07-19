import React, { useState } from 'react';
import { MathText, MathBlock } from './Math.jsx';
import Figure from './Figure.jsx';

/* Interactive multiple choice: click an option, get instant feedback. */
function MCQuestion({ prompt, options, correct, flat }) {
  const [picked, setPicked] = useState(null);
  if (flat || correct == null) {
    return (
      <div className="mcblock">
        <p className="subq"><MathText text={prompt} /></p>
        <ul className="mc">
          {options.map((o, j) => <li key={j}><MathText text={o} /></li>)}
        </ul>
      </div>
    );
  }
  return (
    <div className="mcq">
      <p className="subq"><MathText text={prompt} /></p>
      <div className="mcopts">
        {options.map((o, i) => {
          let cls = 'mcopt';
          if (picked !== null) {
            if (i === correct) cls += ' right';
            else if (i === picked) cls += ' wrong';
          }
          return (
            <button key={i} type="button" className={cls} onClick={() => setPicked(i)}>
              <span className="radio" /><MathText text={o} />
            </button>
          );
        })}
      </div>
      {picked !== null && (picked === correct
        ? <p className="mcfb ok">✓ correct</p>
        : <p className="mcfb no">✗ not quite — the green option is the right one (see the solution for why)</p>)}
    </div>
  );
}

/* Interactive True/False (or Yes/No, Valid/Invalid) list with a running score. */
function TFBlock({ items, labels = ['True', 'False'], flat }) {
  const [picks, setPicks] = useState({});
  if (flat) {
    return (
      <div className="scroll">
        <table className="plain tfprint">
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td className="tfq"><MathText text={it.text} /></td>
                <td className="tfa">☐ {labels[0]} &nbsp;&nbsp; ☐ {labels[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const answered = Object.keys(picks).length;
  const right = items.filter((it, i) => picks[i] === it.answer).length;
  return (
    <div className="tflist">
      {items.map((it, i) => {
        const picked = picks[i];
        return (
          <div key={i} className="tfrow">
            <span className="tftext"><MathText text={it.text} /></span>
            <span className="tfbtns">
              {[true, false].map(v => {
                let cls = 'tfbtn';
                if (picked !== undefined) {
                  if (v === it.answer) cls += ' right';
                  else if (v === picked) cls += ' wrong';
                }
                return (
                  <button key={String(v)} type="button" className={cls}
                          onClick={() => setPicks(p => ({ ...p, [i]: v }))}>
                    {v ? labels[0] : labels[1]}
                  </button>
                );
              })}
            </span>
          </div>
        );
      })}
      {answered > 0 && <p className="tfscore">{right} / {items.length} correct{answered < items.length ? ` · ${items.length - answered} to go` : ''}</p>}
    </div>
  );
}

/** Renders the block list used in questions.json statements/solutions. */
export default function Blocks({ blocks, flat = false }) {
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
            return <MCQuestion key={i} prompt={b.prompt} options={b.options} correct={b.correct} flat={flat} />;
          case 'tf':
            return <TFBlock key={i} items={b.items} labels={b.labels} flat={flat} />;
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
