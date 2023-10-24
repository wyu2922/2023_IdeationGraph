
// ---------------------------------------------------------------------------
// =============== On Page Load ===============

// handle to survey
document.getElementById('to-survey').onclick = function () {
    window.location.href = 'idea_evaluation.html';
};

// Read CSV data and filter based on user selections
let filteredData = [];
async function fetchDataAndFilter() {
    try {
        const data = await d3.csv('data/edge_preds_with_cluster_info_1022.csv');
        populateProductDropdown(data);
        updateFilteredData(data);
        initializeEventListeners(data);
    } catch (error) {
        console.error("Error fetching or filtering data:", error);
    }
}

// Populate Product Name dropdown with unique values
function populateProductDropdown(data) {
    const productDropdown = document.getElementById('product-name');
    const productNames = Array.from(new Set(data.map(d => d.dst_names))).sort();

    productNames.forEach(function (name) {
        const option = document.createElement('option');
        option.text = name;
        option.value = name;
        productDropdown.appendChild(option);
    });
}

// Function to update filtered data
function updateFilteredData(data) {
    const associationType = document.getElementById('association-type').value;
    const modelPrediction = parseInt(document.getElementById('model-prediction').value);
    const ugcSignal = parseInt(document.getElementById('ugc-signal').value);
    const selectedProduct = document.getElementById('product-name').value;

    filteredData = data.filter(function (d) {
        return (
            d.src_types === associationType &&
            parseInt(d.PredEdge) === modelPrediction &&
            parseInt(d.isEdge) === ugcSignal &&
            d.dst_names === selectedProduct
        );
    });

    // Display up to 30 rows or show "No results found"
    const tableBody = document.getElementById('filtered-data');
    const noResults = document.getElementById('no-results');

    if (filteredData.length > 0) {
        noResults.style.display = 'none';
        tableBody.innerHTML = '';

        const displayedData = filteredData.slice(0, 30);

        displayedData.forEach(function (d, index) {
            const row = document.createElement('tr');
            const cell0 = document.createElement('td');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            const cell3 = document.createElement('td');


            // Add row index to the new cell
            cell0.textContent = index;
            // Rename columns as requested
            cell1.textContent = d.src_names;
            cell2.textContent = d.edge_probs;
            cell3.textContent = d.category_examplar;

            row.appendChild(cell0);
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            tableBody.appendChild(row);
        });
    } else {
        noResults.style.display = 'block';
        tableBody.innerHTML = '';
    }

}

// Initialize event listeners on the page
function initializeEventListeners(data) {
    // Attach event listener to the "Go" button
    document.getElementById('filter-button').addEventListener('click', function () {
        updateFilteredData(data);
    });

    // Attach event listener to the "Generate New Product Features" button
    document.getElementById('generate-features-button').addEventListener('click', function () {
        updateFilteredData(data);
        handleGenerateFeaturesButtonClick();
    });

    // Attach event listener to close the modal when clicking outside of it
    window.onclick = closeModalOnClickOutside;

}




// ---------------------------------------------------------------------------
// ========== Deal with "Generate New Product Features" Modal ==========

// ---------- Interact with OpenAI API ---------
// Function to make an asynchronous request to OpenAI's API
async function fetchAndGenerateFeatures(apiKey, productName, keywordsString) {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const ideationPrompt = `Imagine that you are a product manager for ${productName}, the mobile app. 
    Your task is to come up with 5 new product features that are novel and useful for the users. You should use the following keywords as hints to inspire your ideas. 
    The features should enhance the overall user experience and provide value to the customers.\nKeywords: ${keywordsString}`;

    const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: ideationPrompt }
        ]
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    });

    const responseData = await response.json();
    return responseData.choices[0].message.content;
}

// Function to handle errors from OpenAI's API
function handleOpenAIError(error) {
    console.error("Error calling OpenAI:", error);
    const memorizedInputContainer = document.getElementById('memorized-input-container');
    const memorizedInputDiv = document.getElementById('memorized-input');

    memorizedInputDiv.innerHTML = `Error calling OpenAI. Here is the error message: <br><br> ${error}`;
    memorizedInputContainer.style.display = 'block';
}


// ---------- Webpage Modal Functions ---------

function handleCancelClick() {
    const rowSelectionModal = document.getElementById('row-selection-modal');
    console.log('cancel-row-selection');
    rowSelectionModal.style.display = 'none';
}

