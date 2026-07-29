# Portfolio Design System

## 1. Atmosphere & Identity

An editorial work archive with the restraint of a printed dossier and the clarity of a well-labelled tool. The portfolio should feel collected rather than decorated: warm paper, ink-black type, quiet rules, and a single chartreuse signal that marks interaction and evidence. The signature is the split between a generous title field and a dense proof field, repeated across every project page so a long career reads as one coherent object.

The redesign changes presentation only. `data.json` remains the source of truth for project copy, dates, links, technical notes, and screenshot paths. Existing capture images are the only project imagery.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|---|---|---|---|
| Screen canvas | `--color-canvas` | `#d7d6ce` | Desktop reading space around A4 pages |
| Paper primary | `--color-paper` | `#f4f1e9` | Every printed page |
| Paper quiet | `--color-paper-quiet` | `#ebe8df` | Image wells, metadata strips |
| Ink primary | `--color-ink` | `#171a18` | Headings and primary text |
| Ink secondary | `--color-ink-soft` | `#4e554e` | Descriptions and secondary labels |
| Ink muted | `--color-ink-muted` | `#62695f` | Periods, page metadata |
| Rule | `--color-rule` | `#c9c8bd` | Hairline dividers |
| Accent | `--color-accent` | `#c8f24b` | Focus, active index row, image affordance |
| Accent deep | `--color-accent-deep` | `#5f711f` | Accent text on paper |
| White | `--color-white` | `#ffffff` | Lightbox controls only |

### Rules

- The accent appears only where the interface communicates state or invites inspection.
- The paper and ink pair remains stable in print; screen canvas is the only surrounding tone.
- No project-specific colors are introduced. Status-like colors belong to the original content, not the shell.
- CSS colors outside `:root` must reference these tokens.

## 3. Typography

| Level | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Cover display | `clamp(4rem, 12vw, 7.5rem)` | 700 | 0.9 | Portfolio title |
| Page title | `clamp(2rem, 4vw, 3rem)` | 700 | 1.02 | Project and section titles |
| Body large | `1.125rem` | 400 | 1.7 | Introductory descriptions |
| Body | `1rem` | 400 | 1.7 | Project descriptions |
| Body small | `0.875rem` | 500 | 1.55 | Technical notes and index rows |
| Caption | `0.75rem` | 600 | 1.35 | Page metadata and screen labels |

### Font roles

- Display: `Georgia`, `Batang`, `Times New Roman`, serif. The serif gives the cover and page titles a printed, authored voice while still rendering without a network font.
- Interface/body: `Noto Sans KR`, `Apple SD Gothic Neo`, `Malgun Gothic`, sans-serif. The fallback chain keeps Korean wrapping predictable on Windows and macOS.
- Numbers use `font-variant-numeric: tabular-nums` where they form a list or page marker.

### Rules

- No body text below `0.875rem` on desktop or `1rem` on mobile.
- Headings use `text-wrap: balance`; prose uses `text-wrap: pretty` where supported.
- Korean copy is never forced into character-by-character breaks. Containers may grow vertically on narrow screens.

## 4. Spacing & Layout

All intentional spacing derives from a 4px base.

| Token | Value | Usage |
|---|---:|---|
| `--space-1` | `4px` | Hairline offsets and icon gaps |
| `--space-2` | `8px` | Tight label groups |
| `--space-3` | `12px` | Compact rows |
| `--space-4` | `16px` | Standard inner padding |
| `--space-5` | `20px` | Image and copy gaps |
| `--space-6` | `24px` | Section padding |
| `--space-8` | `32px` | Page margins and major gaps |
| `--space-10` | `40px` | Title-to-content breathing room |
| `--space-12` | `48px` | Cover and index rhythm |
| `--space-16` | `64px` | Large editorial breaks |

### Page geometry

- Print page: A4, `210mm × 297mm`, with a `10mm` page margin and a `276mm` `.subpage` content height.
- Desktop reading width: the physical A4 page remains the focal object and is centered in the available canvas.
- Mobile reading width: page padding becomes fluid and project columns stack. Mobile is a readable document, not a scaled-down PDF.
- The `.subpage` uses a column flex layout. `.title` is content-sized, `.contents` owns the primary visual field, and `.descBottom` absorbs remaining height. This is required for multi-line Korean and project titles.

