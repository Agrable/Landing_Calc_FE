document.getElementById('farm-form').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form from refreshing the page

  // Get form data
  const location = document.getElementById('location').value;
  const size = document.getElementById('size').value;
  const cropType = document.getElementById('crop-type').value;

  // Show loading message
  const resultSection = document.getElementById('result-section');
  const result = document.getElementById('result');
  resultSection.style.display = 'block';
  result.textContent = 'Calculating...';

  // Placeholder: Replace this with your backend connection
  setTimeout(() => {
    result.textContent = `For a farm in ${location} with ${size} hectares, the estimated revenue is €X,XXX/year.`;
  }, 2000); // Simulate a delay
});