async function handleSubmitRowSelection() {
    // Get the entered start and end row indexes
    const startRow = parseInt(document.getElementById('start-row').value);
    const endRow = parseInt(document.getElementById('end-row').value);
    const apiKey = document.getElementById('api-key').value;

    if (!isNaN(startRow) && !isNaN(endRow) && startRow >= 0 && endRow >= 0 && startRow <= endRow && endRow < filteredData.length) {
        // Close the row selection modal
        const rowSelectionModal = document.getElementById('row-selection-modal');
        rowSelectionModal.style.display = 'none';

        // Show loading message
        const memorizedInputContainer = document.getElementById('memorized-input-container');
        const memorizedInputDiv = document.getElementById('memorized-input');
        memorizedInputDiv.innerHTML = 'Working on it...';
        memorizedInputContainer.style.display = 'block';

        // Extract Product names and keywords chosen by users
        const productName = filteredData[startRow]['dst_names'];
        const keywords = [];

        // Collect keywords from selected rows
        for (let i = startRow; i <= endRow; i++) {
            const rowData = filteredData[i];
            const singleKeyword = rowData['src_names'].split('_');
            keywords.push(...singleKeyword);
        }
        const keywordsString = keywords.join(', ');

        // Call OpenAI
        try {
            // Make an asynchronous request to OpenAI's API
            const assistantResponse = await fetchAndGenerateFeatures(apiKey, productName, keywordsString);
            // Display the generated features
            displayGeneratedFeatures(productName, keywordsString, assistantResponse);
        } catch (error) {
            handleOpenAIError(error);
        }

    } else {
        alert("Invalid row numbers selected or missing API key. Please try again.");
    }
}

// Handle "Generate New Product Features" button click
function handleGenerateFeaturesButtonClick() {
    // Show the row selection modal
    const rowSelectionModal = document.getElementById('row-selection-modal');
    rowSelectionModal.style.display = 'block';

    // Handle "Cancel" button to close the modal: Remove existing click event listeners &  Add a new click event listener
    const cancelRowSelectionButton = document.getElementById('cancel-row-selection');
    cancelRowSelectionButton.removeEventListener('click', handleCancelClick);
    cancelRowSelectionButton.addEventListener('click', handleCancelClick);

    // Handle "Submit" button for row selection: Remove existing click event listeners & Add a new click event listener
    const submitRowSelectionButton = document.getElementById('submit-row-selection');
    submitRowSelectionButton.removeEventListener('click', handleSubmitRowSelection);
    submitRowSelectionButton.addEventListener('click', handleSubmitRowSelection);
}

function formatAssistantResponse(response) {
    console.log(response)
    // Split the response into individual points
    const paragraphs = response.split('\n\n');

    // Process each paragraph
    const processedParagraphs = paragraphs.map(paragraph => {
        // Identify patterns starting from a number and followed by '.' or ':'
        const pattern = /\d+[\.:]/g;
        const matches = paragraph.match(pattern);

        if (matches) {
            // Split the paragraph by identified patterns
            const subPoints = paragraph.split(pattern);

            // Create separate <li> for each subpoint
            const subPointItems = subPoints
                .filter(subPoint => subPoint.trim() !== '') // Exclude empty rows
                .map(subPoint => `<li>${subPoint.trim()}</li><br>`);

            // Join the subpoint items to form the final HTML for this paragraph
            return subPointItems.join('');
        } else {
            // If no pattern found, return the original paragraph
            return `<li>${paragraph.trim()}</li>`;
        }
    });

    // Join the processed paragraphs to form the final HTML
    const finalHTML = processedParagraphs.join('');
    return finalHTML;

}



// Function to display the generated features
function displayGeneratedFeatures(productName, keywordsString, assistantResponse) {
    const memorizedInputContainer = document.getElementById('memorized-input-container');
    const memorizedInputDiv = document.getElementById('memorized-input');

    memorizedInputDiv.innerHTML = `
    <p>(Product: ${productName})
    <br>(Keywords: ${keywordsString})</p>
    <p>Here are 5 new product features generated by OpenAI using the selected keywords as a prompt:</p>
    <ul>${formatAssistantResponse(assistantResponse)}</ul>`;;

    memorizedInputContainer.style.display = 'block';
}

function closeModalOnClickOutside(event) {
    const modal = document.getElementById('row-selection-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


// Fetch and filter data on page load
fetchDataAndFilter();




