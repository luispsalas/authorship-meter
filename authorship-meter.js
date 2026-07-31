/*!
 * Authorship Meter — a disclosure widget for human/AI contribution.
 * Spec v1.0 · self-contained custom element · no dependencies.
 *
 *   <authorship-meter src="authorship.json"></authorship-meter>
 *
 *   <authorship-meter compact>
 *     <script type="application/json">{ ...declaration... }</script>
 *   </authorship-meter>
 *
 * Attributes:
 *   src      — URL of a declaration JSON file
 *   compact  — render the badge only; stages expand on click
 *   open     — start with stage detail expanded (full mode default)
 */
(() => {
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

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /** Composite, AI share and band label for a declaration. Exported for reuse. */
  function score(decl) {
    const w = { ...PROFILES.equal, ...PROFILES[decl.weights?.profile] , ...decl.weights };
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

  const CSS = `
    :host {
      --am-human: #2e7d6f;
      --am-ai: #6b5bd2;
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

    .toggle {
      appearance: none;
      background: none;
      border: 0;
      margin: 10px 0 0;
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
      if (name === 'src') this.#load(next);
      else this.#render();
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

      const compact = this.hasAttribute('compact');
      const open = this.hasAttribute('open') || !compact;

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

      const meta = [
        d.tools?.length ? `Tools: ${d.tools.map(esc).join(', ')}` : '',
        d.declared_by ? esc(d.declared_by) : '',
        d.method ? esc(d.method.replace('-', ' ')) : '',
        d.weights?.profile && d.weights.profile !== 'equal' ? `${esc(d.weights.profile)} weighting` : '',
      ].filter(Boolean).join(' · ');

      this.#root.innerHTML = `
        <style>${CSS}</style>
        <div class="card" role="group" aria-label="Authorship: ${esc(s.band)}, ${s.aiShare}% AI contribution">
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
          <button class="toggle" type="button" aria-expanded="${open}">
            ${open ? 'Hide breakdown' : 'How was this made?'}
          </button>
          ${open ? `<div class="stages">${stages}</div>` : ''}
          ${open && meta ? `<p class="meta">${meta}</p>` : ''}
        </div>`;

      this.#root.querySelector('.toggle').addEventListener('click', () => {
        this.toggleAttribute('open');
        this.#render();
      });
    }
  }

  AuthorshipMeter.score = score;
  AuthorshipMeter.LEVELS = LEVELS;

  if (!customElements.get('authorship-meter')) {
    customElements.define('authorship-meter', AuthorshipMeter);
  }
  if (typeof globalThis !== 'undefined') globalThis.AuthorshipMeter = AuthorshipMeter;
})();
