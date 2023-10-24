let user_id;
let gender;
let age;
let profession;
let pennStateStudent;
let major;
let psuEmail;

// Get user_id from the URL
user_id = getParameterByName('user_id');
if (user_id === null) {
    user_id = 'u_9999999999999_999';
}
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
// --- DB operation function ---
function retryPostRequest(url, options, maxRetries) {
    return fetch(url, options)
        .then((response) => {
            if (!response.ok) {
                if (maxRetries > 0) {
                    console.log('Retrying POST request...');
                    return retryPostRequest(url, options, maxRetries - 1);
                } else {
                    throw new Error('Network response was not ok after retrying');
                }
            }
            return response.json();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

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
    const jsonData = JSON.stringify(dataSave);
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData, // Pass the JSON data as the request body
    };
    retryPostRequest("https://www.idea-db.com:60000/set", requestOptions, 3).then(response => {
        console.log('Response data:', response);
    });
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

