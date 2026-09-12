// Central State
let state = {
  clinicProfile: {},
  doctors: [],
  patients: [],
  appointments: [],
  queue: [],
  teethMap: {},
  treatmentPlans: [],
  prescriptions: [],
  inventory: [],
  invoices: [],
  labOrders: [],
  activePatientId: 'TKR-P-1001',
  selectedTooth: 19,
  currentRole: 'doctor', // 'doctor' or 'admin'
  rxMedQueue: []
};

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupRoleToggle();
  setupSSE();
  fetchInitialData();
  setupModals();
  setupOdontogramEvents();
});

// SSE Live Connection
function setupSSE() {
  const syncStatusText = document.getElementById('syncStatusText');
  const syncSubText = document.getElementById('syncSubText');

  const evtSource = new EventSource('/api/events');

  evtSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      handleLiveEvent(data);
    } catch (err) {
      console.warn('SSE parse error', err);
    }
  };

  evtSource.onopen = () => {
    if (syncStatusText) syncStatusText.textContent = 'Live Synced to Mobile App';
    if (syncSubText) syncSubText.textContent = 'Channel Active • Port 5000';
  };

  evtSource.onerror = () => {
    if (syncStatusText) syncStatusText.textContent = 'Reconnecting Sync...';
    if (syncSubText) syncSubText.textContent = 'Retrying connection...';
  };
}

function handleLiveEvent(evt) {
  if (evt.type === 'CONNECTED') return;

  // Refresh data when something changed
  fetchInitialData(false);

  if (evt.type === 'APPOINTMENT_ADDED') {
    showToast(`📅 New Appointment booked for ${evt.payload.patientName} (${evt.payload.time})`);
  } else if (evt.type === 'QUEUE_TOKEN_CALLED') {
    showToast(`📢 Token ${evt.payload.token} called to ${evt.payload.room}`);
  } else if (evt.type === 'PAYMENT_RECORDED') {
    showToast(`💳 Payment received for Invoice #${evt.payload.invoice.id}`);
  } else if (evt.type === 'TEETH_UPDATED') {
    showToast(`🦷 Odontogram updated for Tooth #${evt.payload.toothNum}`);
  }
}

// Fetch Full DB Snapshot
async function fetchInitialData(renderFull = true) {
  try {
    const res = await fetch('/api/sync');
    const json = await res.json();
    if (json.success && json.data) {
      state = { ...state, ...json.data };
      if (renderFull) {
        populatePatientDropdowns();
        renderAll();
      } else {
        renderAll();
      }
    }
  } catch (e) {
    console.error('Failed to load clinic state', e);
    showToast('⚠️ Could not connect to central server. Retrying...');
  }
}

// Render All Components
function renderAll() {
  renderDashboard();
  renderOdontogram();
  renderAppointments();
  renderQueue();
  renderTreatments();
  renderPrescriptions();
  renderPatients();
  renderBilling();
  renderInventory();
  renderLabOrders();
}

