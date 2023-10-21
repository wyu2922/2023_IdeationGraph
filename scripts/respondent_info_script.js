let user_id;
let gender;
let age;
let profession;
let pennStateStudent;
let major;
let psuEmail;

// Get user_id from the URL
user_id = getParameterByName('user_id');
console.log(user_id)

// Function to extract parameter from URL
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// --- Send Data to Backend ---
function sendData() {
    var dataSave = {
        'table_idx': 'Table3',
        'userid': user_id,
        'gender': gender ? gender.value : 'noGender',
        'age_group': age ? age.value : 'noAge',
        'profession': profession ? profession.value : 'defaultProfession',
        'pennStateStudent': pennStateStudent ? pennStateStudent.checked : false,
        'major': major ? major.value : 'defaultMajor',
        'psuEmail': psuEmail ? psuEmail.value : 'defaultEmail'
    };
    //send data to backend
    console.log(dataSave);
};


// Handle Buttons
function togglePennStateFields() {
    var pennStateFields = document.getElementById("pennStateFields");
    var pennStateCheckbox = document.getElementById("pennStateStudent");

    pennStateFields.style.display = pennStateCheckbox.checked ? "block" : "none";
}

function submitForm() {
    gender = document.querySelector('input[name="gender"]:checked');
    age = document.querySelector('input[name="age"]:checked');
    profession = document.getElementById("profession");
    pennStateStudent = document.getElementById("pennStateStudent");
    major = document.getElementById("major");
    psuEmail = document.getElementById("psuEmail");
    sendData()

    if (confirm("Your response has been submitted. Thank you for contributing to our survey!")) {
        window.location.href = 'index.html';
    }
}

