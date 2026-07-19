import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Blocks from './Blocks.jsx';
import { MathText } from './Math.jsx';

function parseCredits(c) {
  const m = /(\d+)/.exec(c || '');
  return m ? +m[1] : 0;
}

function CreditColumn({ credits }) {
  if (!credits) return <div className="creditcol" />;
  const n = Math.min(credits, 12);
  return (
    <div className="creditcol">
      {Array.from({ length: n + 1 }, (_, k) => (
        <span key={k} className="cb"><i>{k}</i><b /></span>
      ))}
    </div>
  );
}

function PrintProblem({ problem, withSolutions }) {
  const credits = parseCredits(problem.credits);
  const boxHeight = Math.min(2 + credits * 1.2, 12);
  return (
    <div className={'print-problem' + (problem.info ? ' info' : '')}>
      <CreditColumn credits={problem.info ? 0 : credits} />
      <div className="print-body">
        <h4>
          <MathText text={problem.title} />
          {!problem.info && credits > 0 && <span className="pcr"> ({credits} credit{credits !== 1 ? 's' : ''})</span>}
        </h4>
        <Blocks blocks={problem.statement} />
        {!problem.info && (withSolutions
          ? (problem.solution && (
              <div className="print-solution">
                <div className="psol-label">Solution</div>
                <Blocks blocks={problem.solution} />
              </div>
            ))
          : <div className="answerbox" style={{ height: `${boxHeight}cm` }} />
        )}
      </div>
    </div>
  );
}

export default function PrintExam({ data }) {
  const { examId } = useParams();
  const [withSolutions, setWithSolutions] = useState(false);
  const exam = data.exams.find(e => e.id === examId);
  if (!exam) return <Navigate to="/" replace />;
  const pm = exam.print || {};

  const perSection = data.sections.map(s => ({
    section: s,
    problems: s.groups.flatMap(g => g.problems).filter(p => p.exam === examId),
  }));
  const totalCredits = perSection
    .flatMap(x => x.problems)
    .reduce((a, p) => a + parseCredits(p.credits), 0);

  return (
    <div className="printwrap">
      <div className="printbar">
        <Link to={`/exam/${examId}`}>← back</Link>
        <label>
          <input type="checkbox" checked={withSolutions} onChange={e => setWithSolutions(e.target.checked)} />
          include solutions
        </label>
        <button className="printbtn" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
        <span className="printhint">In the print dialog choose “Save as PDF”, A4, default margins.</span>
      </div>

      <div className="paper">
        <div className="chair">
          Chair of Robotics, Artificial Intelligence and Real-time Systems<br />
          Department of Informatics<br />
          Technical University of Munich
        </div>

        <div className="conduct">
          <b>Compliance to the code of conduct</b><br />
          I hereby assure that I solve and submit this exam myself under my own name by only using the
          allowed tools listed below.
          <div className="sigline">Signature or full name if no pen input available</div>
        </div>

        <h1 className="examtitle">Cyber-Physical Systems</h1>
        <table className="exammeta">
          <tbody>
            <tr>
              <td><b>Exam:</b> {pm.exam}</td>
              <td><b>Date:</b> {pm.date}</td>
            </tr>
            <tr>
              <td><b>Examiner:</b> {pm.examiner}</td>
              <td><b>Time:</b> {pm.time}</td>
            </tr>
          </tbody>
        </table>

        <div className="instructions">
          <h3>Working instructions</h3>
          <ul>
            <li>This exam consists of <b>{perSection.length} problems</b> with a total of <b>{totalCredits} credits</b>{withSolutions ? ' (solutions included)' : ''}. Please make sure now that you received a complete copy of the exam.</li>
            <li>Detaching pages from the exam is prohibited.</li>
            <li>Allowed resources: the exam is open-book (lecture slides, books, your own notes), one non-programmable pocket calculator, the CPS Formula Sheet.</li>
            <li>Answers are only accepted if the solution approach is documented. Give a reason for each answer unless explicitly stated otherwise in the respective subproblem.</li>
            <li>Do not write with red or green colors.</li>
            <li>Multiple choice: +0.5 credits per correct cross, −0.5 per wrong cross; the overall credits per subproblem will not fall below 0.</li>
          </ul>
        </div>

        {perSection.map(({ section, problems }, i) => {
          const secCredits = problems.reduce((a, p) => a + parseCredits(p.credits), 0);
          return (
            <section key={section.id} className="print-section">
              <h2>
                Problem {i + 1} <span className="sectitle">{section.title.replace(/^Problem \d+ — /, '')} ({secCredits} credits)</span>
              </h2>
              {problems.map(p => (
                <PrintProblem key={p.id} problem={p} withSolutions={withSolutions} />
              ))}
            </section>
          );
        })}
        <div className="printfooter">{exam.title} — CPS Practice Exams (unofficial practice material)</div>
      </div>
    </div>
  );
}
