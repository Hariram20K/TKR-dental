const express = require('express');
const cors = require('cors');
const path = require('path');
const { readDb, writeDb, INITIAL_DATA } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the Doctor & Admin Web Portal static files
app.use(express.static(path.join(__dirname, 'public')));

// Server-Sent Events (SSE) clients for real-time sync
let sseClients = [];

function broadcastEvent(type, payload) {
  const message = `data: ${JSON.stringify({ type, payload, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(message);
    } catch (e) {
      console.warn('Failed to send SSE to client', e);
    }
  });
}

// SSE endpoint for live updates
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    clinic: 'TKR DENTAL CARE & Implant Centre',
    port: PORT,
    activeConnections: sseClients.length,
    serverTime: new Date().toISOString()
  });
});

// Full state sync
app.get('/api/sync', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db
  });
});

// Reset data
app.post('/api/reset', (req, res) => {
  writeDb(INITIAL_DATA);
  broadcastEvent('DATA_RESET', INITIAL_DATA);
  res.json({ success: true, message: 'Database reset to default seed data' });
});

// ---------------- PATIENTS ----------------
app.get('/api/patients', (req, res) => {
  const db = readDb();
  res.json(db.patients);
});

app.post('/api/patients', (req, res) => {
  const db = readDb();
  const nextId = `TKR-P-${1000 + db.patients.length + 1}`;
  const newPatient = {
    ...req.body,
    id: nextId,
    registrationDate: new Date().toISOString().split('T')[0],
    balanceDue: 0,
    totalVisits: 1,
    vitals: req.body.vitals || { bp: '120/80 mmHg', pulse: '72 bpm', spo2: '99%', temp: '98.4 F', sugar: '100 mg/dL' }
  };
  db.patients.unshift(newPatient);
  writeDb(db);
  broadcastEvent('PATIENT_ADDED', newPatient);
  res.status(201).json(newPatient);
});

app.put('/api/patients/:id', (req, res) => {
  const db = readDb();
  const index = db.patients.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Patient not found' });
  db.patients[index] = { ...db.patients[index], ...req.body };
  writeDb(db);
  broadcastEvent('PATIENT_UPDATED', db.patients[index]);
  res.json(db.patients[index]);
});

// ---------------- DOCTORS ----------------
app.get('/api/doctors', (req, res) => {
  const db = readDb();
  res.json(db.doctors);
});

// ---------------- APPOINTMENTS ----------------
app.get('/api/appointments', (req, res) => {
  const db = readDb();
  res.json(db.appointments);
});

app.post('/api/appointments', (req, res) => {
  const db = readDb();
  const newApt = {
    ...req.body,
    id: `APT-${100 + db.appointments.length + 1}`,
    status: req.body.status || 'Scheduled'
  };
  db.appointments.unshift(newApt);
  writeDb(db);
  broadcastEvent('APPOINTMENT_ADDED', newApt);
  res.status(201).json(newApt);
});

app.patch('/api/appointments/:id/status', (req, res) => {
  const db = readDb();
  const apt = db.appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.status = req.body.status;
  writeDb(db);
  broadcastEvent('APPOINTMENT_STATUS_UPDATED', apt);
  res.json(apt);
});

// ---------------- QUEUE ----------------
app.get('/api/queue', (req, res) => {
  const db = readDb();
  res.json(db.queue);
});

app.post('/api/queue', (req, res) => {
  const db = readDb();
  const { patientId, priority = 'Normal' } = req.body;
  const pat = db.patients.find(p => p.id === patientId);
  if (!pat) return res.status(404).json({ error: 'Patient not found' });

  const tokenNum = 100 + db.queue.length + 1;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newItem = {
    id: `Q-${db.queue.length + 1}`,
    token: `TKR-Q-${tokenNum}`,
    patientId: pat.id,
    patientName: pat.name,
    doctorId: pat.assignedDoctorId || 'DOC-1',
    doctorName: 'Dr. E. Rajalakshmi',
    arrivalTime: timeStr,
    status: 'waiting',
    room: 'Consultation Operatory 1',
    priority
  };
  db.queue.push(newItem);
  writeDb(db);
  broadcastEvent('QUEUE_TOKEN_ADDED', newItem);
  res.status(201).json(newItem);
});

app.patch('/api/queue/:id/status', (req, res) => {
  const db = readDb();
  const item = db.queue.find(q => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Queue item not found' });
  item.status = req.body.status;
  writeDb(db);
  broadcastEvent('QUEUE_STATUS_UPDATED', item);
  res.json(item);
});

app.post('/api/queue/:id/call', (req, res) => {
  const db = readDb();
  const item = db.queue.find(q => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Queue item not found' });
  item.status = 'called';
  writeDb(db);
  broadcastEvent('QUEUE_TOKEN_CALLED', item);
  res.json({ success: true, item });
});

// ---------------- ODONTOGRAM / TEETH ----------------
app.get('/api/teeth/:patientId', (req, res) => {
  const db = readDb();
  const patientTeeth = db.teethMap[req.params.patientId] || {};
  res.json(patientTeeth);
});

app.post('/api/teeth', (req, res) => {
  const db = readDb();
  const { patientId, toothNum, condition, surfaces, notes } = req.body;
  if (!patientId || !toothNum) return res.status(400).json({ error: 'patientId and toothNum required' });

  if (!db.teethMap[patientId]) {
    db.teethMap[patientId] = {};
  }
  db.teethMap[patientId][toothNum] = {
    number: Number(toothNum),
    condition: condition || 'healthy',
    surfaces: surfaces || [],
    notes: notes || ''
  };
  writeDb(db);
  broadcastEvent('TEETH_UPDATED', { patientId, toothNum, data: db.teethMap[patientId][toothNum] });
  res.json(db.teethMap[patientId][toothNum]);
});

// ---------------- TREATMENTS ----------------
app.get('/api/treatments', (req, res) => {
  const db = readDb();
  res.json(db.treatmentPlans);
});

app.post('/api/treatments', (req, res) => {
  const db = readDb();
  const newPlan = {
    ...req.body,
    id: `TP-${100 + db.treatmentPlans.length + 1}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.treatmentPlans.unshift(newPlan);
  writeDb(db);
  broadcastEvent('TREATMENT_PLAN_ADDED', newPlan);
  res.status(201).json(newPlan);
});

