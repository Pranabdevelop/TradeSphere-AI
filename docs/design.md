# Design — TradeSphere AI

Covers both surfaces: the Streamlit dashboard (functional, data-dense) and the Next.js UI shell
(presentation layer, Gen-Z/Pinterest aesthetic).

## 1. Design philosophy
Two different jobs, two different looks:
- **Dashboard (`app.py`)** optimizes for density and trust — plain Streamlit widgets, Plotly charts,
  tables you can actually read numbers off. No decoration competing with the data.
- **UI shell (`frontend/`)** optimizes for first impression — a landing page a non-technical
  evaluator or a classmate would actually want to scroll through, not a generic "AI SaaS" template.

## 2. UI shell visual language
Deliberately **not** the default AI-product look (dark mode, blue-to-purple gradients, glassy cards).
Instead: a warm, neo-brutalist/"dopamine decor" style — bold, playful, a little hand-made.

| Token | Value | Use |
|---|---|---|
| `cream` | `#FBF4E9` | Page background |
| `clay` | `#E2714B` | Primary accent, CTAs |
| `rust` | `#C85A3C` | Secondary accent, negative/alert tone |
| `sage` | `#8A9A6E` | Positive tone, Bull regime |
| `moss` | `#5F7355` | Deep accent |
| `butter` | `#F3C969` | Highlight, badges |
| `berry` | `#A4506B` | Tertiary accent |
| `ink` | `#2B2420` | Text, outlines, borders |

Structural rules:
- Every card/button gets a **2px ink border** and a **hard offset shadow** (`shadow-chunky`), never a
  soft blur — this is what reads as "sticker," not "corporate SaaS."
- Background uses a subtle **dotted grain texture**, not a gradient mesh.
- Blobby `border-radius` shapes (`rounded-blob`) break up the grid in the hero section.
- Typography: a chunky display face (Space Grotesk) for headlines, a clean body face (Inter) for text.
  Headlines use an outline-text trick (`-webkit-text-stroke`) for emphasis instead of color-only bolding.

## 3. Trading-themed motion
Animation choices are tied to what the project *is*, not generic page polish:

| Element | Motion | Why |
|---|---|---|
| Hero candlesticks | Staggered scale-in, then continuous gentle bob | Reads like a tiny live chart |
| Stat cards | Count up from 0 when scrolled into view | Mirrors a ticking stat screen |
| Agent leaderboard cards | Hover tilt + lift | Sticker/collectible-card feel for 7 "competing" agents |
| Ticker strip | Infinite horizontal marquee | Literal nod to a stock ticker tape |
| Hero blobs | Slow float/rotate loop | Ambient movement without distracting from text |

All animation is implemented with Framer Motion (`whileInView`, `whileHover`, keyframe `animate`), kept
subtle (under ~1s per transition, easing curves, no flashing/strobing).

## 4. Dashboard layout (Streamlit)
Seven tabs, left to right, in the order a user should explore them:
1. **Market & Regimes** — candlestick chart + regime scatter + regime stats table.
2. **ML Forecast** — accuracy/AUC metrics, feature importance, probability-over-time chart.
3. **Agent Arena** — leaderboard table, equity curves, drawdown chart, exposure inspector, RL learning curve.
4. **Stress Test** — scenario controls, base-vs-shocked comparison table, shocked price chart.
5. **Risk Lab** — VaR/CVaR metrics, return histogram, Monte-Carlo fan chart.
6. **Portfolio Lab** — correlation heatmap, efficient frontier scatter.
7. **Sentiment Lab** — headline input, scored table, exposure-tilt preview.

Sidebar holds every control that changes the whole run (ticker, model, horizon, costs, RL episodes,
vol-targeting) so tabs stay purely about *viewing* results, never re-configuring them.

## 5. Accessibility notes
- Color choices avoid red/green-only signaling where possible (regime badges carry text labels, not
  just color).
- All interactive elements (nav links, buttons) have visible hover and focus states.
- Font sizes stay above 14px body / 36px+ headline for readability on a projector during a viva demo.

## 6. Open design questions
- Should the dashboard adopt the same cream/clay palette as the UI shell for brand consistency, or stay
  neutral Streamlit default for data-trust reasons? (Currently: kept neutral, intentionally.)
- Mobile layout for the UI shell beyond the nav's `sm:` breakpoint hasn't been stress-tested.
