# SmartDifferentialCalc
### **Calculadora Inteligente de Ecuaciones Diferenciales Ordinarias (EDO)**  
Documentación técnica completa — Español

---

## 📘 ¿Qué es SmartDifferentialCalc?

SmartDifferentialCalc es una **aplicación web** especializada en resolver **ecuaciones diferenciales ordinarias (EDO)** utilizando **IA avanzada** (DeepSeek AI) para generar **explicaciones detalladas paso a paso**, completamente en **español**.

A diferencia de las calculadoras simbólicas tradicionales que dependen únicamente de algoritmos matemáticos, SmartDifferentialCalc combina:

- **Flask** como backend,
- **DeepSeek AI** como motor de resolución,
- **HTML/CSS/JavaScript** como interfaz interactiva,
- **SymPy (opcional)** para validaciones simbólicas.

El sistema actúa como un **proxy seguro**, donde el backend administra la clave API, valida entradas, construye prompts pedagógicos y entrega soluciones claras al usuario final.

---

# 📂 Archivos fuente relevantes

| Archivo | Propósito |
|--------|-----------|
| **app.py** | Backend Flask, endpoint `/solve_ode`, integración con DeepSeek |
| **templates/index.html** | Interfaz HTML de la calculadora |
| **static/js/main.js** | Lógica del cliente, validaciones, fetch API |
| **static/css/style.css** | Estilos y diseño responsivo |
| **.env** | Variables de entorno (clave API, configuración) |
| **.devin/wiki.json** | Metadata de documentación |

---

# 🎯 Propósito y alcance

Este documento cubre:

1. **API interna de Flask** — rutas HTTP, validación, respuestas.  
2. **Integración externa con DeepSeek API** — construcción de prompts, autenticación, manejo de errores.  
3. **Documentación HTML**, incluyendo:
   - estructura DOM,
   - jerarquía de contenedores,
   - cuadrícula de botones,
   - elementos interactivos.

---

# 🧩 Capacidades básicas

| Capacidad | Descripción | Implementación |
|----------|-------------|----------------|
| Entrada de ecuación | Caja de texto + cuadrícula de botones | `index.html` + `main.js` |
| Resolución IA | DeepSeek genera pasos en español | `app.py` ruta `/solve_ode` |
| Calculadora interactiva | Teclado matemático completo | `main.js` eventos |
| Validación | Cliente + servidor | `main.js` y `app.py` |
| Explicaciones detalladas | Respuestas educativas en español | Prompting en `app.py` |
| Gestión segura de API | Clave en `.env` | `load_dotenv()` |

---

# 🎯 Usuarios objetivo

- **Estudiantes** de ingeniería/matemáticas que requieren explicaciones pedagógicas.  
- **Docentes** que necesitan demostrar métodos de resolución asistida.  
- **Desarrolladores** interesados en expandir o integrar el sistema.

El sistema asume solo conocimientos básicos: notación como `dy/dx`, `d/dx`, `exp(x)`.

---

# 🏗️ Descripción de la pila tecnológica

```
Frontend ─ HTML5, CSS3, JavaScript
Backend  ─ Python + Flask
IA       ─ DeepSeek API
Extras   ─ python-dotenv, requests, SymPy
```

**Diagrama conceptual (texto):**

```
[Usuario]
    ↓
[Navegador → index.html + main.js]
    ↓ fetch()
[Flask backend → /solve_ode]
    ↓
[DeepSeek API]
    ↓
[Flask procesa respuesta]
    ↓
[Navegador muestra solución]
```

---

# 🧱 Arquitectura de alto nivel

SmartDifferentialCalc sigue una arquitectura **de tres niveles**:

| Nivel | Componentes | Descripción |
|------|-------------|-------------|
| **Presentación** | HTML, CSS, JS | Interfaz de usuario y validaciones básicas |
| **Aplicación** | Flask | Lógica de negocio, seguridad, orquestación |
| **Integración** | requests + DeepSeek | Comunicación externa con motor IA |

---

# 📝 Componentes del sistema

## Tabla general

| Componente | Archivo | Responsabilidades | Entidades clave |
|-----------|---------|------------------|------------------|
| Backend Flask | `app.py` | Routing, validación, proxy API | `@app.route()`, `solve_ode()` |
| Interfaz web | `index.html` | Estructura UI | `equationInput`, `solveButton` |
| Lógica cliente | `main.js` | Eventos, fetch API | `fetch()`, listeners |
| Estilos | `style.css` | Layout, cuadrícula, responsividad | `grid`, clases |
| Entorno | `.env` | Claves seguras | `DEEPSEEK_API_KEY` |

