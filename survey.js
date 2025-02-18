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

  farmTypeDropdown.addEventListener('change', function () {
    const farmType = this.value;
    currentQuestions = getQuestionsForFarmType(farmType);
    currentQuestionIndex = 0;
    totalSOCPotential = 0;

    if (currentQuestions.length > 0) {
      startSurveyButton.style.display = 'block';
    } else {
      startSurveyButton.style.display = 'none';
    }
  });

  startSurveyButton.addEventListener('click', function () {
    startSurveyButton.style.display = 'none';
    questionContainer.style.display = 'block';
    showQuestion();
  });

  nextQuestionButton.addEventListener('click', function () {
    const selectedValue = questionSelect.value;
    if (!selectedValue) {
      alert("Please select an answer before continuing.");
      return;
    }

    const socValues = JSON.parse(questionSelect.dataset.socValues);
    const selectedSOC = socValues[selectedValue];

    // Adjust calculation for negative values
    const maxPotential = Object.values(socValues).reduce((max, value) => Math.max(max, value), 0);
    const adjustedSOC = maxPotential + selectedSOC;
    totalSOCPotential += adjustedSOC;

    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion();
    } else {
      questionContainer.style.display = 'none';
      calculateButton.style.display = 'block';
    }
  });

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
  }

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

