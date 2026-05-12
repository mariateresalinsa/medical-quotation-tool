/* ============================================================
   form.js — Conditional logic faithful to Client_Form.xlsx
   
   TABLE 1: Baseline (B.001–B.012)
   TABLE 2: EU MDR (#2.xxx) — sub-tables by classification
   TABLE 3: EU IVDR (#3.xxx) — sub-tables by classification
   TABLE 4: UK MDR (#4.xxx) — sub-tables by classification
   TABLE 5: UK IVDR (#5.xxx)
   ============================================================ */

var deviceCounts = { mdr: 0, ivdr: 0, ukmdr: 0, ukivdr: 0 };
var siteCount = 0;
var WARN_AT = 5;
var MAX_DEVICES = 10;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function toggle(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

function selected() {
    return Array.from(document.querySelectorAll('input[name="standards"]:checked'))
        .map(function(cb) { return cb.value; });
}

/* ═══════════════════════════════════════════
   LEVEL 1: Standards → sections
   ═══════════════════════════════════════════ */

function updateSections() {
    var s = selected();
    var hasAny   = s.length > 0;
    var hasISO   = s.indexOf('iso_13485') !== -1;
    var hasIVDR  = s.indexOf('eu_ivdr') !== -1;
    var hasMDR   = s.indexOf('eu_mdr') !== -1;
    var hasUKMDR = s.indexOf('uk_mdr') !== -1;
    var hasUKIVDR = s.indexOf('uk_ivdr') !== -1;
    var hasReg   = hasIVDR || hasMDR || hasUKMDR || hasUKIVDR;

    toggle('baseline-section',  hasAny);
    toggle('facilities-section', hasAny);
    toggle('field-b008',        hasISO && hasReg);
    toggle('field-b004-install', hasISO);
    toggle('field-b009',        hasReg);
    toggle('field-b011',        hasReg);
    toggle('field-b012',        hasReg);
    toggle('eu-mdr-section',    hasMDR);
    toggle('eu-ivdr-section',   hasIVDR);
    toggle('uk-mdr-section',    hasUKMDR);
    toggle('uk-ivdr-section',   hasUKIVDR);

    if (!(hasISO && hasReg)) toggle('field-b008-count', false);
    updateAIFields();
    updateInnovativeFields();
}

/* ═══════════════════════════════════════════
   CROSS-DEVICE: B.011 AI, B.012 Innovative
   ═══════════════════════════════════════════ */

function updateAIFields() {
    var show = document.getElementById('b011').value === 'yes';
    document.querySelectorAll('.ai-field').forEach(function(el) {
        el.classList.toggle('hidden', !show);
    });
}

function updateInnovativeFields() {
    var show = document.getElementById('b012').value === 'yes';
    document.querySelectorAll('.innovative-field').forEach(function(el) {
        el.classList.toggle('hidden', !show);
    });
}

/* ═══════════════════════════════════════════
   SITES: add / remove / renumber
   ═══════════════════════════════════════════ */

function addSite() {
    siteCount++;
    var template = document.getElementById('site-template');
    var clone = template.content.cloneNode(true);
    clone.querySelector('.site-num').textContent = siteCount;
    var container = document.getElementById('sites-container');
    container.appendChild(clone);
    // Attach accordion to new site
    var cards = container.querySelectorAll('.site-card');
    var last = cards[cards.length - 1];
    last.querySelector('.accordion-toggle').addEventListener('click', function() {
        toggleAccordion(this);
    });
}

function removeSite(btn) {
    btn.closest('.site-card').remove();
    siteCount--;
    renumberItems('sites-container', '.site-card', '.site-num', 'Site');
}

/* ═══════════════════════════════════════════
   DEVICES: add / remove / renumber / limits
   ═══════════════════════════════════════════ */

function addDevice(scheme) {
    if (deviceCounts[scheme] >= MAX_DEVICES) return;
    deviceCounts[scheme]++;

    var template = document.getElementById(scheme + '-device-template');
    var clone = template.content.cloneNode(true);
    clone.querySelector('.device-num').textContent = deviceCounts[scheme];

    var container = document.getElementById(scheme + '-devices-container');
    container.appendChild(clone);

    // Attach accordion
    var cards = container.querySelectorAll('.device-card');
    var last = cards[cards.length - 1];
    last.querySelector('.accordion-toggle').addEventListener('click', function() {
        toggleAccordion(this);
    });

    updateAIFields();
    updateInnovativeFields();
    checkThresholds(scheme);
}

function removeDevice(btn) {
    var card = btn.closest('.device-card');
    var scheme = card.getAttribute('data-scheme');
    card.remove();
    deviceCounts[scheme]--;

    var schemeName = { mdr: 'MDR', ivdr: 'IVDR', ukmdr: 'UK MDR', ukivdr: 'UK IVDR' }[scheme];
    renumberItems(scheme + '-devices-container', '.device-card', '.device-num', schemeName + ' Device');
    checkThresholds(scheme);
}

function renumberItems(containerId, cardSelector, numSelector, prefix) {
    var cards = document.getElementById(containerId).querySelectorAll(cardSelector);
    cards.forEach(function(card, i) {
        card.querySelector(numSelector).textContent = i + 1;
    });
}

function checkThresholds(scheme) {
    var count = deviceCounts[scheme];
    console.log('checkThresholds:', scheme, 'count:', count);
    
    var warningEl = document.getElementById(scheme + '-warning');
    var limitEl = document.getElementById(scheme + '-limit');
    var btn = document.getElementById(scheme + '-add-btn');
    
    if (warningEl) warningEl.classList.toggle('hidden', !(count >= WARN_AT && count < MAX_DEVICES));
    if (limitEl) limitEl.classList.toggle('hidden', !(count >= MAX_DEVICES));
    if (btn) btn.disabled = count >= MAX_DEVICES;
}

/* ═══════════════════════════════════════════
   DEVICE CLASSIFICATION → field blocks
   ═══════════════════════════════════════════ */

function updateDeviceClass(selectEl) {
    var card = selectEl.closest('.device-card');
    var cls = selectEl.value;
    card.querySelectorAll('.classification-block').forEach(function(block) {
        block.classList.add('hidden');
    });
    if (cls) {
        var target = card.querySelector('[data-class="' + cls + '"]');
        if (target) target.classList.remove('hidden');
    }
}

/* ═══════════════════════════════════════════
   MDS CHECKBOXES → conditional blocks
   ═══════════════════════════════════════════ */

function toggleMDS(checkbox) {
    var card = checkbox.closest('.device-card');
    var mdsCode = checkbox.getAttribute('data-mds');
    var visibleBlock = card.querySelector('.classification-block:not(.hidden)');
    if (!visibleBlock) return;

    visibleBlock.querySelectorAll('[data-condition="mds-' + mdsCode + '"]').forEach(function(el) {
        el.classList.toggle('hidden', !checkbox.checked);
    });
}

/* ═══════════════════════════════════════════
   MDN/MDA CODE → conditional (Class IIa)
   ═══════════════════════════════════════════ */

function updateMDNCode(selectEl) {
    var card = selectEl.closest('.device-card');
    var block = card.querySelector('[data-class="IIa"]');
    if (!block) return;
    block.querySelectorAll('[data-condition^="mdn-"]').forEach(function(el) {
        el.classList.add('hidden');
    });
    if (selectEl.value) {
        var target = block.querySelector('[data-condition="mdn-' + selectEl.value + '"]');
        if (target) target.classList.remove('hidden');
    }
}

/* ═══════════════════════════════════════════
   IVR CODE → sterility (IVDR)
   ═══════════════════════════════════════════ */

function toggleIVR(selectEl) {
    var card = selectEl.closest('.device-card');
    var visibleBlock = card.querySelector('.classification-block:not(.hidden)');
    if (!visibleBlock) return;
    var sterility = visibleBlock.querySelector('[data-condition="ivr-sterility"]');
    if (sterility) sterility.classList.toggle('hidden', selectEl.value !== 'IVS1005');
}

/* ═══════════════════════════════════════════
   ACCORDION
   ═══════════════════════════════════════════ */

function toggleAccordion(header) {
    var body = header.nextElementSibling;
    while (body && !body.classList.contains('accordion-body')) {
        body = body.nextElementSibling;
    }
    if (!body) return;
    var icon = header.querySelector('.accordion-icon');
    if (body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        if (icon) icon.textContent = '▼';
    } else {
        body.classList.add('hidden');
        if (icon) icon.textContent = '►';
    }
}

/* ═══════════════════════════════════════════
   BACK TO TOP
   ═══════════════════════════════════════════ */

window.addEventListener('scroll', function() {
    toggle('back-to-top', window.scrollY > 300);
});

/* ═══════════════════════════════════════════
   COUNTRY LIST (B.002)
   ═══════════════════════════════════════════ */

function populateCountries() {
    var countries = [
        "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria",
        "Bangladesh","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria",
        "Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia",
        "Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia",
        "Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala",
        "Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq",
        "Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait",
        "Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Malta","Mexico",
        "Moldova","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Nepal",
        "Netherlands","New Zealand","Nigeria","North Macedonia","Norway","Oman",
        "Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
        "Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia",
        "Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
        "Taiwan","Tanzania","Thailand","Tunisia","Turkey","UAE","Uganda","Ukraine",
        "United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam"
    ];
    var select = document.getElementById('b002');
    countries.forEach(function(c) {
        var opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

    populateCountries();

    // Standards → sections
    document.querySelectorAll('input[name="standards"]').forEach(function(cb) {
        cb.addEventListener('change', updateSections);
    });

    // B.008 → count
    document.getElementById('b008').addEventListener('change', function() {
        toggle('field-b008-count', this.value === 'no');
    });

    // B.011 AI → device AI fields
    document.getElementById('b011').addEventListener('change', updateAIFields);

    // B.012 Innovative → device innovative fields
    document.getElementById('b012').addEventListener('change', updateInnovativeFields);






    // Add first site by default
    addSite();
 


}

);
function openCountryModal() {
    var country = document.getElementById('b002').value;

    var text = "Please contact your Designated Operative.";

    if (country === "Italy") {
        text = "Contact: it.support@sgs.com";
    } else if (country === "Germany") {
        text = "Contact: de.support@sgs.com";
    } else if (country === "United States") {
        text = "Contact: us.support@sgs.com";
    }

    document.getElementById('contact-text').innerText = text;
    document.getElementById('country-help-modal').classList.remove('hidden');
}

function closeCountryModal() {
    document.getElementById('country-help-modal').classList.add('hidden');
}
