// apparance of forms
var AttendanceForm = document.getElementById("Attendence");
var formContainer = document.getElementById("Room");
var bookingForm = document.getElementById("booking");
var EmployeesForm = document.getElementById("Addemployees");

function Openaddemp(){
    EmployeesForm.style.display = 'block';
}

function OpenAttendence(){
    AttendanceForm.style.display = 'block';
}

function OpenForm() {
    formContainer.style.display = 'block'; // Display the form container
    bookingForm.style.display = 'none';
}
function closed(){
    formContainer.style.display = 'none';
    bookingForm.style.display = 'none';
    AttendanceForm.style.display = 'none';
}

function Booking(roomNumber){
    bookingForm.style.display = 'block';
    formContainer.style.display = 'none';
    fillRoomNumber(roomNumber); // Pass the room number to fill the form
}

// Function to fill room number and disable the input field
function fillRoomNumber(roomNumber) {
    var roomNoInput = document.getElementById("RoomNo");
    roomNoInput.value = roomNumber;
    roomNoInput.disabled = true;
}

function Booked() {
    var bookBtn = document.getElementById("Bookbtn");
    bookBtn.textContent = "Booked";
    bookBtn.style.color = "red";
}

document.getElementById('deleteRoomForm').addEventListener('submit', function(event) {
    const confirmation = confirm('Are you sure you want to delete this room?');
    if (!confirmation) {
        event.preventDefault(); // Prevent form submission if user clicks "Cancel"
    }
});

//Room availability 
// Get the element by its ID
var Capacity = document.getElementById("Tcapacity");
var Bookings = document.getElementById("Tbookings");

// Get the text content of the element
var textContent = Capacity.textContent;
var textContents = Bookings.textContent;

// Use a regular expression to extract the number from the text
var numberMatch = textContent.match(/\d+/);
var numberMatchs = textContents.match(/\d+/);

// Convert the matched number to an integer, if a match is found
var capacityValue = numberMatch ? parseInt(numberMatch[0], 10) : null;
var bookingValues = numberMatchs ? parseInt(numberMatchs[0], 10) : null;

// Log the result
console.log(capacityValue);
console.log(bookingValues);

var availability =  capacityValue - bookingValues;
console.log(availability);
document.getElementById("Tcap").innerText = availability + " Persons";

//Date format 
var DDY = new Date();
var date = DDY.getDate();
var month = DDY.getMonth() + 1;
var year = DDY.getFullYear();
var day = DDY.getDay();
var days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

document.getElementById("head").innerText = "Hi, today is "+ days[day - 1] + " : " + date + "-" + month + "-" + year ;  

 // Handle form submission for adding attendance
        document.getElementById('addAttendanceForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            fetch('/add-attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json())
              .then(data => {
                  alert('Attendance record added successfully!');
                  // Optionally reset the form
                  this.reset();
              }).catch(error => {
                  console.error('Error:', error);
              });
        });

               // Handle form submission for adding employee


///Graph//////////

  


