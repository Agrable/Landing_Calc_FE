document.addEventListener('DOMContentLoaded', function () {
  const farmTypeDropdown = document.getElementById('farm-type');
  const startSurveyButton = document.getElementById('start-survey');
  const questionContainer = document.getElementById('question-container');
  const questionLabel = document.getElementById('question-label');
  const questionSelect = document.getElementById('question-select');
  const nextQuestionButton = document.getElementById('next-question');
  const backButton = document.createElement('button');
  const calculateButton = document.getElementById('calculate-button');

  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let totalSOCPotential = 0;
  let responses = [];

  backButton.textContent = "Back";
  backButton.style.display = "none";
  backButton.style.marginRight = "10px";
  questionContainer.insertBefore(backButton, nextQuestionButton);

  // Detect farm type selection
  farmTypeDropdown.addEventListener('change', function () {
    const farmType = this.value;
    currentQuestions = getQuestionsForFarmType(farmType);
    currentQuestionIndex = 0;
    totalSOCPotential = 0;
    responses = [];

    console.log("Farm type selected:", farmType);
    console.log("Loaded questions:", currentQuestions);

    if (currentQuestions.length > 0) {
      startSurveyButton.style.display = 'block';
    } else {
      startSurveyButton.style.display = 'none';
    }
  });

  // Click "Next" to start the survey
  startSurveyButton.addEventListener('click', function () {
    startSurveyButton.style.display = 'none';
    questionContainer.style.display = 'block';
    showQuestion();
  });

  // Click "Next" to move forward
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

    responses[currentQuestionIndex] = {
      question: currentQuestions[currentQuestionIndex].text,
      selectedOption: selectedValue,
      socValue: adjustedSOC
    };

    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion();
    } else {
      questionContainer.style.display = 'none';
      calculateButton.style.display = 'block';
    }

    backButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
  });

  // Click "Back" to go to the previous question
  backButton.addEventListener('click', function () {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      totalSOCPotential -= responses[currentQuestionIndex].socValue || 0;
      showQuestion();
    }

    backButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
    calculateButton.style.display = "none";
  });

  // Submit form to calculate total SOC increase
  document.getElementById('survey-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const farmName = document.getElementById('farm-name').value;
    const farmLocation = document.getElementById('farm-location').value;
    const farmType = document.getElementById('farm-type').value;

    let summary = `<h3>Recap of Current Practices:</h3><ul>`;
    responses.forEach(response => {
      summary += `<li><strong>${response.question}</strong>: ${response.selectedOption} (SOC Effect: ${response.socValue.toFixed(2)} tCO₂/ha)</li>`;
    });
    summary += `</ul>`;

    document.getElementById('result').innerHTML = `${summary}<h3>Total Estimated SOC Increase: ${totalSOCPotential.toFixed(2)} tCO₂ per ha</h3>`;
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

    backButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
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
      },
      {
        text: "Utilisation d’engrais organiques / composts",
        options: [
          { label: "Engrais minéraux seuls", value: "mineral" },
          { label: "Substitution partielle par compost / fumier", value: "partial" },
          { label: "Engrais verts et compost optimisé", value: "optimized" }
        ],
        socValues: { "mineral": -0.5, "partial": 0.2, "optimized": 0.6 }
      },
      {
        text: "Intégration d’arbres ou haies (agroforesterie)",
        options: [
          { label: "Absence d’arbres", value: "none" },
          { label: "Agroforesterie basique (50 arbres/ha)", value: "basic" },
          { label: "Agroforesterie dense (100+ arbres/ha)", value: "dense" }
        ],
        socValues: { "none": 0, "basic": 1, "dense": 3 }
      }
    ],
    "Prairies et élevages": [
      {
        text: "Type de pâturage",
        options: [
          { label: "Surpâturage / pâturage continu", value: "continuous" },
          { label: "Pâturage tournant simple", value: "rotational" },
          { label: "Pâturage régénératif", value: "regenerative" }
        ],
        socValues: { "continuous": -1, "rotational": 0.5, "regenerative": 1.5 }
      },
      {
        text: "Gestion des prairies",
        options: [
          { label: "Fauche intensive, absence de restitution", value: "intensive" },
          { label: "Gestion extensive (fauche tardive, diversité floristique)", value: "extensive" },
          { label: "Prairie permanente riche en légumineuses", value: "legumes" }
        ],
        socValues: { "intensive": -0.5, "extensive": 0.5, "legumes": 1.5 }
      },
      {
        text: "Intégration d’arbres (silvopastoralisme)",
        options: [
          { label: "Pâturage en pleine lumière", value: "none" },
          { label: "Arbres clairsemés (20-50 arbres/ha)", value: "scattered" },
          { label: "Silvopastoralisme intensif (100+ arbres/ha)", value: "intensive" }
        ],
        socValues: { "none": 0, "scattered": 1.5, "intensive": 4 }
      },
      {
        text: "Valorisation des effluents d’élevage",
        options: [
          { label: "Stockage direct sur sol nu", value: "storage" },
          { label: "Compostage optimisé", value: "compost" },
          { label: "Méthanisation avec retour au sol du digestat", value: "methanization" }
        ],
        socValues: { "storage": -5, "compost": 1, "methanization": 3 }
      }
    ],
    "Systèmes naturels et semi-naturels": [
      {
        text: "Gestion durable de la forêt",
        options: [
          { label: "Exploitation intensive sans régénération", value: "intensive" },
          { label: "Forêt en gestion durable", value: "sustainable" },
          { label: "Boisement de terres dégradées", value: "reforestation" }
        ],
        socValues: { "intensive": -2, "sustainable": 2, "reforestation": 3 }
      },
      {
        text: "Tourbières/zones humides en bon état hydrique",
        options: [
          { label: "Tourbière drainée, asséchée", value: "drained" },
          { label: "Tourbière partiellement restaurée", value: "restored" },
          { label: "Tourbière totalement réhumidifiée", value: "rehumidified" }
        ],
        socValues: { "drained": -10, "restored": 0, "rehumidified": 5 }
      }
    ]
  }[farmType] || [];
}

});

