# 🤖 Patrones de Diseño Agéntico — Bitácora y Guía de Arquitectura

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![DevTalles](https://img.shields.io/badge/DevTalles-Course-blueviolet?style=for-the-badge)

<p align="center">
  <b>Exploración práctica, métricas de observabilidad y criterios de ingeniería</b><br>
  para construir sistemas de Inteligencia Artificial agénticos en TypeScript.<br>
  Basado en el curso oficial de <a href="https://cursos.devtalles.com/courses/patrones-diseno-agentico"><b>DevTalles: Patrones de Diseño Agéntico</b></a>.
</p>

</div>

---

## 🧭 ¿Qué hace diferente este enfoque?

> **"Un patrón agéntico cuesta más llamadas y más tokens. Lo que compra es que las restricciones, la exactitud y la calidad sobrevivan hasta el final. Si no hay restricciones que perder o exactitud que garantizar, no compra nada."**

La mayoría de los tutoriales enseñan a conectar librerías como "cajas negras". En este repositorio los patrones se implementan **artesanalmente desde cero** con TypeScript y [Vercel AI SDK](https://sdk.vercel.ai/), permitiendo:
1. **Ver la trampa de cada patrón:** Entender por qué un modelo sin herramientas alucina, por qué en one-shot olvida restricciones y por qué la auto-evaluación ingenua tiende al auto-engaño.
2. **Medir el coste real:** Cada ejecución incorpora trazadores (`createTracer`) que miden el uso de tokens (prompt, completion, reasoning), la cantidad de pasos y el tiempo invertido.
3. **Contrastar con la realidad:** Comparar la salida sin patrón vs. con patrón y validar contra jueces programáticos deterministas.

---

## 🛠️ Stack Tecnológico y Arquitectura

- **Lenguaje:** [TypeScript 5+](https://www.typescriptlang.org/) bajo módulos nativos (ESM).
- **Orquestación y Modelos:** [Vercel AI SDK (`ai`)](https://sdk.vercel.ai/) utilizando `generateText`, `Output.object`, `tool` y `stepCountIs`.
- **Esquemas y Contratos:** [Zod](https://zod.dev/) para validar inputs/outputs y forzar *Structured Outputs*.
- **Trazabilidad:** Sistema interno de tracer en [`src/helpers/`](./src/helpers/) para observabilidad de llamadas, costes y finalización.
- **Capa Multi-proveedor:** Centralizada en [`src/helpers/selected-model.ts`](./src/helpers/selected-model.ts), permitiendo intercambiar instantáneamente entre:
  - ⚡ **Groq** (`@ai-sdk/groq`) — Ultra baja latencia.
  - 🧠 **Anthropic Claude** (`@ai-sdk/anthropic`) — Razonamiento refinado.
  - 🌐 **OpenAI** (`@ai-sdk/openai`) — Modelos GPT-4o / GPT-5.
  - 🔍 **Google Gemini** (`@ai-sdk/google`) — Ventanas de contexto masivas.
  - 🔀 **OpenRouter** (`@openrouter/ai-sdk-provider`) — Flexibilidad de catálogo global.
  - 💻 **Ollama** (`ollama-ai-provider-v2`) — Modelos 100% locales y privados.

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar variables de entorno y configurar tus API keys
cp .env.template .env

# 2. Instalar dependencias
npm install

# 3. Elegir el modelo en src/helpers/selected-model.ts
# 4. Activar el patrón deseado en src/main.ts
npm run dev
```

---

## 📚 Mapa de Patrones y Bitácora de Avance

> **Leyenda:** `[x]` Completada · `[~]` En curso / Actual · `[ ]` Pendiente

```
Progreso General: [████████████░░░░░░░░] 9 / 15 Módulos Principales
```

---

### 🔹 Módulo 1 & 2: Fundamentos del Diseño Agéntico
> **Objetivo:** Comprender la diferencia entre un simple consumo de API (LLM) y un sistema agéntico capaz de percibir, razonar, planificar y actuar en bucle.

- **Conceptos clave:** Ciclo de percepción-acción, degradación de contexto, cuándo utilizar agentes y cuándo basta un prompt estructurado.
- **Estado:**
  - [x] Sección 1: Introducción y metodología
  - [x] Sección 2: Fundamentos de los patrones agénticos

---

### 🔹 Módulo 3: Entorno y Abstracción de Modelos
> **Objetivo:** Preparar la arquitectura base desacoplada del proveedor de IA, permitiendo evaluar el mismo patrón en distintos motores según coste y capacidades.

- **Archivos clave:** [`src/helpers/selected-model.ts`](./src/helpers/selected-model.ts), [`src/helpers/index.ts`](./src/helpers/index.ts)
- **Estado:**
  - [x] Configuración de proyecto TypeScript + ESM
  - [x] Arquitectura de carpetas y helpers de trazabilidad
  - [x] Integración de Groq, Anthropic, OpenAI, Google Gemini y Ollama

---

### 🔹 Módulo 4: Patrón 01 — Tool Use (Uso de Herramientas)
> **Problema que resuelve:** Los LLMs tienen conocimiento congelado en el tiempo y sufren de alucinaciones en aritmética y catálogos privados.  
> **Mecanismo:** El modelo recibe herramientas fuertemente tipadas mediante schemas Zod (`findCoursesTool`, `calculateTotalsTool`). Un **Circuit Breaker** (`stepCountIs(6)`) previene bucles infinitos de llamadas.

- **Código implementado:** [`src/patterns/01-tool-use/tool-use.ts`](./src/patterns/01-tool-use/tool-use.ts)
- **Hallazgo clave:** Sin herramientas, el modelo inventa cursos y calcula precios de memoria con total confianza; con herramientas, consulta fuentes reales y delega el cómputo exacto.
- **Estado:**
  - [x] Sección 4: Patrón Uso de Herramientas (15 - 20)

---

### 🔹 Módulo 5: Patrón 02 — Planning (Planificación)
> **Problema que resuelve:** En tareas complejas con múltiples restricciones y dependencias cruzadas (ej. asignar recursos limitados a prioridades de rescate), un *one-shot prompt* olvida reglas críticas hacia el final de la respuesta.  
> **Mecanismo:** Dividir en 3 fases:
> 1. **Construcción del plan:** Generar una secuencia estructurada de pasos (`planSchema`).
> 2. **Ejecución paso a paso:** Resolver cada paso de forma aislada alimentando los hallazgos previos (`findings`).
> 3. **Síntesis final:** Unificar los resultados consolidados en la orden definitiva.

- **Código implementado:** [`src/patterns/02-planning/planning.ts`](./src/patterns/02-planning/planning.ts)
- **Tradeoff observado:** Cuesta más tokens y latencia, pero evita fallos de lógica y garantiza el cumplimiento estricto de prioridades.
- **Estado:**
  - [x] Sección 5: Patrón Planeación (22 - 29)

---

### 🔹 Módulo 6: Patrón 03 — Reflection (Reflexión y Rúbrica)
> **Problema que resuelve:** La trampa de la complacencia: si a un modelo se le pregunta "¿tu texto está bien?", casi siempre se autocalifica positivamente.  
> **Mecanismo:**
> - **A) Sin reflexión:** Una sola pasada (suele omitir requisitos sutiles).
> - **B) Reflexión ingenua:** Sin criterios; el modelo confirma su propio sesgo.
> - **C) Reflexión con rúbrica:** Crítica estricta contra una lista exhaustiva con evidencia literal (`criticSchema`), iterando hasta cumplir el 100% de los puntos o alcanzar un tope de iteraciones.
> - **Juez programático:** Auditoría determinista en código (sin LLM) como fuente imparcial de verdad.

- **Código implementado:** [`src/patterns/03-reflection/reflection.ts`](./src/patterns/03-reflection/reflection.ts)
- **Estado:**
  - [x] Sección 6: Patrón Reflexión (31 - 38)

---

### 🔹 Módulo 7: Patrón 04 — ReAct (Reasoning + Acting)
> **Problema que resuelve:** Imposibilidad de planificar secuencias de antemano cuando cada paso depende del resultado dinámico del paso previo, o cuando los datos iniciales son ambiguos y requieren inspección en caliente.  
> **Mecanismo:** Ciclos iterativos continuos de **Pensamiento (Thought) → Acción (Tool Call) → Observación (Observation)**. El modelo razona, ejecuta una herramienta, evalúa la respuesta obtenida y decide la siguiente acción hasta cumplir la meta o alcanzar el límite de pasos (`stepCountIs`).

- **Código implementado:** [`src/patterns/04-reAct/reAct-loop.ts`](./src/patterns/04-reAct/reAct-loop.ts), [`src/patterns/04-reAct/reAct-tarea.ts`](./src/patterns/04-reAct/reAct-tarea.ts)
- **Casos prácticos abordados:**
  1. **Bucle de escalación en organigrama (`reAct-loop.ts`):** Aprobación de presupuestos subiendo por la jerarquía empresarial; la cadena es de longitud desconocida porque el supervisor inmediato solo se descubre dentro de la ficha del empleado consultado.
  2. **Resolución de ambigüedad con API real (`reAct-tarea.ts`):** Consulta del clima en Ottawa (Canadá) usando la API abierta de Open-Meteo. La geocodificación inicial devuelve un resultado válido pero equivocado (otra de las 8 Ottawas del mundo); el agente observa la discrepancia y reformula su llamada con coordenadas precisas.
- **Estado:**
  - [x] Sección 7: Patrón de diseño ReAct (40 - 46)

---

### 🔹 Módulo 8: Patrón 05 — Prompt Chaining (Encadenamiento de Prompts)
> **Problema que resuelve:** Los LLMs operan sobre tokens, no caracteres. Por diseño, no saben contar letras ni respetar límites estrictos de longitud (p. ej., un tweet de máximo 280 caracteres), sin importar cuán enfático sea el prompt.  
> **Mecanismo:** Descomponer el flujo en eslabones independientes protegidos por **Compuertas de Validación (Approval Gates)** programáticas:
> 1. **Eslabón 1 (Generador):** Redacta el borrador inicial a partir del brief.
> 2. **Gate determinista:** Valida en código (`text.length`) límites mínimos y máximos.
> 3. **Eslabón 2 (Ajustador/Recortador):** Si no pasa la compuerta, se retroalimenta al modelo indicándole exactamente cuántos caracteres sobran o faltan.
> 4. **Fallback determinista:** Si se agota el tope de reintentos (`MAX_RETRIES`), el código recorta limpiamente por palabra para garantizar el cumplimiento incondicional.

- **Código implementado:** [`src/patterns/05-prompt-chaining/prompt-chaining.ts`](./src/patterns/05-prompt-chaining/prompt-chaining.ts)
- **Hallazgo clave:** Asimetría cognitiva: lo que un LLM no puede evaluar con certeza (contar caracteres exactos), una línea de código (`text.length`) lo audita al 100%. La compuerta programática no sólo mejora el resultado: garantiza el contrato.
- **Estado:**
  - [x] Sección 8: Patrón Prompt Chaining (48 - 55)

---

### 🔹 Módulo 9: Patrón 06 — Plan and Execute (Planificar y Ejecutar)
> **Problema que resuelve:** En tareas deterministas y predecibles, el patrón ReAct desperdicia excesivas llamadas al LLM al consultar al modelo tras cada tool call individual.  
> **Mecanismo:** Desacoplar radicalmente la planificación de la ejecución:
> 1. **Planificador Macro (LLM):** En una sola llamada estructurada (`Output.object` con `planSchema`), diseña la lista completa de acciones a ejecutar.
> 2. **Ejecutor Ciego (Código):** El runtime de TypeScript itera y ejecuta todas las herramientas en serie o paralelo sin invocar al LLM entre pasos.
> 3. **Sintetizador (LLM):** Una segunda y última llamada consolida las evidencias recolectadas en el reporte final.
> - **Límite del patrón:** Falla si un paso subsiguiente requiere forzosamente información descubierta en un paso previo (para lo cual se debe recurrir a ReAct o re-planificación dinámica).

- **Código implementado:** [`src/patterns/06-plan-and-execute/plan-execute.ts`](./src/patterns/06-plan-and-execute/plan-execute.ts)
- **Caso práctico abordado:** Auditoría de seguridad e integridad de celdas y bitácoras en una prisión de alta seguridad tras una fuga de supervillanos.
- **Estado:**
  - [x] Sección 9: Patrón Plan and Execute (57 - 63)

---

### 🔹 Módulo 10: Patrón 07 — CodeAct (Código como Acción)
> **Concepto:** En lugar de diseñar decenas de herramientas estáticas en JSON, el agente redacta scripts ejecutables (TypeScript/Python/Bash) que se corren en un entorno aislado (Sandbox). Ideal para análisis de datos, cálculos masivos o transformaciones complejas.

- **Estado:**
  - [~] Sección 10: Patrón Code Act (65 - 71) *(Próximo módulo)*

---

### 🔹 Módulo 11: Patrón 08 — Router & Specialist (Enrutamiento y Especialistas)
> **Concepto:** Evitar el antipatrón del "Agente Todólogo". Un agente clasificador ligero (Router) evalúa la intención del usuario y la redirige al agente especialista que posee el contexto, instrucciones y herramientas óptimas para ese dominio.

- **Estado:**
  - [ ] Sección 11: Patrón Enrutamiento y Especialistas (73 - 79)

---

### 🔹 Módulo 12: Patrón 09 — Orchestrator & Workers (Orquestador y Trabajadores)
> **Concepto:** Topología jerárquica donde un Orquestador Central descompone una misión global, asigna subtareas a múltiples agentes subordinados (Workers) y consolida la entrega final.

- **Estado:**
  - [ ] Sección 12: Patrón Orquestador y Trabajadores (81 - 87)

---

### 🔹 Módulo 13: Patrón 10 — Parallelization (Paralelización)
> **Concepto:** Ejecución concurrente de agentes o sub-prompts cuando las tareas son ortogonales e independientes (ej. consultar múltiples fuentes, analizar distintos ángulos de un problema o votar en consenso), reduciendo la latencia de minutos a segundos.

- **Estado:**
  - [ ] Sección 13: Patrón Paralelización (89 - 95)

---

### 🔹 Módulo 14: Patrón 11 — Human in the Loop (Humano en el Ciclo)
> **Concepto:** Incorporación de **Approval Gates humanas** en operaciones de alto impacto o destructivas (transferencias, eliminación de datos, envío de correos a clientes). El agente suspende su ejecución, solicita confirmación y reanuda según el veredicto humano.

- **Estado:**
  - [ ] Sección 14: Patrón Humano en el Ciclo (97 - 103)

---

### 🔹 Módulo 15: Cierre & Criterio Agéntico
- [ ] Sección 15: Conclusiones y evaluación final de arquitecturas (105)

---

## 🛡️ Mecanismos de Control y Seguridad Agéntica

A lo largo del código de los patrones se integran primitivas esenciales para producción:

| Mecanismo | Propósito en el Código |
| :--- | :--- |
| **Circuit Breakers** | Límites máximos de iteraciones y tokens para evitar bucles infinitos (`stepCountIs`). |
| **Structured Outputs** | Garantía de esquemas mediante `zod` y `Output.object` para evitar respuestas rotas. |
| **Auditores Deterministas** | Funciones regulares en TypeScript que auditan al modelo sin sesgos de LLM. |
| **Approval Gates & Fallbacks** | Validación estricta con compuertas en código (ej. longitud, tipos) y recortes deterministas si se supera el tope de reintentos. |
| **Isolation & Context Guarding** | Mantener prompts enfocados para evitar la dilución del contexto. |

---