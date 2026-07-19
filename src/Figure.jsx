import React, { useEffect, useState } from 'react';
import { MathText } from './Math.jsx';

const cache = new Map();

/**
 * Loads an SVG from public/images/ and inlines it so that
 * `currentColor` strokes follow the page theme.
 */
export default function Figure({ src, caption, width }) {
  const url = `${import.meta.env.BASE_URL}images/${src}`;
  const [svg, setSvg] = useState(cache.get(url) || null);

  useEffect(() => {
    if (cache.has(url)) { setSvg(cache.get(url)); return; }
    let alive = true;
    fetch(url)
      .then(r => (r.ok ? r.text() : Promise.reject(new Error(`${r.status}`))))
      .then(text => { cache.set(url, text); if (alive) setSvg(text); })
      .catch(() => alive && setSvg(null));
    return () => { alive = false; };
  }, [url]);

  return (
    <figure className="fig">
      {svg
        ? <div className="figsvg" style={width ? { maxWidth: width } : undefined}
               dangerouslySetInnerHTML={{ __html: svg }} />
        : <div className="figsvg figloading">loading figure…</div>}
      {caption && <figcaption><MathText text={caption} /></figcaption>}
    </figure>
  );
}