// Navigation Tabs
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const viewFullQueueBtn = document.getElementById('viewFullQueueBtn');
  if (viewFullQueueBtn) {
    viewFullQueueBtn.addEventListener('click', () => switchTab('queue'));
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  const activePane = document.getElementById(`pane-${tabId}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePane) activePane.classList.add('active');

  // Update top bar titles
  const titles = {
    'dashboard': ['Doctor Clinical Dashboard', "Real-time clinical overview, today's chair appointments, and live patient queue"],
    'odontogram': ['32-Tooth Digital Odontogram', 'Interactive FDI / Universal anatomical dental chart with surface pathology tagging'],
    'appointments': ['Operatory Appointments & Chairs', 'Doctor duty schedule, chair assignment (Chairs 1-3), and booking calendar'],
    'queue': ['Reception Token Queue Board', 'Live token management with synthetic voice chime announcements for operatory rooms'],
    'treatments': ['Clinical Treatment Plans', 'Multi-step tooth procedures, progress stages, and estimated costs'],
    'prescriptions': ['Digital Prescription Pad', 'Formulate prescriptions on official clinic letterhead with dosage presets'],
    'patients': ['Patient Records Directory', 'Comprehensive health records, vital signs, allergy badges, and registration'],
    'billing': ['Billing, UPI Payments & Invoicing', 'Itemized procedure invoicing, real-time UPI QR codes, and payment receipts'],
    'inventory': ['Pharmacy & Consumable Inventory', 'Batch tracking, low-stock warnings, expiry alerts, and stock dispensing'],
    'lab-orders': ['Dental Prosthetics & Lab Orders', 'Custom crown, bridge, and clear aligner fabrication tracking']
  };

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  if (titles[tabId]) {
    if (pageTitle) pageTitle.textContent = titles[tabId][0];
    if (pageSubtitle) pageSubtitle.textContent = titles[tabId][1];
  }
}

// Switch between Doctor and Admin views
function setupRoleToggle() {
  const toggleBtn = document.getElementById('toggleRoleBtn');
  const roleBadge = document.getElementById('portalRoleBadge');
  const userAvatar = document.getElementById('currentUserAvatar');
  const userName = document.getElementById('currentUserName');
  const userDesc = document.getElementById('currentUserRoleDesc');

  toggleBtn.addEventListener('click', () => {
    if (state.currentRole === 'doctor') {
      state.currentRole = 'admin';
      roleBadge.textContent = 'ADMIN PORTAL';
      roleBadge.style.color = '#10b981';
      roleBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      userAvatar.textContent = '🏢';
      userName.textContent = 'Admin Desk / Reception';
      userDesc.textContent = 'Practice Administrator';
      showToast('Switched to Clinic Administrator View');
    } else {
      state.currentRole = 'doctor';
      roleBadge.textContent = 'DOCTOR PORTAL';
      roleBadge.style.color = '#38bdf8';
      roleBadge.style.background = 'rgba(56, 189, 248, 0.15)';
      userAvatar.textContent = '👩‍⚕️';
      userName.textContent = 'Dr. E. Rajalakshmi';
      userDesc.textContent = 'Chief Dental Surgeon';
      showToast('Switched to Doctor Clinical View');
    }
  });
}

// Populate Patient Dropdowns
function populatePatientDropdowns() {
  const selects = [
    document.getElementById('activePatientSelect'),
    document.getElementById('queuePatientSelect'),
    document.getElementById('rxPatientSelect'),
    document.getElementById('modalAptPatientSelect')
  ];

  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = state.patients.map(p => `
      <option value="${p.id}" ${p.id === state.activePatientId ? 'selected' : ''}>
        ${p.name} (${p.id})
      </option>
    `).join('');
    if (currentVal && state.patients.some(p => p.id === currentVal)) {
      select.value = currentVal;
    }
  });

  const activeSelect = document.getElementById('activePatientSelect');
  if (activeSelect) {
    activeSelect.addEventListener('change', (e) => {
      state.activePatientId = e.target.value;
      renderOdontogram();
      renderTreatments();
      renderPrescriptions();
      showToast(`Active patient set to: ${state.patients.find(p => p.id === state.activePatientId)?.name}`);
    });
  }
}

// ---------------- 1. DASHBOARD ----------------
function renderDashboard() {
  const apts = state.appointments || [];
  const queue = state.queue || [];
  const waitingQueue = queue.filter(q => q.status === 'waiting');
  const calledQueue = queue.filter(q => q.status === 'called');

  // KPI counters
  document.getElementById('kpiAptCount').textContent = apts.length;
  document.getElementById('todayAptCount').textContent = apts.length;
  document.getElementById('kpiWaitingCount').textContent = waitingQueue.length;
  document.getElementById('waitingQueueCount').textContent = waitingQueue.length;

  const totalRev = (state.invoices || []).reduce((acc, inv) => acc + inv.paid, 0);
  document.getElementById('kpiRevenue').textContent = `₹${totalRev.toLocaleString()}`;
  document.getElementById('kpiTreatmentsCount').textContent = (state.treatmentPlans || []).length;

  // Banner caller
  const activeCall = calledQueue[0] || queue[0];
  const liveCallerStatus = document.getElementById('liveCallerStatus');
  if (activeCall && liveCallerStatus) {
    liveCallerStatus.innerHTML = `Calling Token: <strong>${activeCall.token}</strong> (${activeCall.patientName}) &bull; ${activeCall.room}`;
  }

  // Dashboard appointments
  const aptList = document.getElementById('dashAppointmentsList');
  if (aptList) {
    aptList.innerHTML = apts.slice(0, 4).map(a => `
      <div class="apt-row-card">
        <div class="apt-time">${a.time}</div>
        <div class="apt-patient">
          <strong>${a.patientName}</strong>
          <span>${a.type} &bull; ${a.chair}</span>
        </div>
        <div>
          <span class="pill-badge badge-${a.status.toLowerCase().replace(' ', '')}">${a.status}</span>
        </div>
      </div>
    `).join('');
  }

  // Dashboard queue
  const queueList = document.getElementById('dashQueueList');
  if (queueList) {
    queueList.innerHTML = queue.slice(0, 4).map(q => `
      <div class="apt-row-card">
        <div class="apt-time">${q.token}</div>
        <div class="apt-patient">
          <strong>${q.patientName}</strong>
          <span>${q.priority} Priority &bull; Arr: ${q.arrivalTime}</span>
        </div>
        <button class="btn btn-voice btn-sm" onclick="callQueueToken('${q.id}')">
          <i class="fa-solid fa-volume-high"></i> Call
        </button>
      </div>
    `).join('');
  }

  const dashCallNextBtn = document.getElementById('dashCallNextBtn');
  if (dashCallNextBtn) {
    dashCallNextBtn.onclick = () => {
      const next = queue.find(q => q.status === 'waiting');
      if (next) {
        callQueueToken(next.id);
      } else {
        showToast('No more patients waiting in queue!');
      }
    };
  }
}

// ---------------- 2. 32-TOOTH ODONTOGRAM ----------------
function renderOdontogram() {
  const patient = state.patients.find(p => p.id === state.activePatientId) || state.patients[0];
  if (!patient) return;

  const odontogramPatientName = document.getElementById('odontogramPatientName');
  if (odontogramPatientName) {
    odontogramPatientName.textContent = `${patient.name} (${patient.id}) • Age: ${patient.age} • Blood: ${patient.bloodGroup}`;
  }

  const patientTeeth = state.teethMap[patient.id] || {};

  // Upper Arch: Teeth 1 to 16
  const upperRow = document.getElementById('upperArchTeeth');
  if (upperRow) {
    upperRow.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
      upperRow.appendChild(createToothElement(i, patientTeeth[i]));
    }
  }

  // Lower Arch: Teeth 32 down to 17 (anatomical order)
  const lowerRow = document.getElementById('lowerArchTeeth');
  if (lowerRow) {
    lowerRow.innerHTML = '';
    for (let i = 32; i >= 17; i--) {
      lowerRow.appendChild(createToothElement(i, patientTeeth[i]));
    }
  }

  // History table
  const tbody = document.getElementById('patientTeethTableBody');
  if (tbody) {
    const records = Object.values(patientTeeth);
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">All 32 teeth currently charted as healthy.</td></tr>`;
    } else {
      tbody.innerHTML = records.map(r => `
        <tr>
          <td><strong>#${r.number}</strong></td>
          <td><span class="pill-badge cond-${r.condition}">${r.condition.toUpperCase()}</span></td>
          <td>${(r.surfaces || []).join(', ') || 'Crown / Entire'}</td>
          <td>${r.notes || '-'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="selectToothForEdit(${r.number})">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
          </td>
        </tr>
      `).join('');
    }
  }
}

