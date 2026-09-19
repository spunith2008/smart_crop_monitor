/* =========================================================
   Smart Crop Monitoring System - Application Logic
   Pure JavaScript (ES6+) | Sample Data & Interactive UI
   ========================================================= */

// --- Default Demo Data ---
const DEFAULT_CROPS = [
  {
    id: 1,
    name: "Wheat",
    variety: "Sharbati Gold (HD-2967)",
    plantDate: "2026-01-15",
    area: "3.5",
    stage: "Flowering",
    stageProgress: 65,
    health: "Healthy",
    icon: "🌾",
    sector: "Sector A1",
    notes: "Regular nitrogen top-dressing completed. Good tillering observed."
  },
  {
    id: 2,
    name: "Maize (Corn)",
    variety: "Pioneer 3396",
    plantDate: "2026-02-01",
    area: "2.0",
    stage: "Vegetative",
    stageProgress: 45,
    health: "Monitor",
    icon: "🌽",
    sector: "Sector B2",
    notes: "Soil moisture dropping in the south corner; slight leaf curling seen."
  },
  {
    id: 3,
    name: "Basmati Rice",
    variety: "Pusa 1121",
    plantDate: "2026-01-10",
    area: "4.0",
    stage: "Fruiting",
    stageProgress: 80,
    health: "Healthy",
    icon: "🍚",
    sector: "Sector C1",
    notes: "Standing water level maintained at 5cm. Optimal grain development."
  },
  {
    id: 4,
    name: "Organic Tomato",
    variety: "Roma VF",
    plantDate: "2026-02-18",
    area: "1.2",
    stage: "Flowering",
    stageProgress: 55,
    health: "At Risk",
    icon: "🍅",
    sector: "Sector A2",
    notes: "Early signs of fungal blight spotted on lower foliage after recent rains."
  },
  {
    id: 5,
    name: "Potato",
    variety: "Kufri Jyoti",
    plantDate: "2026-01-28",
    area: "2.5",
    stage: "Maturity",
    stageProgress: 90,
    health: "Healthy",
    icon: "🥔",
    sector: "Sector D1",
    notes: "Tuber bulking is strong. Ready for harvest within 10 to 14 days."
  }
];

const DEFAULT_ALERTS = [
  {
    id: 1,
    type: "critical",
    title: "Low Soil Moisture Warning",
    sector: "Sector B2 (Maize Plot)",
    time: "25 mins ago",
    description: "Moisture level dropped to 18%, significantly below the 35% threshold. Recommend starting drip irrigation immediately to avoid heat wilt.",
    resolved: false
  },
  {
    id: 2,
    type: "warning",
    title: "High Midday Temperature Alert",
    sector: "All Farm Sectors",
    time: "2 hours ago",
    description: "Ambient temperature peaked at 34.5°C with high solar radiation. Ensure adequate shade cover for young nursery beds.",
    resolved: false
  },
  {
    id: 3,
    type: "warning",
    title: "Crop Disease Risk (Early Blight)",
    sector: "Sector A2 (Tomato Plot)",
    time: "Yesterday at 4:30 PM",
    description: "High humidity and wet leaves detected. Early blight risk is high. Recommend bio-fungicide foliar spray (Trichoderma).",
    resolved: false
  },
  {
    id: 4,
    type: "resolved",
    title: "Scheduled Irrigation Completed",
    sector: "Sector C1 (Rice Plot)",
    time: "Yesterday at 08:00 AM",
    description: "Automated pump ran for 45 minutes. Water ponding depth restored to 5.2 cm. Sensor readings stabilized.",
    resolved: true
  }
];

const FORECAST_DAYS = [
  { day: "Today", icon: "🌤️", condition: "Partly Cloudy", temp: "28°C", low: "19°C", rain: "10%" },
  { day: "Tomorrow", icon: "☀️", condition: "Sunny & Warm", temp: "30°C", low: "20°C", rain: "0%" },
  { day: "Thu", icon: "🌦️", condition: "Scattered Showers", temp: "26°C", low: "18°C", rain: "65%" },
  { day: "Fri", icon: "🌧️", condition: "Moderate Rain", temp: "24°C", low: "17°C", rain: "80%" },
  { day: "Sat", icon: "⛅", condition: "Mostly Sunny", temp: "27°C", low: "18°C", rain: "20%" }
];

