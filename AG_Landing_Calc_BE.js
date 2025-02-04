// Handle form submission on index.html
document.getElementById('farm-form')?.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent form from refreshing the page

  // Get form data
  const region = document.getElementById('region').value; // Updated to match your region input
  const size = document.getElementById('size').value;

  // Show loading message
  const resultSection = document.getElementById('result-section');
  const result = document.getElementById('result');
  resultSection.style.display = 'block';
  result.textContent = 'Calculating...';

  try {
    // Send request to the backend
    const response = await fetch('https://landing-calc-be.onrender.com/calculate-revenue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ region, size }), // Pass region and size to the backend
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from the backend.');
    }

    // Parse the backend response
    const data = await response.json();

    // Display the backend result
    result.textContent = data.result; // Assuming the backend returns { result: '...' }
  } catch (error) {
    console.error('Error:', error);
    result.textContent = 'An error occurred while calculating revenue. Please try again.';
  }
});

// Handle dynamic functionality on dashboard.html
const activityLevers = {
  Emissions: ["Fuel Use", "Fertilizer Application", "Livestock Emissions"],
  Sequestration: ["Agroforestry", "Cover Crops", "No-Till Farming", "Composting", "Biochar Application"],
};

// Activity buttons and form handling
document.getElementById('emissions-btn')?.addEventListener('click', () => {
  populateActivityDropdown("Emissions");
  toggleFormVisibility();
});

document.getElementById('sequestration-btn')?.addEventListener('click', () => {
  populateActivityDropdown("Sequestration");
  toggleFormVisibility();
});

// Populate dropdown based on selected activity type
function populateActivityDropdown(activityType) {
  const activityDropdown = document.getElementById('activity-type');
  activityDropdown.innerHTML = ''; // Clear existing options

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select activity';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  activityDropdown.appendChild(defaultOption);

  activityLevers[activityType]?.forEach((lever) => {
    const option = document.createElement('option');
    option.value = lever;
    option.textContent = lever;
    activityDropdown.appendChild(option);
  });
}

// Toggle form visibility
function toggleFormVisibility() {
  const logForm = document.getElementById('log-form');
  logForm.style.display = 'block'; // Show the form when an activity is selected
}

// Handle form submission on dashboard.html
document.getElementById('log-form')?.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent form refresh

  const activityType = document.getElementById('activity-type').value;
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value;
  const notes = document.getElementById('notes').value;

  console.log(`Logged Activity:
    Type: ${activityType},
    Amount: ${amount},
    Date: ${date},
    Notes: ${notes}`);

  // Simulate saving data to the backend
  try {
    const response = await fetch('https://landing-calc-be.onrender.com/log-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activityType, amount, date, notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to log activity on the backend.');
    }

    const data = await response.json();
    alert(`Activity logged successfully! Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Error logging activity:', error);
    alert('Failed to log activity. Please try again.');
  }
});