function createToothElement(num, conditionObj) {
  const div = document.createElement('div');
  div.className = `tooth-item ${state.selectedTooth === num ? 'selected' : ''}`;
  div.onclick = () => selectToothForEdit(num);

  const cond = conditionObj ? conditionObj.condition : 'healthy';
  const surfaces = (conditionObj && conditionObj.surfaces) || [];

  div.innerHTML = `
    <span class="tooth-num">#${num}</span>
    <div class="tooth-surfaces cond-${cond}">
      <div class="surf-box surf-o" style="background:${surfaces.includes('O') ? getConditionColor(cond) : '#fff'}"></div>
      <div class="surf-box surf-b" style="background:${surfaces.includes('B') ? getConditionColor(cond) : '#fff'}"></div>
      <div class="surf-box surf-l" style="background:${surfaces.includes('L') ? getConditionColor(cond) : '#fff'}"></div>
      <div class="surf-box surf-m" style="background:${surfaces.includes('M') ? getConditionColor(cond) : '#fff'}"></div>
      <div class="surf-box surf-d" style="background:${surfaces.includes('D') ? getConditionColor(cond) : '#fff'}"></div>
    </div>
    <span class="tooth-tag ${cond !== 'healthy' ? 'has-cond' : ''}">${cond}</span>
  `;
  return div;
}

function getConditionColor(cond) {
  switch (cond) {
    case 'caries': return '#ef4444';
    case 'filling': return '#3b82f6';
    case 'crown': return '#eab308';
    case 'rct': return '#8b5cf6';
    case 'implant': return '#10b981';
    case 'missing': return '#94a3b8';
    case 'extraction': return '#f97316';
    default: return '#ffffff';
  }
}

