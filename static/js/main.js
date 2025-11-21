document.addEventListener('DOMContentLoaded', () => {
    const equationInput = document.getElementById('equationInput');
    const solveButton = document.getElementById('solveButton');
    const solutionOutput = document.getElementById('solutionOutput');
    const loadingIndicator = document.getElementById('loading');
    const errorDisplay = document.getElementById('error');
    const calculatorButtonsContainer = document.getElementById('calculatorButtons');
    const initialConditionsContainer = document.getElementById('initialConditionsContainer');
    const addConditionButton = document.getElementById('addCondition');
    const removeConditionButton = document.getElementById('removeCondition');

    let conditionCount = 1; // Start with 1 condition input field

    // Function to update button states based on conditionCount
    const updateConditionButtons = () => {
        addConditionButton.disabled = conditionCount >= 3;
        removeConditionButton.disabled = conditionCount <= 1;
    };

    // Add Condition Button Event Listener
    addConditionButton.addEventListener('click', () => {
        console.log('Add Condition button clicked');
        if (conditionCount < 3) {
            conditionCount++;
            const conditionItem = document.createElement('div');
            conditionItem.classList.add('initial-condition-item');
            conditionItem.innerHTML = `
                <label>Condición Inicial ${conditionCount}:</label>
                <input type="text" class="initial-condition-input" placeholder="Ej: y(0)=1">
            `;
            initialConditionsContainer.appendChild(conditionItem);
            updateConditionButtons();
        }
    });

    // Remove Condition Button Event Listener
    removeConditionButton.addEventListener('click', () => {
        if (conditionCount > 1) {
            initialConditionsContainer.lastElementChild.remove();
            conditionCount--;
            updateConditionButtons();
        }
    });

    // Initial button state setup
    updateConditionButtons();

    solveButton.addEventListener('click', async () => {
        const equation = equationInput.value.trim();
        
        if (!equation) {
            displayError("Por favor, ingresa una ecuación.");
            addShakeAnimation(equationInput);
            return;
        }

        solutionOutput.innerHTML = '';
        hideElement(errorDisplay);
        showElement(loadingIndicator);
        solveButton.textContent = "Resolviendo ecuación...";
        solveButton.disabled = true;

        const initialConditions = Array.from(initialConditionsContainer.querySelectorAll('.initial-condition-input'))
                                     .map(input => input.value.trim())
                                     .filter(value => value !== '');

        try {
            const response = await fetch('/solve_ode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equation: equation,
                    initial_conditions: initialConditions
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const formatted = formatSolution(data.solution);
                solutionOutput.innerHTML = formatted;

                if (window.MathJax) {
                    MathJax.typesetPromise();
                }

            } else {
                displayError(data.error || 'Ocurrió un error al resolver la ecuación.');
            }
        } catch (error) {
            displayError('Error de conexión con el servidor.');
        } finally {
            hideElement(loadingIndicator);
            solveButton.textContent = "Calcular Ecuación";
            solveButton.disabled = false;
        }
    });

    calculatorButtonsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.calc-btn');
        
        if (target && !target.classList.contains('empty')) {
            const value = target.dataset.value;
            const start = equationInput.selectionStart;
            const end = equationInput.selectionEnd;

            addButtonPressAnimation(target);

            if (value === 'C') {
                equationInput.value = '';
            } else if (value.endsWith('(') && value !== '(') {
                equationInput.value =
                    equationInput.value.substring(0, start) +
                    value +
                    equationInput.value.substring(end);
                equationInput.selectionStart = equationInput.selectionEnd = start + value.length;
            } else {
                equationInput.value =
                    equationInput.value.substring(0, start) +
                    value +
                    equationInput.value.substring(end);
                equationInput.selectionStart = equationInput.selectionEnd = start + value.length;
            }

            equationInput.focus();
        }
    });

    equationInput.addEventListener('input', () => {
        hideElement(errorDisplay);
    });

    equationInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            solveButton.click();
            return; // Exit after handling Enter
        }

        const allowedKeys = [
            'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Tab', 'Home', 'End'
        ];

        if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
            return; // Allow control keys and shortcuts
        }

        const allowedCharsRegex = /^[a-zA-Z0-9+\-*/().\s^=]$/;
        if (!allowedCharsRegex.test(event.key)) {
            event.preventDefault();
        }
    });


    function formatSolution(text) {
        if (!text) return "";

        let cleaned = text; // Start with original text, do not remove all backslashes

        // Convert double asterisks to h3 for steps
        cleaned = cleaned.replace(/\*\*(Paso.*?)\*\*/g, "<h3>$1</h3>");
        
        // Convert remaining double asterisks (if any) to bold, might not be needed if deepseek doesn't use them otherwise
        cleaned = cleaned.replace(/\*\*/g, ""); 
        
        // Convert newlines to <br> for display
        cleaned = cleaned.replace(/\n/g, "<br>");

        // Handle MathJax block equations (\[ ... \])
        // Need to ensure the backslashes are preserved for MathJax to render correctly.
        // We want to wrap the content that MathJax will process.
        cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, "<div class='math-block'>\\[$1\\]</div>");

        // Handle inline MathJax (\( ... \)) if it's explicitly in the response
        // DeepSeek might return \\( or \( depending on its formatting.
        cleaned = cleaned.replace(/\\\((.*?)\\\)/g, "\\($1\\)");
        cleaned = cleaned.replace(/\\\( (.*?) \\\)/g, "\\($1\\)"); // Handle spaces around parentheses if any

        return cleaned;
    }

    function showElement(element) {
        element.classList.remove('hidden');
    }

    function hideElement(element) {
        element.classList.add('hidden');
    }


    function displayError(message) {
        errorDisplay.textContent = message;
        showElement(errorDisplay);
        addShakeAnimation(errorDisplay);
    }


    function addShakeAnimation(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 400);
    }


    function addButtonPressAnimation(button) {
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
 
    solutionOutput.innerHTML = `
        <div style="text-align: center; color: #667eea; padding: 20px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 12px;">
                <path d="M9 18l6-6-6-6"/>
            </svg>
            <p style="font-size: 16px; margin-top: 8px;">
                Ingresa una ecuación diferencial y presiona <strong>Calcular</strong>
            </p>
        </div>
    `;
});
