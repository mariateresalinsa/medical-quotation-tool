# Client Form — Technical Documentation

> **Source of truth:**  [Medical Services tool Parameters collection.xlsx](https://sgs-my.sharepoint.com/:x:/r/personal/aina_herasparets_sgs_com/_layouts/15/Doc.aspx?sourcedoc=%7BF4078D1C-20B4-42B3-8EE9-573355D077CE%7D&file=Medical%20Services%20tool%20Parameters%20collection.xlsx&action=default&mobileredirect=true) — Full calculation rules (SharePoint, internal access only)(Client Form Sheet and Drop Downs Sheet)  
> **Files:** `mock/index.html` · `mock/form.js` · `mock/style.css`  
> **Status:** Conditional logic working. Needs completion + JSON export.

---

## Architecture

Pure HTML/CSS/JS — no framework, no build step. Opens in any browser.

The form uses **progressive disclosure**: sections appear/hide based on user selections. All visibility logic runs through one master function (`updateSections()`), which is called on every checkbox/dropdown change. The `hidden` CSS class controls what the user sees.

**Layout:** Two-column — main form on the left, sticky summary panel on the right (stacks on mobile < 900px). A disclosure banner sits at the top with a modal for the full SGS proposal text.

**Dynamic content:** Sites and devices are cloned from `<template>` elements in the HTML. Each device scheme (MDR, IVDR, UK MDR, UK IVDR) has its own template with classification-dependent sub-blocks that show/hide when the user picks a class.

---

## Form Sections

### 1. Select Standards (B.001) — always visible

Five checkboxes: ISO 13485, EU MDR, EU IVDR, UK MDR, UK IVDR. Three of them (EU MDR, EU IVDR, UK MDR) expand sub-option panels with annexes and articles. A scheme is considered **active** only when the parent is checked AND at least one sub-option is selected (UK IVDR has no sub-options, so parent alone is enough).

Key logic: when only article-based sub-options are selected (Article 16, 22, 16ivd) without any annex, certain baseline fields (B.009, B.011, B.012) are hidden.

### 2. Baseline — visible when any standard is selected

Company location (B.002), prior SGS certification (B.003), and conditional fields that depend on which standards are active: ISO-specific questions (B.004-install, B.008), regulation-specific questions (B.009 eIFU, B.011 AI, B.012 innovative, B.013 Article 61(10) for EU MDR only).

B.011 and B.012 have a **global cascading effect**: setting B.011 to "Yes" reveals `.ai-field` elements inside every device card across all schemes. Same for B.012 → `.innovative-field`, and B.013 → `.b013-field`.

### 3. Facilities (B.004–B.007) — visible when any standard is selected

Repeatable cards, one per site. Fields: FTE count, clean rooms, activities, shifts. First site added automatically on page load. Users can add/remove sites.

### 4–7. Device Sections (Tables 2–5)

One section per scheme. Each shows when the scheme is active. Devices are added as cards with an "Add Device" button (warning at 5, hard limit at 10).

Every device card has a **classification dropdown** that reveals the right sub-block:

| Scheme | Template ID | Classifications |
|--------|-------------|-----------------|
| EU MDR | `mdr-device-template` | Class I, IIa, IIb/III, SPP (Art. 22) |
| EU IVDR | `ivdr-device-template` | Class A, B, C |
| UK MDR | `ukmdr-device-template` | Class I, IIa, IIb/III, SPP (Art. 14) |
| UK IVDR | `ukivdr-device-template` | Flat — no sub-blocks |

Within each sub-block, further conditionals: MDS code checkboxes toggle sterility blocks and medicinal/animal substance fields. MDN/MDA code selection (Class IIa) toggles washer/sterilizer-specific fields. Sterility blocks support multiple sterilization methods via cloneable cards.

**Device thresholds:** at 5 devices per scheme a warning suggests downloading an Excel template for bulk entry. At 10 the "Add Device" button is disabled and the user is asked to use the template or contact their Designated Operative.

### 8. Contact Details — visible when any standard is selected

Company name, contact person, email, phone.

---

## Key JS Functions

| Function | What it does |
|----------|-------------|
| `updateSections()` | Master visibility engine — runs on every change |
| `updateDeviceClass(select)` | Shows the right classification block in a device card |
| `toggleMDS(checkbox)` | Shows/hides MDS-conditional fields (sterility, substances) |
| `updateMDNCode(select)` | Shows/hides MDN-conditional fields (Class IIa only) |
| `toggleIVS1005(checkbox)` | Shows/hides IVDR sterility block |
| `addSite()` / `removeSite()` | Site CRUD + renumbering |
| `addDevice(scheme)` / `removeDevice()` | Device CRUD + thresholds |
| `addSterilizationMethod()` | Clones sterilization method card |
| `updateSummary()` | Rebuilds the sidebar summary panel |
| `collectFormData()` | **TODO** — serializes form to JSON (see Next Steps) |

---

## Data Model

When exported, the form produces a JSON with this structure:

```
{
  standards: [...],
  mdr_suboptions: [...],  ivdr_suboptions: [...],  ukmdr_suboptions: [...],
  baseline: { country, tier, prior_qms, install, eifu, ai, innovative, ... },
  sites: [{ fte, cleanrooms, activities, shifts }],
  mdr_devices: [{ name, classification, variants, mda_code, mds_codes, sterility, ... }],
  ivdr_devices: [...],  ukmdr_devices: [...],  ukivdr_devices: [...],
  contact: { company, person, email, phone }
}
```

Full schema with field-by-field mapping is in the codebase comments. Key rules: booleans (not "yes"/"no" strings), numbers (not strings), hidden fields excluded, sterility methods as array.

---

## Known Issues

1. **B.008 count** — shows whenever ISO + regulation is active, instead of only when B.008 = "No". One-line fix in `updateSections()`.
2. **B.006 Activities dropdown** — placeholder options ("TBD"). Needs real values from GPMD 1005.
3. **B.002 Country tiers** — no premium/normal classification yet. Engine needs this.
4. **UK IVDR #5.003** — MDN/MDA dropdown only has "Other".
5. **UK MDR missing device variants field** — present in EU MDR but absent from UK MDR template.

---

## Next Steps

### 1. Complete Client Form

- Fix B.008 count conditional bug
- Populate placeholder dropdowns (B.006 Activities, B.002 tiers, UK IVDR codes)
- Add missing UK MDR device variants field
- Add form validation (required fields, numeric ranges, visual error states)

### 2. JSON Data Export

- Implement `collectFormData()` — walks the DOM, extracts all visible field values
- Add "Export JSON" button — downloads `quotation_data.json`
- Validate before export — block if mandatory fields are empty
- Test with 3 scenarios: ISO-only, MDR+ISO with devices, full portfolio