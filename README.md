Medical Quotation Tool
Automated quotation system for SGS Medical Device certification services.
Current Focus
The Client Form — the front-end interface that collects client data — is largely built. Conditional logic, device templates (EU MDR, EU IVDR, UK MDR, UK IVDR), and the summary panel are functional. The next steps are:

Complete the Client Form — populate placeholder dropdowns, add missing template fields, implement form validation;
JSON data export — implement collectFormData() to serialize the form state for the calculation engine (see docs/client_form.md §16.2)
Calculation engine — wire the business rules from spec/ into engine.js

Project Structure
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
├── mock/                            ← Browser-based prototype
│   ├── index.html                    ← ✅ Form layout + templates
│   ├── style.css                     ← ✅ styles
│   ├── form.js                       ← ✅ Conditional logic — needs completion
│   ├── engine.js                     ← Stub
│   └── app.js                        ← Stub
└── Client_Form.xlsx                 ← Source of truth for form fields
How to Run
Open mock/index.html in any browser. No server required.
Live demo: https://mariateresalinsa.github.io/medical-quotation-tool/mock/
Documentation
The full technical documentation for the Client Form is in docs/client_form.md. It covers:

Form architecture and layout
Every field mapped to the Excel spec, with conditions and calculation effects
JavaScript functions reference
Data model (JSON schema) for engine integration
Known bugs and TODOs with priorities
Next steps: form completion + JSON export

