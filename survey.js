document.addEventListener('DOMContentLoaded', () => {
  const farmTypeDropdown = document.getElementById('farm-type');
  const questionsContainer = document.getElementById('questions-container');

  farmTypeDropdown.addEventListener('change', function () {
    const farmType = this.value;
    questionsContainer.innerHTML = ''; // Clear previous questions
    questionsContainer.style.display = 'block';

    const questions = getQuestionsForFarmType(farmType);

    if (questions.length === 0) {
      questionsContainer.style.display = 'none'; // Hide container if no questions
      return;
    }

    questions.forEach((question, index) => {
      const div = document.createElement('div');
      div.classList.add('question');

      const label = document.createElement('label');
      label.textContent = question.text;

      const select = document.createElement('select');
      select.name = `question-${index}`;
      select.dataset.socValue = JSON.stringify(question.socValues); // Store SOC data

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select an option';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

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

  document.getElementById('survey-form').addEventListener('submit', async function (event) {
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

    document.getElementById('result').textContent = `Estimated SOC Increase: ${totalSOCPotential.toFixed(2)} tCO₂ per ha`;
    document.getElementById('result-section').style.display = 'block';

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
});

// Function to get questions based on farm type
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
        socValues: { "conventional": -0.5, "reduced": 0.5, "direct": 1.2 }
      }
    ],
    "Prairies et élevages": [
      {
        text: "Type de pâturage",
        options: [
          { label: "Surpâturage", value: "continuous" },
          { label: "Pâturage tournant", value: "rotational" },
          { label: "Pâturage régénératif", value: "regenerative" }
        ],
        socValues: { "continuous": -1, "rotational": 1.5, "regenerative": 3.5 }
      }
    ]
  }[farmType] || [];
}

