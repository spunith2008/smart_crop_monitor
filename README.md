# 🌾 Smart Crop Monitoring System

A simple, modern, and responsive **Crop Monitoring System website** designed for farmers to track crop health, soil conditions, micro-climate weather, and agricultural risk alerts — all in one accessible, clean portal.

Built with **pure HTML5, CSS3, and JavaScript** (no backend or complex setup required).

---

## 🌟 Key Features

### 1. 🏠 Home Page
- **Hero Banner:** Welcoming introduction to the "Smart Crop Monitoring System" with quick access buttons.
- **Farm Telemetry Summary:** Live counts of active monitored crops, average soil moisture, overall farm health score, and active diagnostic alerts.
- **Quick Navigation Modules:** Fast navigation to Dashboard, Crop Details, Soil Monitoring, Weather Forecast, Alerts, and Add Crop.
- **Daily Farmer Advisory:** Practical agricultural tips on irrigation, weather timing, and field care.

### 2. 📊 Farm Dashboard
- **5 Core Sensor Metrics:**
  - 🌡️ **Temperature:** Real-time ambient temperature (°C) and daily range.
  - 💧 **Humidity:** Atmospheric relative humidity (%).
  - 🌍 **Soil Moisture:** Current root-zone moisture percentage.
  - 🌧️ **Rainfall:** Precipitation accumulation (mm) for the day.
  - 🌿 **Crop Health Index:** Overall farm health score and ratio of healthy crops.
- **Interactive Visual Charts:**
  - 7-Day Temperature & Humidity dual-line chart.
  - 7-Day Soil Moisture bar chart against standard thresholds.
- **Quick Crop Health Status:** Color-coded status overview for active crops.

### 3. 🌱 Crop Details & Management
- Grid view of individual crops (Wheat, Maize, Basmati Rice, Tomato, Potato, etc.).
- Displays **Crop Name**, **Cultivar / Variety**, **Planting Date**, **Field Sector**, **Growth Stage** (with visual progress bar), and **Health Status** (`Healthy`, `Needs Monitoring`, `At Risk`).
- **Interactive Controls:**
  - Status filter pills (`All`, `Healthy`, `Needs Monitor`, `At Risk`).
  - Search bar to filter crops by name, variety, or sector.
  - Advance growth stage button (`⏩ Advance Stage`).
  - Remove / Delete crop action.

### 4. 🧪 Soil Monitoring
- **Primary Soil Parameters:** Soil moisture %, Soil pH scale, and Soil temperature with visual range gauges.
- **7-Day Trend Chart:** Dual-axis chart tracking historical soil moisture and pH stability.
- **NPK Nutrient Overview:** Nitrogen (N), Phosphorus (P), and Potassium (K) levels with fertility indications.
- **Farmer Soil Health Recommendations:** Direct, actionable advice for field irrigation and soil treatments.

### 5. ⛅ Weather Conditions & Forecast
- **Current Weather Hero:** Live condition text, large temperature display, humidity, rainfall, wind speed (km/h), and UV index.
- **5-Day Weather Forecast:** Daily forecasts with weather condition icons, temperature highs/lows, and precipitation chances.
- **Weekly Rainfall Chart:** Bar chart showing expected precipitation (mm) across the week.

### 6. 🔔 Alerts & Diagnostic Notifications
- Real-time agricultural alerts covering:
  - 🚨 **Low Soil Moisture Warning** (Critical drought stress detection).
  - 🌡️ **High Midday Temperature Alert** (Heat stress warning).
  - 🐛 **Crop Disease Risk** (Fungal blight early detection).
  - 💧 **Irrigation Status** (Completed watering cycles).
- Categorized by **Critical**, **Warning**, and **Resolved** with an interactive **"Mark Resolved"** action.

### 7. ➕ Add Crop Form
- Beginner-friendly form to enroll new crops into the monitoring system.
- Fields: Crop Name, Variety, Planting Date, Field Area (acres), Growth Stage, Initial Health Status, Sector / Plot ID, and Farmer Observations.
- Instant client-side validation, `localStorage` persistence, and automatic dashboard metric recalculation.

### 8. 🔄 Live Sensor Simulation
- Includes a **"Refresh Data"** button in the header that simulates realistic real-time sensor fluctuations and updates timestamps.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic, accessible markup.
- **CSS3:** Custom agricultural green color palette, CSS Grid, Flexbox, smooth transitions, and responsive mobile-first design.
- **JavaScript (ES6+):** Pure vanilla JavaScript for DOM manipulation, `localStorage` state management, search/filter algorithms, and chart integration.
- **Chart.js:** Responsive visual charts loaded via CDN.

---

## 📁 Project Structure

```
smart_crop_monitor/
├── index.html        # Main HTML document with all sections
├── style.css         # Agricultural green theme and responsive styles
├── app.js            # Dynamic application logic, sample data & charts
└── README.md         # Documentation and project overview
```

---

## 🚀 How to Run the Website

No build tools, servers, or dependencies to install!

1. Clone or download this repository:
   ```bash
   git clone https://github.com/spunith2008/smart_crop_monitor.git
   ```
2. Open the project folder:
   ```bash
   cd smart_crop_monitor
   ```
3. Open `index.html` in any modern web browser:
   - Double-click `index.html` directly, or
   - Right-click and choose **Open with Google Chrome / Microsoft Edge / Firefox**.

---

## 📱 Responsiveness

The interface is fully responsive across all device sizes:
- 📱 **Mobile (< 768px):** Slide-out drawer navigation with hamburger toggle and touch-friendly cards.
- 💻 **Tablet (768px – 1024px):** Adaptive multi-column grid layouts.
- 🖥️ **Desktop (> 1024px):** Persistent sidebar with full telemetry dashboard and side-by-side charts.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
