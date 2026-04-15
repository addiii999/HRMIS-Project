/* ═══════════════════════════════════════════════════════════
   HRMIS — app.js
   Human Resource Management Information System
   BCA 6th Semester Project — Premium Prototype v2.0
   ═══════════════════════════════════════════════════════════ */

/* ── CONSTANTS ──────────────────────────────────────────── */
const WORKING_DAYS_DEFAULT = 26;

/* ── SEED DATA ──────────────────────────────────────────── */
let employees = [
  { id: 'EMP001', name: 'Ravi Sharma',     dept: 'IT',         desig: 'Software Engineer',    salary: 55000, contact: '9876543210', present: 24, status: 'Active'   },
  { id: 'EMP002', name: 'Priya Mehta',     dept: 'HR',         desig: 'HR Executive',         salary: 42000, contact: '9812345678', present: 26, status: 'Active'   },
  { id: 'EMP003', name: 'Arjun Patel',     dept: 'Finance',    desig: 'Accountant',           salary: 48000, contact: '9823456789', present: 22, status: 'Active'   },
  { id: 'EMP004', name: 'Sneha Gupta',     dept: 'Marketing',  desig: 'Marketing Analyst',    salary: 40000, contact: '9834567890', present: 20, status: 'Active'   },
  { id: 'EMP005', name: 'Vikram Singh',    dept: 'IT',         desig: 'System Administrator', salary: 62000, contact: '9845678901', present: 25, status: 'Active'   },
  { id: 'EMP006', name: 'Meera Joshi',     dept: 'Operations', desig: 'Operations Manager',   salary: 70000, contact: '9856789012', present: 26, status: 'Active'   },
  { id: 'EMP007', name: 'Suresh Kumar',    dept: 'Finance',    desig: 'Finance Analyst',      salary: 53000, contact: '9867890123', present: 18, status: 'On Leave' },
  { id: 'EMP008', name: 'Ananya Reddy',    dept: 'IT',         desig: 'UI/UX Designer',       salary: 50000, contact: '9878901234', present: 23, status: 'Active'   },
  { id: 'EMP009', name: 'Rohit Desai',     dept: 'HR',         desig: 'Recruiter',            salary: 38000, contact: '9889012345', present: 24, status: 'Active'   },
  { id: 'EMP010', name: 'Kavya Nair',      dept: 'Marketing',  desig: 'Content Strategist',   salary: 44000, contact: '9890123456', present: 21, status: 'Active'   },
];

let nextId      = 11;
let workingDays = WORKING_DAYS_DEFAULT;

/* ── UTILITIES ──────────────────────────────────────────── */
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const pct = (p, w) => Math.round((p / w) * 100);

function attBadge(p, w) {
  const a = pct(p, w);
  if (a >= 90) return `<span class="badge badge-green">${a}%</span>`;
  if (a >= 75) return `<span class="badge badge-orange">${a}%</span>`;
  return `<span class="badge badge-red">${a}%</span>`;
}

function statusBadge(s) {
  if (s === 'Active')   return `<span class="badge badge-green">${s}</span>`;
  if (s === 'On Leave') return `<span class="badge badge-orange">${s}</span>`;
  return `<span class="badge badge-red">${s}</span>`;
}

function calcPayroll(emp) {
  const gross = (emp.salary / workingDays) * emp.present;
  const pf    = gross * 0.12;
  const tax   = gross * 0.10;
  const net   = gross - pf - tax;
  return { gross, pf, tax, net };
}

/* ── TAB SWITCHER ───────────────────────────────────────── */
function switchTab(tab) {
  // Hide all
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Show selected
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('nav-' + tab)?.classList.add('active');

  const titles = {
    dashboard:     ['Dashboard',      'Overview of your HR data'],
    employees:     ['Employees',      'Manage your employee directory'],
    attendance:    ['Attendance',     'Track monthly attendance records'],
    payroll:       ['Payroll',        'Automated salary processing'],
    reports:       ['Reports',        'Analytics & departmental summaries'],
    projectreport: ['Project Report', 'HRMIS — BCA 6th Semester MIS Project'],
  };

  document.getElementById('pageTitle').textContent = titles[tab][0];
  document.getElementById('pageSub').textContent   = titles[tab][1];

  if (tab === 'employees')  renderEmployees();
  if (tab === 'attendance') renderAttendance();
  if (tab === 'payroll')    renderPayroll();
  if (tab === 'reports')    renderReports();
}

/* ── DASHBOARD ──────────────────────────────────────────── */
function renderDashboard() {
  const total  = employees.length;
  const depts  = [...new Set(employees.map(e => e.dept))].length;
  const avgAtt = total > 0
    ? Math.round(employees.reduce((s, e) => s + pct(e.present, workingDays), 0) / total)
    : 0;
  const totNet = employees.reduce((s, e) => s + calcPayroll(e).net, 0);

  // Animate counter
  animateCount('kpi-total',      total,  false);
  animateCount('kpi-depts',      depts,  false);
  animateCount('kpi-attendance', avgAtt, false, '%');

  document.getElementById('kpi-salary').textContent = fmt(Math.round(totNet));

  // Department bar chart
  const deptMap = {};
  employees.forEach(e => { deptMap[e.dept] = (deptMap[e.dept] || 0) + 1; });
  const maxD = Math.max(...Object.values(deptMap), 1);
  let dHtml = '';
  Object.entries(deptMap).forEach(([d, c]) => {
    const w = Math.round((c / maxD) * 100);
    dHtml += `<div class="dept-row">
      <span class="dept-name">${d}</span>
      <div class="dept-bar-wrap"><div class="dept-bar-fill" style="width:${w}%"></div></div>
      <span class="dept-count">${c}</span>
    </div>`;
  });
  document.getElementById('deptChart').innerHTML = dHtml;

  // Top attendance bars (sorted, top 6)
  const sorted = [...employees]
    .sort((a, b) => pct(b.present, workingDays) - pct(a.present, workingDays))
    .slice(0, 6);
  let aHtml = '';
  sorted.forEach(e => {
    const a = pct(e.present, workingDays);
    aHtml += `<div class="att-row">
      <span class="att-name">${e.name.split(' ')[0]}</span>
      <div class="att-bar-wrap"><div class="att-bar-fill" style="width:${a}%"></div></div>
      <span class="att-pct">${a}%</span>
    </div>`;
  });
  document.getElementById('attBars').innerHTML = aHtml;

  // Recent table (first 5)
  const recent = employees.slice(0, 5);
  let rHtml = '';
  recent.forEach(e => {
    rHtml += `<tr>
      <td><span class="emp-id">${e.id}</span></td>
      <td>${e.name}</td>
      <td>${e.dept}</td>
      <td style="color:var(--accent);font-weight:700">${fmt(Math.round(calcPayroll(e).net))}</td>
      <td>${attBadge(e.present, workingDays)}</td>
      <td>${statusBadge(e.status)}</td>
    </tr>`;
  });
  document.getElementById('dashRecentBody').innerHTML = rHtml;
}

/* ── EMPLOYEES ──────────────────────────────────────────── */
function renderEmployees() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.dept.toLowerCase().includes(q) ||
    e.desig.toLowerCase().includes(q)
  );

  let html = '';
  filtered.forEach(e => {
    html += `<tr>
      <td><span class="emp-id">${e.id}</span></td>
      <td><strong>${e.name}</strong></td>
      <td>${e.dept}</td>
      <td>${e.desig}</td>
      <td>${fmt(e.salary)}</td>
      <td style="color:var(--text-muted)">${e.contact}</td>
      <td>${statusBadge(e.status)}</td>
      <td>
        <button class="btn-danger" onclick="removeEmployee('${e.id}')">Remove</button>
      </td>
    </tr>`;
  });

  document.getElementById('empTableBody').innerHTML = html ||
    '<tr><td colspan="8" style="text-align:center;color:var(--text-dim);padding:36px">No employees found.</td></tr>';
}

function removeEmployee(id) {
  employees = employees.filter(e => e.id !== id);
  renderEmployees();
  renderDashboard();
  showToast('Employee removed successfully.');
}

