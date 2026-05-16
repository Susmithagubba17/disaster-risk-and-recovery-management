import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "vanguard-secret-key-123";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vanguard";

// --- MongoDB Schemas ---

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["USER", "RESCUE_TEAM", "ADMIN"], default: "USER" }
});

const disasterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  disasterType: String,
  description: String,
  riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
  resourcesReq: [String],
  status: { type: String, enum: ["REPORTED", "ASSIGNED", "RESOLVED"], default: "REPORTED" },
  assignedTeamId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const sosSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    lat: Number,
    lng: Number
  },
  missingPersonName: String,
  status: { type: String, enum: ["ACTIVE", "RESOLVED"], default: "ACTIVE" },
  createdAt: { type: Date, default: Date.now }
});

const resourceSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  location: String
});

const UserModel = mongoose.model("User", userSchema);
const DisasterModel = mongoose.model("Disaster", disasterSchema);
const SOSModel = mongoose.model("SOS", sosSchema);
const ResourceModel = mongoose.model("Resource", resourceSchema);

async function startServer() {
  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    
    // Seed initial resources if empty
    const count = await ResourceModel.countDocuments();
    if (count === 0) {
      await ResourceModel.insertMany([
        { name: "Medical Kits", quantity: 50, unit: "units", location: "Main Hub" },
        { name: "Water Bottles", quantity: 200, unit: "liters", location: "Sector 4" },
        { name: "Rations", quantity: 100, unit: "kg", location: "Main Hub" }
      ]);
    }
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      const existing = await UserModel.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({ email, password: hashedPassword, name, role });
      await newUser.save();
      
      const userObj = newUser.toObject();
      const { password: _, ...rest } = userObj;
      res.json({ ...rest, id: newUser._id });
    } catch (err) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET);
      const userObj = user.toObject();
      const { password: _, ...rest } = userObj;
      res.json({ token, user: { ...rest, id: user._id } });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // --- Disaster Routes ---
  app.get("/api/disasters", async (req, res) => {
    try {
      const data = await DisasterModel.find().sort({ createdAt: -1 });
      res.json(data.map(d => ({ ...d.toObject(), id: d._id })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch disasters" });
    }
  });

  app.post("/api/disasters", async (req, res) => {
    try {
      const report = new DisasterModel(req.body);
      await report.save();
      const reportObj = { ...report.toObject(), id: report._id };
      io.emit("new-disaster", reportObj);
      res.json(reportObj);
    } catch (err) {
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.patch("/api/disasters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await DisasterModel.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) {
        const updatedObj = { ...updated.toObject(), id: updated._id };
        io.emit("disaster-update", updatedObj);
        res.json(updatedObj);
      } else {
        res.status(404).json({ error: "Report not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  // --- SOS Routes ---
  app.get("/api/sos", async (req, res) => {
    try {
      const data = await SOSModel.find().sort({ createdAt: -1 });
      res.json(data.map(s => ({ ...s.toObject(), id: s._id })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SOS" });
    }
  });

  app.post("/api/sos", async (req, res) => {
    try {
      const sos = new SOSModel(req.body);
      await sos.save();
      const sosObj = { ...sos.toObject(), id: sos._id };
      io.emit("new-sos", sosObj);
      res.json(sosObj);
    } catch (err) {
      res.status(500).json({ error: "Failed to create SOS" });
    }
  });

  // --- Resource Routes ---
  app.get("/api/resources", async (req, res) => {
    try {
      const data = await ResourceModel.find();
      res.json(data.map(r => ({ ...r.toObject(), id: r._id })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    try {
      const resource = new ResourceModel(req.body);
      await resource.save();
      res.json({ ...resource.toObject(), id: resource._id });
    } catch (err) {
      res.status(500).json({ error: "Failed to create resource" });
    }
  });

  app.patch("/api/resources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await ResourceModel.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) {
        res.json({ ...updated.toObject(), id: updated._id });
      } else {
        res.status(404).json({ error: "Resource not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to update resource" });
    }
  });

  app.get("/api/admin/system-info", (req, res) => {
    const isMock = MONGODB_URI.includes("localhost") || MONGODB_URI.includes("127.0.0.1");
    res.json({
      databaseType: "MongoDB",
      isMock: isMock,
      connectionStatus: mongoose.connection.readyState === 1 ? "ACTIVE" : "CONNECTING",
      apiDomain: req.get('host')
    });
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
