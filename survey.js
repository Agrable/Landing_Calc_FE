document.addEventListener('DOMContentLoaded', function () {
  const farmTypeDropdown = document.getElementById('farm-type');
  const startSurveyButton = document.getElementById('start-survey');
  const questionContainer = document.getElementById('question-container');
  const questionLabel = document.getElementById('question-label');
  const questionSelect = document.getElementById('question-select');
  const nextQuestionButton = document.getElementById('next-question');
  const calculateButton = document.getElementById('calculate-button');

  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let totalSOCPotential = 0;

  // Ensure farm type dropdown is detected
  farmTypeDropdown.addEventListener('change', function () {
    const farmType = this.value;
    currentQuestions = getQuestionsForFarmType(farmType);
    currentQuestionIndex = 0;
    totalSOCPotential = 0;

    console.log("Farm type selected:", farmType); // Debugging: Check if selection is detected
    console.log("Loaded questions:", currentQuestions); // Debugging: Check if questions are loaded

    if (currentQuestions.length > 0) {
      startSurveyButton.style.display = 'block'; // Show "Next" button
    } else {
      startSurveyButton.style.display = 'none';
    }
  });

  // Click "Next" to start the survey
  startSurveyButton.addEventListener('click', function () {
    console.log("Next button clicked - Showing first question"); // Debugging

    startSurveyButton.style.display = 'none'; // Hide "Next" button
    questionContainer.style.display = 'block'; // Show question area
    showQuestion();
  });

  // Click "Next" to move to the next question
  nextQuestionButton.addEventListener('click', function () {
    const selectedValue = questionSelect.value;
    if (!selectedValue) {
      alert("Please select an answer before continuing.");
      return;
    }

    const socValues = JSON.parse(questionSelect.dataset.socValues);
    const selectedSOC = socValues[selectedValue];

    // Adjust calculation for negative values (Add absolute value to max)
    const maxPotential = Object.values(socValues).reduce((max, value) => Math.max(max, value), 0);
    const adjustedSOC = maxPotential + selectedSOC;
    totalSOCPotential += adjustedSOC;

    console.log(`Selected: ${selectedValue}, SOC Adjusted: ${adjustedSOC}, Total: ${totalSOCPotential}`); // Debugging

    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion(); // Show next question
    } else {
      questionContainer.style.display = 'none'; // Hide question area
      calculateButton.style.display = 'block'; // Show "Calculate" button
    }
  });

  // Submit form to calculate total SOC increase
  document.getElementById('survey-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const farmName = document.getElementById('farm-name').value;
    const farmLocation = document.getElementById('farm-location').value;
    const farmType = document.getElementById('farm-type').value;

    document.getElementById('result').textContent = `Estimated SOC Increase: ${totalSOCPotential.toFixed(2)} tCO₂ per ha`;
    document.getElementById('result-section').style.display = 'block';

    try {
      const response = await fetch('https://landing-calc-be.onrender.com/log-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmName, farmLocation, farmType, totalSOCPotential }),
      });

      if (!response.ok) throw new Error('Failed to save survey data');

      alert('Survey data logged successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving data.');
    }
  });

  // Function to display the current question
  function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    questionLabel.textContent = question.text;
    questionSelect.innerHTML = '';
    questionSelect.dataset.socValues = JSON.stringify(question.socValues);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select an option';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    questionSelect.appendChild(defaultOption);

    question.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      questionSelect.appendChild(opt);
    });

    console.log("Showing Question:", question.text); // Debugging
  }

  // Function to return questions based on farm type
  function getQuestionsForFarmType(farmType) {
    return {
      "Grandes cultures, Maraîchage, Viticulture, PPAM": [
        {
          text: "Pratique du travail du sol",
          options: [
            { label: "Labour conventionnel", value: "conventional" },
            { label: "Réduction du travail du sol", value: "reduced" },
            { label: "Semis direct", value: "direct" }
          ],
          socValues: { "conventional": -0.5, "reduced": 0.2, "direct": 0.3 }
        },
        {
          text: "Présence de couverts végétaux",
          options: [
            { label: "Sans couvert", value: "none" },
            { label: "Couverts hivernaux", value: "some" },
            { label: "Couverts multi-espèces", value: "full" }
          ],
          socValues: { "none": 0, "some": 0.3, "full": 0.6 }
        }
      ]
    }[farmType] || [];
  }
});