/* ── ATTENDANCE ─────────────────────────────────────────── */
function renderAttendance() {
  workingDays = parseInt(document.getElementById('workingDays').value) || WORKING_DAYS_DEFAULT;
  let html = '';
  employees.forEach(e => {
    const a = pct(e.present, workingDays);
    const statusLabel = a >= 90
      ? statusBadge('Active')
      : a >= 75
        ? '<span class="badge badge-orange">Average</span>'
        : '<span class="badge badge-red">Poor</span>';
    html += `<tr>
      <td><span class="emp-id">${e.id}</span></td>
      <td><strong>${e.name}</strong></td>
      <td>${e.dept}</td>
      <td>
        <input class="att-input" type="number" min="0" max="${workingDays}"
          value="${e.present}"
          onchange="updatePresent('${e.id}', this.value)" />
      </td>
      <td>${attBadge(e.present, workingDays)}</td>
      <td>${statusLabel}</td>
    </tr>`;
  });
  document.getElementById('attTableBody').innerHTML = html;
}

function updatePresent(id, val) {
  const emp = employees.find(e => e.id === id);
  if (emp) {
    emp.present = Math.min(Math.max(0, parseInt(val) || 0), workingDays);
    renderDashboard();
  }
}

function recalcAll() {
  workingDays = parseInt(document.getElementById('workingDays').value) || WORKING_DAYS_DEFAULT;
  renderAttendance();
  renderDashboard();
  showToast(`Recalculated with ${workingDays} working days.`);
}

/* ── PAYROLL ────────────────────────────────────────────── */
function renderPayroll() {
  let html = '';
  let totGross = 0, totPF = 0, totTax = 0, totNet = 0;

  employees.forEach(e => {
    const { gross, pf, tax, net } = calcPayroll(e);
    totGross += gross;
    totPF    += pf;
    totTax   += tax;
    totNet   += net;

    html += `<tr>
      <td><span class="emp-id">${e.id}</span></td>
      <td><strong>${e.name}</strong></td>
      <td>${fmt(e.salary)}</td>
      <td>${e.present}/${workingDays}</td>
      <td>${fmt(Math.round(gross))}</td>
      <td style="color:var(--s-orange)">${fmt(Math.round(pf))}</td>
      <td style="color:var(--s-red)">${fmt(Math.round(tax))}</td>
      <td style="color:var(--accent);font-weight:700">${fmt(Math.round(net))}</td>
      <td><span class="badge badge-cyan">Processed</span></td>
    </tr>`;
  });

  document.getElementById('payTableBody').innerHTML = html;
  document.getElementById('payrollSummary').innerHTML = `
    <div class="pay-stat">
      <span class="pay-stat-label">Gross Total</span>
      <span class="pay-stat-value">${fmt(Math.round(totGross))}</span>
    </div>
    <div class="pay-stat">
      <span class="pay-stat-label">Total PF</span>
      <span class="pay-stat-value" style="color:var(--s-orange)">${fmt(Math.round(totPF))}</span>
    </div>
    <div class="pay-stat">
      <span class="pay-stat-label">Total Tax</span>
      <span class="pay-stat-value" style="color:var(--s-red)">${fmt(Math.round(totTax))}</span>
    </div>
    <div class="pay-stat">
      <span class="pay-stat-label">Net Payable</span>
      <span class="pay-stat-value" style="color:var(--accent)">${fmt(Math.round(totNet))}</span>
    </div>
    <div class="pay-stat">
      <span class="pay-stat-label">Employees</span>
      <span class="pay-stat-value">${employees.length}</span>
    </div>
  `;
}