function selectToothForEdit(num) {
  state.selectedTooth = num;
  document.getElementById('selectedToothNumDisplay').textContent = `#${num}`;

  const patientTeeth = state.teethMap[state.activePatientId] || {};
  const current = patientTeeth[num] || { condition: 'healthy', surfaces: [], notes: '' };

  document.getElementById('editToothCondition').value = current.condition;
  document.getElementById('editToothNotes').value = current.notes || '';

  const checkboxes = document.querySelectorAll('.surface-checkboxes input[name="surf"]');
  checkboxes.forEach(cb => {
    cb.checked = (current.surfaces || []).includes(cb.value);
  });

  renderOdontogram();
}

function setupOdontogramEvents() {
  const saveBtn = document.getElementById('saveToothBtn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    const toothNum = state.selectedTooth;
    const condition = document.getElementById('editToothCondition').value;
    const notes = document.getElementById('editToothNotes').value;

    const surfaces = [];
    document.querySelectorAll('.surface-checkboxes input[name="surf"]:checked').forEach(cb => {
      surfaces.push(cb.value);
    });

    try {
      const res = await fetch('/api/teeth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: state.activePatientId,
          toothNum,
          condition,
          surfaces,
          notes
        })
      });

      if (res.ok) {
        showToast(`✅ Tooth #${toothNum} condition saved and synced to Patient App!`);
        fetchInitialData(false);
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving tooth condition');
    }
  });
}

// ---------------- 3. APPOINTMENTS ----------------
function renderAppointments() {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  const filter = document.getElementById('filterChairSelect')?.value || 'all';
  const apts = state.appointments.filter(a => filter === 'all' || a.chair === filter);

  tbody.innerHTML = apts.map(a => `
    <tr>
      <td><strong>${a.date}</strong><br><small class="text-muted">${a.time}</small></td>
      <td><strong>${a.patientName}</strong><br><small class="text-muted">${a.patientId}</small></td>
      <td>${a.doctorName}</td>
      <td><span class="pill-badge" style="background:#f1f5f9;">${a.chair}</span></td>
      <td>${a.type}</td>
      <td>
        <select class="form-control" style="width: auto; padding: 2px 6px;" onchange="updateAptStatus('${a.id}', this.value)">
          <option value="Scheduled" ${a.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          <option value="Checked In" ${a.status === 'Checked In' ? 'selected' : ''}>Checked In</option>
          <option value="In Progress" ${a.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Cancelled" ${a.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td><small>${a.notes || '-'}</small></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="sendToQueue('${a.patientId}')">
          <i class="fa-solid fa-ticket"></i> Queue
        </button>
      </td>
    </tr>
  `).join('');
}