## 5. Components

### Screen chrome

- **Structure:** `header.site-chrome` with a brand mark, section label, and index link.
- **Variants:** desktop rail, compact mobile bar, print-hidden.
- **States:** default, hover, active, focus-visible.
- **Accessibility:** semantic landmark, real links, visible keyboard focus.
- **Motion:** opacity/transform only, 180ms.

### Page frame

- **Structure:** `.page > .subpage > title / contents / descBottom / pageIndicator`.
- **Variants:** cover, index, project, text-only project, project group, history.
- **Spacing:** page and section spacing tokens; A4 dimensions are print mechanics.
- **States:** reading, print.
- **Accessibility:** one document landmark per page variant; page indicators are supplementary.
- **Motion:** none; the page is a stable reading unit.

### Index row

- **Structure:** keyboard-focusable `button.index-row` with a project title and ordinal.
- **Variants:** project, subproject, active.
- **States:** default, hover, active, focus-visible.
- **Accessibility:** real button target scrolls to an element with the matching id; no pointer-only navigation.
- **Motion:** transform/opacity only, 180ms.

### Media trigger

- **Structure:** keyboard-focusable button with `data-img`, background image, and caption metadata.
- **Variants:** hero image, group tile, screenshot tile, history image.
- **States:** default, hover, active, focus-visible, unavailable.
- **Accessibility:** descriptive `aria-label`; image is an inspection affordance, not the only source of project meaning.
- **Motion:** image scale and outline opacity only, 220ms; disabled for reduced motion.

### Project information block

- **Structure:** image/description split, technical note block, description block, optional screenshot rail.
- **Variants:** with hero image, text-only, group with child projects.
- **States:** normal and narrow-screen stacked layout.
- **Accessibility:** prose remains selectable, readable, and in DOM order; links retain their original destinations.
- **Motion:** no entrance animation; preserve reading speed.

### Screenshot rail

- **Structure:** `.screens` flex-wrap rail of `.screen` media triggers.
- **Variants:** 0–4 screenshots, empty slots hidden from assistive tech.
- **States:** default, hover, active, focus-visible.
- **Accessibility:** each screenshot gets an accessible label from its original title/description.
- **Motion:** image scale only on interaction.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | `120ms` | `ease-out` | Focus and rule emphasis |
| Standard | `180ms` | `ease-out` | Index hover and media affordance |
| Lightbox | library-controlled | library default | Existing screenshot inspection |

- Only `transform`, `opacity`, and `outline-color` transition.
- Smooth anchor scrolling is used for index navigation on screen and disabled in print.
- `prefers-reduced-motion: reduce` removes smooth scrolling, media scale transitions, and the existing lightbox spinner animation.

## 7. Depth & Surface

Strategy: mixed. The page itself uses a low-contrast screen-only shadow to read as paper; inside the page, depth comes from tonal shifts and hairline rules instead of nested floating cards. Image wells are quiet paper tones, not decorative cards. The accent is a state signal rather than a glow.

| Level | Token | Value | Usage |
|---|---|---|---|
| Page shadow | `--shadow-page` | `0 16px 40px rgba(23, 26, 24, 0.14)` | Screen-only A4 frame |
| Image shadow | `--shadow-image` | `0 8px 20px rgba(23, 26, 24, 0.12)` | Interactive image lift |
| Hairline | `--rule-hairline` | `1px solid var(--color-rule)` | Internal separation |

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA target: 4.5:1 for body text, 3:1 for large text and UI boundaries.
- Every index and image action is keyboard reachable with a visible `:focus-visible` treatment.
- Korean copy keeps natural word wrapping and never relies on image text for meaning.
- Print keeps all project copy and images; screen-only navigation is hidden from print.
- Reduced-motion users receive no smooth-scroll or scale transition.
- No new private or internal product screenshots may be added.

### Accepted debt

| Item | Location | Why accepted | Exit |
|---|---|---|---|
| External lightbox library remains jQuery-based | `js/`, `index.html` | Existing capture inspection behavior is preserved during a vanilla redesign | Replace only if a later task changes the interaction contract |
| Source project images remain PNG | `projects/` | User explicitly asked to preserve existing capture images | Optimize only in a separate asset-migration task |
