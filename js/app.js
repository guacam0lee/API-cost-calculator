const PRICING_URL = './data/pricing.json';
const toggleVizBtn = document.getElementById('toggle-viz-btn');
const outputTokensInput = document.getElementById('output-tokens-input');
const inputCostDisplay = document.getElementById('input-cost');
const outputCostDisplay = document.getElementById('output-cost');
const outputTokenDisplay = document.getElementById('output-token-display');
const apiCallsInput = document.getElementById('api-calls-input');
const tableBody = document.getElementById('comparison-table-body');
let isVizExpanded = false;

const modelSelect = document.getElementById('model-select');
const totalCostDisplay = document.getElementById('total-cost');

modelSelect.addEventListener('change', handlePromptInput);

modelSelect.addEventListener('change', () => {
  handlePromptInput();

  localStorage.setItem('preferred_ai_model', modelSelect.value);
});

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

  const savedModel = localStorage.getItem('preferred_ai_model');
  if (savedModel) {
    selectElement.value = savedModel;
  }

  if (promptInput.value !== "") {
    handlePromptInput();
  }
}

fetchPricing();



const promptInput = document.getElementById('prompt-input');
const tokenCountDisplay = document.getElementById('token-count');


promptInput.addEventListener('input', handlePromptInput);


function handlePromptInput() {
  const text = promptInput.value;
  const vizContainer = document.getElementById('token-visualization');
  const vizCount = document.getElementById('viz-count');

  if (text === "") {
    tokenCountDisplay.textContent = "0";
    vizContainer.innerHTML = '<span class="text-gray-600 italic">Type to see how your text is tokenized...</span>';
    vizCount.textContent = "(0 tokens)";
    toggleVizBtn.classList.add('hidden');
    return;
  }

  try {
    const tokens = GPTTokenizer_cl100k_base.encode(text);

    tokenCountDisplay.textContent = tokens.length;

    calculateAndDisplayCost(tokens.length);
    updateComparisonTable(tokens.length);
    renderTokenVisualization(tokens);

  } catch (error) {
    console.error("Błąd podczas tokenizacji tekstu:", error);
  }
}
  try {

    const tokens = GPTTokenizer_cl100k_base.encode(text);

    tokenCountDisplay.textContent = tokens.length;

    calculateAndDisplayCost(tokens.length);

    updateComparisonTable(inputTokenCount);

    renderTokenVisualization(tokens);

  } catch (error) {
    console.error("Błąd podczas tokenizacji tekstu:", error);
  }


function renderTokenVisualization(tokens) {
  const vizContainer = document.getElementById('token-visualization');
  const vizCount = document.getElementById('viz-count');

  vizCount.textContent = `(${tokens.length} tokens)`;
  vizContainer.innerHTML = '';

  const colors = ['bg-blue-900', 'bg-green-900', 'bg-yellow-900', 'bg-purple-900', 'bg-pink-900'];
  const fragment = document.createDocumentFragment();

  tokens.forEach((tokenId, index) => {
    const span = document.createElement('span');
    let tokenText = GPTTokenizer_cl100k_base.decode([tokenId]);

    if (tokenText === '\n') {
      tokenText = '↵';
    }

    span.textContent = tokenText;
    span.className = `${colors[index % colors.length]} text-white px-1 py-0.5 rounded text-xs`;

    fragment.appendChild(span);
    // NAPRAWA: Usunięto z tego miejsca appendChild oraz toggleVizBtn
  });

  // NAPRAWA: Aktualizacja fizycznego DOM tylko raz, po zakończeniu pętli!
  vizContainer.appendChild(fragment);
  toggleVizBtn.classList.remove('hidden');
}

toggleVizBtn.addEventListener('click', () => {
  const vizContainer = document.getElementById('token-visualization');
  isVizExpanded = !isVizExpanded;

  if (isVizExpanded) {

    vizContainer.classList.remove('max-h-[100px]', 'overflow-hidden');
    toggleVizBtn.textContent = 'Hide breakdown ▲';
  } else {

    vizContainer.classList.add('max-h-[100px]', 'overflow-hidden');
    toggleVizBtn.textContent = 'Show full breakdown ▼';
  }
});


function calculateAndDisplayCost(inputTokenCount) {
  const selectedModelId = modelSelect.value;
  const expectedOutputTokens = parseInt(outputTokensInput.value) || 0;

  if (!selectedModelId) {
    inputCostDisplay.textContent = "$0.0000";
    outputCostDisplay.textContent = "$0.0000";
    totalCostDisplay.textContent = "$0.0000";
    return;
  }

  const selectedModel = modelsData.find(model => model.id === selectedModelId);

  if (selectedModel) {
    const inputCost = (inputTokenCount / 1000000) * selectedModel.input_price_per_1m;
    const outputCost = (expectedOutputTokens / 1000000) * selectedModel.output_price_per_1m;
    const totalCost = inputCost + outputCost;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });

    inputCostDisplay.textContent = formatter.format(inputCost);
    outputCostDisplay.textContent = formatter.format(outputCost);
    totalCostDisplay.textContent = formatter.format(totalCost);
  }
}

  const selectedModel = modelsData.find(model => model.id === selectedModelId);

  if (selectedModel) {

    const cost = (tokenCount / 1000000) * selectedModel.input_price_per_1m;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });

    totalCostDisplay.textContent = formatter.format(cost);
  }


const fileUpload = document.getElementById('file-upload');

fileUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const MAX_FILE_SIZE_MB = 5;
  const maxSizeInBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    alert(`Error: The file is too large! Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
    event.target.value = '';
    return;
  }

  const validExtensions = ['.txt', '.md', '.csv'];
  const fileName = file.name.toLowerCase();
  const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  if (!isValidExtension) {
    alert("Error: Unsupported file format. Please upload flat text files only (.txt, .md, .csv).");
    event.target.value = '';
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    promptInput.value = e.target.result;
    handlePromptInput();
  };

  reader.onerror = () => {
    alert("System error: Could not read the file from your disk.");
  };

  reader.readAsText(file);
  event.target.value = '';
});

outputTokensInput.addEventListener('input', () => {
  const outValue = outputTokensInput.value || 0;
  outputTokenDisplay.textContent = outValue;


  const currentInputTokens = parseInt(tokenCountDisplay.textContent) || 0;
  calculateAndDisplayCost(currentInputTokens);
});


function updateComparisonTable(inputTokenCount) {
  const expectedOutput = parseInt(outputTokensInput.value) || 0;
  const apiCalls = parseInt(apiCallsInput.value) || 1;

  tableBody.innerHTML = '';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });

  modelsData.forEach(model => {
    const singleCallInputCost = (inputTokenCount / 1000000) * model.input_price_per_1m;
    const singleCallOutputCost = (expectedOutput / 1000000) * model.output_price_per_1m;

    const pricePerCall = singleCallInputCost + singleCallOutputCost;
    const totalPrice = pricePerCall * apiCalls;

    const row = document.createElement('tr');
    row.className = "hover:bg-gray-700/50 transition-colors";

    row.innerHTML = `
            <td class="px-4 py-3 font-medium text-white">${model.provider}</td>
            <td class="px-4 py-3">${model.name}</td>
            <td class="px-4 py-3 text-gray-400 font-mono">$${model.input_price_per_1m.toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-400 font-mono">$${model.output_price_per_1m.toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-mono text-blue-300">${formatter.format(pricePerCall)}</td>
            <td class="px-4 py-3 text-right font-mono text-green-400 font-bold">${formatter.format(totalPrice)}</td>
        `;

    tableBody.appendChild(row);
  });
}
