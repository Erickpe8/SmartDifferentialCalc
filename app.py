import os
from flask import Flask, request, jsonify, render_template
import requests
from dotenv import load_dotenv
from sympy import sympify, Eq, Function, dsolve, symbols, Derivative

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve_ode', methods=['POST'])
def solve_ode():
    if not DEEPSEEK_API_KEY:
        return jsonify({"error": "DEEPSEEK_API_KEY no configurada en el servidor."}), 500

    data = request.get_json()
    equation_str = data.get('equation')
    initial_conditions = data.get('initial_conditions', []) # Get initial conditions, default to empty list

    if not equation_str:
        return jsonify({"error": "No se proporcionó ninguna ecuación."}), 400

    try:
        # Preparar el prompt para DeepSeek
        prompt = f"Resuelve la siguiente ecuación diferencial ordinaria: {equation_str}."

        if initial_conditions:
            conditions_str = ", ".join(initial_conditions)
            prompt += f" Usa las siguientes condiciones iniciales: {conditions_str}."
            prompt += " Proporciona la solución particular y calcula las constantes de integración (C1, C2, o las que sean necesarias) basándote en la ecuación proporcionada y estas condiciones iniciales."
        else:
            prompt += " Proporciona la solución particular y calcula las constantes de integración (C1, C2, o las que sean necesarias) basándote únicamente en la ecuación proporcionada."
        
        prompt += " Proporciona únicamente los pasos detallados de la solución, explicando cada uno de forma clara y concisa, sin saludos ni texto introductorio o conclusivo."

        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "deepseek-chat", # O el modelo DeepSeek que prefieras
            "messages": [
                {"role": "system", "content": "Eres un asistente experto en matemáticas y ecuaciones diferenciales. Tu única tarea es resolver ecuaciones diferenciales y proporcionar los pasos detallados de la solución. Evita cualquier saludo, despedida, introducción o conclusión. Solo la solución paso a paso."},
                {"role": "user", "content": prompt}
            ],
            "stream": False
        }

        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        response.raise_for_status() # Lanza una excepción para códigos de estado HTTP erróneos

        deepseek_response = response.json()
        solution_text = deepseek_response['choices'][0]['message']['content']

        return jsonify({"solution": solution_text})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error al comunicarse con la API de DeepSeek: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)