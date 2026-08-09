# Write-up: FieldQuote

## Run locally

The frontend requires Node.js 22.6 or newer. From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL after startup. Before shipping a change, run `npm test`, `npm run lint`,
and `npm run build`; the current submission passes all three checks, including 26 focused tests.

## What I built

A mobile-first, single-page estimate tool (`frontend/`, React + TypeScript + Vite) a tech can run
on their phone at the job site. It uses an intentionally focused 10-screen wizard, grouped into
four stages:

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

A sticky bottom bar shows labor, parts, and the running total throughout the wizard, so the number
the customer cares about is visible while the estimate is being built. The 10 screens keep lookup,
contact, property, labor, equipment, and review decisions focused; property size, system type, and
age share one screen, and notes live only on Review.

## Why these choices

- **No application backend.** The three supplied JSON files are bundled into the app at build time,
  so customer lookup, pricing, drafts, and estimates do not depend on a custom server. The only
  optional external lookup is address autocomplete; manual address entry continues to work when
  that service is unavailable. A production version should use an authenticated API so pricing and
  rates can be updated without a redeploy (see below).
- **LA-biased address autocomplete.** After three characters, the street field makes a debounced
  request to Photon's OpenStreetMap geocoder, restricted to the greater Los Angeles area. Selecting
  a result fills street, city, state, and ZIP while leaving every field editable. The public endpoint
  is suitable for this low-volume prototype; production should use a contracted or self-hosted
  provider with an explicit availability and privacy policy.
- **Refresh-safe drafts.** The in-progress estimate is saved to `localStorage` after each change,
  including the current screen, customer details, labor choices, equipment quantities, notes, and
  estimate ID. An accidental refresh or brief browser closure no longer loses field work.
- **Future customer lookup on this device.** Reaching Review automatically upserts the customer
  into a separate local saved-customer list using phone/address matching, so a new customer appears
  in the next lookup without duplicating the bundled JSON records. A production, multi-technician
  version should replace this device-local store with an authenticated database/API.
- **Reopenable estimate history.** The 20 most recent completed estimates are stored separately
  from the active draft and shown on the start screen. A technician can reopen an estimate without
  rebuilding it; production would sync this history through the same authenticated API.
- **Data normalization layer (`lib/normalize.ts`).** The three files use inconsistent keys in a
  few records (`propertyType` vs `property_type`, `squareFootage` vs `sqft`, `baseCost` vs
  `base_cost`) — the README calls this out as "real-ish" data. Rather than hand-editing the source
  files (which hides the problem instead of solving it), I normalize on read so every consumer
  downstream gets one consistent shape, and the raw files stay an honest copy of what was given.
- **I didn't invent a pricing formula.** It'd be easy to make up a "$X per sq ft" or
  tonnage-by-square-footage rule, but nothing in the data backs that, and a wrong made-up formula
  is worse than no formula — it would quietly misprice real jobs. System type, age, job type, and
  level now produce "suggested items to inspect" with a clear warning that they are not a diagnosis
  or matched-system design. Capacity, AHRI compatibility, electrical requirements, and sizing must
  be confirmed. A real sizing calculation (e.g. Manual J) remains a next step.
- **Simple estimated tax.** Review shows labor, equipment, one automatic estimated-tax line, and
  the final total. Tax is estimated on the full subtotal from known city rates with a clearly labeled
  state-base fallback; unsupported locations report tax unavailable rather than inventing a rate. No separate transportation fee
  is added because routine local travel is normally covered by service/diagnostic pricing.
- **Guided system details.** Editable system-type and age autocompletes use the supplied records
  plus DOE/ENERGY STAR categories and replacement-evaluation guidance. Staff can still record a
  custom value, and age guidance never replaces an on-site condition and safety assessment.
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
- **Cross-device estimate sync.** Device-local history already lets a technician reopen the 20
  most recent estimates in the same browser. Next I'd sync those records through the backend so
  technicians and office staff can revisit them from any authorized device.
- **Business-managed pricing rules**, including approved markup, permit/disposal schedules,
  service-area policy, taxability rules, and address-level tax lookup rather than manual entry.
- **Send the estimate directly to the customer** (email/SMS) instead of relying on the browser
  print dialog, and a signature/approval step to turn an estimate into an accepted job.
- **Broader tests.** Focused unit tests cover inconsistent-field normalization, labor and parts
  calculations, quantity changes, estimate ranges, customer-address parsing, system/age matching,
  recommendations, estimated tax, and saved-customer upserts. With more time I'd add component-level wizard and
  print-layout tests.
