import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Hotel",
    password: "Omkar",
    port: 5000, // Adjust port as per your PostgreSQL configuration
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function Dguest() {
    const guest = await db.query("select * from bookings");
    return guest.rows;
}
async function getRooms() {
    const room = await db.query("SELECT * FROM rooms");
    return room.rows;
}



async function TRooms() {
    try {
        const result = await db.query("SELECT COUNT(*) FROM rooms");
        const count = result.rows[0].count;
        return count;
    } catch (error) {
        console.error("Error counting rooms:", error);
        throw error;
    }
}

async function Tguest() {
    try {
        const result = await db.query(`SELECT COUNT(*) AS total_bookings FROM bookings`);
        const count = result.rows[0].total_bookings;
        return count;
    } catch (error) {
        console.error("Error counting guests:", error);
        throw error;
    }
}

async function Capacity() {
    try {
        const result = await db.query(`
            SELECT 
                rooms.room_number,
                rooms.room_type,
                rooms.amenities,
                COUNT(bookings.room_number) AS booking_count
            FROM 
                rooms
            LEFT JOIN 
                bookings ON rooms.room_number = bookings.room_number
            GROUP BY 
                rooms.room_number, rooms.room_type
            ORDER BY 
                rooms.room_number;
        `);
        
        // Convert the result to a more usable format
        const roomCapacities = result.rows.map(row => ({
            roomNumber: row.room_number,
            bookingCount: row.booking_count,
            typeRoom: row.room_type,
            facility: row.amenities
        }));

        return roomCapacities;
    } catch (error) {
        console.error("Error fetching room capacities:", error);
        throw error;
    }
}

app.set("view engine", "ejs");


// Assuming other imports and setup are already in place

// Example route to handle rendering Guest.ejs
app.get('/views/Guest.ejs', async (req, res) => {
    try {
        const dguest = await Dguest(); // Fetch the guest data
        res.render('Guest', { dguest }); // Pass dguest to the Guest.ejs template
    } catch (error) {
        console.error("Error rendering Guest page:", error);
        res.status(500).send("Error rendering Guest page");
    }
});

// Route handler for rendering the main page (index.ejs)
app.get("/", async (req, res) => {
    try {
        const dguest = await Dguest();
        const allRooms = await getRooms();
        const Trooms = await TRooms();
        const tguest = await Tguest();
        const capacities = await Capacity();

        res.render("index", { allRooms, Trooms, capacities, tguest, dguest }); // Render index.ejs
    } catch (error) {
        console.error("Error rendering main page:", error);
        res.status(500).send("Error rendering main page");
    }
});



// Route to handle room creation form submission
app.post("/room", async (req, res) => {
    const { room_number, room_type, amenities } = req.body;
  
    try {
        const result = await db.query(
            `INSERT INTO rooms (room_number, room_type, amenities) VALUES ($1, $2, $3) RETURNING room_number`,
            [room_number, room_type, amenities]
        );
  
        res.send(`<script>alert("Room Created successfully! Room Number: ${result.rows[0].room_number}"); window.location.href = "/";</script>`);
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).send('Error creating room');
    }
});

// Route to handle booking form submission
app.post("/book", async (req, res) => {
    const { room_number, guest_name, guest_id, guest_address, guest_phone, date, time } = req.body;

    try {
        // Check if the room_number exists in rooms table
        const roomCheck = await db.query('SELECT COUNT(*) AS count FROM rooms WHERE room_number = $1', [room_number]);
        const roomExists = roomCheck.rows[0].count > 0;

        if (!roomExists) {
            return res.status(404).send('Room number does not exist');
        }

        // Proceed with booking insertion
        const result = await db.query(
            `INSERT INTO bookings (room_number, guest_name, guest_id, guest_address, guest_phone, date_of_join, time_of_join) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING room_number`,
            [room_number, guest_name, guest_id, guest_address, guest_phone, date,time]
        );

        res.send(`<script>alert("Booking Created successfully! Room Number: ${result.rows[0].room_number}"); window.location.href = "/";</script>`);
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).send('Error creating booking');
    }
});


//deleting task from frontend by double clicking on task 

app.post ("/del", async (req, res) => {
    const taskID = req.body.guest_name;
    const { room_number, guest_name, guest_id, guest_address, guest_phone, date, time } = req.body;
    console.log("Deleted Guest Data Successfully");
    try {
        await db.query("DELETE FROM bookings WHERE guest_name = $1", [taskID]);
        await db.query(
            `INSERT INTO guest_history (room_number, guest_name, guest_id, guest_address, guest_phone, joining) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING room_number`,
            [room_number, guest_name, guest_id, guest_address, guest_phone, date]
        );
        
        res.redirect("/");
      } catch (err) {
        console.log(err);
        
      }
    });

    //deleting room
    app.post ("/delroom", async (req, res) => {
        const Rmno = req.body.delRoom;
        console.log("Room is removed succesfully");
    
        try {
            await db.query("DELETE FROM rooms WHERE room_number = $1", [Rmno]);
            res.redirect("/");
          } catch (err) {
            console.log(err);
          }
        });


    // Route to handle task update
app.post('/update', async (req, res) => {
    const { oldTask, newTask } = req.body;
    try {
        await db.query("UPDATE task_manager SET task = $1 WHERE task = $2", [newTask, oldTask]);
        res.redirect('/');
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send("Error updating task");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
