// fcc-ds-seating.jsx — Saalplan-Editor (Veranstaltungsplaner · Aufgabe Saalplanung).
// Mobile-first drag&drop hall planner (pointer events → touch + mouse).
// PRIMARY OBJECT = Tischreihe (banquet row): N×80cm tables butted into one long
// table, chairs along the long sides, moved/rotated/resized AS ONE batch.
// Single table = Reihe of length 1. Two modes: "Tische planen" / "Saal einrichten".
// 10cm snap, meter ruler, live Kapazität-HUD, Tischreihen-Block helper, Vorlage.
// Composes system shell + tokens. Exports window.TaskSaalplan (+ SeatingEditor alias).

(function () {
  const { T, Ic, Card, Chip, Btn, Title } = window;
  const { useState, useRef, useEffect } = React;

  const TARGET = 350;
  const UNIT = 80;            // one table = 80×80cm
  const CH = 30, CGAP = 7;    // chair size / offset
  const snap = (v) => Math.round(v / 10) * 10;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const HALL0 = { w: 2200, h: 1500 };
  // footprint of a row in cm
  const fp = (r) => r.dir === 'h' ? { w: r.len * UNIT, h: UNIT } : { w: UNIT, h: r.len * UNIT };
  const seatsOf = (r) => r.len * 4 + (r.ends ? 2 : 0);

  // initial layout — two banks of long tables flanking a central Gang (per sketch)
  function genRows() {
    const out = []; let n = 1;
    const ys = [380, 568, 756, 944, 1132];
    ys.forEach((y) => {
      out.push({ id: 'r' + n, x: 180, y, len: 8, dir: 'h', ends: false, num: n++ });
      out.push({ id: 'r' + n, x: 1320, y, len: 8, dir: 'h', ends: false, num: n++ });
    });
    return out;
  }
  const OBST0 = [
    { id: 'o1', type: 'buehne', x: 700, y: 40, w: 800, h: 180 },
    { id: 'o2', type: 'bar', x: 56, y: 360, w: 66, h: 240, label: 'BAR 2' },
    { id: 'o3', type: 'bar', x: 56, y: 820, w: 66, h: 240, label: 'BAR 1' },
    { id: 'o4', type: 'eingang', x: 850, y: 1380, w: 360, h: 84 },
  ];
  const OB = {
    buehne: { label: 'BÜHNE', fill: T.ink, fg: '#fff', solid: true },
    bar: { label: 'BAR', fill: '#9a7200', fg: '#fff', solid: true },
    eingang: { label: 'EINGANG', fill: T.green, fg: '#fff', solid: true },
    saeule: { label: '', fill: 'rgba(26,20,17,0.55)', fg: '#fff', solid: true },
    fluchtweg: { label: 'FLUCHT', fill: T.red, fg: '#fff', hatch: true },
  };

  function BackBtn({ children, onClick }) {
    return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub, padding: 0 }}><span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span>{children}</button>;
  }
  const stepBtn = { width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.display, fontSize: 18, color: T.ink, cursor: 'pointer', lineHeight: 1 };
  function Stepper({ value, set, min = 1, max = 16, suffix }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <button onClick={() => set(clamp(value - 1, min, max))} style={stepBtn}>–</button>
        <span style={{ fontFamily: T.display, fontSize: 18, minWidth: suffix ? 50 : 26, textAlign: 'center' }}>{value}{suffix || ''}</span>
        <button onClick={() => set(clamp(value + 1, min, max))} style={stepBtn}>+</button>
      </div>
    );
  }
  function Seg({ children }) {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}><span style={{ width: 10, height: 10, background: T.red, flexShrink: 0 }} /><span style={{ fontFamily: T.display, fontSize: 15, letterSpacing: 0.4 }}>{children}</span><div style={{ flex: 1, height: 2, background: T.line }} /></div>;
  }

  function Editor({ mobile, onBack }) {
    const canvasW = mobile ? 358 : 760;
    const [hall, setHall] = useState(HALL0);
    const [rows, setRows] = useState(genRows);
    const [obst, setObst] = useState(OBST0);
    const [mode, setMode] = useState('tische');
    const [sel, setSel] = useState(null);
    const [addLen, setAddLen] = useState(8), [addDir, setAddDir] = useState('h');
    const [bRows, setBRows] = useState(5), [bLen, setBLen] = useState(8), [bGap, setBGap] = useState(50);
    const scale = canvasW / hall.w;
    const scaleRef = useRef(scale); useEffect(() => { scaleRef.current = scale; });
    const hallPx = hall.h * scale;
    const drag = useRef(null);
    const px = (cm) => cm * scale;
    const seats = rows.reduce((a, r) => a + seatsOf(r), 0);
    const nextNum = () => rows.reduce((m, r) => Math.max(m, r.num), 0) + 1;

    function down(e, id, kind) {
      e.stopPropagation();
      if (kind === 'row' && mode !== 'tische') return;
      if (kind === 'obst' && mode !== 'saal') return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { }
      const it = (kind === 'row' ? rows : obst).find((o) => o.id === id);
      drag.current = { id, kind, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, moved: false };
      setSel({ id, kind });
    }
    function move(e) {
      const d = drag.current; if (!d) return;
      const dx = (e.clientX - d.sx) / scaleRef.current, dy = (e.clientY - d.sy) / scaleRef.current;
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
      const set = d.kind === 'row' ? setRows : setObst;
      set((arr) => arr.map((o) => {
        if (o.id !== d.id) return o;
        const f = d.kind === 'row' ? fp(o) : o;
        return { ...o, x: clamp(snap(d.ox + dx), 0, hall.w - f.w), y: clamp(snap(d.oy + dy), 0, hall.h - f.h) };
      }));
    }
    function up() { drag.current = null; }

    const addRow = () => { const r = { id: 'r' + Date.now(), x: snap(hall.w / 2 - (addDir === 'h' ? addLen * UNIT / 2 : UNIT / 2)), y: snap(hall.h / 2 - (addDir === 'v' ? addLen * UNIT / 2 : UNIT / 2)), len: addLen, dir: addDir, ends: false, num: nextNum() }; const f = fp(r); r.x = clamp(r.x, 0, hall.w - f.w); r.y = clamp(r.y, 0, hall.h - f.h); setRows((a) => [...a, r]); setSel({ id: r.id, kind: 'row' }); };
    const addBlock = () => {
      let n = nextNum() - 1; const add = [];
      const stepY = UNIT + 2 * (CH + CGAP) + bGap;
      for (let i = 0; i < bRows; i++) { n += 1; add.push({ id: 'b' + Date.now() + '_' + i, x: 180, y: clamp(snap(380 + i * stepY), 0, hall.h - UNIT), len: bLen, dir: 'h', ends: false, num: n }); }
      setRows((a) => [...a, ...add]);
    };
    const updSel = (patch) => setRows((a) => a.map((r) => r.id === sel.id ? { ...r, ...patch } : r));
    const rotate = () => setRows((a) => a.map((r) => { if (r.id !== sel.id) return r; const nd = r.dir === 'h' ? 'v' : 'h'; const nr = { ...r, dir: nd }; const f = fp(nr); nr.x = clamp(r.x, 0, hall.w - f.w); nr.y = clamp(r.y, 0, hall.h - f.h); return nr; }));
    const delSel = () => { if (!sel) return; (sel.kind === 'row' ? setRows : setObst)((a) => a.filter((o) => o.id !== sel.id)); setSel(null); };
    const addObst = (type) => { const it = { id: 'o' + Date.now(), type, x: snap(hall.w / 2 - 100), y: snap(hall.h / 2 - 40), w: type === 'saeule' ? 54 : 260, h: type === 'saeule' ? 54 : 100 }; setObst((a) => [...a, it]); setSel({ id: it.id, kind: 'obst' }); };
    const rotObst = () => setObst((a) => a.map((o) => o.id === sel.id ? { ...o, w: o.h, h: o.w } : o));
    const setHallDim = (k, d) => setHall((h) => ({ ...h, [k]: clamp(h[k] + d, 800, 4000) }));
    const selObj = sel ? (sel.kind === 'row' ? rows : obst).find((o) => o.id === sel.id) : null;

    // chairs for a row
    const chairs = (r) => {
      const els = []; const mk = (k, l, t, w, h) => els.push(<div key={k} style={{ position: 'absolute', left: px(l), top: px(t), width: px(w), height: px(h), background: T.sub, opacity: 0.5, borderRadius: 4 }} />);
      const cw = 28, pad = (UNIT - 2 * cw) / 3; // 2 chairs per unit on a long side
      if (r.dir === 'h') {
        for (let i = 0; i < r.len; i++) { const bx = r.x + i * UNIT; mk('t' + i + 'a', bx + pad, r.y - CH - CGAP, cw, CH); mk('t' + i + 'b', bx + 2 * pad + cw, r.y - CH - CGAP, cw, CH); mk('u' + i + 'a', bx + pad, r.y + UNIT + CGAP, cw, CH); mk('u' + i + 'b', bx + 2 * pad + cw, r.y + UNIT + CGAP, cw, CH); }
        if (r.ends) { mk('eL', r.x - CH - CGAP, r.y + (UNIT - cw) / 2, CH, cw); mk('eR', r.x + r.len * UNIT + CGAP, r.y + (UNIT - cw) / 2, CH, cw); }
      } else {
        for (let i = 0; i < r.len; i++) { const by = r.y + i * UNIT; mk('l' + i + 'a', r.x - CH - CGAP, by + pad, CH, cw); mk('l' + i + 'b', r.x - CH - CGAP, by + 2 * pad + cw, CH, cw); mk('r' + i + 'a', r.x + UNIT + CGAP, by + pad, CH, cw); mk('r' + i + 'b', r.x + UNIT + CGAP, by + 2 * pad + cw, CH, cw); }
        if (r.ends) { mk('eT', r.x + (UNIT - cw) / 2, r.y - CH - CGAP, cw, CH); mk('eB', r.x + (UNIT - cw) / 2, r.y + r.len * UNIT + CGAP, cw, CH); }
      }
      return els;
    };

    const gridStep = px(100);
    const ruler = (n, horiz) => Array.from({ length: Math.floor((horiz ? hall.w : hall.h) / 200) + 1 }).map((_, i) => (
      <div key={i} style={{ position: 'absolute', [horiz ? 'left' : 'top']: px(i * 200) + (horiz ? 18 : -4), fontSize: 8.5, fontWeight: 800, color: T.faint }}>{i * 2}{horiz ? 'm' : ''}</div>
    ));

    const canvas = (
      <div>
        <div style={{ height: 14, position: 'relative', marginLeft: 18 }}>{ruler(0, true)}</div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 18, position: 'relative' }}>{ruler(0, false)}</div>
          <div onPointerMove={move} onPointerUp={up} onPointerDown={() => setSel(null)}
            style={{ position: 'relative', width: canvasW, height: hallPx, background: T.panel, border: `2.5px solid ${T.ink}`, borderRadius: 6, overflow: 'hidden', touchAction: 'none', userSelect: 'none', boxShadow: T.shadow, backgroundImage: `linear-gradient(${T.line2} 1px, transparent 1px), linear-gradient(90deg, ${T.line2} 1px, transparent 1px)`, backgroundSize: `${gridStep}px ${gridStep}px` }}>
            {obst.map((o) => { const c = OB[o.type]; const s = sel && sel.id === o.id; return (
              <div key={o.id} onPointerDown={(e) => down(e, o.id, 'obst')} onPointerMove={move} onPointerUp={up}
                style={{ position: 'absolute', left: px(o.x), top: px(o.y), width: px(o.w), height: px(o.h), background: c.hatch ? `repeating-linear-gradient(45deg, ${c.fill}, ${c.fill} 5px, ${c.fill}99 5px, ${c.fill}99 10px)` : c.fill, color: c.fg, borderRadius: o.type === 'saeule' ? '50%' : 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.display, fontSize: Math.max(8, px(Math.min(o.w, o.h)) * 0.34), letterSpacing: 1, cursor: mode === 'saal' ? 'grab' : 'default', outline: s ? `2.5px solid ${T.red}` : 'none', outlineOffset: 2, touchAction: 'none' }}>{o.label || c.label}</div>
            ); })}
            {rows.map((r) => <React.Fragment key={'c' + r.id}>{chairs(r)}</React.Fragment>)}
            {rows.map((r) => { const f = fp(r); const s = sel && sel.id === r.id; const divs = []; for (let i = 1; i < r.len; i++) divs.push(<div key={i} style={{ position: 'absolute', background: s ? 'rgba(255,255,255,0.45)' : 'rgba(26,20,17,0.16)', ...(r.dir === 'h' ? { left: px(i * UNIT), top: 0, bottom: 0, width: 1 } : { top: px(i * UNIT), left: 0, right: 0, height: 1 }) }} />); return (
              <div key={r.id} onPointerDown={(e) => down(e, r.id, 'row')} onPointerMove={move} onPointerUp={up}
                style={{ position: 'absolute', left: px(r.x), top: px(r.y), width: px(f.w), height: px(f.h), background: s ? T.red : T.cream, border: `1.5px solid ${s ? T.red : T.ink}`, borderRadius: 5, cursor: mode === 'tische' ? 'grab' : 'default', touchAction: 'none', boxShadow: s ? `0 0 0 3px ${T.red}33` : T.shadow, zIndex: s ? 3 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {divs}
                <span style={{ position: 'relative', fontFamily: T.display, fontSize: Math.max(8, px(UNIT) * 0.42), color: s ? '#fff' : T.ink }}>{r.num}</span>
              </div>
            ); })}
          </div>
        </div>
      </div>
    );

    const hud = (
      <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: '16px 18px', boxShadow: `6px 6px 0 ${T.red}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: T.display, fontSize: 40, color: seats >= TARGET ? '#7BE0A6' : '#fff', lineHeight: 1 }}>{seats}</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'rgba(251,244,230,0.75)' }}>/ {TARGET} Plätze</span>
        </div>
        <div style={{ margin: '11px 0 9px', height: 8, borderRadius: 5, background: 'rgba(251,244,230,0.18)', overflow: 'hidden' }}><div style={{ width: clamp(seats / TARGET * 100, 0, 100) + '%', height: '100%', background: seats >= TARGET ? '#2E9E5B' : T.red, borderRadius: 5 }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: 'rgba(251,244,230,0.8)' }}><span>{rows.length} Tischreihen</span><span>{seats >= TARGET ? 'Ziel erreicht ✓' : `${TARGET - seats} fehlen`}</span></div>
      </div>
    );

    const dirToggle = (val, setVal) => (
      <div style={{ display: 'flex', gap: 6 }}>
        {[['h', 'Quer'], ['v', 'Hoch']].map(([d, l]) => <button key={d} onClick={() => setVal(d)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `2px solid ${val === d ? T.ink : T.line}`, background: val === d ? T.ink : T.panel, color: val === d ? '#fff' : T.sub, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>{l}</button>)}
      </div>
    );

    const tools = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {hud}
        {mode === 'tische' ? (
          <React.Fragment>
            <Card pad={16}>
              <Seg>Tischreihe einfügen</Seg>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}><span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>Länge</span><Stepper value={addLen} set={setAddLen} suffix={' Tische'} /></div>
              <div style={{ marginBottom: 13 }}>{dirToggle(addDir, setAddDir)}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, fontWeight: 700, fontSize: 12, color: T.faint }}><span>= {addLen * UNIT / 100} m lang</span><span>{addLen * 4} Plätze</span></div>
              <Btn primary icon="plus" onClick={addRow} style={{ width: '100%', justifyContent: 'center' }}>Reihe einfügen</Btn>
            </Card>
            <Card pad={16}>
              <Seg>Tischreihen-Block</Seg>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}><span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>Reihen</span><Stepper value={bRows} set={setBRows} max={12} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}><span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>Länge</span><Stepper value={bLen} set={setBLen} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}><span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>Gang</span><Stepper value={bGap} set={setBGap} min={20} max={200} suffix={'cm'} /></div>
              <Btn ghost icon="grid" onClick={addBlock} style={{ width: '100%', justifyContent: 'center' }}>{bRows} Reihen einfügen</Btn>
            </Card>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Card pad={16}>
              <Seg>Saal-Maße</Seg>
              {[['Länge', 'w'], ['Breite', 'h']].map(([l, k]) => <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}><span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>{l}</span><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><button onClick={() => setHallDim(k, -50)} style={stepBtn}>–</button><span style={{ fontFamily: T.display, fontSize: 16, minWidth: 54, textAlign: 'center' }}>{(hall[k] / 100).toFixed(1)}m</span><button onClick={() => setHallDim(k, 50)} style={stepBtn}>+</button></div></div>)}
            </Card>
            <Card pad={16}>
              <Seg>Hindernis platzieren</Seg>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['buehne', 'Bühne'], ['bar', 'Bar'], ['eingang', 'Eingang'], ['saeule', 'Säule'], ['fluchtweg', 'Fluchtweg']].map(([t, l]) => <button key={t} onClick={() => addObst(t)} style={{ padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 12, height: 12, borderRadius: t === 'saeule' ? '50%' : 3, background: OB[t].fill, flexShrink: 0 }} />{l}</button>)}
              </div>
            </Card>
          </React.Fragment>
        )}
      </div>
    );

    const inspector = selObj && (
      <Card pad={16}>
        {sel.kind === 'row' ? (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}><span style={{ fontFamily: T.display, fontSize: 17 }}>Reihe {selObj.num}</span><Chip tone="red" dot>{seatsOf(selObj)} Plätze</Chip></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}><span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>Länge</span><Stepper value={selObj.len} set={(v) => updSel({ len: v })} suffix={' T.'} /></div>
            <div style={{ marginBottom: 11 }}>{dirToggle(selObj.dir, (d) => { if (d !== selObj.dir) rotate(); })}</div>
            <button onClick={() => updSel({ ends: !selObj.ends })} style={{ width: '100%', padding: '9px', borderRadius: 9, border: `2px solid ${selObj.ends ? T.ink : T.line}`, background: selObj.ends ? T.ink : T.panel, color: selObj.ends ? '#fff' : T.sub, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', marginBottom: 13 }}>Kopfplätze {selObj.ends ? 'an · +2' : 'aus'}</button>
            <Btn ghost icon="trash" onClick={delSel} style={{ width: '100%', justifyContent: 'center' }}>Reihe löschen</Btn>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ fontFamily: T.display, fontSize: 17, marginBottom: 13 }}>{selObj.label || OB[selObj.type].label || 'Säule'}</div>
            <div style={{ display: 'flex', gap: 8 }}>{selObj.type !== 'saeule' && <Btn ghost sm icon="refresh" onClick={rotObst} style={{ flex: 1, justifyContent: 'center' }}>Drehen</Btn>}<Btn ghost sm icon="trash" onClick={delSel} style={{ flex: 1, justifyContent: 'center' }}>Löschen</Btn></div>
          </React.Fragment>
        )}
      </Card>
    );

    const modeTabs = (sm) => (
      <div style={{ display: 'inline-flex', gap: 4, background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: sm ? 10 : 11, padding: sm ? 3 : 4, width: sm ? '100%' : 'auto' }}>
        {[['tische', sm ? 'Tische' : 'Tische planen'], ['saal', sm ? 'Saal' : 'Saal einrichten']].map(([id, l]) => <button key={id} onClick={() => { setMode(id); setSel(null); }} style={{ flex: sm ? 1 : 'none', border: 'none', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: sm ? 12.5 : 13, padding: sm ? '7px' : '8px 14px', borderRadius: sm ? 7 : 8, background: mode === id ? T.ink : 'transparent', color: mode === id ? '#fff' : T.sub }}>{l}</button>)}
      </div>
    );

    if (mobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ padding: '12px 14px 10px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><BackBtn onClick={onBack}>Zurück</BackBtn><span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5 }}><span style={{ fontFamily: T.display, fontSize: 22, color: seats >= TARGET ? T.green : T.ink }}>{seats}</span><span style={{ fontWeight: 800, fontSize: 12, color: T.sub }}>/{TARGET}</span></span></div>
            {modeTabs(true)}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>{canvas}</div>
            {selObj ? inspector : (
              <Card pad={14}>
                {mode === 'tische' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 12.5, color: T.sub }}>Länge</span><Stepper value={addLen} set={setAddLen} />{dirToggle(addDir, setAddDir)}<Btn primary sm icon="plus" onClick={addRow} style={{ flex: 1, justifyContent: 'center' }}>Reihe</Btn>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{[['buehne', 'Bühne'], ['bar', 'Bar'], ['eingang', 'Eingang'], ['saeule', 'Säule'], ['fluchtweg', 'Flucht']].map(([t, l]) => <Btn key={t} ghost sm onClick={() => addObst(t)}>{l}</Btn>)}</div>
                )}
              </Card>
            )}
            <div style={{ height: 8 }} />
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <BackBtn onClick={onBack}>Zurück zum Event</BackBtn>
          {modeTabs(false)}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Chip tone="neutral">Vorlage: Prunksitzung 2025</Chip><Btn primary sm icon="check">Vorlage speichern</Btn></div>
        </div>
        <div>
          <Title size={28}>Saalplanung</Title>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.sub, marginTop: 5 }}>Lange Tischreihen ziehen — Stühle entstehen automatisch an den Längsseiten. Eine Reihe = beliebig viele 80er-Tische, als Block verschiebbar. Raster 10cm.</div>
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <div style={{ width: 250, flexShrink: 0 }}>{tools}</div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: T.radius, padding: 24 }}>{canvas}</div>
          <div style={{ width: 224, flexShrink: 0 }}>{inspector || <Card pad={16}><div style={{ fontWeight: 700, fontSize: 12.5, color: T.sub, lineHeight: 1.5 }}>Tippe eine Tischreihe an: Länge ändern, drehen, Kopfplätze schalten oder löschen. Ziehen verschiebt die ganze Reihe.</div></Card>}</div>
        </div>
      </div>
    );
  }

  window.TaskSaalplan = function TaskSaalplan({ onBack, mobile }) { return <Editor mobile={mobile} onBack={onBack} />; };
  window.SeatingEditor = window.TaskSaalplan;
})();
