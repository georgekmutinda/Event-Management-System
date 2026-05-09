/* ═══════════════════════════════════════
   payment.js — Payment Module
   Modal open/close · Method tabs ·
   Form HTML builder · Process stub
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   OPEN / CLOSE
───────────────────────────────────── */

/**
 * Open the payment modal pre-filled with event & amount details.
 * @param {string} eventName - display name of the event
 * @param {string} amount    - formatted amount string e.g. "KES 4,500"
 */
function openPaymentModal(eventName, amount) {  // eslint-disable-line no-unused-vars
  const bodyEl = document.getElementById('payment-modal-body');
  bodyEl.innerHTML = buildPaymentForm(eventName || 'Nairobi Tech Summit 2026', amount || 'KES 4,500');
  document.getElementById('payment-modal').classList.add('open');
}

/**
 * Close the payment modal.
 * @param {MouseEvent|null} e - pass null to close unconditionally;
 *   pass the event to close only when the backdrop is clicked.
 */
function closePaymentModal(e) {  // eslint-disable-line no-unused-vars
  if (!e || e.target === document.getElementById('payment-modal')) {
    document.getElementById('payment-modal').classList.remove('open');
  }
}

/* ─────────────────────────────────────
   METHOD TABS
───────────────────────────────────── */

/**
 * Switch the visible payment method panel.
 * @param {'mpesa'|'card'|'bank'} method
 * @param {HTMLElement} el - the clicked tab button
 */
function switchPayTab(method, el) {  // eslint-disable-line no-unused-vars
  document.querySelectorAll('.pay-method-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pay-method-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('pay-panel-' + method).classList.add('active');
}

/* ─────────────────────────────────────
   PROCESS (stub — wire to API)
───────────────────────────────────── */

/**
 * Process a payment: calls the backend via processPaymentAPI (api.js)
 * which posts to POST /api/payments, then shows a toast.
 * @param {'mpesa'|'card'|'bank'} method
 */
function processPayment(method) {  // eslint-disable-line no-unused-vars
  // Extract amount from the summary box currently rendered in the modal
  const totalEl  = document.querySelector('.pay-summary-total');
  const eventEl  = document.querySelector('.pay-summary-row span:last-child');
  const amount   = totalEl  ? totalEl.textContent.trim()  : 'KES 0';
  const event    = eventEl  ? eventEl.textContent.trim()  : '';

  if (typeof processPaymentAPI === 'function') {
    processPaymentAPI(method, event, amount);
  } else {
    // Fallback if api.js not yet loaded
    closePaymentModal(null);
    const msgs = {
      mpesa: 'M-Pesa payment initiated — check your phone ✦',
      card:  'Card payment processed successfully ✦',
      bank:  'Bank transfer instructions sent to your email ✦',
    };
    showToast(msgs[method] || 'Payment processed ✦');
  }
}

/* ─────────────────────────────────────
   FORM HTML BUILDER
───────────────────────────────────── */

/**
 * Build the payment modal body HTML.
 * @param {string} eventName
 * @param {string} amount
 * @returns {string} HTML string
 */
function buildPaymentForm(eventName, amount) {
  return `
    <!-- Order summary -->
    <div class="pay-summary-box">
      <div class="pay-summary-row"><span class="label">Event</span><span>${eventName}</span></div>
      <div class="pay-summary-row"><span class="label">Ticket Type</span><span>General Admission</span></div>
      <div class="pay-summary-row"><span class="label">Quantity</span><span>1 ticket</span></div>
      <div class="pay-summary-row"><span class="label">Total</span><span class="pay-summary-total">${amount}</span></div>
    </div>

    <!-- Method selector -->
    <div class="pay-method-tabs">
      <button class="pay-method-tab active" onclick="switchPayTab('mpesa', this)">📱 M-Pesa</button>
      <button class="pay-method-tab"        onclick="switchPayTab('card',  this)">💳 Card</button>
      <button class="pay-method-tab"        onclick="switchPayTab('bank',  this)">🏦 Bank Transfer</button>
    </div>

    <!-- ── M-PESA ── -->
    <div class="pay-method-panel active" id="pay-panel-mpesa">
      <div class="mpesa-logo">M-PESA</div>
      <div class="mpesa-sub">Pay securely with your M-Pesa number. You'll receive a prompt on your phone.</div>
      <div class="auth-field" style="margin-bottom:20px">
        <label>M-Pesa Phone Number</label>
        <input type="tel" class="form-control" placeholder="0712 345 678" value="0712 345 678">
      </div>
      <button class="pay-btn" onclick="processPayment('mpesa')">
        Send M-Pesa Prompt — ${amount}
      </button>
    </div>

    <!-- ── CARD ── -->
    <div class="pay-method-panel" id="pay-panel-card">
      <div class="auth-field">
        <label>Cardholder Name</label>
        <input type="text" class="form-control" placeholder="Alexandra Rothbury">
      </div>
      <div class="auth-field">
        <label>Card Number</label>
        <input type="text" class="form-control" placeholder="4242 4242 4242 4242">
      </div>
      <div class="card-row" style="margin-bottom:20px">
        <div class="auth-field">
          <label>Expiry</label>
          <input type="text" class="form-control" placeholder="MM / YY">
        </div>
        <div class="auth-field">
          <label>CVV</label>
          <input type="text" class="form-control" placeholder="•••">
        </div>
      </div>
      <button class="pay-btn" onclick="processPayment('card')">
        Pay ${amount} Securely
      </button>
    </div>

    <!-- ── BANK TRANSFER ── -->
    <div class="pay-method-panel" id="pay-panel-bank">
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">
        Transfer to the account below and use your name as reference.
      </p>
      <div class="bank-code">
        <div class="bank-code-label">Bank Name</div>
        <div class="bank-code-val">Kenya Commercial Bank</div>
      </div>
      <div class="bank-code">
        <div class="bank-code-label">Account Number</div>
        <div class="bank-code-val">1234 5678 9012</div>
      </div>
      <div class="bank-code">
        <div class="bank-code-label">Branch Code</div>
        <div class="bank-code-val">01100</div>
      </div>
      <div class="bank-code" style="margin-bottom:20px">
        <div class="bank-code-label">Amount</div>
        <div class="bank-code-val">${amount}</div>
      </div>
      <button class="pay-btn" onclick="processPayment('bank')">
        Email Me Transfer Confirmation
      </button>
    </div>`;
}