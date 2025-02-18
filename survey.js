document.getElementById('farm-type').addEventListener('change', function() {
  const farmType = this.value;
  const questionsContainer = document.getElementById('questions-container');
  questionsContainer.innerHTML = ''; // Clear previous questions
  questionsContainer.style.display = 'block';

  const questions = getQuestionsForFarmType(farmType);

  questions.forEach((question, index) => {
    const div = document.createElement('div');
    div.classList.add('question');

    const label = document.createElement('label');
    label.textContent = question.text;

    const select = document.createElement('select');
    select.name = `question-${index}`;
    select.dataset.socValue = JSON.stringify(question.socValues); // Store SOC data

    question.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      select.appendChild(opt);
    });

    div.appendChild(label);
    div.appendChild(select);
    questionsContainer.appendChild(div);
  });
});

document.getElementById('survey-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const farmName = document.getElementById('farm-name').value;
  const farmLocation = document.getElementById('farm-location').value;
  const farmType = document.getElementById('farm-type').value;
  const questions = document.querySelectorAll('.question select');

  let totalSOCPotential = 0;
  let responses = [];

  questions.forEach(select => {
    const socValues = JSON.parse(select.dataset.socValue);
    const selectedValue = select.value;

    totalSOCPotential += socValues[selectedValue] || 0;
    responses.push({ question: select.name, answer: selectedValue });
  });

  // Display results
  document.getElementById('result').textContent = `Estimated SOC Increase: ${totalSOCPotential.toFixed(2)} tCO₂ per ha`;
  document.getElementById('result-section').style.display = 'block';

  // Send data to backend
  try {
    const response = await fetch('https://landing-calc-be.onrender.com/log-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmName, farmLocation, farmType, responses, totalSOCPotential }),
    });

    if (!response.ok) throw new Error('Failed to save survey data');

    alert('Survey data logged successfully!');
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while saving data.');
  }
});

function getQuestionsForFarmType(farmType) {
  const questionDatabase = {
    "Grandes cultures, Maraîchage, Viticulture, PPAM": [
      {
        text: "What are your tilling practices?",
        options: [
          { label: "Labour conventionnel", value: "conventional" },
          { label: "Réduction du travail du sol", value: "reduced" },
          { label: "Semis direct", value: "direct" }
        ],
        socValues: { "conventional": -0.3, "reduced": 0.5, "direct": 1.2 }
      }
    ],
    "Prairies et élevages": [
      {
        text: "What type of pasture management do you use?",
        options: [
          { label: "Surpâturage / pâturage continu", value: "continuous" },
          { label: "Pâturage tournant simple", value: "rotational" },
          { label:
