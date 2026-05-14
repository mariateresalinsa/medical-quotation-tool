/* ============================================================
   form.js — Fixed rules: sub-options control sections
   Rule: parent checkbox shows sub-options,
         sub-options (annex/article) show device sections + baseline fields
   ============================================================ */

var deviceCounts = { mdr: 0, ivdr: 0, ukmdr: 0, ukivdr: 0 };
var siteCount = 0;
var WARN_AT = 5;
var MAX_DEVICES = 10;

function toggle(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

function selected() {
    return Array.from(document.querySelectorAll('input[name="standards"]:checked'))
        .map(cb => cb.value);
}

/* =========================
   CHECK IF ANY SUB-OPTION IS SELECTED
   ========================= */

function hasAnySub(name) {
    return document.querySelectorAll('input[name="' + name + '"]:checked').length > 0;
}

function getArticles() {
    return {
        article16: document.getElementById('article16')?.checked || false,
        article22: document.getElementById('article22')?.checked || false,
        article117: document.getElementById('article117')?.checked || false,
        article16ivd: document.getElementById('article16ivd')?.checked || false
    };
}

/* =========================
   RULES
   ========================= */

function getRules() {
    var s = selected();
    var arts = getArticles();

    // Parent checkboxes
    var hasMDR = s.includes('eu_mdr');
    var hasIVDR = s.includes('eu_ivdr');
    var hasUKMDR = s.includes('uk_mdr');
    var hasUKIVDR = s.includes('uk_ivdr');
    var hasISO = s.includes('iso_13485');
    var hasAny = s.length > 0;

    // Sub-options selected (annex/article)
    var hasMDRSub = hasAnySub('eu_mdr_sub');
    var hasIVDRSub = hasAnySub('eu_ivdr_sub');
    var hasUKMDRSub = hasAnySub('uk_mdr_sub');

    // "Active" means parent checked AND at least one sub-option selected
    var mdrActive = hasMDR && hasMDRSub;
    var ivdrActive = hasIVDR && hasIVDRSub;
    var ukmdrActive = hasUKMDR && hasUKMDRSub;

    // Any regulation is active (has sub-option selected)
    var hasActiveReg = mdrActive || ivdrActive || ukmdrActive || hasUKIVDR;


    // MDR annexes
var hasMDRAnnex =
    document.querySelector('input[name="eu_mdr_sub"][value="annex_ix_123"]:checked') ||
    document.querySelector('input[name="eu_mdr_sub"][value="annex_ix_45"]:checked') ||
    document.querySelector('input[name="eu_mdr_sub"][value="annex_xi_a"]:checked') ||
    document.querySelector('input[name="eu_mdr_sub"][value="article_117"]:checked');

// IVDR annexes (future-proof)
var hasIVDRAnnex = 
    document.querySelector('input[name="eu_ivdr_sub"][value="annex_ix_123"]:checked') ||
    document.querySelector('input[name="eu_ivdr_sub"][value="annex_ix_45"]:checked') ||
    document.querySelector('input[name="eu_ivdr_sub"][value="annex_xi_a"]:checked');


// Hide baseline fields for article-only selections
var onlyArticles =
    (
        (arts.article16 || arts.article22) &&
        !hasMDRAnnex
    ) ||
    (
        arts.article16ivd &&
        !hasIVDRAnnex
    );

    return {
        hasAny, hasISO, hasMDR, hasIVDR, hasUKMDR, hasUKIVDR,
        hasMDRSub, hasIVDRSub, hasUKMDRSub,
        mdrActive, ivdrActive, ukmdrActive,
        hasActiveReg, onlyArticles,
        ...arts
    };
}

/* =========================
   MAIN UPDATE
   ========================= */

function updateSections() {
    var r = getRules();

    // Sub-options: show when parent is checked
    toggle('eu-mdr-suboptions', r.hasMDR);
    toggle('eu-ivdr-suboptions', r.hasIVDR);
    toggle('uk-mdr-suboptions', r.hasUKMDR);

    // Baseline + Facilities: any standard selected
    toggle('baseline-section', r.hasAny);
    toggle('facilities-section', r.hasAny);

    // ISO-specific
    toggle('field-b008', r.hasISO && r.hasActiveReg);
    toggle('field-b004-install', r.hasISO);
    toggle('field-b008-count', r.hasISO && r.hasActiveReg);

    // Table 1.3: B.009, B.011, B.012 — only if active reg AND not only articles
    toggle('field-b009', r.hasActiveReg && !r.onlyArticles);
    toggle('field-b011', r.hasActiveReg && !r.onlyArticles);
    toggle('field-b012', r.hasActiveReg && !r.onlyArticles);

    // Table 1.4: B.013 — only if EU MDR active, not article 16/22/117 only
    var showB013 = r.mdrActive && !r.article16 && !r.article22 && !r.article117;
    toggle('field-b013', showB013);

    // Device sections: show only when sub-option is selected
    toggle('eu-mdr-section', r.mdrActive);
    toggle('eu-ivdr-section', r.ivdrActive);
    toggle('uk-mdr-section', r.ukmdrActive);
    toggle('uk-ivdr-section', r.hasUKIVDR);

    // Personal details + final
    toggle('personal-details-section', r.hasAny);

    updateAIFields();
    updateInnovativeFields();
    updateB013Fields();
    updateSummary();
}

/* =========================
   AI / INNOVATION / B013
   ========================= */

function updateAIFields() {
    var show = document.getElementById('b011')?.value === 'yes';
    document.querySelectorAll('.ai-field').forEach(el => el.classList.toggle('hidden', !show));
}

function updateInnovativeFields() {
    var show = document.getElementById('b012')?.value === 'yes';
    document.querySelectorAll('.innovative-field').forEach(el => el.classList.toggle('hidden', !show));
}

function updateB013Fields() {
    var b013 = document.getElementById('b013');
    var show = b013 && b013.checked;
    document.querySelectorAll('.b013-field').forEach(el => el.classList.toggle('hidden', !show));
}

/* =========================
   CLASSIFICATION
   ========================= */

function updateDeviceClass(selectEl) {
    var card = selectEl.closest('.device-card');
    var cls = selectEl.value;
    card.querySelectorAll('.classification-block').forEach(block => block.classList.add('hidden'));
    if (cls) {
        var target = card.querySelector('[data-class="' + cls + '"]');
        if (target) target.classList.remove('hidden');
    }
    updateSummary();
}

/* =========================
   MDS / MDN / IVS / IVR
   ========================= */

function toggleMDS(checkbox) {
    var card = checkbox.closest('.device-card');
    var mdsCode = checkbox.getAttribute('data-mds');
    var block = card.querySelector('.classification-block:not(.hidden)');
    if (!block) return;
    block.querySelectorAll('[data-condition="mds-' + mdsCode + '"]').forEach(el => el.classList.toggle('hidden', !checkbox.checked));
}

function updateMDNCode(selectEl) {
    var card = selectEl.closest('.device-card');
    var block = card.querySelector('[data-class="IIa"]');
    if (!block) return;
    block.querySelectorAll('[data-condition^="mdn-"]').forEach(el => el.classList.add('hidden'));
    if (selectEl.value) {
        var target = block.querySelector('[data-condition="mdn-' + selectEl.value + '"]');
        if (target) target.classList.remove('hidden');
    }
}

function toggleIVS1005(checkbox) {
    var card = checkbox.closest('.device-card');
    var block = card.querySelector('.classification-block:not(.hidden)');
    if (!block) return;
    var s = block.querySelector('[data-condition="ivs-1005"]');
    if (s) s.classList.toggle('hidden', !checkbox.checked);
}

function toggleIVR(selectEl) { /* kept for compatibility */ }

/* =========================
   STERILIZATION
   ========================= */

function addSterilizationMethod(btn) {
    var container = btn.previousElementSibling;
    while (container && !container.classList.contains('sterilization-methods-container')) container = container.previousElementSibling;
    if (!container) return;
    var template = document.getElementById('sterilization-method-template');
    container.appendChild(template.content.cloneNode(true));
}

function removeSterilizationMethod(btn) {
    var card = btn.closest('.sterilization-method-card');
    var container = card.parentElement;
    if (container.querySelectorAll('.sterilization-method-card').length > 1) card.remove();
}

/* =========================
   SITES
   ========================= */

function addSite() {
    siteCount++;
    var clone = document.getElementById('site-template').content.cloneNode(true);
    clone.querySelector('.site-num').textContent = siteCount;
    document.getElementById('sites-container').appendChild(clone);
    var cards = document.getElementById('sites-container').querySelectorAll('.site-card');
    cards[cards.length - 1].querySelector('.accordion-toggle').addEventListener('click', function() { toggleAccordion(this); });
    updateSummary();
}

function removeSite(btn) {
    btn.closest('.site-card').remove();
    siteCount--;
    renumberItems('sites-container', '.site-card', '.site-num');
    updateSummary();
}

/* =========================
   DEVICES
   ========================= */

function addDevice(scheme) {
    if (deviceCounts[scheme] >= MAX_DEVICES) return;
    deviceCounts[scheme]++;
    var clone = document.getElementById(scheme + '-device-template').content.cloneNode(true);
    clone.querySelector('.device-num').textContent = deviceCounts[scheme];
    document.getElementById(scheme + '-devices-container').appendChild(clone);
    var cards = document.getElementById(scheme + '-devices-container').querySelectorAll('.device-card');
    cards[cards.length - 1].querySelector('.accordion-toggle').addEventListener('click', function() { toggleAccordion(this); });
    updateAIFields();
    updateInnovativeFields();
    updateB013Fields();
    checkThresholds(scheme);
    updateSummary();
}

function removeDevice(btn) {
    var card = btn.closest('.device-card');
    var scheme = card.getAttribute('data-scheme');
    card.remove();
    deviceCounts[scheme]--;
    renumberItems(scheme + '-devices-container', '.device-card', '.device-num');
    checkThresholds(scheme);
    updateSummary();
}

function renumberItems(containerId, cardSelector, numSelector) {
    document.getElementById(containerId).querySelectorAll(cardSelector).forEach((card, i) => {
        card.querySelector(numSelector).textContent = i + 1;
    });
}

function checkThresholds(scheme) {
    var count = deviceCounts[scheme];
    var w = document.getElementById(scheme + '-warning');
    var l = document.getElementById(scheme + '-limit');
    var b = document.getElementById(scheme + '-add-btn');
    if (w) w.classList.toggle('hidden', !(count >= WARN_AT && count < MAX_DEVICES));
    if (l) l.classList.toggle('hidden', !(count >= MAX_DEVICES));
    if (b) b.disabled = count >= MAX_DEVICES;
}

/* =========================
   ACCORDION
   ========================= */

function toggleAccordion(header) {
    var body = header.parentElement.querySelector('.accordion-body');
    if (!body) return;
    var icon = header.querySelector('.accordion-icon');
    body.classList.contains('hidden') ? (body.classList.remove('hidden'), icon && (icon.textContent = '▼')) : (body.classList.add('hidden'), icon && (icon.textContent = '►'));
}

/* =========================
   MODAL
   ========================= */

function openModal() { document.getElementById('disclosure-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeModal() { document.getElementById('disclosure-modal').classList.add('hidden'); document.body.style.overflow = ''; }

/* =========================
   SUMMARY
   ========================= */

function updateSummary() {
    var html = '';
    var standards = [];
    document.querySelectorAll('input[name="standards"]:checked').forEach(cb => {
        var t = cb.parentElement.textContent.trim();
        if (t.includes('ISO')) standards.push('ISO 13485');
        else if (t.includes('2017/745')) standards.push('EU MDR');
        else if (t.includes('2017/746')) standards.push('EU IVDR');
        else if (t.includes('UK MDR 2002')) standards.push('UK MDR');
        else if (t.includes('Part IV')) standards.push('UK IVDR');
    });
    if (standards.length) {

    var standardDetails = [];

    // EU MDR
    if (document.querySelector('input[value="eu_mdr"]:checked')) {

        var mdrSubs = [];

        document.querySelectorAll('input[name="eu_mdr_sub"]:checked').forEach(cb => {
            mdrSubs.push(cb.parentElement.textContent.trim());
        });

        standardDetails.push(
            'EU MDR' +
            (mdrSubs.length
                ? ' → ' + mdrSubs.join(', ')
                : '')
        );
    }

    // EU IVDR
    if (document.querySelector('input[value="eu_ivdr"]:checked')) {

        var ivdrSubs = [];

        document.querySelectorAll('input[name="eu_ivdr_sub"]:checked').forEach(cb => {
            ivdrSubs.push(cb.parentElement.textContent.trim());
        });

        standardDetails.push(
            'EU IVDR' +
            (ivdrSubs.length
                ? ' → ' + ivdrSubs.join(', ')
                : '')
        );
    }

    // UK MDR
    if (document.querySelector('input[value="uk_mdr"]:checked')) {

        var ukSubs = [];

        document.querySelectorAll('input[name="uk_mdr_sub"]:checked').forEach(cb => {
            ukSubs.push(cb.parentElement.textContent.trim());
        });

        standardDetails.push(
            'UK MDR' +
            (ukSubs.length
                ? ' → ' + ukSubs.join(', ')
                : '')
        );
    }

    // ISO
    if (document.querySelector('input[value="iso_13485"]:checked')) {
        standardDetails.push('ISO 13485');
    }

    // UK IVDR
    if (document.querySelector('input[value="uk_ivdr"]:checked')) {
        standardDetails.push('UK IVDR');
    }

    html +=
        '<div class="summary-section">' +
        '<strong>Standards:</strong>' +
        '<ul>' +
        standardDetails.map(s => '<li>' + s + '</li>').join('') +
        '</ul>' +
        '</div>';
}
    if (siteCount > 0) html += '<div class="summary-section"><strong>Sites:</strong> ' + siteCount + '</div>';

    var names = { mdr: 'EU MDR', ivdr: 'EU IVDR', ukmdr: 'UK MDR', ukivdr: 'UK IVDR' };
    Object.keys(deviceCounts).forEach(scheme => {
        if (deviceCounts[scheme] > 0) {
            var devs = [];
            document.querySelectorAll('#' + scheme + '-devices-container .device-card').forEach(card => {
                var n = card.querySelector('input[type="text"]');
                var c = card.querySelector('.device-class-select');
                var name = n && n.value ? n.value : 'Unnamed';
                var cls = c && c.value ? c.selectedOptions[0].text : '';
                devs.push(name + (cls ? ' (' + cls + ')' : ''));
            });
            html += '<div class="summary-section"><strong>' + names[scheme] + ' Devices:</strong><ul>' + devs.map(d => '<li>' + d + '</li>').join('') + '</ul></div>';
        }
    });

    var el = document.getElementById('summary-content');
    if (el) el.innerHTML = html || '<p class="summary-empty">No selections yet</p>';
}

/* =========================
   BACK TO TOP
   ========================= */

window.addEventListener('scroll', () => toggle('back-to-top', window.scrollY > 300));

/* =========================
   COUNTRY LIST
   ========================= */

function populateCountries() {
    var countries = ["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Bangladesh","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Malta","Mexico","Moldova","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Nepal","Netherlands","New Zealand","Nigeria","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Tanzania","Thailand","Tunisia","Turkey","UAE","Uganda","Ukraine","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam"];
    var select = document.getElementById('b002');
    countries.forEach(c => { var o = document.createElement('option'); o.value = c; o.textContent = c; select.appendChild(o); });
}

/* =========================
   LIVE UPDATE
   ========================= */

document.addEventListener('input', e => { if (e.target.closest('.device-card')) updateSummary(); });

/* =========================
   INIT
   ========================= */

document.addEventListener('DOMContentLoaded', function() {
    populateCountries();

    // All standard checkboxes
    document.querySelectorAll('input[name="standards"]').forEach(cb => cb.addEventListener('change', updateSections));

    // All sub-option checkboxes
    document.querySelectorAll('input[name="eu_mdr_sub"], input[name="eu_ivdr_sub"], input[name="uk_mdr_sub"]').forEach(cb => cb.addEventListener('change', updateSections));

    document.getElementById('b008')?.addEventListener('change', function() { toggle('field-b008-count', this.value === 'no'); });
    document.getElementById('b011')?.addEventListener('change', updateAIFields);
    document.getElementById('b012')?.addEventListener('change', updateInnovativeFields);
    document.getElementById('b013')?.addEventListener('change', updateB013Fields);

    // Modal
    document.getElementById('disclosure-modal')?.addEventListener('click', function(e) { if (e.target === this) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    addSite();
    updateSections();
    updateSummary();
});