app.patch('/api/treatments/:planId/items/:itemId/status', (req, res) => {
  const db = readDb();
  const plan = db.treatmentPlans.find(p => p.id === req.params.planId);
  if (!plan) return res.status(404).json({ error: 'Treatment plan not found' });
  const item = plan.items.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found in plan' });
  item.status = req.body.status;
  writeDb(db);
  broadcastEvent('TREATMENT_ITEM_UPDATED', { planId: plan.id, item });
  res.json(plan);
});

// ---------------- PRESCRIPTIONS ----------------
app.get('/api/prescriptions', (req, res) => {
  const db = readDb();
  res.json(db.prescriptions);
});

app.post('/api/prescriptions', (req, res) => {
  const db = readDb();
  const newRx = {
    ...req.body,
    id: `RX-${100 + db.prescriptions.length + 1}`,
    date: new Date().toISOString().split('T')[0]
  };
  db.prescriptions.unshift(newRx);
  writeDb(db);
  broadcastEvent('PRESCRIPTION_ADDED', newRx);
  res.status(201).json(newRx);
});

// ---------------- INVENTORY ----------------
app.get('/api/inventory', (req, res) => {
  const db = readDb();
  res.json(db.inventory);
});

app.post('/api/inventory/dispense', (req, res) => {
  const db = readDb();
  const { itemId, quantity } = req.body;
  const item = db.inventory.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Inventory item not found' });
  item.stock = Math.max(0, item.stock - Number(quantity));
  writeDb(db);
  broadcastEvent('INVENTORY_UPDATED', item);
  res.json(item);
});

// ---------------- INVOICES & PAYMENTS ----------------
app.get('/api/invoices', (req, res) => {
  const db = readDb();
  res.json(db.invoices);
});

app.post('/api/invoices', (req, res) => {
  const db = readDb();
  const newInv = {
    ...req.body,
    id: `INV-${9000 + db.invoices.length + 1}`,
    date: new Date().toISOString().split('T')[0]
  };
  db.invoices.unshift(newInv);
  writeDb(db);
  broadcastEvent('INVOICE_ADDED', newInv);
  res.status(201).json(newInv);
});

app.post('/api/invoices/:id/pay', (req, res) => {
  const db = readDb();
  const inv = db.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  const amount = Number(req.body.amount) || inv.balance;
  inv.paid += amount;
  inv.balance = Math.max(0, inv.total - inv.paid);
  inv.status = inv.balance === 0 ? 'Paid' : 'Partial';
  if (req.body.paymentMode) inv.paymentMode = req.body.paymentMode;

  // Update patient balance
  const pat = db.patients.find(p => p.id === inv.patientId);
  if (pat) {
    pat.balanceDue = Math.max(0, pat.balanceDue - amount);
  }

  writeDb(db);
  broadcastEvent('PAYMENT_RECORDED', { invoice: inv, patient: pat });
  res.json({ success: true, invoice: inv });
});

// ---------------- LAB ORDERS ----------------
app.get('/api/lab-orders', (req, res) => {
  const db = readDb();
  res.json(db.labOrders);
});

app.patch('/api/lab-orders/:id/status', (req, res) => {
  const db = readDb();
  const order = db.labOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Lab order not found' });
  order.status = req.body.status;
  writeDb(db);
  broadcastEvent('LAB_ORDER_UPDATED', order);
  res.json(order);
});

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🦷 TKR Dental Unified Server running on http://localhost:${PORT}`);
  console.log(`🌐 Doctor & Admin Portal available at http://localhost:${PORT}`);
  console.log(`📡 Real-time SSE sync active on http://localhost:${PORT}/api/events`);
});