async function updateAptStatus(id, status) {
  try {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Appointment status updated to ${status}`);
    }
  } catch (e) {
    console.error(e);
  }
}

async function sendToQueue(patientId) {
  try {
    const res = await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, priority: 'Normal' })
    });
    if (res.ok) {
      const item = await res.json();
      showToast(`Token ${item.token} generated for patient!`);
    }
  } catch (e) {
    console.error(e);
  }
}

// ---------------- 4. QUEUE & VOICE CALLER ----------------
function renderQueue() {
  const tbody = document.getElementById('queueTableBody');
  if (!tbody) return;

  const queue = state.queue || [];
  tbody.innerHTML = queue.map(q => `
    <tr>
      <td><strong>${q.token}</strong></td>
      <td><strong>${q.patientName}</strong></td>
      <td>${q.arrivalTime}</td>
      <td><span class="pill-badge" style="background:${q.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9'}; color:${q.priority === 'Urgent' ? '#b91c1c' : '#334155'};">${q.priority}</span></td>
      <td>${q.room}</td>
      <td><span class="pill-badge badge-${q.status}">${q.status.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-voice btn-sm" onclick="callQueueToken('${q.id}')">
          <i class="fa-solid fa-volume-high"></i> Call Voice
        </button>
      </td>
    </tr>
  `).join('');

  // Top banner
  const called = queue.find(q => q.status === 'called') || queue[0];
  if (called) {
    document.getElementById('queueNowCallingToken').textContent = called.token;
    document.getElementById('queueNowCallingPatient').textContent = `${called.patientName} • ${called.room}`;
  }

  const chimeBtn = document.getElementById('btnPlayTokenChime');
  if (chimeBtn && called) {
    chimeBtn.onclick = () => playVoiceAnnouncement(called);
  }

  const issueBtn = document.getElementById('btnIssueQueueToken');
  if (issueBtn) {
    issueBtn.onclick = async () => {
      const patientId = document.getElementById('queuePatientSelect').value;
      const priority = document.getElementById('queuePrioritySelect').value;
      try {
        const res = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, priority })
        });
        if (res.ok) {
          const item = await res.json();
          showToast(`Token ${item.token} issued!`);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}

async function callQueueToken(id) {
  try {
    const res = await fetch(`/api/queue/${id}/call`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      playVoiceAnnouncement(data.item);
    }
  } catch (e) {
    console.error(e);
  }
}

function playVoiceAnnouncement(item) {
  if (!('speechSynthesis' in window)) {
    showToast(`Calling Token ${item.token}: ${item.patientName}`);
    return;
  }
  window.speechSynthesis.cancel();
  const text = `Calling token ${item.token}. ${item.patientName}, please proceed to ${item.room}.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
  showToast(`🔊 Digital Voice Announcement: "${text}"`);
}

// ---------------- 5. TREATMENT PLANS ----------------
function renderTreatments() {
  const container = document.getElementById('treatmentsContainer');
  if (!container) return;

  const plans = state.treatmentPlans || [];
  container.innerHTML = plans.map(p => `
    <div class="plan-card">
      <div class="plan-header">
        <div>
          <h4>${p.title}</h4>
          <small class="text-muted">Patient: <strong>${p.patientName}</strong> &bull; Created: ${p.createdAt}</small>
        </div>
        <span class="pill-badge" style="background:#e0f2fe; color:#0369a1;">${p.status}</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tooth</th>
              <th>Procedure</th>
              <th>Cost (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${p.items.map(item => `
              <tr>
                <td><strong>${item.tooth}</strong></td>
                <td>${item.procedure}</td>
                <td>₹${item.cost.toLocaleString()}</td>
                <td>
                  <select class="form-control" style="padding: 2px 4px; width: auto;" onchange="updateTreatmentStatus('${p.id}', '${item.id}', this.value)">
                    <option value="Planned" ${item.status === 'Planned' ? 'selected' : ''}>Planned</option>
                    <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="text-align: right; margin-top: 12px; font-weight: 700; font-size: 0.95rem;">
        Total Plan Estimate: <span style="color: var(--primary);">₹${p.totalCost.toLocaleString()}</span>
      </div>
    </div>
  `).join('');
}

async function updateTreatmentStatus(planId, itemId, status) {
  try {
    const res = await fetch(`/api/treatments/${planId}/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Procedure stage updated to: ${status}`);
    }
  } catch (e) {
    console.error(e);
  }
}

// ---------------- 6. DIGITAL PRESCRIPTIONS ----------------
window.addMedPreset = function(name, dosage, frequency, duration, instructions) {
  state.rxMedQueue.push({ name, dosage, frequency, duration, instructions });
  renderRxQueue();
};

function renderRxQueue() {
  const container = document.getElementById('rxMedsList');
  if (!container) return;
  if (state.rxMedQueue.length === 0) {
    container.innerHTML = `<small class="text-muted">Click quick presets above to add medications to this prescription...</small>`;
    return;
  }
  container.innerHTML = state.rxMedQueue.map((m, idx) => `
    <div class="rx-med-item">
      <div>
        <strong>${m.name}</strong> - ${m.dosage}<br>
        <small>${m.frequency} &bull; ${m.duration} &bull; ${m.instructions}</small>
      </div>
      <button class="btn btn-outline btn-sm" onclick="removeRxMed(${idx})" style="color:#ef4444;">&times;</button>
    </div>
  `).join('');
}

window.removeRxMed = function(idx) {
  state.rxMedQueue.splice(idx, 1);
  renderRxQueue();
};

function renderPrescriptions() {
  renderRxQueue();

  const list = document.getElementById('prescriptionsListContainer');
  if (!list) return;

  const rxs = state.prescriptions || [];
  list.innerHTML = rxs.map(rx => `
    <div class="plan-card" style="margin-bottom: 12px;">
      <div class="flex-between">
        <div>
          <h4>${rx.patientName} &bull; Date: ${rx.date}</h4>
          <small class="text-muted">Prescribed by ${rx.doctorName}</small>
        </div>
        <button class="btn btn-outline btn-sm" onclick="printRx('${rx.id}')">
          <i class="fa-solid fa-print"></i> Print Rx
        </button>
      </div>
      <ul style="padding-left: 18px; margin: 8px 0; font-size: 0.85rem;">
        ${rx.medications.map(m => `
          <li><strong>${m.name}</strong>: ${m.dosage}, ${m.frequency} for ${m.duration} (${m.instructions})</li>
        `).join('')}
      </ul>
      <p style="font-size: 0.8rem; color: #64748b; font-style: italic;">Advice: ${rx.instructions}</p>
    </div>
  `).join('');

  const btnSavePrescription = document.getElementById('btnSavePrescription');
  if (btnSavePrescription) {
    btnSavePrescription.onclick = async () => {
      const patientId = document.getElementById('rxPatientSelect').value;
      const patient = state.patients.find(p => p.id === patientId);
      if (!patient) return;
      if (state.rxMedQueue.length === 0) {
        showToast('Please add at least one medication to the prescription!');
        return;
      }
      const instructions = document.getElementById('rxInstructions').value || 'Take as prescribed';

      try {
        const res = await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient.id,
            patientName: patient.name,
            doctorName: 'Dr. E. Rajalakshmi, BDS, MDS',
            medications: state.rxMedQueue,
            instructions
          })
        });
        if (res.ok) {
          state.rxMedQueue = [];
          document.getElementById('rxInstructions').value = '';
          renderRxQueue();
          showToast(`Digital Rx issued to ${patient.name} and synced to Patient App!`);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}

function printRx(id) {
  const rx = state.prescriptions.find(r => r.id === id);
  if (!rx) return;
  const printWin = window.open('', '_blank');
  printWin.document.write(`
    <html>
      <head>
        <title>Prescription - ${rx.patientName}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 20px; }
          h2 { color: #0284c7; margin: 0; }
          .med { margin: 14px 0; padding: 10px; border-left: 3px solid #0284c7; background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>TKR DENTAL CARE & Implant Centre</h2>
          <p>Tirupathur, Tamil Nadu &bull; Phone: +91 98765 43210</p>
          <hr>
          <p><strong>Doctor:</strong> ${rx.doctorName} | <strong>Patient:</strong> ${rx.patientName} | <strong>Date:</strong> ${rx.date}</p>
        </div>
        <h3>Rx Medications:</h3>
        ${rx.medications.map(m => `
          <div class="med">
            <strong>${m.name}</strong> - ${m.dosage}<br>
            <span>Frequency: ${m.frequency} &bull; Duration: ${m.duration}</span><br>
            <em>Instructions: ${m.instructions}</em>
          </div>
        `).join('')}
        <p><strong>Doctor's Advice:</strong> ${rx.instructions}</p>
        <br><br>
        <p style="text-align: right;">_______________________<br>Doctor's Digital Signature</p>
      </body>
    </html>
  `);
  printWin.document.close();
  printWin.print();
}

// ---------------- 7. PATIENTS DIRECTORY ----------------
function renderPatients() {
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;

  const search = (document.getElementById('searchPatientInput')?.value || '').toLowerCase();
  const filtered = state.patients.filter(p => 
    p.name.toLowerCase().includes(search) || 
    p.id.toLowerCase().includes(search) || 
    p.phone.includes(search)
  );

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td><strong>${p.name}</strong><br><small class="text-muted">${p.age} yrs &bull; ${p.gender}</small></td>
      <td>${p.phone}</td>
      <td><span class="pill-badge" style="background:#fee2e2; color:#991b1b;">${p.bloodGroup}</span></td>
      <td>
        ${(p.allergies || []).map(a => `<span class="pill-badge" style="background:#fef3c7; color:#b45309; margin-right: 4px;">${a}</span>`).join('') || '<small class="text-muted">None</small>'}
      </td>
      <td><small>BP: ${p.vitals?.bp || '-'} &bull; Sugar: ${p.vitals?.sugar || '-'}</small></td>
      <td><strong style="color:${p.balanceDue > 0 ? '#ef4444' : '#10b981'};">₹${p.balanceDue.toLocaleString()}</strong></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openPatientOdontogram('${p.id}')">
          <i class="fa-solid fa-teeth"></i> Odontogram
        </button>
      </td>
    </tr>
  `).join('');

  const searchInput = document.getElementById('searchPatientInput');
  if (searchInput) {
    searchInput.oninput = () => renderPatients();
  }
}

window.openPatientOdontogram = function(patientId) {
  state.activePatientId = patientId;
  const sel = document.getElementById('activePatientSelect');
  if (sel) sel.value = patientId;
  switchTab('odontogram');
  renderOdontogram();
};

// ---------------- 8. BILLING & INVOICES ----------------
function renderBilling() {
  const tbody = document.getElementById('invoicesTableBody');
  if (!tbody) return;

  const invoices = state.invoices || [];
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalPending = invoices.reduce((s, i) => s + i.balance, 0);

  document.getElementById('totalInvoicedStat').textContent = `₹${totalInvoiced.toLocaleString()}`;
  document.getElementById('totalPaidStat').textContent = `₹${totalPaid.toLocaleString()}`;
  document.getElementById('totalOutstandingStat').textContent = `₹${totalPending.toLocaleString()}`;

  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td><strong>${inv.id}</strong></td>
      <td>${inv.date}</td>
      <td><strong>${inv.patientName}</strong></td>
      <td><small>${inv.items.map(it => it.description).join(', ')}</small></td>
      <td><strong>₹${inv.total.toLocaleString()}</strong></td>
      <td style="color:#10b981;">₹${inv.paid.toLocaleString()}</td>
      <td style="color:${inv.balance > 0 ? '#ef4444' : '#64748b'}; font-weight:700;">₹${inv.balance.toLocaleString()}</td>
      <td><span class="pill-badge" style="background:#f1f5f9;">${inv.paymentMode}</span></td>
      <td><span class="pill-badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
      <td>
        ${inv.balance > 0 ? `
          <button class="btn btn-primary btn-sm" onclick="openPayModal('${inv.id}')">
            <i class="fa-solid fa-qrcode"></i> Collect
          </button>
        ` : `
          <span style="color:#10b981; font-weight:700; font-size:0.8rem;"><i class="fa-solid fa-check-double"></i> Settled</span>
        `}
      </td>
    </tr>
  `).join('');
}

let activeInvoiceForPay = null;
window.openPayModal = function(invoiceId) {
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;
  activeInvoiceForPay = inv;
  document.getElementById('modalPayAmountDisplay').textContent = `₹${inv.balance.toLocaleString()}`;
  document.getElementById('modalPayAmountInput').value = inv.balance;
  openModal('modalRecordPayment');
};

// ---------------- 9. INVENTORY ----------------
function renderInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const items = state.inventory || [];
  tbody.innerHTML = items.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td><span class="pill-badge" style="background:#e0f2fe;">${item.category}</span></td>
      <td><code>${item.batch}</code></td>
      <td>
        <strong style="color:${item.stock <= item.minStock ? '#ef4444' : '#0f172a'};">${item.stock} ${item.unit}</strong>
        ${item.stock <= item.minStock ? '<span class="pill-badge" style="background:#fee2e2; color:#ef4444; margin-left:6px;">LOW</span>' : ''}
      </td>
      <td>${item.minStock} ${item.unit}</td>
      <td>${item.expiry}</td>
      <td>₹${item.unitPrice.toLocaleString()}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="dispenseInventoryItem('${item.id}')">
          <i class="fa-solid fa-minus"></i> Dispense 1
        </button>
      </td>
    </tr>
  `).join('');
}

async function dispenseInventoryItem(id) {
  try {
    const res = await fetch('/api/inventory/dispense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id, quantity: 1 })
    });
    if (res.ok) {
      showToast('1 unit dispensed from inventory');
    }
  } catch (e) {
    console.error(e);
  }
}

// ---------------- 10. LAB ORDERS ----------------
function renderLabOrders() {
  const tbody = document.getElementById('labOrdersTableBody');
  if (!tbody) return;

  const orders = state.labOrders || [];
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.patientName}</td>
      <td><strong>${o.labName}</strong></td>
      <td>${o.item}</td>
      <td>Tooth: ${o.toothNumber} &bull; Shade: ${o.shade}</td>
      <td>${o.sentDate}</td>
      <td><strong>${o.expectedDate}</strong></td>
      <td><span class="pill-badge badge-scheduled">${o.status}</span></td>
      <td>
        <select class="form-control" style="width: auto; padding: 2px 6px;" onchange="updateLabStatus('${o.id}', this.value)">
          <option value="Sent" ${o.status === 'Sent' ? 'selected' : ''}>Sent</option>
          <option value="In Production" ${o.status === 'In Production' ? 'selected' : ''}>In Production</option>
          <option value="Received" ${o.status === 'Received' ? 'selected' : ''}>Received</option>
          <option value="Fitted" ${o.status === 'Fitted' ? 'selected' : ''}>Fitted</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateLabStatus(id, status) {
  try {
    const res = await fetch(`/api/lab-orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Lab order status updated to ${status}`);
    }
  } catch (e) {
    console.error(e);
  }
}

