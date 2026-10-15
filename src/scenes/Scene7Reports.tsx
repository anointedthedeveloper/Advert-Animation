import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {KText} from '../components/KText';
import {Crest, Chip} from '../components/ui';
import {Check, File} from '../components/Icons';
import {C, FONT} from '../theme';
import {ease, lerp, prog} from '../util';
import {Problem, Strength, Explainer} from '../components/Caption';

const CARD_W = 470;
const CARD_H = 640;

const SUBJECTS = ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
const STUDENTS = [
  {name: 'Daniel Ade', id: 'GA-2026-014', scores: [78, 86, 81, 74, 83]},
  {name: 'Amaka Obi', id: 'GA-2026-021', scores: [82, 71, 76, 80, 88]},
  {name: 'Tunde Bello', id: 'GA-2026-032', scores: [69, 90, 84, 77, 72]},
  {name: 'Zainab Musa', id: 'GA-2026-045', scores: [88, 79, 73, 85, 81]},
  {name: 'Chidi Okeke', id: 'GA-2026-058', scores: [75, 83, 79, 70, 86]},
];

const ReportCard: React.FC<{i: number}> = ({i}) => {
  const s = STUDENTS[i];
  const total = s.scores.reduce((a, b) => a + b, 0);
  return (
    <div style={{width: CARD_W, height: CARD_H, background: '#fff', borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.42)', fontFamily: FONT, overflow: 'hidden', position: 'relative'}}>
      <div style={{height: 104, background: C.dark, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 16, color: '#fff'}}>
        <Crest size={58} />
        <div>
          <div style={{fontSize: 24, fontWeight: 900, letterSpacing: '-0.01em'}}>Greenfield Academy</div>
          <div style={{fontSize: 14, fontWeight: 700, color: C.mint, letterSpacing: '0.16em'}}>STUDENT REPORT CARD</div>
        </div>
      </div>
      <div style={{padding: '22px 28px 0'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <div style={{fontSize: 13, fontWeight: 700, color: C.slate, letterSpacing: '0.08em'}}>STUDENT</div>
            <div style={{fontSize: 27, fontWeight: 900, color: C.ink}}>{s.name}</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 13, fontWeight: 700, color: C.slate, letterSpacing: '0.08em'}}>STUDENT ID</div>
            <div style={{fontSize: 19, fontWeight: 800, color: C.ink, marginTop: 6}}>{s.id}</div>
          </div>
        </div>
        <div style={{marginTop: 6, fontSize: 15, fontWeight: 600, color: C.slate}}>Class: SS 2 Science · 2026/2027 Session</div>
        <div style={{marginTop: 18, borderRadius: 10, border: `1px solid ${C.line}`, overflow: 'hidden'}}>
          <div style={{display: 'flex', background: '#F1F5F9', padding: '9px 16px', fontSize: 13, fontWeight: 800, color: C.slate, letterSpacing: '0.06em'}}>
            <span style={{flex: 1}}>SUBJECT</span>
            <span>SCORE / 100</span>
          </div>
          {SUBJECTS.map((sub, k) => (
            <div key={sub} style={{display: 'flex', padding: '10px 16px', fontSize: 18, fontWeight: 600, color: C.ink, borderTop: `1px solid ${C.line}`}}>
              <span style={{flex: 1}}>{sub}</span>
              <span style={{fontWeight: 800, color: s.scores[k] >= 80 ? '#15803D' : C.ink}}>{s.scores[k]}</span>
            </div>
          ))}
          <div style={{display: 'flex', padding: '12px 16px', fontSize: 19, fontWeight: 900, color: C.dark, background: '#ECFDF5', borderTop: `1px solid ${C.line}`}}>
            <span style={{flex: 1}}>Total</span>
            <span>{total} / 500</span>
          </div>
        </div>
        <div style={{marginTop: 16, fontSize: 15, fontWeight: 600, color: C.slate}}>Average: {(total / 5).toFixed(1)}%</div>
      </div>
      <div style={{position: 'absolute', left: 28, right: 28, bottom: 24, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: C.slate}}>
        <span style={{borderTop: `1.5px solid ${C.slate}`, paddingTop: 6, width: 170}}>Class teacher</span>
        <span style={{borderTop: `1.5px solid ${C.slate}`, paddingTop: 6, width: 170, textAlign: 'right'}}>Principal</span>
      </div>
    </div>
  );
};

const SHEET_ROWS = [
  ['Daniel Ade', 78, 86, 81, 74, 83],
  ['Amaka Obi', 82, 71, 76, 80, 88],
  ['Tunde Bello', 69, 90, 84, 77, 72],
  ['Zainab Musa', 88, 79, 73, 85, 81],
  ['Chidi Okeke', 75, 83, 79, 70, 86],
  ['Ngozi Eze', 80, 77, 85, 72, 79],
  ['Samuel Ojo', 71, 74, 68, 78, 75],
] as const;

const Broadsheet: React.FC<{f: number}> = ({f}) => {
  const cols = ['Student', 'Eng', 'Maths', 'Phy', 'Chem', 'Bio', 'Total'];
  return (
    <div style={{width: 860, borderRadius: 18, background: '#fff', overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.5)', fontFamily: FONT}}>
      <div style={{height: 62, background: '#15803D', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', color: '#fff'}}>
        <File size={28} stroke={2} />
        <span style={{fontWeight: 800, fontSize: 24}}>Class_Broadsheet.xlsx</span>
        <div style={{flex: 1}} />
        <Chip bg="rgba(255,255,255,0.18)" fg="#fff" size={15}>SS 2 Science · 2026/2027</Chip>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2.2fr repeat(5, 1fr) 1.2fr', background: '#E8F5EC', borderBottom: '2px solid #15803D'}}>
        {cols.map((c, i) => (
          <div key={c} style={{padding: '13px 16px', fontWeight: 900, fontSize: 18, color: C.dark, textAlign: i === 0 ? 'left' : 'center', borderRight: '1px solid #CFE8D6'}}>
            {c}
          </div>
        ))}
      </div>
      {SHEET_ROWS.map((r, ri) => {
        const total = (r[1] as number) + (r[2] as number) + (r[3] as number) + (r[4] as number) + (r[5] as number);
        return (
          <div key={ri} style={{display: 'grid', gridTemplateColumns: '2.2fr repeat(5, 1fr) 1.2fr', background: ri % 2 ? '#F8FAFC' : '#fff', borderBottom: `1px solid ${C.line}`}}>
            {[...r, total].map((cell, ci) => {
              const p = prog(f, 4 + ri * 3 + ci * 1.2, 6);
              return (
                <div key={ci} style={{padding: '13px 16px', fontSize: 19, fontWeight: ci === 0 ? 700 : ci === 6 ? 900 : 600, color: ci === 6 ? '#15803D' : C.ink, textAlign: ci === 0 ? 'left' : 'center', borderRight: `1px solid ${C.line}`, opacity: p, fontVariantNumeric: 'tabular-nums'}}>
                  {cell}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const ZipIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 200 220">
    <path d="M30 10h100l50 50v140a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10V20a10 10 0 0 1 10-10z" fill="#F1F5F9" />
    <path d="M130 10l50 50h-40a10 10 0 0 1-10-10z" fill="#CBD5E1" />
    <rect x="20" y="86" width="160" height="104" rx="12" fill={C.primary} />
    <rect x="88" y="10" width="24" height="12" fill="#064E3B" />
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <rect key={k} x={88 + (k % 2 ? 12 : 0)} y={26 + k * 12} width="12" height="8" fill="#064E3B" />
    ))}
    <rect x="86" y="108" width="28" height="36" rx="8" fill="#fff" />
    <text x="100" y="178" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="30" fill="#fff">
      ZIP
    </text>
  </svg>
);

/** Local frame 0 = global frame 660 (22.0 s). Ends at global 846 (28.2 s) under the final wipe. */
export const Scene7Reports: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 12, ease.out);
  const sec = 4; // seconds-based timeline below is in scene-local frames

  const ZIP = {x: 800, y: 600};
  const CARDS_C = {x: 1230, y: 560};

  // card timeline: card k appears at 8 + 9k
  const cards = STUDENTS.map((_, k) => {
    const appear = prog(f, 8 + k * 9, 14, ease.out);
    const gather = prog(f, 62 + k * 2.5, 18, ease.inOut);
    // fan position while waiting (earlier cards slide left/up a little as new ones arrive)
    const newer = Math.max(0, Math.min(STUDENTS.length - 1, Math.floor((f - 8) / 9)) - k);
    const fan = Math.min(newer, 4);
    const fx = CARDS_C.x - fan * 46;
    const fy = CARDS_C.y - fan * 20;
    const fr = -fan * 3.2;
    const x = lerp(fx + (1 - appear) * 380, ZIP.x, gather);
    const y = lerp(fy + (1 - appear) * 120, ZIP.y, gather);
    const sc = lerp(0.88 + appear * 0.12, 0.16, gather);
    const op = (appear > 0 ? 1 : 0) * (1 - prog(f, 62 + k * 2.5 + 14, 6));
    return {x, y, sc, rot: fr * (1 - gather), op};
  });

  const zip = prog(f, 78, 14, ease.back);
  const sheet = prog(f, 98, 20, ease.out);
  const zipMove = prog(f, 96, 20, ease.inOut);
  const cap1Out = f >= 90;
  const sheetF = f - 100;
  const zx = lerp(ZIP.x, 330, zipMove);
  const zy = lerp(ZIP.y, 840, zipMove);
  const out = prog(f, 160, 14, ease.in);

  return (
    <AbsoluteFill style={{opacity: (1 - out) * inP}}>
      <div style={{position: 'absolute', left: 100, top: 214}}>
        <Problem text="Reports compiled by hand" at={2} fixAt={36} size={28} />
      </div>
      <div style={{position: 'absolute', left: 100, top: cap1Out ? 560 : 640}}>
        {!cap1Out ? (
          <Explainer text="PDF report cards with your school logo, ready for the whole class." at={30} width={700} />
        ) : (
          <Explainer text="Class broadsheets and results export straight to Excel." at={100} width={700} />
        )}
      </div>
      {!cap1Out && (
        <div style={{position: 'absolute', left: 100, top: 292}}>
          <KText size={70} start={4} stagger={4} exitAt={80} lines={[[{t: 'Branded'}, {t: 'report'}], [{t: 'cards', color: C.mint}, {t: 'for', color: C.mint}], [{t: 'the', color: C.mint}, {t: 'whole', color: C.mint}], [{t: 'class', color: C.mint}]]} lineHeight={1.08} />
        </div>
      )}
      {cap1Out && (
        <div style={{position: 'absolute', left: 100, top: 330}}>
          <KText size={96} start={92} stagger={5} lines={[[{t: 'Export'}], [{t: 'to', color: C.mint}, {t: 'Excel', color: C.mint}]]} />
        </div>
      )}

      {/* report cards */}
      {cards.map((c, k) => {
        if (c.op <= 0.01) return null;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: c.x - CARD_W / 2,
              top: c.y - CARD_H / 2,
              opacity: c.op,
              transform: `rotate(${c.rot}deg) scale(${c.sc})`,
              zIndex: k,
            }}
          >
            <ReportCard i={k} />
          </div>
        );
      })}

      {/* zip archive */}
      {zip > 0 && (
        <div style={{position: 'absolute', left: zx - 110, top: zy - 150, transform: `scale(${(0.6 + 0.4 * zip) * (1 - zipMove * 0.15)})`, opacity: Math.min(1, zip * 2), textAlign: 'center', fontFamily: FONT}}>
          <ZipIcon size={220} />
          <div style={{marginTop: 8, display: 'inline-flex'}}>
            <Chip bg="rgba(167,243,208,0.14)" fg={C.mint} size={20} style={{border: '1px solid rgba(167,243,208,0.4)'}}>
              Greenfield_Report_Cards.zip
            </Chip>
          </div>
        </div>
      )}

      {/* broadsheet */}
      {sheet > 0 && (
        <div style={{position: 'absolute', left: 940, top: 290, opacity: sheet, transform: `translateX(${(1 - sheet) * 260}px)`}}>
          <Broadsheet f={sheetF} />
        </div>
      )}
    </AbsoluteFill>
  );
};
