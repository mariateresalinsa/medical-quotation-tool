/* ============================================================
   form.js — Conditional logic only
   Based on: Medical_Services_tool_Parameters_collection.xlsx

   RULES:
   - Baseline + Facilities   → ANY standard selected
   - B.003                   → ISO 13485 AND (IVDR or MDR or UKMDR)
   - B.003 count             → B.003 = "No"
   - B.004                   → ISO 13485
   - EU IVDR section         → EU IVDR ticked
   - EU MDR section          → EU MDR ticked
   - UK MDR section          → UK MDR ticked
   - IVDR sterility          → IVR code = IVS 1005
   - MDR block 1001          → MDS 1001 ticked
   - MDR block 1003          → MDS 1003 ticked
   - MDR sterility           → MDS 1005 ticked
   ============================================================ */

function toggle(id, show) {
    document.getElementById(id).classList.toggle('hidden', !show);
}

function selected() {
    return Array.from(document.querySelectorAll('input[name="standards"]:checked'))
        .map(cb => cb.value);
}

function updateSections() {
    const s = selected();
    const hasAny  = s.length > 0;
    const hasISO  = s.includes('iso_13485');
    const hasIVDR = s.includes('eu_ivdr');
    const hasMDR  = s.includes('eu_mdr');
    const hasUKMDR = s.includes('uk_mdr');
    const hasReg  = hasIVDR || hasMDR || hasUKMDR;

    toggle('baseline-section',  hasAny);
    toggle('facilities-section', hasAny);
    toggle('field-b003',        hasISO && hasReg);
    toggle('field-b004',        hasISO);
    toggle('eu-ivdr-section',   hasIVDR);
    toggle('eu-mdr-section',    hasMDR);
    toggle('uk-mdr-section',    hasUKMDR);

    if (!(hasISO && hasReg)) toggle('field-b003-count', false);
}

document.addEventListener('DOMContentLoaded', () => {

    // Standards checkboxes
    document.querySelectorAll('input[name="standards"]').forEach(cb => {
        cb.addEventListener('change', updateSections);
    });

    // B.003 → count
    document.getElementById('b003').addEventListener('change', () => {
        toggle('field-b003-count', document.getElementById('b003').value === 'no');
    });

    // IVDR: IVR code → sterility
    document.getElementById('ivdr-ivr').addEventListener('change', () => {
        toggle('ivdr-sterility', document.getElementById('ivdr-ivr').value === 'IVS1005');
    });

    // MDR: MDS checkboxes → conditional blocks
    document.getElementById('mdr-mds1001').addEventListener('change', function() {
        toggle('mdr-block-1001', this.checked);
    });
    document.getElementById('mdr-mds1003').addEventListener('change', function() {
        toggle('mdr-block-1003', this.checked);
    });
    document.getElementById('mdr-mds1005').addEventListener('change', function() {
        toggle('mdr-sterility', this.checked);
    });
});