/* ── REPORTS ────────────────────────────────────────────── */
function renderReports() {
  // Payroll by department
  const deptPay = {};
  employees.forEach(e => {
    if (!deptPay[e.dept]) deptPay[e.dept] = { gross: 0, net: 0, count: 0 };
    const { gross, net } = calcPayroll(e);
    deptPay[e.dept].gross += gross;
    deptPay[e.dept].net   += net;
    deptPay[e.dept].count++;
  });

  let pHtml = '<table class="data-table"><thead><tr><th>Department</th><th>Employees</th><th>Gross</th><th>Net Pay</th></tr></thead><tbody>';
  Object.entries(deptPay).forEach(([d, v]) => {
    pHtml += `<tr>
      <td><strong>${d}</strong></td>
      <td>${v.count}</td>
      <td>${fmt(Math.round(v.gross))}</td>
      <td style="color:var(--accent);font-weight:700">${fmt(Math.round(v.net))}</td>
    </tr>`;
  });
  pHtml += '</tbody></table>';
  document.getElementById('reportPayrollTable').innerHTML = pHtml;

  // Attendance by department
  const deptAtt = {};
  employees.forEach(e => {
    if (!deptAtt[e.dept]) deptAtt[e.dept] = { total: 0, count: 0 };
    deptAtt[e.dept].total += pct(e.present, workingDays);
    deptAtt[e.dept].count++;
  });

  let aHtml = '<table class="data-table"><thead><tr><th>Department</th><th>Employees</th><th>Avg Attendance</th><th>Rating</th></tr></thead><tbody>';
  Object.entries(deptAtt).forEach(([d, v]) => {
    const avg = Math.round(v.total / v.count);
    const rating = avg >= 90
      ? '<span class="badge badge-green">Excellent</span>'
      : avg >= 75
        ? '<span class="badge badge-orange">Average</span>'
        : '<span class="badge badge-red">Poor</span>';
    aHtml += `<tr><td><strong>${d}</strong></td><td>${v.count}</td><td>${avg}%</td><td>${rating}</td></tr>`;
  });
  aHtml += '</tbody></table>';
  document.getElementById('reportAttTable').innerHTML = aHtml;

  // Vertical bar chart — dept headcount
  const deptCount = {};
  employees.forEach(e => { deptCount[e.dept] = (deptCount[e.dept] || 0) + 1; });
  const maxC = Math.max(...Object.values(deptCount), 1);
  let bHtml = '';
  Object.entries(deptCount).forEach(([d, c]) => {
    const h = Math.round((c / maxC) * 90);
    bHtml += `<div class="dept-bar-vert">
      <span class="vert-count">${c}</span>
      <div class="vert-outer"><div class="vert-fill" style="height:${h}px"></div></div>
      <span class="vert-label">${d}</span>
    </div>`;
  });
  document.getElementById('deptBarsReport').innerHTML = bHtml;
}

/* ── MODAL ──────────────────────────────────────────────── */
function openAddModal() {
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  ['fName', 'fDesig', 'fSalary', 'fContact', 'fPresent'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function addEmployee() {
  const name    = document.getElementById('fName').value.trim();
  const dept    = document.getElementById('fDept').value;
  const desig   = document.getElementById('fDesig').value.trim()  || 'Employee';
  const salary  = parseFloat(document.getElementById('fSalary').value);
  const contact = document.getElementById('fContact').value.trim() || 'N/A';
  const present = parseInt(document.getElementById('fPresent').value)  || 0;

  if (!name)              { showToast('Name is required.'); return; }
  if (!salary || salary <= 0) { showToast('Enter a valid salary.'); return; }

  const id = 'EMP' + String(nextId++).padStart(3, '0');
  employees.push({ id, name, dept, desig, salary, contact, present, status: 'Active' });

  closeModal();
  renderEmployees();
  renderDashboard();
  showToast(`${name} added to the directory.`);
}

/* ── TOAST ──────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── COUNTER ANIMATION ──────────────────────────────────── */
function animateCount(id, target, isCurrency, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  const start    = 0;
  const duration = 800;
  const step     = (timestamp) => {
    if (!step.startTime) step.startTime = timestamp;
    const progress = Math.min((timestamp - step.startTime) / duration, 1);
    const val = Math.round(progress * target);
    el.textContent = (isCurrency ? fmt(val) : val) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── DATE ───────────────────────────────────────────────── */
function setDate() {
  const d = new Date();
  document.getElementById('currentDate').textContent =
    d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/* ── INIT ───────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  setDate();
  renderDashboard();
});
