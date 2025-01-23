document.getElementById('farm-form').addEventListener('submit', async (event) => {
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

