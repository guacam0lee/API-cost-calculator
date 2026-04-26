const PRICING_URL = './data/pricing.json';

let modelsData = [];

async function fetchPricing() {
  try {
    const response = await fetch(PRICING_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    modelsData = data.models;
    console.log("Models load succesfull:", modelsData);

    populateModelSelect();

  } catch (error) {
    console.error("Error: priciong dowload:", error);
    document.getElementById('model-select').innerHTML = '<option value="">Error loading models. Please refresh.</option>';
  }
}


function populateModelSelect() {
  const selectElement = document.getElementById('model-select');

  selectElement.innerHTML = '';

  modelsData.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;
    selectElement.appendChild(option);
  });
}

fetchPricing();
