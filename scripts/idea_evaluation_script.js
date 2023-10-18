
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
let singleIdea;
let currentIdeaIndex = 0;

//Send to Database
// previously defined: user_id, randomProduct, singleIdea
let singleIdeaIdx; //idea_indx
let singleIdeaGroupIdex; //group_idea_eval
let randomGroup; //group_adopt_intent

// record user selections
let productScreen; 
let question1;
let question2;
let question3;
let question4;
let question5;
let question6;


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
    // Randomly select one from product_list
    randomProduct = product_list[Math.floor(Math.random() * product_list.length)];
    // Randomly select one from group_adopt_list
    randomGroup = group_adopt_list[Math.floor(Math.random() * group_adopt_list.length)];
    // Filter surveyData based on the selected criteria
    selectedData = surveyData.filter(item => item.app_name === randomProduct && item.group_adopt_intent === randomGroup);
    //shuffle array
    selectedData = shuffleArray(selectedData);

    console.log('Random Product:', randomProduct);
    console.log(group_adopt_list);
    console.log('Random Group:', randomGroup);
    console.log('Idea number', selectedData.length);
}


// --- Helper Functions for Display Logic ---

function displayProductScreen() {
    //display product screen question page
    document.getElementById('intro-container').style.display = 'none';
    document.getElementById('survey-container').style.display = 'none';
    document.getElementById('product-screen-container').style.display = 'block';
    document.getElementById('product-screen-question').innerHTML = `<br><br><strong>Are you familiar with <strong style="color: red;font-size: larger;"><em><u>${randomProduct}</u></em></strong>, the mobile app?</strong>`;
}

function displayIdeaEval() {
    // get value
    singleIdea = selectedData[currentIdeaIndex].new_idea;
    singleIdeaIdx = selectedData[currentIdeaIndex].idea_idx;
    singleIdeaGroupIdex = selectedData[currentIdeaIndex].group_idea_eval;

    //display idea evaluation question page
    document.getElementById('product-screen-container').style.display = 'none';
    document.getElementById('survey-container').style.display = 'block';

    // Update user progress information
    currentIdeaIndex ++;
    document.getElementById('current-index').textContent = currentIdeaIndex;
    document.getElementById('total-ideas').textContent = selectedData.length;
    document.getElementById('product-evaluated').textContent = currentProductIndex;

    // insert idea
    document.getElementById('idea_desc').innerHTML = `The product team of <strong style="color: red;"><em><u>${randomProduct}</strong></em></u> is considering adding a new feature to ${randomProduct}. Please read the following product feature description carefully.`;
    document.getElementById('idea').innerHTML = ` ${singleIdea} `;
}

function clearRadioButtons(radio_labels) {
    var radioButtons = document.querySelectorAll(radio_labels);
    
    // Loop through each radio button and uncheck it
    radioButtons.forEach(function(radioButton) {
        radioButton.checked = false;
    });
}


// --- Send Data to Backend ---
function sendData(){
    //send data to backend
    console.log('send data to backend')
}


//----------------------------------------------------------
// ------------------ Handle Pages ---------------------

// --- Introduction Page ---

function loadIdeaData() {
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
            gen_random_samples();
            displayProductScreen();

        }, error: function (error) {
            console.error('Error parsing idea source CSV:', error);
        }
    });
}

function showExitAlert() {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
        // Redirect to personal info page
        //window.location.href =  // 
    }
}

// -------------------------------------------------------------------------------------------------
//--------------- Collect Answers for Selected Product ---------------

// --- Handle Buttons ---

function handleProductScreen() {
    //handle "confirm product" button on product screen page

    var productScreenInput = document.querySelector('input[name="familiarity"]:checked');
    if (productScreenInput) {
        productScreen = productScreenInput.value
        // Check if a value is selected
        if (productScreen === 'unaware') {
            question1 = 999
            question2 = 999
            question3 = 999
            question4 = 999
            question5 = 999
            question6 = 999
            sendData()
            
            //select next random product and display product screen page
            gen_random_samples();
            displayProductScreen();
        } else {
            //move to idea quality evaluation page
            currentProductIndex++;
            displayIdeaEval();
        }
        //clear selecton
        clearRadioButtons('input[name="familiarity"]')
    } else {
        alert("Please make a selection.");
    }

}

function handleIdeaNext() {
    // handle "next" button on idea quality evaluation page

    // check current selections & send to backend
    const radioGroups = document.querySelectorAll('input[type="radio"]:checked');
    if (radioGroups.length !== 6) {
        alert('Please answer all questions before proceeding.')
    }else{
        // Get the selected values for each question
        question1 = document.querySelector('input[name="question1"]:checked').value;
        question2 = document.querySelector('input[name="question2"]:checked').value;
        question3 = document.querySelector('input[name="question3"]:checked').value;
        question4 = document.querySelector('input[name="question4"]:checked').value;
        question5 = document.querySelector('input[name="question5"]:checked').value;
        question6 = document.querySelector('input[name="question6"]:checked').value;
        sendData()

        // Clear radio button selections
        clearRadioButtons('input[name="question1"]');
        clearRadioButtons('input[name="question2"]');
        clearRadioButtons('input[name="question3"]');
        clearRadioButtons('input[name="question4"]');
        clearRadioButtons('input[name="question5"]');
        clearRadioButtons('input[name="question6"]');
        }

    // move to next idea
    if (currentIdeaIndex < selectedData.length) {
        // show next idea of this product
        displayIdeaEval();
    } else {
        if (currentProductIndex < total_product_required) {
            currentProductIndex++;
            gen_random_samples();
            displayProductScreen();
        } else {
            console.log('end of the survey')
            //go to thank you page
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSwitchProduct() {
    // handle "SwitchProduct" button on idea quality evaluation page

     // Clear radio button selections
     clearRadioButtons('input[name="question1"]');
     clearRadioButtons('input[name="question2"]');
     clearRadioButtons('input[name="question3"]');
     clearRadioButtons('input[name="question4"]');
     clearRadioButtons('input[name="question5"]');
     clearRadioButtons('input[name="question6"]');

    gen_random_samples();
    displayProductScreen();
}