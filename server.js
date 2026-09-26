const path = require("path");
const fs = require("fs");

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const configuredOrigin = process.env.CORS_ORIGIN;
if (configuredOrigin) {
  app.use(cors({ origin: configuredOrigin }));
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lostfound",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: "utf8mb4"
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is required. Copy .env.example to .env and configure it.");
  process.exit(1);
}

const transporter = createMailTransporter();

function createMailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
    }
    cb(null, true);
  }
});

function signToken(user) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

function validateRequired(values) {
  return Object.entries(values).every(([, value]) => String(value ?? "").trim() !== "");
}

function generateEmailHTML(data) {
  const isReturnRequest = data.request_type === "Return Request";

  const title = isReturnRequest
    ? "Return Request Approved"
    : "Claim Approved";

  const subtitle = isReturnRequest
    ? "Your request to return the item has been approved."
    : "Your claim has been approved successfully.";

  const contactTitle = isReturnRequest
    ? "Item Owner Contact"
    : "Finder Contact";

  const contactName = isReturnRequest
    ? data.owner_name
    : data.finder_name;

  const contactEmail = isReturnRequest
    ? data.owner_email
    : data.finder_email;

  const contactPhone = isReturnRequest
    ? data.owner_phone
    : data.finder_phone;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial,Helvetica,sans-serif;
  color:#1f2937;
">

  <div style="
    max-width:620px;
    margin:30px auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 8px 30px rgba(0,0,0,0.08);
  ">

    <!-- Header -->
    <div style="
      background:linear-gradient(135deg,#2563eb,#4f46e5);
      padding:28px 25px;
      text-align:center;
      color:white;
    ">
      <div style="font-size:38px;">🔎</div>

      <h1 style="
        margin:8px 0 4px;
        font-size:26px;
      ">
        Lost &amp; Found 404
      </h1>

      <p style="
        margin:0;
        font-size:14px;
        opacity:0.9;
      ">
        Campus Lost &amp; Found Portal
      </p>
    </div>

    <!-- Content -->
    <div style="padding:30px 28px;">

      <div style="
        text-align:center;
        font-size:48px;
        margin-bottom:10px;
      ">
        🎉
      </div>

      <h2 style="
        text-align:center;
        margin:0 0 10px;
        color:#16a34a;
        font-size:24px;
      ">
        ${title}
      </h2>

      <p style="
        text-align:center;
        color:#6b7280;
        line-height:1.6;
        margin-bottom:28px;
      ">
        ${subtitle}
      </p>

      <!-- Item Details -->
      <div style="
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:12px;
        padding:20px;
        margin-bottom:22px;
      ">

        <h3 style="
          margin:0 0 15px;
          color:#111827;
          font-size:17px;
        ">
          📦 Item Details
        </h3>

        <p style="margin:8px 0;">
          <strong>Claim ID:</strong>
          #${data.id}
        </p>

        <p style="margin:8px 0;">
          <strong>Item:</strong>
          ${data.item_name}
        </p>

        <p style="margin:8px 0;">
          <strong>Location:</strong>
          ${data.location || "Not specified"}
        </p>

      </div>

      <!-- Contact Details -->
      <div style="
        background:#eff6ff;
        border:1px solid #bfdbfe;
        border-radius:12px;
        padding:20px;
        margin-bottom:22px;
      ">

        <h3 style="
          margin:0 0 15px;
          color:#1d4ed8;
          font-size:17px;
        ">
          📞 ${contactTitle}
        </h3>

        <p style="margin:8px 0;">
          <strong>Name:</strong>
          ${contactName || "Not available"}
        </p>

        <p style="margin:8px 0;">
          <strong>Email:</strong>
          ${contactEmail || "Not available"}
        </p>

        <p style="margin:8px 0;">
          <strong>Phone:</strong>
          ${contactPhone || "Not available"}
        </p>

      </div>

      <!-- Next Steps -->
      <div style="
        background:#fff7ed;
        border-left:4px solid #f97316;
        padding:16px;
        border-radius:8px;
        margin-bottom:20px;
      ">

        <strong style="color:#c2410c;">
          📌 Next Steps
        </strong>

        <p style="
          margin:8px 0 0;
          color:#7c2d12;
          line-height:1.6;
        ">
          Please contact the person mentioned above and coordinate
          the safe return or collection of the item.
          Carry a valid college ID when meeting in person.
        </p>

      </div>

      <p style="
        text-align:center;
        color:#6b7280;
        font-size:13px;
        line-height:1.5;
      ">
        This is an automated notification from the
        Lost &amp; Found 404 Portal.
      </p>

    </div>

    <!-- Footer -->
    <div style="
      background:#f8fafc;
      border-top:1px solid #e5e7eb;
      padding:18px;
      text-align:center;
      color:#9ca3af;
      font-size:12px;
    ">
      © Lost &amp; Found 404 · Campus Lost &amp; Found Portal
    </div>

  </div>

</body>
</html>
  `;
}

async function sendMail(to, subject, html) {
  if (!transporter) {
    console.warn("SMTP is not configured. Email notification skipped.");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("Mail error:", error.message);
  }
}

function generateRejectEmail(data) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial, Helvetica, sans-serif;
">

<div style="padding:30px 15px;">

  <div style="
    max-width:650px;
    margin:auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 4px 18px rgba(0,0,0,0.08);
  ">

    <!-- HEADER -->
    <div style="
      background:linear-gradient(135deg,#334155,#1e293b);
      padding:28px 25px;
      text-align:center;
      color:white;
    ">

      <div style="
        font-size:30px;
        font-weight:bold;
      ">
        🔎 Lost & Found 404
      </div>

      <div style="
        margin-top:8px;
        font-size:14px;
        opacity:0.9;
      ">
        Helping lost belongings find their way home
      </div>

    </div>

    <!-- STATUS -->
    <div style="
      text-align:center;
      padding:30px 25px 10px;
    ">

      <div style="
        width:64px;
        height:64px;
        line-height:64px;
        margin:auto;
        border-radius:50%;
        background:#fee2e2;
        color:#dc2626;
        font-size:32px;
        font-weight:bold;
      ">
        !
      </div>

      <h1 style="
        margin:18px 0 8px;
        color:#b91c1c;
        font-size:25px;
      ">
        Request Not Approved
      </h1>

      <p style="
        margin:0;
        color:#64748b;
        font-size:15px;
      ">
        Your request has not been approved at this time.
      </p>

    </div>

    <!-- MESSAGE -->
    <div style="
      padding:15px 30px;
      color:#334155;
      font-size:15px;
      line-height:1.7;
    ">

      <p>Hello,</p>

      <p>
        Your request for
        <strong>${data.item_name || "the reported item"}</strong>
        could not be approved based on the information
        available to the administrator.
      </p>

    </div>

    <!-- REQUEST DETAILS -->
    <div style="padding:10px 30px;">

      <div style="
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:12px;
        padding:20px;
      ">

        <div style="
          color:#64748b;
          font-size:12px;
          font-weight:bold;
          text-transform:uppercase;
          letter-spacing:1px;
          margin-bottom:14px;
        ">
          Request Details
        </div>

        <p style="margin:9px 0;">
          <strong>📦 Item:</strong>
          ${data.item_name || "Not provided"}
        </p>

        <p style="margin:9px 0;">
          <strong>🧾 Request ID:</strong>
          #${data.id || "N/A"}
        </p>

      </div>

    </div>

    <!-- NEXT STEP -->
    <div style="padding:10px 30px 25px;">

      <div style="
        background:#fff7ed;
        border-left:4px solid #f97316;
        padding:15px 18px;
        border-radius:8px;
        color:#7c2d12;
        font-size:14px;
        line-height:1.6;
      ">

        <strong>💡 What can you do?</strong>

        <br>

        Please verify that the information and description
        provided in your request accurately match the reported
        item. You may submit another request with additional
        relevant details if appropriate.

      </div>

    </div>

    <!-- FOOTER -->
    <div style="
      background:#f8fafc;
      border-top:1px solid #e2e8f0;
      padding:22px 25px;
      text-align:center;
    ">

      <div style="
        font-weight:bold;
        color:#334155;
        font-size:15px;
      ">
        Lost & Found 404
      </div>

      <div style="
        margin-top:6px;
        color:#94a3b8;
        font-size:12px;
      ">
        Helping lost belongings find their way home.
      </div>

      <div style="
        margin-top:12px;
        color:#cbd5e1;
        font-size:11px;
      ">
        This is an automated notification.
      </div>

    </div>

  </div>

</div>

</body>
</html>
`;
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (_error) {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!validateRequired({ username, password })) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (username.trim().toLowerCase() === String(process.env.ADMIN_USERNAME || "admin").toLowerCase()) {
      return res.status(400).json({ message: "This username is reserved" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')",
      [username.trim(), hashed]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Unable to register user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!validateRequired({ username, password })) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const [rows] = await pool.execute(
      "SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1",
      [username.trim()]
    );

    if (!rows.length) return res.status(401).json({ message: "Invalid username or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid username or password" });

    res.json({ token: signToken(user), role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/lost", authenticate, async (req, res) => {
  try {
    const { ownerName, name, location, date, description, email, phone } = req.body;
    if (!validateRequired({ ownerName, name, location, date, description, email, phone })) {
      return res.status(400).json({ message: "All lost-item fields are required" });
    }

    await pool.execute(
      `INSERT INTO lost_items (name, location, date, description, email, owner_name, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, location, date, description, email, ownerName, phone]
    );

    res.status(201).json({ message: "Lost item added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to add lost item" });
  }
});

app.get("/lost", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lost_items ORDER BY date DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load lost items" });
  }
});

app.post("/found", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { ownerName, itemName, location, date, description, email, phone } = req.body;
    if (!validateRequired({ ownerName, itemName, location, date, description, email, phone })) {
      return res.status(400).json({ message: "All found-item fields are required" });
    }

    const image = req.file ? req.file.filename : null;
    await pool.execute(
      `INSERT INTO found_items (name, location, date, description, email, image, phone, owner_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemName, location, date, description, email, image, phone, ownerName]
    );

    res.status(201).json({ message: "Found item added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Unable to add found item" });
  }
});

app.use("/uploads", express.static(UPLOAD_DIR, { index: false }));

app.get("/found", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM found_items ORDER BY date DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load found items" });
  }
});

app.delete("/lost/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.execute("DELETE FROM lost_items WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to delete lost item" });
  }
});

