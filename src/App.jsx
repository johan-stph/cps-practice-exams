import React, { useEffect, useMemo, useState, createContext, useContext } from 'react';
import { Routes, Route, NavLink, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import Blocks from './Blocks.jsx';
import PrintExam from './PrintExam.jsx';
import { MathText } from './Math.jsx';
import { loadDone, saveDone, clearDone } from './progress.js';

const ExamContext = createContext(null);

const BADGE_CLASS = { 'retake-2021': 'retake', 'claude-exam-1': 'new', 'claude-exam-2': 'hard' };

function Difficulty({ value }) {
  if (!value) return null;
  const cls = value <= 4 ? 'easy' : value <= 6 ? 'mid' : 'tough';
  return (
    <span className={`difficulty ${cls}`} title={`Difficulty ${value}/10 (Claude's rating)`}>
      <span className="difflabel">difficulty</span>
      <span className="diffdots">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={'dot' + (i < value ? ' filled' : '')} />
        ))}
      </span>
      <b>{value}/10</b>
    </span>
  );
}

function problemsOf(section) {
  return section.groups.flatMap(g => g.problems);
}
function countProblems(section) {
  return problemsOf(section).filter(p => !p.info).length;
}
function countDone(section, done) {
  return problemsOf(section).filter(p => !p.info && done[p.id]).length;
}

/* ---------- problem card ---------- */

function ProblemCard({ problem, forceOpen }) {
  const { data, done, toggleDone } = useContext(ExamContext);
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen ?? open;
  const exam = data.exams.find(e => e.id === problem.exam);

  return (
    <article className={'card' + (problem.info ? ' info' : '')} id={problem.id}>
      <div className="cardtop">
        <h3><MathText text={problem.title} /></h3>
        {exam && <span className={`badge ${BADGE_CLASS[exam.id] || 'new'}`}>{exam.label}</span>}
        {problem.credits && <span className="pts">{problem.credits}</span>}
        {!problem.info && (
          <label className="done">
            <input type="checkbox" checked={!!done[problem.id]} onChange={() => toggleDone(problem.id)} />
            done
          </label>
        )}
      </div>
      <Blocks blocks={problem.statement} />
      {problem.solution && (
        <details className="sol" open={isOpen} onToggle={e => setOpen(e.currentTarget.open)}>
          <summary>Solution</summary>
          <div className="solbody"><Blocks blocks={problem.solution} /></div>
        </details>
      )}
    </article>
  );
}

function SolutionTools({ onExpand, onCollapse }) {
  return (
    <div className="sectiontools">
      <button onClick={onExpand}>Expand all solutions</button>
      <button onClick={onCollapse}>Collapse all</button>
    </div>
  );
}

/* ---------- section page (topic view) ---------- */

function SectionPage() {
  const { data, done } = useContext(ExamContext);
  const { sectionId } = useParams();
  const [allOpen, setAllOpen] = useState(null);
  const section = data.sections.find(s => s.id === sectionId);
  if (!section) return <Navigate to="/" replace />;

  return (
    <div>
      <h2 className="block">
        <MathText text={section.title} />
        <span className="blockprog">{countDone(section, done)} / {countProblems(section)} done</span>
      </h2>
      <p className="blockdesc"><MathText text={section.desc} /></p>
      <SolutionTools onExpand={() => setAllOpen(true)} onCollapse={() => setAllOpen(false)} />
      {section.groups.map((g, i) => (
        <section key={i}>
          <h3 className="subgroup">{g.title}</h3>
          {g.problems.map(p => <ProblemCard key={p.id} problem={p} forceOpen={allOpen} />)}
        </section>
      ))}
    </div>
  );
}

/* ---------- exam page (one full exam on a single page) ---------- */

function ExamPage() {
  const { data, done } = useContext(ExamContext);
  const { examId } = useParams();
  const [allOpen, setAllOpen] = useState(null);
  const exam = data.exams.find(e => e.id === examId);
  if (!exam) return <Navigate to="/" replace />;

  const perSection = data.sections.map(s => ({
    section: s,
    problems: problemsOf(s).filter(p => p.exam === examId),
  }));
  const gradable = perSection.flatMap(x => x.problems).filter(p => !p.info);
  const doneCount = gradable.filter(p => done[p.id]).length;

  return (
    <div>
      <h2 className="block">
        {exam.title}
        <span className="blockprog">{doneCount} / {gradable.length} done</span>
      </h2>
      <p className="blockdesc">{exam.meta} — all four problems on one page. <Difficulty value={exam.difficulty} /></p>
      <div className="sectiontools">
        <button onClick={() => setAllOpen(true)}>Expand all solutions</button>
        <button onClick={() => setAllOpen(false)}>Collapse all</button>
        <Link className="exportlink" to={`/print/${examId}`}>🖨 Export as PDF</Link>
      </div>
      {perSection.map(({ section, problems }) => (
        <section key={section.id}>
          <h3 className="subgroup examsec">
            <MathText text={section.title} />{' '}
            <Link className="topiclink" to={`/${section.id}`}>topic view →</Link>
          </h3>
          {problems.map(p => <ProblemCard key={p.id} problem={p} forceOpen={allOpen} />)}
        </section>
      ))}
    </div>
  );
}

