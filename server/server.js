
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json({ limit: "10kb" }));

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    }
});

// Health check
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "BrightSmile Clinic API is running",
            database: "PostgreSQL connected"
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Submit appointment enquiry
app.post("/api/enquiries", async (req, res) => {
    try {
        const {
            patient_name,
            phone_number,
            preferred_date,
            message
        } = req.body;

        // Validate required fields
        if (
            typeof patient_name !== "string" ||
            typeof phone_number !== "string" ||
            typeof preferred_date !== "string" ||
            !patient_name.trim() ||
            !phone_number.trim() ||
            !preferred_date.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and preferred date are required."
            });
        }

        if (patient_name.trim().length > 150) {
            return res.status(400).json({
                success: false,
                message: "Patient name is too long."
            });
        }

        if (!/^[0-9+()\-\s]{7,15}$/.test(phone_number.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number."
            });
        }

        // Validate actual calendar date
        if (!/^\d{4}-\d{2}-\d{2}$/.test(preferred_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid preferred date."
            });
        }

        const date = new Date(`${preferred_date}T00:00:00.000Z`);

        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== preferred_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid calendar date."
            });
        }

        if (preferred_date < new Date().toISOString().slice(0, 10)) {
            return res.status(400).json({
                success: false,
                message: "Preferred date cannot be in the past."
            });
        }

        if (
            message !== undefined &&
            (typeof message !== "string" || message.length > 2000)
        ) {
            return res.status(400).json({
                success: false,
                message: "Message must be 2000 characters or fewer."
            });
        }

        // Insert into PostgreSQL
        const result = await pool.query(
            `INSERT INTO appointment_enquiries
            (patient_name, phone_number, preferred_date, message)
            VALUES ($1, $2, $3, $4)
            RETURNING id, patient_name, preferred_date,
                      status, created_at`,
            [
                patient_name.trim(),
                phone_number.trim(),
                preferred_date,
                message?.trim() || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Appointment enquiry submitted successfully. The clinic will contact you for confirmation.",
            enquiry: result.rows[0],
            appointment_confirmed: false
        });

    } catch (error) {
        console.error("Enquiry submission failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to submit enquiry. Please try again."
        });
    }
});
// Get all appointment enquiries
app.get("/api/admin/enquiries", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                patient_name,
                phone_number,
                preferred_date,
                message,
                status,
                created_at
            FROM appointment_enquiries
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            enquiries: result.rows
        });

    } catch (error) {
        console.error("Unable to fetch enquiries:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch enquiries."
        });
    }
});

// Update enquiry status
app.patch("/api/admin/enquiries/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Contacted",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry status."
            });
        }

        const result = await pool.query(
            `UPDATE appointment_enquiries
             SET status = $1
             WHERE id = $2
             RETURNING id, patient_name, status`,
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found."
            });
        }

        res.json({
            success: true,
            message: "Enquiry status updated.",
            enquiry: result.rows[0]
        });

    } catch (error) {
        console.error("Unable to update enquiry:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update enquiry status."
        });
    }
});
// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await pool.query("SELECT 1");

        app.listen(PORT, "0.0.0.0", () => {
            console.log("--------------------------------");
            console.log("BrightSmile Clinic API is running");
            console.log(`Server listening on port ${PORT}`);
            console.log("PostgreSQL connected");
            console.log("--------------------------------");
        });
    } catch (error) {
        console.error("PostgreSQL connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
