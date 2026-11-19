const STEPS = [
  'Read tokens/token-taxonomy.md and agent-contract/screen-generation-rules.md. Use glossary terms: Hub, Command Center, Agent, Human, Round, Question, Answer, Unanswered Policy.',
  'Set data-theme on <html> (hermes-dark by default, hermes-light for the day shift, or hermes-<world>), plus data-palette for a world colour option.',
  'Pick density per region: data-density="compact" on the triage list and logs; data-density="glance" on phone layouts. Never hand-tune paddings.',
  'Compose from .hh-* classes. A Round is always a .hh-strip in a holder with its status word; an Agent is always a .hh-callsign with its text.',
  'Colour comes from roles only (var(--hh-<role>)), and every status prints a word. Glow (elevation-live) is for live state only.',
  'Keep reading planes opaque: Question text, attachments, and free-text Answers sit on strip, code, or input roles. No gradient text, glass, scanlines, or noise.',
  'Wire the keyboard: J/K between Rounds, 1–9 options, A/R approve/reject, ⌘/Ctrl+Enter sends the whole Round. Shortcuts act only inside the bay and can be switched off; show the key hints.',
  'Write copy in the dispatcher voice: status word first, then facts. “Pending · 2 Questions · waits 10 min, then applies recommended.” No exclamation marks, no emoji.',
  'Run npm run validate, then check the screen at 1440 and 390 px in both core themes and glance density: no console errors, no sideways scroll.',
];

const EXAMPLE = `<li class="hh-strip" data-status="pending">
  <div class="hh-strip-tab"><span>Pending</span><span class="hh-mono-sm">06:52 left, then applies recommended</span></div>
  <div class="hh-strip-paper">
    <button class="hh-strip-head" aria-expanded="false" aria-controls="r142-body">
      <span class="hh-strip-cell" data-cell="callsign">
        <span class="hh-callsign" data-agent="1"><span class="hh-callsign-mark"></span>CLAUDE·api-refactor</span>
      </span>
      <span class="hh-strip-cell" data-cell="title"><span class="hh-strip-header">Route versioning for /v2</span></span>
      <span class="hh-strip-cell" data-cell="meta"><span class="hh-mono">09:38</span></span>
    </button>
    <div class="hh-strip-body" id="r142-body" hidden>…</div>
  </div>
  <span class="hh-policy-timer" role="meter" aria-valuetext="06:52 left, then applies recommended"><span class="hh-policy-timer-fill"></span></span>
</li>`;

export function AgentRecipeSection() {
  return (
    <section id="agent-recipe" className="hh-section" aria-labelledby="agent-recipe-title">
      <div className="hh-section-head">
        <h2 id="agent-recipe-title" className="hh-heading-lg">
          Agent recipe
        </h2>
        <p className="hh-body hh-measure">The steps an agent follows to build a Hermes screen from this system. The full contract is agent-contract/screen-generation-rules.md.</p>
      </div>
      <ol className="hh-recipe hh-body">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <figure className="hh-attachment">
        <figcaption className="hh-attachment-head">
          <span className="hh-badge">Code</span>
          <span className="hh-attachment-title hh-mono">A pending Round strip, in markup</span>
        </figcaption>
        <pre className="hh-attachment-body" tabIndex={0}>
          <code>{EXAMPLE}</code>
        </pre>
      </figure>
    </section>
  );
}