/* ---------- home ---------- */

function Home() {
  const { data, done, reset } = useContext(ExamContext);
  return (
    <div>
      <div className="note">
        <b>Exam conventions:</b> open book, non-programmable calculator, CPS formula sheet allowed
        (toggle it with the “Formula sheet” button). Every answer needs a documented solution approach.
        Multiple-choice: +0.5 per correct cross, −0.5 per wrong cross, subproblem total never below 0.
      </div>
      <h3 className="subgroup">By topic</h3>
      <div className="homegrid">
        {data.sections.map(s => {
          const total = countProblems(s);
          const dc = countDone(s, done);
          return (
            <Link key={s.id} to={`/${s.id}`} className="homecard">
              <h3><MathText text={s.title} /></h3>
              <p><MathText text={s.desc} /></p>
              <div className="progress-outer"><div className="progress-inner" style={{ width: `${total ? 100 * dc / total : 0}%` }} /></div>
              <span className="homeprog">{dc} / {total} done</span>
            </Link>
          );
        })}
      </div>
      <h3 className="subgroup">Full exams (one page each)</h3>
      <div className="homegrid">
        {data.exams.map(e => {
          const probs = data.sections.flatMap(problemsOf).filter(p => p.exam === e.id && !p.info);
          const dc = probs.filter(p => done[p.id]).length;
          return (
            <Link key={e.id} to={`/exam/${e.id}`} className="homecard">
              <h3>{e.title}</h3>
              <p>{e.meta}</p>
              <p><Difficulty value={e.difficulty} /></p>
              <div className="progress-outer"><div className="progress-inner" style={{ width: `${probs.length ? 100 * dc / probs.length : 0}%` }} /></div>
              <span className="homeprog">{dc} / {probs.length} done</span>
            </Link>
          );
        })}
      </div>
      <p className="homefoot">
        Sources: IN2305 Retake exam 15 Oct 2021 (ported &amp; solved) · practice-exam style SS17 ·
        lectures L1–L13. Solutions are unofficial — verify the calculation steps yourself.{' '}
        <button className="linklike" onClick={reset}>Reset all progress</button>
      </p>
    </div>
  );
}

/* ---------- app shell ---------- */

const SHEET_KEY = 'cps-sheet-open';

export default function App() {
  const isPrint = useLocation().pathname.startsWith('/print/');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(loadDone);
  const [sheetOpen, setSheetOpen] = useState(() => localStorage.getItem(SHEET_KEY) === '1');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}questions.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch(e => setError(String(e)));
  }, []);

  useEffect(() => {
    localStorage.setItem(SHEET_KEY, sheetOpen ? '1' : '0');
  }, [sheetOpen]);

  const ctx = useMemo(() => ({
    data,
    done,
    toggleDone: id => setDone(d => { const n = { ...d, [id]: !d[id] }; saveDone(n); return n; }),
    reset: () => { if (confirm('Reset all progress?')) { clearDone(); setDone({}); } },
  }), [data, done]);

  if (error) return <div className="wrap"><p>Failed to load questions.json: {error}</p></div>;
  if (!data) return <div className="wrap"><p className="figloading">loading…</p></div>;

  const allProblems = data.sections.flatMap(problemsOf).filter(p => !p.info);
  const doneCount = allProblems.filter(p => done[p.id]).length;

  if (isPrint) {
    return (
      <Routes>
        <Route path="/print/:examId" element={<PrintExam data={data} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <ExamContext.Provider value={ctx}>
      <div className={'wrap' + (sheetOpen ? ' wide' : '')}>
        <header>
          <h1><Link to="/">CPS Practice Exams</Link></h1>
          <p className="sub">
            IN2305 Cyber-Physical Systems (Althoff) — retake exam Oct 2021 ported per section, plus
            Claude Exams 1–2 in the same style.
          </p>
        </header>
        <div className="toolbar">
          <div className="progress-outer">
            <div className="progress-inner" style={{ width: `${allProblems.length ? 100 * doneCount / allProblems.length : 0}%` }} />
          </div>
          <span className="proglabel">{doneCount} / {allProblems.length} done</span>
          <button className={'sheettoggle' + (sheetOpen ? ' on' : '')} onClick={() => setSheetOpen(o => !o)}>
            {sheetOpen ? '✕ Hide formula sheet' : '📄 Formula sheet'}
          </button>
        </div>
        <nav className="quicklinks">
          {data.sections.map((s, i) => (
            <NavLink key={s.id} to={`/${s.id}`}>{i + 1} · {s.short}</NavLink>
          ))}
          <span className="navsep" />
          {data.exams.map(e => (
            <NavLink key={e.id} to={`/exam/${e.id}`} className="examlink">{e.label}</NavLink>
          ))}
        </nav>
        <div className="layout">
          <div className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/exam/:examId" element={<ExamPage />} />
              <Route path="/:sectionId" element={<SectionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          {sheetOpen && (
            <aside className="sheet">
              <iframe title="CPS Formula Sheet" src={`${import.meta.env.BASE_URL}formula-sheet.pdf#view=FitH`} />
            </aside>
          )}
        </div>
      </div>
    </ExamContext.Provider>
  );
}
