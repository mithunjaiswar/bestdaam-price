"use client";

import { useState } from "react";

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function shortDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function PriceHistoryChart({ points }) {
  const [hover, setHover] = useState(null);

  if (!Array.isArray(points) || points.length === 0) {
    return (
      <div className="chart-empty">
        Price history abhi available nahi hai.
      </div>
    );
  }

  if (points.length === 1) {
    return (
      <div className="chart-empty">
        <strong>{shortDate(points[0].date)}:</strong>{" "}
        {formatINR(points[0].price)}
        <br />
        Daily updates ke baad yahan asli price trend dikhega.
      </div>
    );
  }

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const yMin = min - span * 0.15;
  const yMax = max + span * 0.15;

  const x = (i) =>
    PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v) =>
    PAD.top + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`)
    .join(" ");

  const gridVals = [min, (min + max) / 2, max];
  const xTicks = [0, Math.floor(points.length / 2), points.length - 1];
  const last = points[points.length - 1];

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const frac = (px - PAD.left) / (W - PAD.left - PAD.right);
    const i = Math.round(frac * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  }

  return (
    <div className="chart-wrap">
      <div className="chart-summary">
        Is period me sabse kam: <strong>{formatINR(min)}</strong> · sabse zyada:{" "}
        <strong>{formatINR(max)}</strong>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="price-chart"
        role="img"
        aria-label={`Asli price history. Sabse kam ${formatINR(min)}, sabse zyada ${formatINR(max)}.`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {gridVals.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(v) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#6b7280"
            >
              {formatINR(v)}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            fontSize="11"
            fill="#6b7280"
          >
            {shortDate(points[i].date)}
          </text>
        ))}
        <path d={path} fill="none" stroke="#138a36" strokeWidth="2" />
        <circle
          cx={x(points.length - 1)}
          cy={y(last.price)}
          r="4"
          fill="#138a36"
          stroke="#fff"
          strokeWidth="2"
        />
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={x(hover)}
              cy={y(points[hover].price)}
              r="5"
              fill="#138a36"
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
      <div className="chart-tooltip" aria-live="polite">
        {hover !== null
          ? `${shortDate(points[hover].date)}: ${formatINR(points[hover].price)}`
          : " "}
      </div>
      <details className="chart-table">
        <summary>Table me dekho</summary>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Sabse sasta daam</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.date}>
                <td>{shortDate(p.date)}</td>
                <td>{formatINR(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
