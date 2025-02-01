import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    connectionString: "postgresql://neondb_owner:npg_a4wqtdxsyp5z@ep-muddy-waterfall-a5a6pr27-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    ssl: {
        rejectUnauthorized: false,
    },
});
db.connect().then(() => console.log("Connected to Neon.tech PostgreSQL"))
    .catch(err => console.error("Connection error", err.stack));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to execute queries
async function executeQuery(query, params = []) {
    try {
        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}

// Routes
app.get("/", async (req, res) => {
    try {
        const allRooms = await executeQuery("SELECT * FROM rooms");
        const Trooms = await executeQuery("SELECT COUNT(*) FROM rooms");
        const tguest = await executeQuery("SELECT COUNT(*) AS total_bookings FROM bookings");
        res.render("index", { allRooms, Trooms: Trooms[0].count, tguest: tguest[0].total_bookings });
    } catch (error) {
        console.error("Error rendering main page:", error);
        res.status(500).send("Error rendering main page");
    }
});

app.post("/room", async (req, res) => {
    const { room_number, room_type, amenities } = req.body;
    try {
        await executeQuery("INSERT INTO rooms (room_number, room_type, amenities) VALUES ($1, $2, $3)", [room_number, room_type, amenities]);
        res.redirect("/");
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).send("Error creating room");
    }
});

app.post("/book", async (req, res) => {
    const { room_number, guest_name, guest_id, guest_address, guest_phone, date, time } = req.body;
    try {
        const roomExists = await executeQuery("SELECT COUNT(*) AS count FROM rooms WHERE room_number = $1", [room_number]);
        if (roomExists[0].count == 0) {
            return res.status(404).send("Room number does not exist");
        }
        await executeQuery(
            "INSERT INTO bookings (room_number, guest_name, guest_id, guest_address, guest_phone, date_of_join, time_of_join) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [room_number, guest_name, guest_id, guest_address, guest_phone, date, time]
        );
        res.redirect("/");
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).send("Error creating booking");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
