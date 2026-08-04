# Authorship Meter

A small disclosure widget for web projects: it shows, at a glance, how much of a
piece of work came from a person and how much came from a model — and at which
stage of the process.

**[Live demo](https://luispsalas.github.io/authorship-meter/)** · [Spec](SPEC.md) · [Assessment instructions](ASSESSMENT.md)

---

## Why

"Made with AI" is not a useful disclosure. The question is *which part* and to what extent? A single percentage cannot answer that, and a percentage invented by the declarer is not evidence of anything.

The Authorship Meter answers it with five stages and five named levels. You declare
where the work sits at each stage; the widget derives the bar. The mapping is fixed
and published, so the headline number cannot be tuned into something flattering.

---

## The model

**Five stages** — Conception · Structure · Production · Curation · Verification

**Five levels**, each declared per stage:

| Level | Name | Human share | AI share |
|---|---|---|---|
| 1 | Human only | 100% | 0% |
| 2 | Human-led, AI-assisted | 75% | 25% |
| 3 | Co-created | 50% | 50% |
| 4 | AI-led, human-directed | 25% | 75% |
| 5 | AI-generated | 0% | 100% |

The composite is the (optionally weighted) mean of the five levels, mapped to a
band: *Human authored* → *Human-led, AI-assisted* → *Co-created* → *AI-led,
human-directed* → *AI-generated, human-verified*.

**One hard rule:** verification may never be declared level 5. **A human always signs
off. Work with no human verification step cannot use this meter.**

Full definitions, calibration rules, and weight profiles are in [SPEC.md](SPEC.md).

---

## Provenance, always visible

A declaration is a public claim, so every rendered meter shows — without the reader
digging — the **method** (`self-declared` / `llm-assisted` / `third-party`), the
**declarer**, and the **assessed date**, plus two links: one to this standard, one
to the specific declaration behind the claim. If the work changes after it was
assessed, the meter says so rather than showing a confidently stale number.

`llm-assisted` is the encouraged default for the first stage of adoption: an LLM
runs [ASSESSMENT.md](ASSESSMENT.md) and produces the declaration, the author
confirms or contests it. An outside assessor blunts the self-crediting bias that
comes with declaring your own work.

**Placement** (for the author's own content): a one-line reference in the intro —
*"This piece carries an [Authorship Meter](#authorship) declaration"* — and the full
meter at the foot of the content, under an `#authorship` anchor. Non-invasive, two
touchpoints, nothing else required in the body.

Full detail — required fields, staleness rules, the revision model, placement
standard — is in [SPEC.md §6–8](SPEC.md#6-provenance-and-validity).

---

## What this is not

- Not a quality signal. Human-authored does not mean good.
- Not a copyright or licensing claim.
- Not independently verifiable. A declaration is a claim by its declarer; the
  `method` field records how it was arrived at, not that it is true.
- Not a token count. Where a real countable quantity exists, put it in a note
  rather than converting it into a level and calling it measured.

For file-level provenance (C2PA Content Credentials and similar), use those
standards alongside this one — they record what happened to a file, this records
how a work was made.

---

## Using it

```html
<script src="authorship-meter.js" defer></script>

<authorship-meter src="authorship.json"></authorship-meter>
```

Or inline the declaration, which avoids a fetch and works from `file://`:

```html
<authorship-meter compact>
  <script type="application/json">
  {
    "version": "1.1",
    "subject": {
      "name": "My article",
      "type": "article",
      "source": "https://github.com/me/my-article",
      "version": "2026-08-04"
    },
    "assessed_at": "2026-08-04",
    "stages": {
      "conception":   { "level": 1, "note": "Argument is the author's own." },
      "structure":    { "level": 2, "note": "Outline reordered after a model critique." },
      "production":   { "level": 3, "note": "About half the paragraphs drafted by model." },
      "curation":     { "level": 1, "note": "Every paragraph rewritten before publication." },
      "verification": { "level": 1, "note": "Author checked all citations." }
    },
    "tools": ["Claude Opus 5"],
    "method": "self-declared"
  }
  </script>
</authorship-meter>
```

### Attributes

| Attribute | Effect |
|---|---|
| `src` | URL of a declaration JSON file |
| `compact` | Badge only; the breakdown expands on click |
| `open` | Start expanded (the default in full mode) |

### Styling

Restyle with CSS custom properties on the element:
`--am-human` · `--am-ai` · `--am-fg` · `--am-muted` · `--am-bg` · `--am-line` ·
`--am-radius` · `--am-font`.

Light and dark are both handled via `prefers-color-scheme`.

### Scripting

```js
AuthorshipMeter.score(declaration)
// → { composite, aiShare, humanShare, band }

document.querySelector('authorship-meter').declaration = obj;
```

No dependencies, no build step, one file. Shadow DOM keeps host page styles out.

---

## Getting a declaration assessed

[ASSESSMENT.md](ASSESSMENT.md) is written to be handed to an LLM. Give it the file
plus an account of how the work was made, and it will produce a valid declaration
and explain its reasoning. It includes the evidence questions to ask, per-stage
level anchors, seven calibration rules, and a worked example.

The rule that matters most: **when uncertain, choose the higher (more AI) level.**
Under-disclosure is the failure mode that costs trust.

Declarations validate against [`authorship.schema.json`](authorship.schema.json).
Examples live in [`examples/`](examples/).

---

## License

MIT.