app.delete("/found/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.execute("DELETE FROM found_items WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to delete found item" });
  }
});

app.post("/claim", authenticate, async (req, res) => {
  try {
    const { item_id, type, email, description, name } = req.body;
    if (!validateRequired({ item_id, type, email, description, name })) {
      return res.status(400).json({ message: "Missing required claim fields" });
    }
    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({ message: "Invalid claim type" });
    }

    const table = type === "lost" ? "lost_items" : "found_items";
    const [items] = await pool.execute(`SELECT id FROM ${table} WHERE id = ?`, [item_id]);
    if (!items.length) return res.status(404).json({ message: "Item not found" });

    await pool.execute(
      "INSERT INTO claims (item_id, type, user_email, description, name) VALUES (?, ?, ?, ?, ?)",
      [item_id, type, email, description, name]
    );

    res.status(201).json({ message: "Claim submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to submit claim" });
  }
});

app.get("/claims", authenticate, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM claims ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load claims" });
  }
});

app.post("/claims/:id/approve", authenticate, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [claims] = await connection.execute("SELECT * FROM claims WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!claims.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Claim not found" });
    }

    const claim = claims[0];
    if (claim.status !== "pending") {
      await connection.rollback();
      return res.status(409).json({ message: "Claim has already been processed" });
    }

    const table = claim.type === "lost" ? "lost_items" : "found_items";
    const [items] = await connection.execute(`SELECT * FROM ${table} WHERE id = ?`, [claim.item_id]);
    if (!items.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Item no longer exists" });
    }

    const item = items[0];
    await connection.execute("UPDATE claims SET status='approved', updated_at=NOW() WHERE id=?", [claim.id]);
    await connection.execute(`DELETE FROM ${table} WHERE id=?`, [claim.item_id]);

    await connection.commit();

    if (claim.type === "found") {
      await sendMail(
        claim.user_email,
        "🎉 Claim Approved",
        generateEmailHTML({
          id: claim.id,
          item_name: item.name,
          location: item.location,
          finder_name: item.owner_name,
          finder_email: item.email,
          finder_phone: item.phone
        })
      );
    } else {
  await sendMail(
    claim.user_email,
    "✅ Lost & Found 404 — Return Request Approved",
    generateEmailHTML({
      id: claim.id,
      item_name: item.name,
      location: item.location,
      request_type: "Return Request",

      owner_name: item.owner_name,
      owner_email: item.email,
      owner_phone: item.phone
    })
  );

  await sendMail(
    item.email,
    "🎉 Lost & Found 404 — Someone Found Your Lost Item",
        `
    <!DOCTYPE html>
    <html>
    <body style="
      margin:0;
      padding:0;
      background:#f4f7fb;
      font-family:Arial,Helvetica,sans-serif;
    ">

    <div style="padding:30px 15px;">

      <div style="
        max-width:650px;
        margin:auto;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 4px 18px rgba(0,0,0,0.08);
      ">

        <div style="
          background:linear-gradient(135deg,#2563eb,#1d4ed8);
          padding:28px 25px;
          text-align:center;
          color:white;
        ">

          <div style="
            font-size:28px;
            font-weight:bold;
          ">
            🔎 Lost & Found 404
          </div>

          <div style="
            margin-top:8px;
            font-size:14px;
            opacity:.9;
          ">
            Helping lost belongings find their way home
          </div>

        </div>

        <div style="
          text-align:center;
          padding:30px 25px 10px;
        ">

          <div style="
            width:64px;
            height:64px;
            line-height:64px;
            margin:auto;
            border-radius:50%;
            background:#dcfce7;
            color:#16a34a;
            font-size:34px;
          ">
            ✓
          </div>

          <h1 style="
            color:#166534;
            font-size:25px;
            margin:18px 0 8px;
          ">
            Your Item Has Been Found!
          </h1>

          <p style="
            color:#64748b;
            font-size:15px;
            line-height:1.6;
          ">
            Good news! Someone has submitted a return request
            for your lost item.
          </p>

        </div>

        <div style="
          padding:10px 30px;
          color:#334155;
          font-size:15px;
          line-height:1.7;
        ">

          <p>Hello,</p>

          <p>
            A return request for your lost item has been
            <strong style="color:#16a34a;">approved</strong>
            by the Lost & Found administrator.
          </p>

        </div>

        <div style="padding:10px 30px;">

          <div style="
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:12px;
            padding:20px;
          ">

            <div style="
              color:#64748b;
              font-size:12px;
              font-weight:bold;
              text-transform:uppercase;
              letter-spacing:1px;
              margin-bottom:14px;
            ">
              Item Details
            </div>

            <p style="margin:9px 0;">
              <strong>📦 Item:</strong>
              ${item.name}
            </p>

            <p style="margin:9px 0;">
              <strong>📍 Location:</strong>
              ${item.location || "Not provided"}
            </p>

          </div>

        </div>

        <div style="padding:10px 30px 25px;">

          <div style="
            background:#eff6ff;
            border:1px solid #bfdbfe;
            border-radius:12px;
            padding:20px;
          ">

            <div style="
              color:#1d4ed8;
              font-size:16px;
              font-weight:bold;
              margin-bottom:12px;
            ">
              🤝 What happens next?
            </div>

            <p style="
              margin:0;
              color:#334155;
              font-size:14px;
              line-height:1.7;
            ">
              The person who found your item may contact you soon.
              Please coordinate with them to arrange a safe return.
            </p>

          </div>

        </div>

        <div style="
          background:#f8fafc;
          border-top:1px solid #e2e8f0;
          padding:22px 25px;
          text-align:center;
        ">

          <div style="
            font-weight:bold;
            color:#334155;
            font-size:15px;
          ">
            Lost & Found 404
          </div>

          <div style="
            margin-top:6px;
            color:#94a3b8;
            font-size:12px;
          ">
            Helping lost belongings find their way home.
          </div>

          <div style="
            margin-top:12px;
            color:#cbd5e1;
            font-size:11px;
          ">
            This is an automated notification.
          </div>

        </div>

      </div>

    </div>

    </body>
    </html>
    `
  );
}

    res.json({ message: "Approved" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Unable to approve claim" });
  } finally {
    connection.release();
  }
});

