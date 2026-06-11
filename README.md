# Medical Quotation Tool

Automated quotation system for SGS Medical Device certification services.

## Current Focus

The **Client Form** — the front-end interface that collects client data — is largely built. Conditional logic, device templates (EU MDR, EU IVDR, UK MDR, UK IVDR), and the summary panel are functional. The next steps are:

1. **Complete the Client Form** — populate placeholder dropdowns, add missing template fields, implement form validation
2. **JSON data export** — implement `collectFormData()` to serialize the form state for the calculation engine (see `docs/client_form.md`)
3. **Calculation engine** — wire the business rules from `spec/` into `engine.js`

## Project Structure

```
medical-quotation-tool/
├── spec/                            ← Business rules (YAML) — not in this phase
│   ├── quotation-tool.yaml          ← Orchestrator
│   ├── module_I_tda.yaml
│   ├── module_II_sampling.yaml
│   ├── module_III_audit.yaml
│   ├── module_IV_linking_I_II.yaml
│   └── module_V_quotation.yaml
├── docs/                            ← Technical documentation
│   ├── README.md                    ← Index
│   ├── architecture.md
│   ├── data_flow.md
│   ├── calculation_overview.md
│   ├── client_form.md               ← ✅ Done
│   ├── module_I_tda.md
│   ├── module_II_sampling.md
│   ├── module_III_audit.md
│   ├── module_IV_linking.md
│   └── module_V_quotation.md
└── mock/                            ← Browser-based prototype
    ├── index.html                    ← ✅ Form layout + templates
    ├── style.css                     ← ✅ Styles
    ├── form.js                       ← ✅ Conditional logic — needs completion
    ├── engine.js                     ← Stub
    └── app.js                        ← Stub
```

## Reference Documents

- [Medical Services tool Parameters collection.xlsx](https://sgs-my.sharepoint.com/:x:/r/personal/aina_herasparets_sgs_com/_layouts/15/Doc.aspx?sourcedoc=%7BF4078D1C-20B4-42B3-8EE9-573355D077CE%7D&file=Medical%20Services%20tool%20Parameters%20collection.xlsx&action=default&mobileredirect=true) — Full calculation rules (SharePoint, internal access only)

## How to Run

Open `mock/index.html` in any browser. No server required.
Or just click here: https://mariateresalinsa.github.io/medical-quotation-tool/mock/

## Documentation

The full technical documentation for the Client Form is in [`docs/client_form.md`](docs/client_form.md).
