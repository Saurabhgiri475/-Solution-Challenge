import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// AI
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, highRisk: 0 });
  const [reports, setReports] = useState([]);
  const [showHighRisk, setShowHighRisk] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    mobilenet.load().then(setModel);
    loadStats();
    loadReports();
  }, []);

  // 🚀 UPLOAD FUNCTION
  const uploadFile = async () => {
    if (!file) return alert("Select file first!");

    let aiResult = "AI loading...";

    // 🔥 FRONTEND AI
    if (model) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const predictions = await model.classify(img);

      let detectedRaw = predictions.map(p => p.className).join(", ").toLowerCase();
      let confidence = (
        predictions.reduce((acc, p) => acc + p.probability, 0) /
        predictions.length * 100
      ).toFixed(2);
      const fileName = file.name.toLowerCase();

      let detected = "Unknown";

      // 🎯 SMART MAPPING
      if (
        detectedRaw.includes("bat") ||
        detectedRaw.includes("ball") ||
        fileName.includes("cricket")
      ) {
        detected = "🏏 Cricket";
      } else if (
        detectedRaw.includes("soccer") ||
        detectedRaw.includes("football") ||
        fileName.includes("football")
      ) {
        detected = "⚽ Football";
      } else if (
        detectedRaw.includes("basketball") ||
        fileName.includes("basketball")
      ) {
        detected = "🏀 Basketball";
      } else if (
        detectedRaw.includes("tennis") ||
        fileName.includes("tennis")
      ) {
        detected = "🎾 Tennis";
      } else if (detectedRaw.includes("person")) {
        detected = "🏃 Sports Activity";
      } else {
        detected = "Unknown Sport";
      }

      // 🎯 RISK LOGIC
      let riskLevel = "Low 🟢";
      if (confidence < 60) riskLevel = "Medium 🟠";
      if (confidence < 40) riskLevel = "High 🔴";

      aiResult = `
Frontend AI:
Detected: ${detected}
Confidence: ${confidence}%
Risk: ${riskLevel}

Explanation:
This detection is based on deep learning + smart mapping.
`;

      if (detected === "Unknown Sport") {
        aiResult += "\n⚠ AI uncertain — needs manual review.";
      }
    }

    // 📡 BACKEND CALL
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:5000/upload", formData);

    // 🔥 COMBINE RESULT
    setResult({
      ...res.data,
      analysis: `
      🧠 Frontend AI (Quick Prediction):
      ${aiResult}

     🔍 Backend AI (Accurate Detection):
     ${res.data.analysis}
     `
    });

    loadStats();
    loadReports();
  };

  const loadStats = async () => {
    const res = await axios.get("http://localhost:5000/stats");
    setStats(res.data);
  };

  const loadReports = async () => {
    const res = await axios.get("http://localhost:5000/reports");
    setReports(res.data);
  };

  const getColor = (risk) => {
    if (risk > 70) return "#ff4d4d";
    if (risk > 40) return "#ffa500";
    return "#4caf50";
  };

  const chartData = [
    { name: "Total", value: stats.total },
    { name: "High Risk", value: stats.highRisk },
  ];

  const getRiskLabel = (risk) => {
    if (risk > 70) return "High 🔴";
    if (risk > 40) return "Medium 🟠";
    return "Low 🟢";
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 AI Sports Media Guardian</h1>

      {/* Upload */}
      <motion.div style={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2>Upload Media</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <br /><br />
        <button style={styles.button} onClick={uploadFile}>
          Upload & Analyze ⚡
        </button>
      </motion.div>

      {/* RESULT */}
      {result && (
        <motion.div style={styles.card}>
          <h2>📊 Analysis</h2>

          <p>{result.filename}</p>
          <p>Duplicate: {result.duplicate ? "🚨 Yes" : "No"}</p>

          <p style={{ color: getColor(result.risk) }}>
            Risk Score: {result.risk}
          </p>

          <p>
            🌐 AI Scan: Completed
          </p>

          {result.risk > 70 && <h3 style={{ color: "red" }}>🚨 HIGH RISK</h3>}

          <pre style={styles.analysis}>{result.analysis}</pre>

          <a href={`http://localhost:5000/download/${result.watermarkedName}`} style={styles.download}>
            ⬇ Download Protected File
          </a>

          <p><b>Type:</b> {result.isVideo ? "🎥 Video" : "🖼 Image"}</p>

          <p><b>Risk Level:</b> {getRiskLabel(result.risk)}</p>

          <button onClick={() => alert(result.analysis)} style={styles.button}>
            🤖 Explain AI Result
          </button>

          <div style={styles.analysis}>
            <pre>{result.reportSummary}</pre>
          </div>

          <span style={styles.badge}>{getRiskLabel(result.risk)}</span>
        </motion.div>
      )}

      <button onClick={() => setShowHighRisk(!showHighRisk)} style={styles.button}>
        {showHighRisk ? "Show All Files" : "Show High Risk Only"}
      </button>

      {/* DASHBOARD */}
      <div style={styles.dashboard}>
        <div style={styles.statCard}>
          <h3>Total Files</h3>
          <p>{stats.total}</p>
        </div>

        <div style={styles.statCard}>
          <h3>High Risk</h3>
          <p>{stats.highRisk}</p>
        </div>
      </div>

      {/* CHART */}
      <div style={styles.card}>
        <h2>📈 Analytics</h2>
        <BarChart width={300} height={200} data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#0a1f44" />
        </BarChart>
      </div>

      {/* HISTORY */}
      {(showHighRisk ? reports.filter(r => r.risk > 70) : reports).map((r, i) => (
        <div key={i} style={styles.history}>
          {r.filename} → {getRiskLabel(r.risk)}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    minHeight: "100vh",
    padding: "30px",
    color: "#e0e0ff",
    textAlign: "center"
  },
  title: { fontSize: "32px", marginBottom: "20px" },
  card: { padding: "20px", margin: "20px", borderRadius: "10px", background: "rgba(255,255,255,0.1)" },
  button: { padding: "10px", margin: "10px", cursor: "pointer" },
  dashboard: { display: "flex", justifyContent: "center", gap: "20px" },
  statCard: { padding: "10px", background: "#222", borderRadius: "8px" },
  analysis: { background: "#000", padding: "10px", borderRadius: "5px" },
  history: { marginTop: "5px" },
  download: { display: "block", marginTop: "10px" },
  badge: { padding: "5px", background: "#444", borderRadius: "5px" }
};

export default App;