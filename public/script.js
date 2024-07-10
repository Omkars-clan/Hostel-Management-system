var formContainer = document.getElementById("Room");
var bookingForm = document.getElementById("booking");

function OpenForm() {
    formContainer.style.display = 'block'; // Display the form container
    bookingForm.style.display = 'none';
}
function closed(){
    formContainer.style.display = 'none';
    bookingForm.style.display = 'none';
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
