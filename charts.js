/**
 * charts.js - Zero-Dependency SVG Visualization Engine
 * 
 * Generates interactive vector radar charts and metric comparison bars
 * without any external libraries (Chart.js/D3) or cloud dependencies.
 */

class ScoreVisualizer {
  /**
   * Generates a 5-axis SVG Radar / Spider Chart
   * Axes: Conceptual Mastery, STAR Structure, Fluency, Assertiveness, Vocabulary Diversity
   */
  static renderRadarChart(containerId, metrics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = 320;
    const center = size / 2;
    const radius = 110;
    const axes = [
      { key: "concepts", label: "Concepts", value: metrics.concepts || 0 },
      { key: "structure", label: "Structure", value: metrics.structure || 0 },
      { key: "fluency", label: "Fluency", value: metrics.fluency || 0 },
      { key: "confidence", label: "Confidence", value: metrics.confidence || 0 },
      { key: "diversity", label: "Vocabulary", value: metrics.diversity || 0 }
    ];

    const angleStep = (Math.PI * 2) / axes.length;
    // Rotate so first axis points straight up
    const startAngle = -Math.PI / 2;

    // Web levels (circles) at 20%, 40%, 60%, 80%, 100%
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    let gridLines = "";

    levels.forEach(lvl => {
      const pts = [];
      for (let i = 0; i < axes.length; i++) {
        const a = startAngle + i * angleStep;
        const x = center + Math.cos(a) * (radius * lvl);
        const y = center + Math.sin(a) * (radius * lvl);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      gridLines += `<polygon points="${pts.join(" ")}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.2" stroke-dasharray="${lvl === 1.0 ? 'none' : '3,3'}"/>`;
    });

    // Axis spoke lines & labels
    let spokes = "";
    let labels = "";
    const dataPoints = [];

    axes.forEach((axis, i) => {
      const a = startAngle + i * angleStep;
      const xEnd = center + Math.cos(a) * radius;
      const yEnd = center + Math.sin(a) * radius;
      spokes += `<line x1="${center}" y1="${center}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="rgba(255,255,255,0.12)" stroke-width="1.2"/>`;

      // Label coordinate with outward offset
      const labelRadius = radius + 26;
      const xLbl = center + Math.cos(a) * labelRadius;
      const yLbl = center + Math.sin(a) * labelRadius;
      
      let anchor = "middle";
      if (Math.abs(Math.cos(a)) > 0.3) {
        anchor = Math.cos(a) > 0 ? "start" : "end";
      }

      labels += `
        <text x="${xLbl.toFixed(1)}" y="${(yLbl + 4).toFixed(1)}" 
              fill="#94a3b8" font-size="11" font-weight="600" text-anchor="${anchor}" class="radar-label">
          ${axis.label} (${Math.round(axis.value)}%)
        </text>
      `;

      // Data point coordinate
      const normVal = Math.max(5, Math.min(100, axis.value)) / 100;
      const xData = center + Math.cos(a) * (radius * normVal);
      const yData = center + Math.sin(a) * (radius * normVal);
      dataPoints.push({ x: xData, y: yData, val: axis.value });
    });

    const polygonPoints = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const markers = dataPoints.map(p => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#38bdf8" stroke="#0f172a" stroke-width="2" />
    `).join("");

    container.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" class="w-full h-auto radar-chart-svg" style="max-width: 320px; margin: 0 auto; display: block;">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
        ${gridLines}
        ${spokes}
        <polygon points="${polygonPoints}" fill="url(#radarFill)" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" class="radar-polygon"/>
        ${markers}
        ${labels}
      </svg>
    `;
  }

  /**
   * Generates metric progression horizontal bars
   */
  static renderProgressBar(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<div class="space-y-3">`;
    items.forEach(item => {
      const color = item.value >= 80 ? "bg-emerald-500" : item.value >= 60 ? "bg-cyan-500" : item.value >= 40 ? "bg-amber-500" : "bg-rose-500";
      html += `
        <div class="metric-row">
          <div class="flex justify-between items-center mb-1 text-xs font-medium">
            <span class="text-slate-300">${item.label}</span>
            <span class="text-slate-100 font-semibold">${item.value}%</span>
          </div>
          <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 ${color}" style="width: ${item.value}%"></div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }
}
