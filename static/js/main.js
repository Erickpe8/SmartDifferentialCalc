document.addEventListener('DOMContentLoaded', () => {
    const equationInput = document.getElementById('equationInput');
    const solveButton = document.getElementById('solveButton');
    const solutionOutput = document.getElementById('solutionOutput');
    const loadingIndicator = document.getElementById('loading');
    const errorDisplay = document.getElementById('error');
    const calculatorButtonsContainer = document.getElementById('calculatorButtons');

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

        try {
            const response = await fetch('/solve_ode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equation: equation }),
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
        }
    });


    function formatSolution(text) {
        if (!text) return "";

        let cleaned = text;

        cleaned = cleaned
            .replace(/\\\\/g, "")
            .replace(/\\\(/g, "\\(")
            .replace(/\\\)/g, "\\)")
            .replace(/\\n/g, "\n")
            .replace(/\*\*(Paso.*?)\*\*/g, "<h3>$1</h3>")
            .replace(/\*\*/g, "")
            .replace(/\n/g, "<br>");

        cleaned = cleaned
            .replace(/\\\[([\s\S]*?)\\\]/g, "<div class='math-block'>\\[$1\\]</div>");

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