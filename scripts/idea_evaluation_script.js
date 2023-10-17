//-------------- Load Google -------------------


//--------------- Start of Survey ---------------
//store data from csv
let surveyData = [];
let product_list = [];
let group_adopt_list = [];

//document user progress
let user_id;
const total_product_required = 3
let productEvaluated = 0;

function loadIdeaData(callback) {
    // assign a user_id to current user
    user_id = `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Function to load idea data
    const csvFilePath = 'data/idea_for_survey_1015.csv';
    Papa.parse(csvFilePath, {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results) {
            // Extract all ideas
            surveyData = results.data;
            // Extract unique app names
            product_list = [...new Set(surveyData.map(item => item.app_name))];
            // Extract unique group_adopt_intent_idx names
            group_adopt_list = [...new Set(surveyData.map(item => item.group_adopt_intent))];

            // Call the callback function with the loaded data
            if (typeof callback === 'function') {
                callback();
            }
        },
        error: function (error) {
            console.error('Error parsing idea source CSV:', error);
        }
    });
}

function showExitAlert() {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
        //window.location.href = "https://yourwebsite.com"; // Redirect to the homepage or another page
        //go to thank you page
    }
}



// -------------------------------------------------------------------------------------------------
//--------------- Collect Answers for Selected Product ---------------
let randomProduct;
let selectedData;
let currentIndex = 0;
function shuffleArray(array) {
    // shuffles the elements of an array using the Fisher-Yates (or Knuth) Shuffle algorithm.
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function gen_random_samples() {
    currentIndex = 0
    // Clear radio button selections for all questions
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(button => {
        button.checked = false;
    });

    // Randomly select one from product_list
    randomProduct = product_list[Math.floor(Math.random() * product_list.length)];
    // Randomly select one from group_adopt_list
    const randomGroup = group_adopt_list[Math.floor(Math.random() * group_adopt_list.length)];
    // Filter surveyData based on the selected criteria
    selectedData = surveyData.filter(item => item.app_name === randomProduct && item.group_adopt_intent === randomGroup);
    //shuffle array
    selectedData = shuffleArray(selectedData);

    console.log('Random Product:', randomProduct);
    console.log('Idea number', selectedData.length);
    console.log('Idea number', selectedData);

    // Move to product screen question
    displayProductScreen()
}

function displayProductScreen() {
    //product screen question
    document.getElementById('intro-container').style.display = 'none';
    document.getElementById('survey-container').style.display = 'none';
    document.getElementById('product-screen-container').style.display = 'block';
    document.getElementById('product-screen-question').innerHTML = `<br><br><strong>Are you familiar with <strong style="color: red;font-size: larger;"><em><u>${randomProduct}</u></em></strong>, the mobile app?</strong>`;

}

function handleUserChoice() {
    var selectedValue = document.querySelector('input[name="familiarity"]:checked');
    if (selectedValue) {
        // Check if a value is selected
        var familiarity = document.querySelector('input[name="familiarity"]:checked').value;
        if (familiarity === 'unaware') {
            gen_random_samples();
        } else {
            startSurvey();
        }
    } else {
        alert("Please select a familiarity level.");
    }
}

function startSurvey() {
    // Update user progress information
    document.getElementById('current-index').textContent = currentIndex + 1;
    document.getElementById('total-ideas').textContent = selectedData.length;
    document.getElementById('product-evaluated').textContent = productEvaluated + 1;

    // If not the first question, check if the user answered all questions
    if (currentIndex !== 0) {
        const radioGroups = document.querySelectorAll('input[type="radio"]:checked');
        if (radioGroups.length !== 6) {
            alert('Please answer all questions before proceeding.')
        }
        else {
            // Clear radio button selections for all questions
            const radioButtons = document.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(button => {
                button.checked = false;
            });
        }
    };

    // control container: show and hide
    document.getElementById('product-screen-container').style.display = 'none';
    document.getElementById('survey-container').style.display = 'block';

    // insert idea
    if (currentIndex < selectedData.length) {
        const singleIdea = selectedData[currentIndex].new_idea; // Replace 'question' with the actual property name in your data
        document.getElementById('idea_desc').innerHTML = `The product team of <strong style="color: red;"><em><u>${randomProduct}</strong></em></u> is considering adding a new feature to <strong style="color: red;"><em><u>${randomProduct}</strong></em></u>. Please read the following product feature description carefully.`;
        document.getElementById('idea').innerHTML = ` ${singleIdea} `;

        currentIndex++;
    } else {
        if (productEvaluated < total_product_required) {
            productEvaluated++;
            gen_random_samples()
        } else {
            console.log('end of the survey')
            //go to thank you page
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}



function submitSurvey() {
    // Process the survey data here (send to server, etc.)
    // For now, let's just redirect to the info.html page
    //go to thank you page
    //window.location.href = "info.html";
}
