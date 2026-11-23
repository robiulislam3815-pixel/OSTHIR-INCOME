
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://robiulislam3815-pixel.github.io"
}));

app.use(express.json());

function verifyTelegramData(initData) {
  if (!process.env.BOT_TOKEN || !initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) return null;

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(calculatedHash, "hex");

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));

  if (!authDate || Math.abs(Date.now() / 1000 - authDate) > 86400) {
    return null;
  }

  try {
    return JSON.parse(params.get("user") || "null");
  } catch {
    return null;
  }
}

app.get("/", (req, res) => {
  res.send("OSTHIR INCOME Backend is running!");
});

app.post("/api/auth", (req, res) => {
  const user = verifyTelegramData(req.body.initData);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Telegram verification failed"
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      first_name: user.first_name,
      username: user.username || null
    }
  });
});

app.listen(PORT, () => {
  console.log(`OSTHIR INCOME Server running on port ${PORT}`);
});
