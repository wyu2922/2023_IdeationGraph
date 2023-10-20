
//store meta data from csv
let surveyData = [];
let product_list = [];
let group_adopt_list = [];

//track user progress
let user_id;
const total_product_required = 3
let currentProductIndex = 0;

//track progress for each product to be evaluated
let randomProduct;
let selectedData;

//Send to Database
// previously defined: user_id, randomProduct
let randomGroup; //group_adopt_intent

// record user selections
let isUser = 0;
let idea_idx;
let new_idea;
let group_idea_eval;
let adopt_price;


//----------------------------------------------------------
// ------------------ Helper Functions ---------------------

// --- Helper Functions for Data Logic ---

function shuffleArray(array) {
    // shuffles the elements of an array using the Fisher-Yates (or Knuth) Shuffle algorithm.
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//Randomly select product and ideas for users to evaluate
function gen_random_samples() {
    // remove previous selections
    clearRadioButtons('input[type="radio"]')

    // Randomly select one from product_list
    randomProduct = product_list[Math.floor(Math.random() * product_list.length)];
    // Randomly select one from group_adopt_list
    randomGroup = group_adopt_list[Math.floor(Math.random() * group_adopt_list.length)];
    // Filter surveyData based on the selected criteria
    selectedData = surveyData.filter(item => item.app_name === randomProduct && item.group_adopt_intent === randomGroup);
    //shuffle array
    selectedData = shuffleArray(selectedData);
}


// --- Helper Functions for Display Logic ---
function displayExprimentInstruction() {
    document.getElementById('intro-container').style.display = 'none';
    document.getElementById('instruction-container').style.display = 'block';
}

function displayProductScreen() {
    //display product screen question page
    document.getElementById('intro-container').style.display = 'none';
    document.getElementById('instruction-container').style.display = 'none';
    document.getElementById('survey-container').style.display = 'none';
    document.getElementById('product-screen-container').style.display = 'block';
    document.getElementById('product-screen-question').innerHTML = `<br><br><strong>Are you currently using <strong style="color: red;font-size: larger;"><em><u>${randomProduct}</u></em></strong>, the mobile app?</strong>`;
}

function displayIdeaEval() {
    // Display idea evaluation question page
    document.getElementById('product-screen-container').style.display = 'none';
    document.getElementById('survey-container').style.display = 'block';

    // Update user progress information
    document.getElementById('product-evaluated').textContent = currentProductIndex;

    // Insert product name to question description
    document.getElementById('idea_desc').innerHTML = `The product team of <strong style="color: red;"><em><u>${randomProduct}</strong></em></u> is considering adding a new feature to ${randomProduct}. Currently, they've narrowed it down to five potential options. Please review the following product features. Select the feature you'd most like to use.`;

    // Insert ideas for Question 1 to radio options
    let optionsHtmlQuestion1 = '';
    for (let i = 0; i < selectedData.length; i++) {
        selectedRow = selectedData[i]
        optionsHtmlQuestion1 += `<input type="radio" name="question1" 
        value="${selectedRow.idea_idx}"
        meta-new-idea="${selectedRow.new_idea}"
        meta-group-idea-eval="${selectedRow.group_idea_eval}"
        >${selectedRow.new_idea}</label><br><br>`;
    }
    optionsHtmlQuestion1 += `<input type="radio" name="question1" value="none">None of the above.</label><br>`;

    // Append optionsHtmlQuestion1 to the survey-form
    document.getElementById('survey-form-1').innerHTML += optionsHtmlQuestion1;

}

function clearRadioButtons(radio_labels) {
    var radioButtons = document.querySelectorAll(radio_labels);
    // Loop through each radio button and uncheck it
    radioButtons.forEach(function (radioButton) {
        radioButton.checked = false;
    });

    //remove preivous inserted idea options
    const surveyForm1 = document.getElementById('survey-form-1');
    surveyForm1.innerHTML = '';
}


// --- Send Data to Backend ---
function sendData() {
    var dataSave = {
        'table_idx': 'Table2',
        'userid': user_id,
        'app_name': randomProduct,
        'group_adopt_intent': randomGroup,
        'group_idea_eval': group_idea_eval,
        'product_screen_isUser': isUser,
        'adopted_idea_idx': idea_idx,
        'adopted_new_idea': new_idea,
        'adopt_price': adopt_price
    };

    //send data to backend
    console.log(dataSave);
}

//----------------------------------------------------------
// ------------------ Handle Pages ---------------------

// --- Introduction Page ---

function loadIdeasData() {
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
            product_list = [...new Set(surveyData.map(item => item.app_name).filter(value => value !== undefined))];
            // Extract unique group_adopt_intent_idx names
            group_adopt_list = [...new Set(surveyData.map(item => item.group_adopt_intent).filter(value => value !== undefined))];

            // After loading data: select random product, and display product screen question
            currentProductIndex = 0
            gen_random_samples();
            displayProductScreen();

        }, error: function (error) {
            console.error('Error parsing idea source CSV:', error);
        }
    });
}


function showExitAlert() {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
        window.location.href = 'index.html';
    }
}

function toRespondentInfo() {
    if (confirm("Before you go, continue with our experiment to earn $5 right away! Confirm now and win yourself a pleasant treat later!")) {
        window.location.href = 'adopt_intention.html';
    } else {
        if (confirm("Are you sure? It's $5 right away!")) {
            window.location.href = 'adopt_intention.html';
        } else {
            window.location.href = 'respondent_info.html?user_id=' + user_id;
        }
    }
}


// -------------------------------------------------------------------------------------------------
//--------------- Collect Answers for Selected Product ---------------

// --- Handle Buttons ---

function handleProductScreenYes() {
    //handle "confirm product" button on product screen page
    isUser = 1
    currentProductIndex++;
    displayIdeaEval();
}

function handleProductScreenNo() {
    isUser = 0;
    idea_idx = 'na';
    new_idea = 'na';
    group_idea_eval = 'na';
    adopt_price = 'na';

    // send data
    sendData();

    //generate new product
    gen_random_samples();
    displayProductScreen();
}

function handleNext() {
    // check current selections & send to backend
    const radioGroups = document.querySelectorAll('input[type="radio"]:checked');
    if (radioGroups.length !== 2) {
        alert('Please answer all questions before proceeding.')
    } else {
        // Get the selected values for each question
        var selectedRadio = document.querySelector('input[name="question1"]:checked');
        idea_idx = selectedRadio.value;
        new_idea = selectedRadio ? selectedRadio.getAttribute('meta-new-idea') : null;
        group_idea_eval = selectedRadio ? selectedRadio.getAttribute('meta-group-idea-eval') : null;

        adopt_price = document.querySelector('input[name="question2"]:checked').value;
        sendData()

        // Clear radio button selections
        clearRadioButtons('input[name="question1"]');
        clearRadioButtons('input[name="question2"]');

        if (currentProductIndex < total_product_required) {
            gen_random_samples();
            displayProductScreen();
        } else {
            window.location.href = 'respondent_info.html?user_id=' + user_id;
        }
    }
}
