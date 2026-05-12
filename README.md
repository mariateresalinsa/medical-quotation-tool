# Medical Quotation Tool

Automated quotation system for SGS Medical Device certification services.

## Current Focus

We are starting from the **Client Form** — the front-end interface that collects client data. The remaining parts of the system (calculation engine, business rules, technical documentation) will follow progressively.

## Project Structure

```
medical-quotation-tool/
├── spec/                            ← Business rules (YAML) - not in this phase
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
│   ├── client_form.md              ← We are here
│   ├── module_I_tda.md
│   ├── module_II_sampling.md
│   ├── module_III_audit.md
│   ├── module_IV_linking.md
│   └── module_V_quotation.md
└── mock/frontend/                   ← Browser-based prototype - only form for now as .js
    ├── index.html
    ├── style.css
    └── form.js                      ← We are here
    └── engine.js                    ← Stub
    └── app.js                       ← Stub
```

## How to run

Open `mock/index.html` in any browser. No server required.
Or just click on here: https://mariateresalinsa.github.io/medical-quotation-tool/mock/
