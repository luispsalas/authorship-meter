/*!
 * Authorship Meter — a disclosure widget for human/AI contribution.
 * Spec v1.1 · self-contained custom element · no dependencies.
 *
 *   <authorship-meter src="authorship.json"></authorship-meter>
 *
 *   <authorship-meter compact>
 *     <script type="application/json">{ ...declaration... }</script>
 *   </authorship-meter>
 *
 * Attributes:
 *   src      — URL of a declaration JSON file
 *   compact  — hide the stage breakdown by default; expands on click.
 *              Provenance (method, declarer, date) and the two links are
 *              always shown, in both modes — SPEC.md §6.1: not buried.
 *   open     — start with stage detail expanded (full mode default)
 */
(() => {
  const METER_HOME = 'https://github.com/luispsalas/authorship-meter';

  const STAGES = [
    ['conception', 'Conception', 'Whose idea or thesis'],
    ['structure', 'Structure', 'Who shaped the architecture'],
    ['production', 'Production', 'Who made the artifact'],
    ['curation', 'Curation', 'Who selected and revised'],
    ['verification', 'Verification', 'Who checked and signed off'],
  ];

  const LEVELS = {
    1: 'Human only',
    2: 'Human-led, AI-assisted',
    3: 'Co-created',
    4: 'AI-led, human-directed',
    5: 'AI-generated',
  };

  const BANDS = [
    [1.5, 'Human authored'],
    [2.5, 'Human-led, AI-assisted'],
    [3.5, 'Co-created'],
    [4.5, 'AI-led, human-directed'],
    [Infinity, 'AI-generated, human-verified'],
  ];

  const PROFILES = {
    equal: { conception: 1, structure: 1, production: 1, curation: 1, verification: 1 },
    editorial: { conception: 2, structure: 1, production: 1, curation: 2, verification: 1 },
    engineering: { conception: 1, structure: 2, production: 1, curation: 1, verification: 2 },
    creative: { conception: 2, structure: 1, production: 2, curation: 1, verification: 1 },
  };

  // Method is the primary trust signal (SPEC §6.1) — labels spell out what
  // each tier means rather than reusing the raw enum value.
  const METHOD_LABELS = {
    'self-declared': 'Self-declared',
    'llm-assisted': 'LLM-assisted',
    'third-party': 'Third-party assessed',
  };

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /** Composite, AI share and band label for a declaration. Exported for reuse. */
  function score(decl) {
    const w = { ...PROFILES.equal, ...PROFILES[decl.weights?.profile], ...decl.weights };
    let num = 0, den = 0;
    for (const [key] of STAGES) {
      const level = decl.stages?.[key]?.level;
      if (typeof level !== 'number') throw new Error(`Missing stage: ${key}`);
      const weight = typeof w[key] === 'number' ? w[key] : 1;
      num += level * weight;
      den += weight;
    }
    const composite = num / den;
    const aiShare = Math.round(((composite - 1) / 4) * 100);
    const band = BANDS.find(([max]) => composite < max)[1];
    return { composite, aiShare, humanShare: 100 - aiShare, band };
  }

  /**
   * True when the work changed after it was last assessed (SPEC §6.3).
   * Requires both dates; silently false (not stale) if either is missing —
   * absence of a date is a validity gap (§6.3 "scoped"/"current"), not itself
   * evidence of staleness.
   */
  function isStale(decl) {
    const assessed = decl.assessed_at;
    const updated = decl.subject?.updated;
    if (!assessed || !updated) return false;
    const a = new Date(assessed), u = new Date(updated);
    if (isNaN(a) || isNaN(u)) return false;
    return u > a;
  }

  function fmtDate(iso) {
    if (!iso) return null;
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const CSS = `
    :host {
      --am-human: #2e7d6f;
      --am-ai: #6b5bd2;
      --am-warn: #b3660a;
      --am-fg: #1c1c1e;
      --am-muted: #6a6a70;
      --am-bg: #ffffff;
      --am-line: #e3e3e6;
      --am-radius: 10px;
      --am-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      display: block;
      max-width: 34rem;
      color: var(--am-fg);
      font-family: var(--am-font);
      font-size: 14px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        --am-human: #4db6a3;
        --am-ai: #9b8cf0;
        --am-warn: #e3a63f;
        --am-fg: #ececf1;
        --am-muted: #9a9aa3;
        --am-bg: #17171a;
        --am-line: #303036;
      }
    }
    :host([hidden]) { display: none; }
    * { box-sizing: border-box; }

    .card {
      background: var(--am-bg);
      border: 1px solid var(--am-line);
      border-radius: var(--am-radius);
      padding: 14px 16px;
    }
    .eyebrow {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--am-muted);
      margin-bottom: 6px;
    }
    .band { font-size: 17px; font-weight: 650; letter-spacing: -.01em; }
    .subject { color: var(--am-muted); font-size: 12.5px; margin-top: 1px; }

    .bar {
      display: flex;
      height: 12px;
      margin: 12px 0 6px;
      border-radius: 99px;
      overflow: hidden;
      background: var(--am-line);
    }
    .bar span { display: block; }
    .bar .h { background: var(--am-human); }
    .bar .a { background: var(--am-ai); }

    .legend {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    .legend b { font-weight: 600; }
    .legend .h { color: var(--am-human); }
    .legend .a { color: var(--am-ai); }

    /* Provenance — SPEC §6.1: method, declarer, date. Always visible,
       compact or not, open or not. Not buried. */
    .prov {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px 10px;
      margin-top: 11px;
      font-size: 11.5px;
      color: var(--am-muted);
    }
    .prov .method {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 99px;
      background: var(--am-line);
      color: var(--am-fg);
      font-weight: 600;
      font-size: 10.5px;
      letter-spacing: .01em;
    }
    .prov .stale {
      color: var(--am-warn);
      font-weight: 600;
    }

    /* The two links — SPEC §6.2: method link (constant) + declaration link (per-instance) */
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 7px;
      font-size: 11.5px;
    }
    .links a {
      color: var(--am-muted);
      text-decoration: none;
    }
    .links a:hover { color: var(--am-fg); text-decoration: underline; }

    .toggle {
      appearance: none;
      background: none;
      border: 0;
      margin: 11px 0 0;
      padding: 0;
      font: inherit;
      font-size: 12px;
      color: var(--am-muted);
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .toggle:hover { color: var(--am-fg); }

    .stages { margin-top: 12px; border-top: 1px solid var(--am-line); padding-top: 10px; }
    .stage { padding: 6px 0; }
    .stage-head { display: flex; align-items: center; gap: 10px; }
    .stage-name { flex: 0 0 5.8rem; font-size: 12.5px; font-weight: 550; }
    .track { display: flex; gap: 3px; flex: 0 0 auto; }
    .cell {
      width: 15px; height: 7px; border-radius: 2px;
      background: var(--am-line);
    }
    .cell[data-side="h"] { background: color-mix(in srgb, var(--am-human) 22%, var(--am-line)); }
    .cell[data-side="a"] { background: color-mix(in srgb, var(--am-ai) 22%, var(--am-line)); }
    .cell[data-on] { height: 11px; margin-top: -2px; }
    .cell[data-on][data-side="h"] { background: var(--am-human); }
    .cell[data-on][data-side="a"] { background: var(--am-ai); }
    .cell[data-on][data-side="n"] { background: var(--am-muted); }
    .stage-level { font-size: 12px; color: var(--am-muted); }
    .note { margin: 3px 0 0 calc(5.8rem + 10px); font-size: 12px; color: var(--am-muted); }

    .meta {
      margin-top: 12px; padding-top: 9px;
      border-top: 1px solid var(--am-line);
      font-size: 11.5px; color: var(--am-muted);
    }

    /* Standing disclaimer — SPEC §10: a claim by its declarer, not an
       endorsement. Always visible per §6.1. */
    .disclaimer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--am-line);
      font-size: 10.5px;
      color: var(--am-muted);
      font-style: italic;
    }

    .err { color: #b3261e; font-size: 12.5px; }

    @media (max-width: 420px) {
      .stage-name { flex-basis: 100%; }
      .stage-head { flex-wrap: wrap; }
      .note { margin-left: 0; }
    }
  `;

  class AuthorshipMeter extends HTMLElement {
    static observedAttributes = ['src', 'compact', 'open'];

    #root = this.attachShadow({ mode: 'open' });
    #data = null;
    #open = null; // null = derive from attributes; boolean = user has toggled

    connectedCallback() {
      const inline = this.querySelector('script[type="application/json"]');
      if (inline) {
        try {
          this.#data = JSON.parse(inline.textContent);
        } catch (e) {
          return this.#fail('Declaration is not valid JSON.');
        }
        return this.#render();
      }
      if (this.hasAttribute('src')) return this.#load(this.getAttribute('src'));
      this.#fail('No declaration: provide a src attribute or an inline JSON script.');
    }

    attributeChangedCallback(name, prev, next) {
      if (prev === next || !this.#data) return;
      if (name === 'src') return this.#load(next);
      if (name === 'open' || name === 'compact') this.#open = null; // re-derive default
      this.#render();
    }

    /** Set the declaration programmatically. */
    set declaration(obj) {
      this.#data = obj;
      this.#render();
    }
    get declaration() {
      return this.#data;
    }

    async #load(src) {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.status);
        this.#data = await res.json();
        this.#render();
      } catch {
        this.#fail(`Could not load declaration from ${src}`);
      }
    }

    #fail(msg) {
      this.#root.innerHTML = `<style>${CSS}</style><div class="card"><p class="err">Authorship Meter — ${esc(msg)}</p></div>`;
    }

    #render() {
      const d = this.#data;
      let s;
      try {
        s = score(d);
      } catch (e) {
        return this.#fail(e.message);
      }

      const open =
        this.#open !== null
          ? this.#open
          : this.hasAttribute('open') || !this.hasAttribute('compact');

      const stages = STAGES.map(([key, label]) => {
        const st = d.stages[key];
        const cells = [1, 2, 3, 4, 5]
          .map((n) => {
            const side = n <= 2 ? 'h' : n === 3 ? 'n' : 'a';
            return `<i class="cell" data-side="${side}"${n === st.level ? ' data-on' : ''}></i>`;
          })
          .join('');
        return `
          <div class="stage">
            <div class="stage-head">
              <span class="stage-name">${label}</span>
              <span class="track" role="img" aria-label="${esc(label)}: ${esc(LEVELS[st.level])}">${cells}</span>
              <span class="stage-level">${esc(LEVELS[st.level])}</span>
            </div>
            ${st.note ? `<p class="note">${esc(st.note)}</p>` : ''}
          </div>`;
      }).join('');

      // Provenance row — method, declarer, assessed date. Always rendered
      // (SPEC §6.1: "not buried"), independent of compact/open state.
      const methodKey = d.method || 'self-declared';
      const methodLabel = METHOD_LABELS[methodKey] || esc(methodKey);
      const stale = isStale(d);
      const assessedText = d.assessed_at
        ? `Assessed ${esc(fmtDate(d.assessed_at))}`
        : 'Assessed: not recorded';

      const prov = `
        <div class="prov">
          <span class="method" title="How this declaration was arrived at (SPEC §6.1).">${esc(methodLabel)}</span>
          ${d.declared_by ? `<span class="declarer">${esc(d.declared_by)}</span>` : ''}
          <span class="assessed">${assessedText}</span>
          ${stale ? `<span class="stale" title="The work changed after this declaration was assessed.">⚠ predates current version</span>` : ''}
        </div>`;

      // The two links — SPEC §6.2. Method link is constant; declaration
      // link is per-instance and only shown when the declaration provides it.
      const links = `
        <div class="links">
          <a href="${esc(METER_HOME)}" target="_blank" rel="noopener">About this scale ↗</a>
          ${d.subject?.source ? `<a href="${esc(d.subject.source)}" target="_blank" rel="noopener">How this was assessed ↗</a>` : ''}
        </div>`;

      const meta = [
        d.tools?.length ? `Tools: ${d.tools.map(esc).join(', ')}` : '',
        d.weights?.profile && d.weights.profile !== 'equal' ? `${esc(d.weights.profile)} weighting` : '',
      ].filter(Boolean).join(' · ');

      this.#root.innerHTML = `
        <style>${CSS}</style>
        <div class="card" role="group" aria-label="Authorship: ${esc(s.band)}, ${s.aiShare}% AI contribution, ${esc(methodLabel)}">
          <p class="eyebrow">Authorship</p>
          <p class="band">${esc(s.band)}</p>
          ${d.subject?.name ? `<p class="subject">${esc(d.subject.name)}</p>` : ''}
          <div class="bar" aria-hidden="true">
            <span class="h" style="width:${s.humanShare}%"></span>
            <span class="a" style="width:${s.aiShare}%"></span>
          </div>
          <div class="legend">
            <span class="h">Human <b>${s.humanShare}%</b></span>
            <span class="a"><b>${s.aiShare}%</b> AI</span>
          </div>
          ${prov}
          ${links}
          <button class="toggle" type="button" aria-expanded="${open}">
            ${open ? 'Hide breakdown' : 'How was this made?'}
          </button>
          ${open ? `<div class="stages">${stages}</div>` : ''}
          ${open && meta ? `<p class="meta">${meta}</p>` : ''}
          <p class="disclaimer">A declaration is a claim by its declarer — not independently verified, not an endorsement.</p>
        </div>`;

      this.#root.querySelector('.toggle').addEventListener('click', () => {
        this.#open = !open;
        this.#render();
      });
    }
  }

  AuthorshipMeter.score = score;
  AuthorshipMeter.isStale = isStale;
  AuthorshipMeter.LEVELS = LEVELS;

  if (!customElements.get('authorship-meter')) {
    customElements.define('authorship-meter', AuthorshipMeter);
  }
  if (typeof globalThis !== 'undefined') globalThis.AuthorshipMeter = AuthorshipMeter;
})();