---

# 🔄 Descripción del flujo completo de solicitud

```
1. Usuario ingresa una ecuación
2. JS valida y ejecuta fetch('/solve_ode')
3. Flask recibe, valida y arma el prompt
4. Flask envía la solicitud a DeepSeek API
5. DeepSeek retorna la explicación paso a paso
6. Flask procesa la respuesta
7. JS muestra la solución en <pre>
```

---

# 🧠 Decisiones clave de diseño

### ✔ IA vs motor simbólico tradicional
- SymPy **resuelve**, pero **no explica**.  
- DeepSeek **resuelve + explica + enseña**.  

### ✔ Flask por simplicidad
- Una sola ruta HTML  
- Un endpoint API `/solve_ode`  
- Menos overhead, mayor claridad

### ✔ Seguridad rigurosa
- API KEY en `.env` (nunca expuesta al cliente)
- Flask como único intermediario

---

# 🔐 Modelo de seguridad

| Riesgo | Mitigación | Archivo |
|-------|------------|---------|
| Exposición de clave | `.env` + `load_dotenv()` | `app.py` |
| Inputs maliciosos | Validación doble | `main.js`, `app.py` |
| Filtración de error | Errores genéricos | `app.py` |
| Ataque MITM | DeepSeek usa HTTPS | `app.py` |

---

# ⚠️ Limitaciones actuales

- Solo resuelve **una ecuación por solicitud**  
- No hay graficación  
- No soporta `d²y/dx²` todavía  
- No existe almacenamiento de historial  
- Dependencia total de la API de DeepSeek  
- El frontend no usa streaming (bloqueo sincronizado)

---

# 🚀 Primeros pasos

1. `git clone https://github.com/Erickpe8/SmartDifferentialCalc.git`
2. Crear entorno virtual:  
   `python -m venv venv`
3. Instalar dependencias:  
   `pip install -r requirements.txt`
4. Crear `.env`:

```
DEEPSEEK_API_KEY=TU_CLAVE
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

5. Ejecutar:  
   `python app.py`
6. Navegar a:  
   **http://localhost:5000**

---

# 🧬 Jerarquía DOM (resumen)

```
container-app
 ├── app-calculator
 │    ├── calculator-container-input-user
 │    │     ├── equationInput (textarea)
 │    │     ├── calculatorButtons (36 botones)
 │    │     ├── solveButton
 │    │     ├── loading
 │    │     └── error
 │    └── solution-calculator-container-output
 │          └── solutionOutput (pre)
```

---

# 🎛️ Cuadrícula de botones (mapa resumido)

- Funciones: `sin(`, `cos(`, `tan(`, `log(`, `exp(`, `sqrt(`
- Derivadas: `d/dx(`, `d/dy(`
- Variables: `x`, `y`, `t`
- Operadores: `+ - * / ^`
- Constantes: `e`, `pi`
- Aritmética: `0–9`, `.`
- Especiales: `(`, `)`, `=`, `C` (clear)
- Placeholders: 2 casillas vacías

---

# 🖼️ Área de salida (soluciones)

```
<div id="result">
   <h2>Solución:</h2>
   <pre id="solutionOutput"></pre>
</div>
```

El uso de `<pre>` preserva el formato original de DeepSeek.

---

# 🧩 Integración con DeepSeek API (detallado)

### Construcción del prompt
En `app.py` línea 32:

- El prompt instruye al modelo a:
  - resolver,
  - explicar,
  - NO agregar contenido irrelevante,
  - usar español claro.

### Proceso de llamada (resumen)

```
requests.post(
    DEEPSEEK_API_URL,
    headers={
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "model": "deepseek-chat",
        "messages": [...]
    }
)
```

---

# 👥 Contribuidores

| Usuario | Nombre |
|--------|--------|
| **@Akarviii** | Daniel Arevalo |
| **@Erickpe8** | Erick Perez |
|  | Wilson Carreño |
| | Cristian Davila |

---

# 📄 Licencia

MIT License — Libre para usar, modificar y distribuir.


---

# 🙌 Gracias por usar SmartDifferentialCalc

El objetivo es democratizar el aprendizaje de ecuaciones diferenciales combinando **matemáticas, IA y buena ingeniería de software**.
