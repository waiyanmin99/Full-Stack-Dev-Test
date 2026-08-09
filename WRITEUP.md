# Write-up: FieldQuote

## What I built

A mobile-first, single-page estimate tool (`frontend/`, React + TypeScript + Vite) a tech can run
on their phone at the job site. It's a 4-step flow:

1. **Customer & property** — search the 10 sample customers by name/address/ID and autofill their
   record, or start blank for a walk-in/new lead. Every field stays editable either way, since
   techs often need to correct an address or update a property's system age on the spot.
2. **Job & labor** — pick job type (diagnostic/repair/install/maintenance/ductwork) and level,
   pulled directly from `labor_rates.json`. Selecting a level shows the hourly rate and the
   min/max hour range from the data, defaulted to the midpoint, with a slider to fine-tune actual
   hours for this job.
3. **Equipment & parts** — search/filter the 30-item catalog by category, add items with a
   quantity stepper. Skippable for labor-only visits.
4. **Review** — a formatted estimate document (ID, date, customer, itemized labor + parts,
   subtotals, total, and a secondary "range if scope shifts" figure) with a print/Save-as-PDF
   button and a notes field, so the tech can hand the customer something that looks finished
   instead of a napkin.

A sticky bottom bar shows the running total and Back/Continue on every step, so the number the
customer cares about is visible the whole time, not just at the end.

## Why these choices

- **No backend.** The brief provided static data and a frontend scaffold, and the whole point is
  speed on-site — a live server round-trip works against that. The three JSON files are bundled
  into the app at build time; if this became a real product, the next move would be an API so
  pricing/rates can be updated without a redeploy (see below).
- **Data normalization layer (`lib/normalize.ts`).** The three files use inconsistent keys in a
  few records (`propertyType` vs `property_type`, `squareFootage` vs `sqft`, `baseCost` vs
  `base_cost`) — the README calls this out as "real-ish" data. Rather than hand-editing the source
  files (which hides the problem instead of solving it), I normalize on read so every consumer
  downstream gets one consistent shape, and the raw files stay an honest copy of what was given.
- **I didn't invent a pricing formula.** It'd be easy to make up a "$X per sq ft" or
  tonnage-by-square-footage rule, but nothing in the data backs that, and a wrong made-up formula
  is worse than no formula — it would quietly misprice real jobs. Square footage, system type, and
  system age are shown as context to help the tech pick the right equipment, not fed into the
  math. A real sizing calculation (e.g. Manual J) is a "what I'd do next" item, not a guess.
  Likewise there's no tax or markup line, since no rate for either was in the data.
- **Step flow instead of one long form.** A single scrolling form with search fields, a labor
  calculator, and a parts catalog is a lot to manage one-handed on a phone with a customer
  standing there. Breaking it into steps with a visible progress bar keeps each screen focused and
  makes the running total feel like it's building up, not just appearing at the end.
- **Design.** Trade-services styling (navy for structure/selection, amber for totals/CTAs),
  system fonts only (no webfont fetch — matters if a job site has weak signal), light/dark mode,
  and print-specific CSS so "Print / Save PDF" produces a clean document instead of the app chrome.

## What I'd do differently with more time

- **A real backend + shared state.** Pricing/rates/catalog living in an API (not bundled JSON)
  so the office can update prices without shipping a new build, and so an estimate started on one
  device could sync to the office or to a CRM.
- **Persist and revisit estimates.** Right now an estimate exists only in memory — closing the
  tab loses it. I'd add local persistence (so a spotty connection or an accidental refresh doesn't
  lose 10 minutes of work) and a history the tech (and office) can look back through.
- **A defensible sizing/pricing rule**, built with actual input from the business (tonnage vs.
  sq ft guidance, commercial vs. residential markup, tax by locality) instead of guessing at one.
- **Send the estimate directly to the customer** (email/SMS) instead of relying on the browser
  print dialog, and a signature/approval step to turn an estimate into an accepted job.
- **Tests.** Given the time box I leaned on TypeScript's types plus manual verification
  (`npm run build`, `npm run lint`, and exercising the flow in the browser) rather than writing a
  test suite; I'd add unit tests for the normalization/calculation logic first since that's where
  a silent bug would be most costly.