// --- Application State ---
let crops = [];
let alerts = [];
let chartInstances = {};
let currentCropFilter = "all";
let currentAlertFilter = "all";

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupNavigation();
  setupDateAndSync();
  renderDashboardKPIs();
  initCharts();
  renderCrops();
  renderAlerts();
  renderForecast();
  setupAddCropForm();
  setupSearchAndFilters();
  setupMobileDrawer();
  setupRefreshSimulation();
});

// --- LocalStorage Management ---
function loadData() {
  const savedCrops = localStorage.getItem("cropwatch_crops");
  crops = savedCrops ? JSON.parse(savedCrops) : [...DEFAULT_CROPS];

  const savedAlerts = localStorage.getItem("cropwatch_alerts");
  alerts = savedAlerts ? JSON.parse(savedAlerts) : [...DEFAULT_ALERTS];
}

function saveCrops() {
  localStorage.setItem("cropwatch_crops", JSON.stringify(crops));
}

function saveAlerts() {
  localStorage.setItem("cropwatch_alerts", JSON.stringify(alerts));
}

// --- Navigation & Section Switching ---
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn, [data-section]");

  navButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetSection = btn.getAttribute("data-section");
      if (targetSection) {
        e.preventDefault();
        switchToSection(targetSection);
        closeMobileSidebar();
      }
    });
  });

  // Check URL hash if available
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(`section-${hash}`)) {
    switchToSection(hash);
  }
}

function switchToSection(sectionId) {
  // Update sidebar active buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    if (btn.getAttribute("data-section") === sectionId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Switch visible section
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  const activeSec = document.getElementById(`section-${sectionId}`);
  if (activeSec) {
    activeSec.classList.add("active");
    window.location.hash = sectionId;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Resize charts to fit container
    Object.values(chartInstances).forEach(chart => {
      if (chart) chart.resize();
    });
  }
}

// --- Topbar Date & Live Time ---
function setupDateAndSync() {
  const dateEl = document.getElementById("currentDate");
  const lastSyncEl = document.getElementById("lastSync");

  const updateTimestamps = () => {
    const now = new Date();
    const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, options);
    if (lastSyncEl) lastSyncEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  updateTimestamps();
  setInterval(updateTimestamps, 60000);
}

// --- Dashboard KPIs ---
function renderDashboardKPIs() {
  // Calculate crop health overview
  const totalCrops = crops.length;
  const healthyCount = crops.filter(c => c.health === "Healthy").length;
  const atRiskCount = crops.filter(c => c.health === "At Risk").length;
  
  const healthPercent = totalCrops > 0 ? Math.round((healthyCount / totalCrops) * 100) : 100;
  
  const dashHealthVal = document.getElementById("dashHealth");
  const dashHealthSub = document.getElementById("dashHealthSub");
  if (dashHealthVal) {
    dashHealthVal.textContent = `${healthPercent}%`;
  }
  if (dashHealthSub) {
    dashHealthSub.textContent = `${healthyCount} of ${totalCrops} crops optimal`;
  }

  // Home summary counts
  const homeCropCount = document.getElementById("homeCropCount");
  if (homeCropCount) homeCropCount.textContent = totalCrops;

  const homeHealthScore = document.getElementById("homeHealthScore");
  if (homeHealthScore) homeHealthScore.textContent = `${healthPercent}%`;

  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const homeAlertCount = document.getElementById("homeAlertCount");
  if (homeAlertCount) homeAlertCount.textContent = unresolvedAlerts;

  const alertBadge = document.getElementById("alertBadge");
  if (alertBadge) alertBadge.textContent = unresolvedAlerts;

  // Render quick status list in dashboard
  const statusContainer = document.getElementById("dashboardStatusList");
  if (statusContainer) {
    statusContainer.innerHTML = crops.slice(0, 4).map(c => {
      let tagClass = "green";
      if (c.health === "Monitor") tagClass = "orange";
      if (c.health === "At Risk") tagClass = "red";
      return `
        <div class="status-item ${c.health === 'Healthy' ? 'good' : (c.health === 'Monitor' ? 'warn' : 'bad')}">
          <span>${c.icon} ${c.name}</span>
          <span class="tag ${tagClass}">${c.health}</span>
        </div>
      `;
    }).join("");
  }
}

