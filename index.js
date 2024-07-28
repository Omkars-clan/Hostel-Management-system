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
    timezone: 'Asia/Kolkata' // Correct time zone format
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));




//Guest History///////////////////////////////////////
async function Hguest() {
    const guest = await db.query("select * from guest_history");
    return guest.rows;
}

//Guest list 
async function Dguest() {
    const guest = await db.query("select * from bookings");
    return guest.rows;
}

//Rooms list
async function getRooms() {
    const room = await db.query("SELECT * FROM rooms");
    return room.rows;
}

//Total rooms number output
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

//total guest output
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

//Room tiles information

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

//////////////Employess Details///////////////
async function Demployee() {
    const emp = await db.query("select * from employees");
    return emp.rows;
}

async function Hemployee() {
    const emph = await db.query("select * from employees_history");
    return emph.rows;
}




/////////////////////////////////////////////


app.set("view engine", "ejs");

//emplyee management
app.get('/views/Employee.ejs', async (req, res) => {
    try {
        const emps = await Demployee(); // Fetch the guest data
        const emph = await Hemployee(); // Fetch the guest data
        res.render('Employee', { emps,emph }); // Pass dguest to the Guest.ejs template

    } catch (error) {
        console.error("Error rendering Guest page:", error);
        res.status(500).send("Error rendering Guest page");
    }
});

//Rout to Guest history
app.get('/views/Hguest.ejs', async (req, res) => {
    try {
        const hguest = await Hguest(); // Fetch the guest data
        res.render('Hguest', { hguest }); // Pass dguest to the Guest.ejs template
    } catch (error) {
        console.error("Error rendering Guest page:", error);
        res.status(500).send("Error rendering Guest page");
    }
});


// Route handler for rendering the main page (index.ejs)
app.get("/", async (req, res) => {
    try {
        const allRooms = await getRooms();
        const Trooms = await TRooms();
        const tguest = await Tguest();
        const capacities = await Capacity();
        

        res.render("index", { allRooms, Trooms, capacities, tguest });
         // Render index.ejs
    } catch (error) {
        console.error("Error rendering main page:", error);
        res.status(500).send("Error rendering main page");
    }
});
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


//deleting task from frontend by double clicking on task (Guest page)

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

    /// deleting guest history

    app.post ("/del_Hg", async (req, res) => {
        const H_guest = req.body.guest_name;
        console.log("Deleted Guest Data permanent Successfully");
        try {
            await db.query("DELETE FROM guest_history WHERE guest_name = $1", [H_guest]);     
            res.redirect("/");
          } catch (err) {
            console.log(err);
            
          }
        });

    //deleting room (Room Tile)
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


/// EMPLOYEE
// Route to handle adding an employee
app.post("/add-employee", async (req, res) => {
    const { firstName, lastName, date_of_joining, government_id, address, phone, designation, salary } = req.body;
  
    try {
        const result = await db.query(
            `INSERT INTO employees (first_name, last_name, date_of_joining, government_id, address, phone, designation, salary)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING employee_id`,
            [firstName, lastName, date_of_joining, government_id, address, phone, designation, salary]
        );
        
        res.send(`<script>alert("Added Employee successfully! Employee Number: ${result.rows[0].employee_id}"); window.location.href = "/";</script>`);
    } catch (err) {
        console.error("Error creating employee:", err);
        res.status(500).send('Error creating employee');
    }
});



// Route to handle adding attendance
app.post("/add-attendence", async (req, res) => {
    const { employeeId, attendanceDate, present, workType, hours } = req.body;
  
    try {
        const result = await db.query(
            `INSERT INTO employee_attendance (employee_id, attendance_date, present, work_type, hours)
            VALUES ($1, $2, $3, $4, $5)
             RETURNING  employee_id , attendance_date,work_type,present`,
            [employeeId, attendanceDate, present, workType, hours]
        );
        
        res.send(`<script>alert("Added Attendence successfully! Check Details before you press ok : ${"Employee ID is " + result.rows[0].employee_id + ", Date & Time:"+  result.rows[0].attendance_date + " Todays attendence is: " + result.rows[0].present + ", Cannot be updated check before you click ok"}"); window.location.href = "/";</script>`);
    } catch (err) {
        console.error("Error creating attendence:", err);
        res.status(500).send('Error creating attendence already attendence may be created please do not violate');
    }
});

///Employee details delete 
app.post("/delemp", async (req, res) => {
    const employeeid = req.body.employee_id;
    const { firstName, lastName, date_of_joining, government_id, address, phone, designation, salary } = req.body;

    try {
        await db.query("DELETE FROM employees WHERE employee_id = $1", [employeeid]);
        const result = await db.query(
            `INSERT INTO employees_history (firstName, lastName, date_of_joining, government_id, address, phone, designation, salary) 
            VALUES ($1, $2, $3, $4, $5, $6 ,$7, $8) RETURNING firstName`,
            [firstName, lastName, date_of_joining, government_id, address, phone, designation, salary]
        );

        res.send(`
            <script>
                alert("Removed data successfully! Check Details before you press ok: Employee Name is ${result.rows[0].firstname}");
                window.location.href = "/";
            </script>
        `);
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while deleting the employee.");
    }
});

/// Employee history delete
app.post("/delperm", async (req, res) => {
    const firstName = req.body.firstname;

    console.log("Received firstname for deletion:", firstName);

    try {
        const result = await db.query("DELETE FROM employees_history WHERE firstname = $1 RETURNING *", [firstName]);

        if (result.rowCount === 0) {
            console.log("No employee history found with the given firstname.");
            res.status(404).send("No employee history found with the given firstname.");
        } else {
            console.log("Deleted Employee Data Permanently Successfully:", result.rows);
            res.redirect("/");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while deleting the employee history.");
    }
});







app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
