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
        const target = event.target;
        if (target.classList.contains('calc-btn')) {
            const value = target.dataset.value;
            const start = equationInput.selectionStart;
            const end = equationInput.selectionEnd;

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
    }
});