// ---------------- MODAL LOGIC ----------------
function setupModals() {
  // Book Appointment
  const quickNewAptBtn = document.getElementById('quickNewAptBtn');
  const openBookAptModalBtn = document.getElementById('openBookAptModalBtn');
  if (quickNewAptBtn) quickNewAptBtn.onclick = () => openModal('modalBookAppointment');
  if (openBookAptModalBtn) openBookAptModalBtn.onclick = () => openModal('modalBookAppointment');

  const btnConfirmCreateApt = document.getElementById('btnConfirmCreateApt');
  if (btnConfirmCreateApt) {
    btnConfirmCreateApt.onclick = async () => {
      const patientId = document.getElementById('modalAptPatientSelect').value;
      const patient = state.patients.find(p => p.id === patientId);
      const doctorId = document.getElementById('modalAptDoctorSelect').value;
      const doctor = state.doctors.find(d => d.id === doctorId);
      const date = document.getElementById('modalAptDate').value;
      const time = document.getElementById('modalAptTime').value;
      const chair = document.getElementById('modalAptChair').value;
      const type = document.getElementById('modalAptType').value;
      const notes = document.getElementById('modalAptNotes').value;

      try {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            patientName: patient?.name || 'Patient',
            doctorId,
            doctorName: doctor?.name || 'Dr. E. Rajalakshmi',
            date,
            time,
            type,
            status: 'Scheduled',
            chair,
            notes: notes || 'Booked via Doctor & Admin Web Portal'
          })
        });
        if (res.ok) {
          closeModal('modalBookAppointment');
          showToast(`Consultation scheduled for ${patient?.name} on ${date} at ${time}!`);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }

  // Quick Issue Queue Token
  const quickAddQueueBtn = document.getElementById('quickAddQueueBtn');
  if (quickAddQueueBtn) {
    quickAddQueueBtn.onclick = () => {
      switchTab('queue');
    };
  }

  // Add Patient Modal
  const openAddPatientModalBtn = document.getElementById('openAddPatientModalBtn');
  if (openAddPatientModalBtn) {
    openAddPatientModalBtn.onclick = () => openModal('modalAddPatient');
  }

  const btnConfirmAddPatient = document.getElementById('btnConfirmAddPatient');
  if (btnConfirmAddPatient) {
    btnConfirmAddPatient.onclick = async () => {
      const name = document.getElementById('newPatName').value.trim();
      if (!name) {
        alert('Please enter patient name');
        return;
      }
      const age = Number(document.getElementById('newPatAge').value) || 25;
      const gender = document.getElementById('newPatGender').value;
      const phone = document.getElementById('newPatPhone').value || '+91 90000 00000';
      const email = document.getElementById('newPatEmail').value || 'patient@example.com';
      const bloodGroup = document.getElementById('newPatBlood').value;
      const address = document.getElementById('newPatAddress').value || 'Tirupathur';
      const allergies = (document.getElementById('newPatAllergies').value || 'None').split(',').map(s => s.trim());
      const medicalHistory = (document.getElementById('newPatHistory').value || 'None').split(',').map(s => s.trim());

      try {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            age,
            gender,
            phone,
            email,
            bloodGroup,
            address,
            emergencyContact: 'Family - +91 90000 00001',
            medicalHistory,
            allergies,
            assignedDoctorId: 'DOC-1',
            notes: 'Registered via Clinic Web Portal'
          })
        });
        if (res.ok) {
          const newPat = await res.json();
          closeModal('modalAddPatient');
          state.activePatientId = newPat.id;
          populatePatientDropdowns();
          showToast(`Patient ${newPat.name} (${newPat.id}) registered successfully!`);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }

  // Confirm Record Payment
  const btnConfirmRecordPayment = document.getElementById('btnConfirmRecordPayment');
  if (btnConfirmRecordPayment) {
    btnConfirmRecordPayment.onclick = async () => {
      if (!activeInvoiceForPay) return;
      const amount = Number(document.getElementById('modalPayAmountInput').value) || activeInvoiceForPay.balance;
      const paymentMode = document.getElementById('modalPayMethod').value;

      try {
        const res = await fetch(`/api/invoices/${activeInvoiceForPay.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, paymentMode })
        });
        if (res.ok) {
          closeModal('modalRecordPayment');
          showToast(`₹${amount.toLocaleString()} payment collected for Invoice #${activeInvoiceForPay.id}!`);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}

window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
};

// Toast notification
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color:#38bdf8;"></i> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
