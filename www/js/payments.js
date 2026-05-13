function openPaymentModal(eventId, eventName, amount) {
  const bodyEl = document.getElementById('payment-modal-body');
  if (!bodyEl) return;

  bodyEl.innerHTML = buildPaymentForm(eventId, eventName, Number(amount || 0));
  document.getElementById('payment-modal').classList.add('open');
}

function closePaymentModal(e) {
  if (!e || e.target === document.getElementById('payment-modal')) {
    document.getElementById('payment-modal').classList.remove('open');
  }
}

function switchPayTab(method, el) {
  document.querySelectorAll('.pay-method-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.pay-method-panel').forEach(panel => panel.classList.remove('active'));
  if (el) el.classList.add('active');
  const panel = document.getElementById(`pay-panel-${method}`);
  if (panel) panel.classList.add('active');
}

function processPayment(method) {
  const eventId = Number(document.getElementById('pay-event-id')?.value || 0);
  const eventName = document.getElementById('pay-event-name')?.value || '';
  const amount = Number(document.getElementById('pay-event-amount')?.value || 0);

  if (!eventId || amount <= 0) {
    showToast('This event is missing payment details.');
    return;
  }

  processPaymentAPI(method, eventId, eventName, amount);
}

async function redeemPaymentCode() {
  const codeInput = document.getElementById('pay-code-input');
  const resultBox = document.getElementById('pay-code-result');
  const button = document.getElementById('pay-code-btn');
  const eventId = Number(document.getElementById('pay-event-id')?.value || 0);

  if (!codeInput || !resultBox) return;
  const code = codeInput.value.trim().toUpperCase();

  if (!code || code.length < 6) {
    resultBox.className = 'pay-code-result error';
    resultBox.textContent = 'Please enter a valid payment code.';
    resultBox.style.display = 'block';
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Verifying...';
  }

  try {
    await ensureRegistrationForEvent(eventId);
  } catch (err) {
    if (!String(err.message || '').toLowerCase().includes('already registered')) {
      resultBox.className = 'pay-code-result error';
      resultBox.textContent = err.message || 'Unable to prepare this registration.';
      resultBox.style.display = 'block';
      if (button) {
        button.disabled = false;
        button.textContent = 'Verify & Redeem Code';
      }
      return;
    }
  }

  try {
    const res = await API.PaymentsAPI.redeemCode({ code, eventId });
    resultBox.className = 'pay-code-result success';
    resultBox.innerHTML = `Code verified. ${res.eventName} has been confirmed.<br><small>Reference: ${res.reference}</small>`;
    resultBox.style.display = 'block';
    setTimeout(() => {
      closePaymentModal(null);
      showToast('Payment code redeemed successfully.');
      refreshCurrentView();
    }, 1800);
  } catch (err) {
    resultBox.className = 'pay-code-result error';
    resultBox.textContent = err.message || 'Code not found or already used.';
    resultBox.style.display = 'block';
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Verify & Redeem Code';
    }
  }
}

function buildPaymentForm(eventId, eventName, amount) {
  const amountLabel = `KES ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `
    <input type="hidden" id="pay-event-id" value="${eventId}">
    <input type="hidden" id="pay-event-name" value="${eventName}">
    <input type="hidden" id="pay-event-amount" value="${amount}">

    <div class="pay-summary-box">
      <div class="pay-summary-row"><span class="label">Event</span><span>${eventName}</span></div>
      <div class="pay-summary-row"><span class="label">Ticket</span><span>Standard</span></div>
      <div class="pay-summary-row"><span class="label">Total</span><span class="pay-summary-total">${amountLabel}</span></div>
    </div>

    <div class="pay-method-tabs">
      <button class="pay-method-tab active" onclick="switchPayTab('mpesa', this)">M-Pesa</button>
      <button class="pay-method-tab" onclick="switchPayTab('card', this)">Card</button>
      <button class="pay-method-tab" onclick="switchPayTab('bank', this)">Bank Transfer</button>
      <button class="pay-method-tab pay-code-tab" onclick="switchPayTab('code', this)">Have a Code?</button>
    </div>

    <div class="pay-method-panel active" id="pay-panel-mpesa">
      <div class="auth-field" style="margin-bottom:16px">
        <label>M-Pesa Phone Number</label>
        <input type="tel" class="form-control" placeholder="0712 345 678">
      </div>
      <button class="pay-btn" onclick="processPayment('mpesa')">Pay ${amountLabel}</button>
    </div>

    <div class="pay-method-panel" id="pay-panel-card">
      <div class="auth-field"><label>Cardholder Name</label><input type="text" class="form-control" placeholder="Your name"></div>
      <div class="auth-field"><label>Card Number</label><input type="text" class="form-control" placeholder="4242 4242 4242 4242"></div>
      <button class="pay-btn" onclick="processPayment('card')">Pay ${amountLabel}</button>
    </div>

    <div class="pay-method-panel" id="pay-panel-bank">
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Use your event name as the transfer reference.</p>
      <div class="bank-code"><div class="bank-code-label">Bank Name</div><div class="bank-code-val">Kenya Commercial Bank</div></div>
      <div class="bank-code"><div class="bank-code-label">Account Number</div><div class="bank-code-val">1234 5678 9012</div></div>
      <div class="bank-code" style="margin-bottom:20px"><div class="bank-code-label">Amount</div><div class="bank-code-val">${amountLabel}</div></div>
      <button class="pay-btn" onclick="processPayment('bank')">Confirm Transfer</button>
    </div>

    <div class="pay-method-panel" id="pay-panel-code">
      <div class="auth-field" style="margin-bottom:10px">
        <label>Payment Code</label>
        <input type="text" id="pay-code-input" class="form-control" placeholder="EVT-2026-001" oninput="this.value=this.value.toUpperCase()" onkeydown="if(event.key==='Enter') redeemPaymentCode()">
      </div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:14px">Enter the code you received after paying outside the platform.</p>
      <div id="pay-code-result" class="pay-code-result" style="display:none"></div>
      <button class="pay-btn" id="pay-code-btn" onclick="redeemPaymentCode()">Verify &amp; Redeem Code</button>
    </div>`;
}
