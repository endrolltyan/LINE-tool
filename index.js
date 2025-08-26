
const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateRandomString(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

function saveIP(ip) {
  const logFile = "./access_log.json";
  let logs = [];

  if (fs.existsSync(logFile)) {
    try {
      const content = fs.readFileSync(logFile, "utf-8").trim();
      if (content) {
        logs = JSON.parse(content);
      }
    } catch (err) {
      console.error("JSON読み込みエラー:", err);
      logs = [];
    }
  }

  logs.push({ ip, time: new Date().toISOString() });
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}


// APIエンドポイント
app.post("/api/message", (req, res) => {
  const { message, length } = req.body;
  const digits = parseInt(length) || 6;

  const random = generateRandomString(digits);
  const output = `${message} :${random}Byhimawari`;

  // IP取得（プロキシやHeroku等で必要な場合はX-Forwarded-Forも確認）
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  saveIP(ip);

  res.json({ output });
});

app.post("/api/save-ip", (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  saveIP(ip);
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`http://localhost:${port} でサーバーが動作中`);
});
