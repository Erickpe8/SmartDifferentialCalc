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

        solutionOutput.textContent = '';
        hideElement(errorDisplay);
        showElement(loadingIndicator);
        solveButton.textContent = "Resolviendo Ecuacion...";
        solveButton.disabled = true; // Deshabilitar el botón mientras carga

        try {
            const response = await fetch('/solve_ode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ equation: equation }),
            });

            const data = await response.json();

            if (response.ok) {
                solutionOutput.textContent = data.solution;
            } else {
                displayError(data.error || 'Ocurrió un error al resolver la ecuación.');
            }
        } catch (error) {
            console.error('Error:', error);
            displayError('Error de conexión con el servidor.');
        } finally {
            hideElement(loadingIndicator);
            solveButton.textContent = "Calcular Ecuacion";
            solveButton.disabled = false; // Habilitar el botón de nuevo
        }
    });

    // Event listener para los botones de la calculadora
    calculatorButtonsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('calc-btn')) {
            const value = target.dataset.value;
            const start = equationInput.selectionStart;
            const end = equationInput.selectionEnd;

            if (value === 'C') {
                equationInput.value = ''; // Limpiar el textarea
            } else if (value.endsWith('(') && value !== '(') { // Handle functions like sin(, log(, d/dx(
                equationInput.value = equationInput.value.substring(0, start) + value + equationInput.value.substring(end);
                equationInput.selectionStart = equationInput.selectionEnd = start + value.length; // Place cursor inside parenthesis
            } else {
                equationInput.value = equationInput.value.substring(0, start) + value + equationInput.value.substring(end);
                equationInput.selectionStart = equationInput.selectionEnd = start + value.length;
            }
            equationInput.focus(); // Mantener el foco en el textarea
        }
    });

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