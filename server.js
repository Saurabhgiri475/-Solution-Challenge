require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

let mediaDB = [];
let reports = [];


async function addWatermark(input, output) {
  const svg = Buffer.from(`
    <svg width="400" height="100">
      <text x="10" y="50" font-size="24" fill="white">
        © Protected
      </text>
    </svg>
  `);

  await sharp(input)
    .resize(1024)
    .composite([{ input: svg, gravity: "southeast" }])
    .toFile(output);
}


function detectYOLO(imagePath) {
  return new Promise((resolve) => {
    const fixed = imagePath.replace(/\\/g, "/");

    exec(`python detect.py "${fixed}"`, (err, stdout, stderr) => {
      if (err) {
        console.log("YOLO Error:", err);
        console.log(stderr);
        return resolve([]);
      }

     
      const start = stdout.indexOf("[");
      const end = stdout.lastIndexOf("]");

      if (start !== -1 && end !== -1) {
        try {
          const json = stdout.substring(start, end + 1);
          return resolve(JSON.parse(json));
        } catch {}
      }

      resolve([]);
    });
  });
}


function detectSport(objects) {
  const labels = objects.map(o => o.class.toLowerCase());

  if (labels.includes("baseball bat") && labels.includes("person"))
    return "🏏 Cricket / Baseball";

  if (labels.includes("sports ball") && labels.includes("person"))
    return "⚽ Football";

  if (labels.includes("tennis racket"))
    return "🎾 Tennis";

  if (labels.includes("basketball"))
    return "🏀 Basketball";

  if (labels.includes("person"))
    return "🏃 Sports Activity";

  return "Unknown";
}


async function analyzeContent(filePath) {
  const yolo = await detectYOLO(filePath);

  if (!yolo.length) return "No objects detected";

  const objectsText = yolo.map(
    o => `${o.class} (${(o.confidence * 100).toFixed(1)}%)`
  );

  const sport = detectSport(yolo);

  const avg =
    yolo.reduce((sum, o) => sum + o.confidence, 0) / yolo.length;

  return `
Detected Sport: ${sport}

Objects:
${objectsText.join("\n")}

Average Confidence: ${(avg * 100).toFixed(2)}%
`;
}


app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded");

    console.log("Uploaded:", file.originalname);

    const isVideo = file.mimetype.startsWith("video");

    const watermarkedName = `watermarked-${file.filename}.png`;
    const watermarkedPath = `uploads/${watermarkedName}`;

    if (!isVideo) {
      await addWatermark(file.path, watermarkedPath);
    }

    const fixedPath = file.path + ".jpg";

    await sharp(file.path)
      .jpeg()
      .toFile(fixedPath);

    const hash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(file.path))
      .digest("hex");

    const duplicate = mediaDB.find(item => item.hash === hash);

    
    const analysis = await analyzeContent(fixedPath);


    let risk = 30;

    if (duplicate) risk += 40;
    if (analysis.includes("person")) risk += 20;
    if (analysis.includes("ball")) risk += 10;

    const report = {
      filename: file.originalname,
      hash,
      duplicate: !!duplicate,
      risk,
      analysis,
      watermarkedName,
      isVideo,
      reportSummary: `
File: ${file.originalname}
Risk: ${risk}
Duplicate: ${duplicate ? "Yes" : "No"}
`
    };

    mediaDB.push({ hash });
    reports.push(report);

    res.json(report);

  } catch (err) {
    console.log("ERROR:", err);

    res.status(200).json({
      filename: "Error",
      analysis: "AI failed",
      risk: 0
    });
  }
});


app.get("/stats", (req, res) => {
  res.json({
    total: reports.length,
    highRisk: reports.filter(r => r.risk > 70).length
  });
});

app.get("/reports", (req, res) => {
  res.json(reports);
});

app.get("/download/:name", (req, res) => {
  res.download(`uploads/${req.params.name}`);
});


app.listen(5000, () => {
  console.log("🚀 YOLO AI Server running on port 5000");
});