// --- Chart.js Initializations ---
function initCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded. Simple charts fallback.");
    return;
  }

  // Chart defaults for clean, readable agricultural theme
  Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.color = "#64748b";

  // 1. Dashboard: Temperature & Humidity Trend
  const tempHumidCtx = document.getElementById("tempHumidChart");
  if (tempHumidCtx) {
    chartInstances.tempHumid = new Chart(tempHumidCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Temp (°C)",
            data: [26, 27, 29, 31, 28, 27, 28],
            borderColor: "#e67e22",
            backgroundColor: "rgba(230, 126, 34, 0.12)",
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: "y"
          },
          {
            label: "Humidity (%)",
            data: [70, 68, 62, 58, 65, 67, 65],
            borderColor: "#0288d1",
            backgroundColor: "rgba(2, 136, 209, 0.10)",
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            min: 15,
            max: 40,
            title: { display: true, text: "°C" },
            grid: { color: "#f1f5f9" }
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            min: 40,
            max: 100,
            title: { display: true, text: "%" },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { color: "#f8fafc" } }
        },
        plugins: {
          legend: { position: "top", labels: { boxWidth: 12, usePointStyle: true } }
        }
      }
    });
  }

  // 2. Dashboard: Soil Moisture Trend
  const moistureCtx = document.getElementById("moistureChart");
  if (moistureCtx) {
    chartInstances.moisture = new Chart(moistureCtx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Soil Moisture (%)",
          data: [48, 46, 43, 40, 38, 52, 42],
          backgroundColor: "#2e7d32",
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: "% Moisture" },
            grid: { color: "#f1f5f9" }
          },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // 3. Soil Monitoring: 7-Day Soil pH & Moisture Trends
  const soilChartCtx = document.getElementById("soilChart");
  if (soilChartCtx) {
    chartInstances.soil = new Chart(soilChartCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
        datasets: [
          {
            label: "Moisture (%)",
            data: [48, 46, 44, 41, 39, 45, 42],
            borderColor: "#0288d1",
            backgroundColor: "rgba(2, 136, 209, 0.15)",
            tension: 0.3,
            fill: true,
            yAxisID: "y"
          },
          {
            label: "pH Level",
            data: [6.6, 6.5, 6.5, 6.4, 6.5, 6.4, 6.5],
            borderColor: "#2e7d32",
            borderDash: [5, 5],
            tension: 0.2,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            min: 20,
            max: 70,
            title: { display: true, text: "Moisture (%)" },
            grid: { color: "#f1f5f9" }
          },
          y1: {
            position: "right",
            min: 5,
            max: 8,
            title: { display: true, text: "Soil pH" },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { color: "#f8fafc" } }
        }
      }
    });
  }

  // 4. Weather: Weekly Rainfall Forecast
  const rainfallChartCtx = document.getElementById("rainfallChart");
  if (rainfallChartCtx) {
    chartInstances.rainfall = new Chart(rainfallChartCtx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Rainfall (mm)",
          data: [0, 2, 0, 14, 22, 5, 0],
          backgroundColor: "#0288d1",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Rainfall (mm)" },
            grid: { color: "#f1f5f9" }
          },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// --- Crop Details Section ---
function renderCrops() {
  const grid = document.getElementById("cropGrid");
  if (!grid) return;

  const searchQuery = document.getElementById("cropSearch") ? document.getElementById("cropSearch").value.toLowerCase() : "";

  const filtered = crops.filter(crop => {
    const matchesFilter = (currentCropFilter === "all") || (crop.health.toLowerCase() === currentCropFilter.toLowerCase());
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery) ||
                          crop.variety.toLowerCase().includes(searchQuery) ||
                          (crop.sector && crop.sector.toLowerCase().includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: 14px; border: 1px dashed #cbd5e1;">
        <span style="font-size: 3rem;">🔍</span>
        <h3 style="margin: 0.8rem 0 0.3rem; color: #1e293b;">No Crops Found</h3>
        <p style="color: #64748b; font-size: 0.9rem;">Try adjusting your filter or search query, or add a new crop.</p>
        <button class="btn-primary" style="margin-top: 1rem;" data-section="addcrop" onclick="switchToSection('addcrop')">➕ Add New Crop</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(crop => {
    let tagClass = "green";
    if (crop.health === "Monitor") tagClass = "orange";
    if (crop.health === "At Risk") tagClass = "red";

    return `
      <div class="crop-card" id="crop-${crop.id}">
        <div class="crop-card-header">
          <div class="crop-title-group">
            <div class="crop-emoji">${crop.icon || "🌱"}</div>
            <div>
              <h3 class="crop-name">${escapeHtml(crop.name)}</h3>
              <p class="crop-variety">${escapeHtml(crop.variety || "Standard Variety")}</p>
            </div>
          </div>
          <span class="tag ${tagClass}">${crop.health}</span>
        </div>

        <div class="crop-specs">
          <div class="spec-item">
            <span class="spec-label">Planted On</span>
            <span class="spec-value">${crop.plantDate}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Area</span>
            <span class="spec-value">${crop.area || "1.0"} Acres</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Sector</span>
            <span class="spec-value">${crop.sector || "Main Field"}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Status</span>
            <span class="spec-value">${crop.health}</span>
          </div>
        </div>

        <div class="stage-section">
          <div class="stage-header">
            <span class="stage-title">Growth Stage</span>
            <span class="stage-name">${escapeHtml(crop.stage)}</span>
          </div>
          <div class="stage-progress-bar">
            <div class="stage-fill" style="width: ${crop.stageProgress || 50}%"></div>
          </div>
        </div>

        ${crop.notes ? `
          <div style="font-size: 0.82rem; color: #64748b; background: #fafdfa; border-left: 3px solid #a5d6a7; padding: 0.5rem 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
            ${escapeHtml(crop.notes)}
          </div>
        ` : ''}

        <div class="crop-card-footer">
          <button class="btn-card-action" onclick="cycleCropStage(${crop.id})">
            ⏩ Advance Stage
          </button>
          <button class="btn-card-action btn-card-delete" onclick="deleteCrop(${crop.id})">
            🗑️ Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function setupSearchAndFilters() {
  const searchInput = document.getElementById("cropSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderCrops();
    });
  }

  const pillBtns = document.querySelectorAll(".pill-btn[data-filter]");
  pillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      pillBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCropFilter = btn.getAttribute("data-filter");
      renderCrops();
    });
  });
}

function cycleCropStage(cropId) {
  const stages = [
    { name: "Germination", progress: 15 },
    { name: "Seedling", progress: 35 },
    { name: "Vegetative", progress: 50 },
    { name: "Flowering", progress: 70 },
    { name: "Fruiting", progress: 85 },
    { name: "Maturity", progress: 95 },
    { name: "Harvest", progress: 100 }
  ];

  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;

  const currentIdx = stages.findIndex(s => s.name.toLowerCase() === crop.stage.toLowerCase());
  const nextIdx = (currentIdx + 1) % stages.length;

  crop.stage = stages[nextIdx].name;
  crop.stageProgress = stages[nextIdx].progress;

  saveCrops();
  renderCrops();
  renderDashboardKPIs();
  showToast(`Updated ${crop.name} stage to: ${crop.stage}`);
}

function deleteCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;

  if (confirm(`Are you sure you want to remove ${crop.name} from monitoring?`)) {
    crops = crops.filter(c => c.id !== cropId);
    saveCrops();
    renderCrops();
    renderDashboardKPIs();
    showToast(`Removed ${crop.name} successfully.`);
  }
}

// --- Add Crop Form ---
function setupAddCropForm() {
  const form = document.getElementById("addCropForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Clear existing errors
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");

    const name = document.getElementById("cropName").value.trim();
    const variety = document.getElementById("cropVariety").value.trim();
    const plantDate = document.getElementById("plantDate").value;
    const area = document.getElementById("fieldArea").value.trim();
    const stage = document.getElementById("growthStage").value;
    const health = document.getElementById("healthStatus").value;
    const sector = document.getElementById("fieldSector").value.trim() || "Sector A";
    const notes = document.getElementById("cropNotes").value.trim();

    let hasError = false;

    if (!name) {
      document.getElementById("cropNameErr").textContent = "Please enter a crop name";
      hasError = true;
    }

    if (!plantDate) {
      document.getElementById("plantDateErr").textContent = "Please select planting date";
      hasError = true;
    }

    if (!stage) {
      document.getElementById("growthStageErr").textContent = "Please select current stage";
      hasError = true;
    }

    if (hasError) return;

    // Guess icon based on crop name
    let icon = "🌱";
    const lower = name.toLowerCase();
    if (lower.includes("wheat")) icon = "🌾";
    else if (lower.includes("corn") || lower.includes("maize")) icon = "🌽";
    else if (lower.includes("rice") || lower.includes("paddy")) icon = "🍚";
    else if (lower.includes("tomato")) icon = "🍅";
    else if (lower.includes("potato")) icon = "🥔";
    else if (lower.includes("pepper") || lower.includes("chili")) icon = "🌶️";
    else if (lower.includes("carrot")) icon = "🥕";
    else if (lower.includes("cotton")) icon = "☁️";

    // Growth percentage mapping
    const stageProgressMap = {
      "Germination": 15,
      "Seedling": 35,
      "Vegetative": 50,
      "Flowering": 70,
      "Fruiting": 85,
      "Maturity": 95,
      "Harvest": 100
    };

    const newCrop = {
      id: Date.now(),
      name,
      variety: variety || "Standard Variety",
      plantDate,
      area: area || "1.0",
      stage,
      stageProgress: stageProgressMap[stage] || 50,
      health: health || "Healthy",
      icon,
      sector,
      notes
    };

    crops.unshift(newCrop);
    saveCrops();
    renderCrops();
    renderDashboardKPIs();

    // Show inline success message
    const successBox = document.getElementById("formSuccess");
    if (successBox) {
      successBox.hidden = false;
      setTimeout(() => { successBox.hidden = true; }, 6000);
    }

    form.reset();
    showToast(`Added ${newCrop.name} successfully!`);
  });
}

// --- Alerts Section ---
function renderAlerts() {
  const alertsList = document.getElementById("alertsList");
  if (!alertsList) return;

  const criticalCount = alerts.filter(a => a.type === "critical" && !a.resolved).length;
  const warningCount = alerts.filter(a => a.type === "warning" && !a.resolved).length;
  const resolvedCount = alerts.filter(a => a.resolved).length;

  const critEl = document.getElementById("criticalCount");
  const warnEl = document.getElementById("warningCount");
  const resEl = document.getElementById("resolvedCount");

  if (critEl) critEl.textContent = criticalCount;
  if (warnEl) warnEl.textContent = warningCount;
  if (resEl) resEl.textContent = resolvedCount;

  const filtered = alerts.filter(a => {
    if (currentAlertFilter === "all") return true;
    if (currentAlertFilter === "resolved") return a.resolved;
    if (currentAlertFilter === "critical") return a.type === "critical" && !a.resolved;
    if (currentAlertFilter === "warning") return a.type === "warning" && !a.resolved;
    return true;
  });

  if (filtered.length === 0) {
    alertsList.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <span style="font-size: 2.5rem;">🎉</span>
        <h4 style="margin: 0.5rem 0 0.2rem; color: #1e293b;">No Alerts in this category</h4>
        <p style="color: #64748b; font-size: 0.85rem;">All monitored conditions are within normal parameters.</p>
      </div>
    `;
    return;
  }

  alertsList.innerHTML = filtered.map(alert => {
    let icon = "🔔";
    if (alert.type === "critical") icon = "🚨";
    else if (alert.type === "warning") icon = "⚠️";
    else if (alert.resolved) icon = "✅";

    return `
      <div class="alert-item ${alert.resolved ? 'resolved' : alert.type}">
        <div class="alert-icon-box">${icon}</div>
        <div class="alert-details">
          <div class="alert-top">
            <h4 class="alert-title">${escapeHtml(alert.title)}</h4>
            <span class="alert-time">${escapeHtml(alert.time)}</span>
          </div>
          <p class="alert-desc">${escapeHtml(alert.description)}</p>
          <div class="alert-action-row">
            <span style="font-size: 0.8rem; font-weight: 600; color: #64748b;">📍 ${escapeHtml(alert.sector)}</span>
            ${!alert.resolved ? `
              <button class="btn-resolve" onclick="resolveAlert(${alert.id})">
                ✓ Mark Resolved
              </button>
            ` : `
              <span style="font-size: 0.8rem; color: #2e7d32; font-weight: 700;">✓ Issue Resolved</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Update badge count
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const alertBadge = document.getElementById("alertBadge");
  if (alertBadge) alertBadge.textContent = unresolvedAlerts;
}

function resolveAlert(alertId) {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    alert.time = "Just now";
    saveAlerts();
    renderAlerts();
    renderDashboardKPIs();
    showToast("Alert resolved and moved to history.");
  }
}

// --- Weather 5-Day Forecast ---
function renderForecast() {
  const container = document.getElementById("forecastCards");
  if (!container) return;

  container.innerHTML = FORECAST_DAYS.map(day => `
    <div class="forecast-day-card">
      <div class="forecast-day-name">${day.day}</div>
      <div class="forecast-icon">${day.icon}</div>
      <div class="forecast-temp">${day.temp}</div>
      <div class="forecast-sub">${day.low} | 🌧️ ${day.rain}</div>
    </div>
  `).join("");
}

// --- Refresh Sensor Simulation ---
function setupRefreshSimulation() {
  const syncBtn = document.getElementById("syncBtn");
  if (!syncBtn) return;

  syncBtn.addEventListener("click", () => {
    syncBtn.classList.add("spinning");
    
    setTimeout(() => {
      // Fluctuate temperature slightly (27°C - 30°C)
      const newTemp = Math.floor(Math.random() * 4) + 27;
      const newHumidity = Math.floor(Math.random() * 8) + 61;
      const newMoisture = Math.floor(Math.random() * 6) + 40;
      const newSoilTemp = Math.floor(Math.random() * 3) + 21;
      const newSoilPH = (6.3 + Math.random() * 0.4).toFixed(1);

      // Update Dashboard values
      const dashTemp = document.getElementById("dashTemp");
      const dashHumidity = document.getElementById("dashHumidity");
      const dashMoisture = document.getElementById("dashMoisture");
      if (dashTemp) dashTemp.textContent = newTemp;
      if (dashHumidity) dashHumidity.textContent = newHumidity;
      if (dashMoisture) dashMoisture.textContent = newMoisture;

      // Update Soil values
      const soilMoisture = document.getElementById("soilMoisture");
      const soilPH = document.getElementById("soilPH");
      const soilTemp = document.getElementById("soilTemp");
      if (soilMoisture) soilMoisture.textContent = `${newMoisture}%`;
      if (soilPH) soilPH.textContent = newSoilPH;
      if (soilTemp) soilTemp.textContent = `${newSoilTemp}°C`;

      // Update Weather values
      const weatherTempBig = document.getElementById("weatherTempBig");
      const wHumidity = document.getElementById("wHumidity");
      if (weatherTempBig) weatherTempBig.textContent = `${newTemp}°C`;
      if (wHumidity) wHumidity.textContent = `${newHumidity}%`;

      // Update timestamp
      const lastSync = document.getElementById("lastSync");
      if (lastSync) lastSync.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      syncBtn.classList.remove("spinning");
      showToast("Live sensor data refreshed!");
    }, 600);
  });
}

// --- Mobile Drawer Handling ---
function setupMobileDrawer() {
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
      closeMobileSidebar();
    });
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
}

// --- Toast Feedback ---
function showToast(message) {
  const existing = document.querySelector(".toast-notice");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notice";
  toast.innerHTML = `<span>🌾</span> <span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Utility: HTML Escape ---
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
