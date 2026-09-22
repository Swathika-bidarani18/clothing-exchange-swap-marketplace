const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");

const userRoutes = require("./routes/userRoutes");
const clothingRoutes = require("./routes/clothingRoutes");
const swapRequestRoutes = require("./routes/swapRequestRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");

const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());


// ========================================
// API ROUTES
// ========================================

app.use("/api/users", userRoutes);
app.use("/api/clothing", clothingRoutes);
app.use("/api/swap-requests", swapRequestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);


// ========================================
// TEST ROUTES
// ========================================

app.get("/", function (req, res) {
    res.send("LoopWear Backend is running successfully!");
});

app.get("/api/test", function (req, res) {
    res.json({
        success: true,
        message: "LoopWear API is connected successfully!"
    });
});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", async function () {
    console.log(
        `LoopWear backend running on port ${PORT}`
    );

    await connectDB();
});