app.post("/claims/:id/reject", authenticate, requireAdmin, async (req, res) => {
  try {
    const [claims] = await pool.execute(
      "SELECT * FROM claims WHERE id=?",
      [req.params.id]
    );

    if (!claims.length) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claims[0].status !== "pending") {
      return res.status(409).json({
        message: "Claim has already been processed"
      });
    }

    const claim = claims[0];

    const table = claim.type === "lost"
      ? "lost_items"
      : "found_items";

    const [items] = await pool.execute(
      `SELECT name FROM ${table} WHERE id = ?`,
      [claim.item_id]
    );

    const itemName = items.length
      ? items[0].name
      : "Reported Item";

    await pool.execute(
      "UPDATE claims SET status='rejected', updated_at=NOW() WHERE id=?",
      [req.params.id]
    );

    await sendMail(
      claim.user_email,
      "❌ Lost & Found 404 — Request Not Approved",
      generateRejectEmail({
        id: claim.id,
        item_name: itemName
      })
    );

    res.json({ message: "Rejected" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to reject claim"
    });
  }
});

app.use(express.static(PUBLIC_DIR, { index: "index.html" }));

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error" });
});

async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.warn("ADMIN_USERNAME/ADMIN_PASSWORD not configured. Admin bootstrap skipped.");
    return;
  }

  const [rows] = await pool.execute("SELECT id FROM users WHERE username=? LIMIT 1", [username]);
  if (!rows.length) {
    const hashed = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')",
      [username, hashed]
    );
    console.log(`Admin user '${username}' created.`);
  }
}

async function start() {
  try {
    await pool.query("SELECT 1");
    await ensureAdmin();
    app.listen(PORT, () => console.log(`Lost & Found Portal running on port ${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();
