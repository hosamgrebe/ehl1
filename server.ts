import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google Sheets Setup
  const getDoc = async () => {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!sheetId || !email || !key) {
      console.warn("Google Sheets credentials missing. Running in Mock Mode.");
      return null;
    }

    const serviceAccountAuth = new JWT({
      email: email,
      key: key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  };

  // API Routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const doc = await getDoc();
      if (!doc) {
        // Return mock data or empty list if no credentials
        return res.json([]);
      }
      const sheet = doc.sheetsByTitle["Transactions"];
      if (!sheet) return res.json([]);
      const rows = await sheet.getRows();
      const transactions = rows.map((row) => ({
        id: row.get("ID"),
        timestamp: row.get("Timestamp"),
        fund: row.get("Fund"),
        type: row.get("Type"),
        amount: parseFloat(row.get("Amount")),
        note: row.get("Note"),
        balanceAfter: parseFloat(row.get("BalanceAfter")),
      }));
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { fund, type, amount, note, timestamp, balanceAfter } = req.body;
      const doc = await getDoc();
      
      if (!doc) {
        console.log("Mock Save:", req.body);
        return res.json({ success: true, message: "Saved in Mock Mode" });
      }

      const sheet = doc.sheetsByTitle["Transactions"];
      if (!sheet) {
        await doc.addSheet({ title: "Transactions", headerValues: ["ID", "Timestamp", "Fund", "Type", "Amount", "Note", "BalanceAfter"] });
      }
      
      const id = Math.random().toString(36).substr(2, 9);
      await sheet.addRow({
        ID: id,
        Timestamp: timestamp,
        Fund: fund,
        Type: type,
        Amount: amount,
        Note: note,
        BalanceAfter: balanceAfter,
      });

      res.json({ success: true, id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save transaction" });
    }
  });

  // Telegram Notification Route
  app.post("/api/notify", async (req, res) => {
    const { message } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log("Telegram credentials missing. Message:", message);
      return res.json({ success: true, message: "Logged to console (Mock Mode)" });
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
