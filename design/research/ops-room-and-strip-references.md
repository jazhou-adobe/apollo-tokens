# Ops-room and strip references

Research behind the Flight Strips direction: how real strip boards and the carrier deck board work, what Hermes takes from them, and the agent-protocol research (MCP elicitation and Tasks, prior art, Agent detection) that shapes the widgets. Facts carry inline links. Text under "Hermes takes" is design analysis, not a sourced fact. Links checked 2026-11-20; two ACM pages refuse automated requests and are cited from their published titles and abstracts.

## Flight progress strips

### FAA JO 7110.65, Chapter 2 Section 3

Source: [FAA Order JO 7110.65, §2-3 Flight Progress Strips](https://www.faa.gov/air_traffic/publications/atpubs/atc_html/chap2_section_3.html).

- Controllers "use flight progress strips to post current data on air traffic and clearances required for control" unless a facility directive says otherwise; en route, strips "must be posted" (§2-3-1).
- "Maintain only necessary current data and remove the strips from the flight progress boards when no longer required for control purposes" (§2-3-1a).
- Corrections: "Do not erase or overwrite any item"; delete with an "X" and "write the new … information immediately adjacent to it and within the same space" (§2-3-1a1).
- Strips have numbered spaces with fixed meanings; space 3 is "Aircraft identification" and the layout of manually prepared strips "must conform to the format of machine-generated strips" (§2-3-1b, TBL 2-3-1).

**Hermes takes:**

- A strip holds only what the Human needs to decide now; answered and expired Rounds leave the bay for the answered log.
- Nothing on a strip is overwritten silently. When a policy fires or an Agent cancels, the strip keeps the original and adds the outcome beside it; an unsent draft stays visible, marked "Not sent".
- Every strip has the same fixed layout: status word, title, Question count, callsign, id, age, policy. Position on the strip means the same thing every time.

### FAA Electronic Flight Strips

Source: [FAA TFDM, Electronic Flight Strips](https://www.faa.gov/air_traffic/technology/tfdm/efs). "For decades, air traffic controllers have used paper flight strips to keep track of flights"; the TFDM programme installs electronic flight strips in US towers.

**Hermes takes:** the strip survives digitisation as a unit of work; Hermes is an electronic strip board, not a chat feed.

### NATS: "ATC Explained: Flight Progress Strips" (2026)

Source: [NATS Blog, 22 January 2026](https://nats.aero/blog/2026/01/atc-explained-flight-progress-strips/).

- A strip is "a concise record of the operational information a controller needs at any particular moment in time".
- Strips carry the callsign and type, departure and destination, route, cleared altitude and speed.
- Tower strips are colour coded, "blue for departures, orange for arrivals for example".
- "Strips are arranged in bays or columns to reflect how traffic is flowing", "with its position telling a story".
- Paper strips were moved "around in their plastic holders"; the purpose is "a consistent, accurate and clear operational picture" shared across controllers.

**Hermes takes:** the holder as the physical frame of a strip; bays where position tells the story (pending in arrival order); the callsign as the first identifier on a strip. Hermes does not reuse aviation colour codes: holder colours are Hermes roles, always paired with words.

### EUROCONTROL ITWP HMI description

Source: [EUROCONTROL, Integrated Tower Working Position (ITWP) HMI Description, V4](https://www.eurocontrol.int/sites/default/files/publication/files/itwp-hmi-description-v4-20012017.pdf).

- EFS are "displayed to the controller … in EFS Bays"; "the content and layout of the EFS can be defined in the local configuration" (§2.5).
- Bays should display "traffic that will become controlled in the near future (pending traffic)", "traffic under control (active traffic)" and "traffic for which transfer to another controller role has been initiated (transferred traffic)"; "a bay is represented as a vertical column consisting of several bay sections" (§2.6).
- Colour coding uses default colours that "are off-line parameters that can be tuned at local level" (§2.4.1), with separate colour rules per planning state, including a "'Pending' Planning State" (§2.4.3).
- A "ghost" strip duplicates a strip active in another section; "all the text fields in a Ghost strip, apart from the callsign, are shown with a grey foreground colour", and ghost strips are "inactive to mouse input" (§2.6.1.4).

**Hermes takes:**

- The bay is a vertical column of sections; pending first.
- Status-by-state colour sets that worlds can retune, as long as each still passes the gates (the world colour options).
- Expired and cancelled strips use grey (`--hh-expired`) and are read-only, but keep the callsign legible — the same idea as the ghost strip, with the status word added because Hermes never relies on grey alone.

### Human factors of strips

- [Mackay, W. E. (1999). "Is paper safer? The role of paper flight strips in air traffic control." ACM TOCHI 6(4), 311–340](https://dl.acm.org/doi/10.1145/331490.331491). The abstract notes that many attempts to automate air traffic control had failed because controllers remained attached to a key work artifact, the paper flight strip.
- [Huber, S., Gramlich, J. et al. (2020). "From Paper Flight Strips to Digital Strip Systems: Changes and Similarities in Air Traffic Control Work Practices." PACMHCI 4(CSCW1), Article 28](https://dl.acm.org/doi/10.1145/3392833). The abstract reports that digital strip systems "have superseded paper strips in lower airspace control centers in Europe".

**Hermes takes:** keep the strip's tangible qualities on screen (a bounded, movable, glanceable record) rather than replacing it with a generic list row.

## The carrier deck board ("Ouija board")

- [Smithsonian Air & Space, "How Things Work: The Ouija Board" (2008)](https://www.smithsonianmag.com/air-space-magazine/how-things-work-the-ouija-board-10048217/): a scale replica of the flight deck and hangar deck (1/16 inch to one foot) with aircraft templates, used in Flight Deck Control "to track every move of every airplane on a carrier". Handlers mark templates with "thumbtacks, nuts and bolts, wing nuts, and washers"; "every carrier has their own plan" for what each marker means. The air boss can call the handler, who "will just look at the ouija board and tell me". The board is kept low-tech because "if ship's power goes down, you don't lose a thing".
- [US Navy, "Old School Meets New School: Flight Deck Ouija Boards Go Digital" (2017)](https://www.navy.mil/Press-Office/News-Stories/Article/2254134/old-school-meets-new-school-flight-deck-ouija-boards-go-digital/): the Office of Naval Research's TechSolutions programme sponsored the Deployable Ship Integration Multitouch System (DSIMS), a digital version of the board.

**Hermes takes:**

- The `deck-handling` world (now archived): Agents as craft parked in deck zones; an answered Round's craft taxis to the catapult and off the board.
- Marker meanings are local in the Navy; in Hermes they are fixed and spelled out, because the Human may change and agents build screens.
- "Look at the board and tell": the bay must answer "what is waiting, from whom, and what happens if I don't act" at a glance.
- Used future: tactile, worn-in and functional, not glossy.

## Agent-to-Human protocols

Summarised from the hermes-hub research branches (`research/agent-human-transport-options`, `research/mcp-bun-tasks`); see those notes for full source lists.

- **MCP elicitation** renders a question inside each Agent's own client UI, not in a central place ([MCP Elicitation, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation)). Form-mode schemas are a flat object of primitives (string, number, boolean, single- and multi-select enum). **URL mode** sends the Human to a web page out of band; it is the elicitation mode that fits a hub.
- **MCP Tasks**, now the extension `io.modelcontextprotocol/tasks`, lets a server return a durable `taskId` that the client polls with `tasks/get` ([Tasks extension overview](https://modelcontextprotocol.io/extensions/tasks/overview)). Client support varies ([extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix)).
- **A2A** models a task waiting for input as `TASK_STATE_INPUT_REQUIRED`, an interrupted, non-terminal state, with poll, stream or push updates ([A2A specification](https://a2a-protocol.org/latest/specification/)).
- **Server-sent events** are a one-way `text/event-stream` with built-in reconnect ([WHATWG HTML, SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html)); the research recommends SSE for the Command Center.

**Hermes takes:** the Round is the unit with an id and a status that survives reconnects; the Command Center shows connection state explicitly (Live, Reconnecting, Offline) because SSE drops and reconnects are normal; a Round's status vocabulary (Pending, Answered, Expired, Cancelled) mirrors the waiting/terminal split in these protocols.

## Prior art for human-in-the-loop inboxes

From the same research note's prior-art table:

- **HumanLayer** SDK (≤ v0.7.9): `require_approval()` and `human_as_tool()`, separating approvals from free questions, polling a hosted API every 3 s ([repository](https://github.com/humanlayer/humanlayer); [v0.7.9 `approval.py`](https://github.com/humanlayer/humanlayer/blob/v0.7.9/humanlayer/core/approval.py)). The repository has since pivoted to a coding-agent control plane.
- **LangChain Agent Inbox** (archived): an inbox UI for LangGraph interrupts with response types accept, edit, response and ignore ([repository](https://github.com/langchain-ai/agent-inbox)).
- **LangGraph `interrupt()`**: pause and resume by thread id ([docs](https://docs.langchain.com/oss/python/langgraph/interrupts)).
- **OpenAI Agents SDK** human-in-the-loop: tools declare `needsApproval`; the run pauses with interruptions and resumes after approve/reject ([docs](https://openai.github.io/openai-agents-js/guides/human-in-the-loop/)).
- **AG-UI** interrupts: a run that needs input ends with an interrupt outcome, and the next run carries resume entries ([spec](https://docs.ag-ui.com/spec/1.0/basic/patterns/interrupt-resume)).

**Hermes takes:** approve/reject is its own Question kind with text labels, separate from choice and free text; one place answers every Agent; the Answer covers the whole Round, so the Answer bar submits everything at once.

## Agent identity and callsigns

Summarised from `research/agent-detection-signals` on hermes-hub (full sources there):

- Most coding-agent clients mark their shell children with environment variables, but only some are documented by the vendor, and markers can collide (one client sets another's marker; nested Agents inherit the parent's variables).
- Session ids are available to shell children for most clients; one client exposes none to terminal commands.
- Working directory and git context are inherited, not sent, so the Hub reads them from the Agent's process.
- MCP `clientInfo` is self-reported and must not drive behaviour or security ([MCP 2026-07-28 Basic](https://modelcontextprotocol.io/specification/2026-07-28/basic)).
- The research recommends that a self-declared **label** is display text that always wins for display but never replaces the detected kind or session id, which are stored alongside it.

**Hermes takes:**

- Callsign = detected client kind + declared label (`CLAUDE·api-refactor`), like an aircraft identification plus a flight-specific suffix.
- Agent detail shows how each value was detected and whether the signal is documented, so the Human can judge the callsign.
- Callsign colour (`agent-1` … `agent-6`) is a stable hash of the session id and never identifies an Agent on its own.

## Network exposure

Summarised from `research/lan-tailnet-exposure-auth` on hermes-hub:

- Browsers treat only `https`, `127.0.0.0/8`, `::1` and `localhost` as potentially trustworthy ([W3C Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy)); plain HTTP on a tailnet or LAN address rules out passkeys and notifications.
- Passkeys need a secure origin ([W3C WebAuthn Level 3, RP ID](https://www.w3.org/TR/webauthn-3/#rp-id)).
- Tailscale Serve gives HTTPS on the tailnet with identity headers ([Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve)).

**Hermes takes:** the sign-in blueprint offers a one-time link and a passkey and explains in words when passkeys are unavailable; Settings → Exposure states what each option exposes.
