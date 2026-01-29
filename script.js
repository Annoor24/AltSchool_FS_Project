// Main calculator logic
const displayElement = document.getElementById('display');
const expressionElement = document.getElementById('expression');
const buttons = document.querySelectorAll('.btn');

// Getting the history elements from our HTML
const historyModal = document.getElementById('modal-overlay');
const historyList = document.getElementById('history-list');
const openHistoryBtn = document.getElementById('open-history');
const closeHistoryBtn = document.getElementById('close-history');
const clearHistoryBtn = document.getElementById('clear-history');

let currentInput = '0';
let expression = ''; // This will hold the full math string
let history = [];
let shouldResetScreen = false;

// Simple function to update what is shown on the screen
function updateDisplay() {
    displayElement.innerText = currentInput;
    expressionElement.innerText = expression;
}

// Handling when a number or dot is clicked
function handleInput(val) {
    if (val === '.' && currentInput.includes('.')) return;
    
    if (currentInput === '0' || shouldResetScreen) {
        currentInput = (val === '.') ? '0.' : val;
        shouldResetScreen = false;
    } else {
        currentInput += val;
    }
    updateDisplay();
}

// Handling when an operator like +, -, * is clicked
function handleOperator(op) {
    // If we just got a result, use it as the start of the next math problem
    if (shouldResetScreen && expression === '') {
        expression = currentInput;
    } else if (!shouldResetScreen) {
        expression += currentInput;
    }
    
    // This part fixes it if I accidentally click two operators in a row
    if (/[\+\-\*\/\%\^]\s*$/.test(expression)) {
        expression = expression.replace(/[\+\-\*\/\%\^]\s*$/, `${op} `);
    } else {
        expression += ` ${op} `;
    }
    
    shouldResetScreen = true;
    updateDisplay();
}

// This function does the actual math when we hit "="
function calculate() {
    if (expression === '' && !shouldResetScreen) return;
    
    const finalExpression = expression + currentInput;
    let result;

    try {
        // Changing the ^ symbol to what JavaScript actually understands for powers
        const evalStr = finalExpression.replace(/\^/g, '**');
        result = evaluateSafe(evalStr);
        
        // Making sure the decimal points don't go on forever
        if (typeof result === 'number') {
            result = Math.round(result * 100000000) / 100000000;
        }
    } catch (e) {
        result = 'Error';
    }

    const resultStr = result.toString();
    addToHistory(finalExpression, resultStr);

    currentInput = resultStr;
    expression = '';
    shouldResetScreen = true;
    updateDisplay();
}

// A helper to safely run our math string
function evaluateSafe(fn) {
    return new Function('return ' + fn)();
}

// Saving our calculations so we can see them later
function addToHistory(expr, res) {
    history.unshift({ expression: expr, result: res });
    if (history.length > 20) history.pop(); // Only keep the last 20
    renderHistory();
}

// Putting the history items into the popup list
function renderHistory() {
    if (!historyList) return;
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: grey; text-align: center;">No history yet</p>';
        return;
    }
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <span class="item-expr">${item.expression}</span>
            <span class="item-res">= ${item.result}</span>
        </div>
    `).join('');
}

// Resetting everything
function clear() {
    currentInput = '0';
    expression = '';
    shouldResetScreen = false;
    updateDisplay();
}

// Deleting the last digit
function backspace() {
    if (shouldResetScreen) return;
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Opening and closing the history popup
openHistoryBtn.addEventListener('click', () => {
    historyModal.style.display = 'flex';
});

closeHistoryBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// Close popup if we click outside of it
window.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.style.display = 'none';
});

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
});

// Listening for clicks on all our calculator buttons
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (btn.id === 'clear') {
            clear();
        } else if (btn.id === 'backspace') {
            backspace();
        } else if (btn.id === 'equals') {
            calculate();
        } else if (btn.classList.contains('btn-num')) {
            handleInput(val);
        } else if (btn.classList.contains('btn-op')) {
            handleOperator(val);
        }
    });
});

// Adding keyboard support so we can type numbers
window.addEventListener('keydown', (e) => {
    if (['+', '-', '*', '/', '%', '^', 'Enter', 'Backspace', 'Escape'].includes(e.key)) e.preventDefault();
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') handleInput(e.key);
    else if (['+', '-', '*', '/', '%', '^'].includes(e.key)) handleOperator(e.key);
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') clear();
});
