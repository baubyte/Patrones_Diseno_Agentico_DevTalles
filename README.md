# 🤖 Patrones de Diseño Agéntico — Bitácora y Guía de Arquitectura

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![DevTalles](https://img.shields.io/badge/DevTalles-Course-blueviolet?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completado%20100%25-brightgreen?style=for-the-badge)

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
Progreso General: [████████████████████] 15 / 15 Módulos Principales (100% Completado 🎉)
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
> **Problema que resuelve:** En Tool Use tradicional (JSON), no existen estructuras de control (`for`, `if`, variables intermedias ni acumuladores). Resolver problemas combinatoriales, filtros masivos o transformaciones complejas exige un round-trip HTTP por cada iteración, agotando el presupuesto de pasos (`stepCountIs`) sin poder terminar.  
> **Mecanismo:** La acción generada por el modelo no es un objeto JSON estático, sino **código ejecutable**. El LLM escribe un script completo (JavaScript/TypeScript) que se ejecuta en un entorno aislado (`node:vm`).
> - **A) Sin CodeAct:** Herramientas atómicas encadenadas. Falla inevitablemente por límite de pasos (~30 pasos requeridos vs. 10 disponibles en el presupuesto).
> - **B) Con CodeAct:** El modelo sintetiza el algoritmo y resuelve el problema en una sola llamada y un solo paso.
> - **Vulnerabilidad y Coste Oculto:** Sin sandbox real con aislamiento de procesos y recursos, *"CodeAct no es un patrón agéntico: es una vulnerabilidad de ejecución remota (RCE) con buenas intenciones"*.

- **Código implementado:** [`src/patterns/07-code-act/code-act.ts`](./src/patterns/07-code-act/code-act.ts)
- **Caso práctico:** Fuga masiva de villanos de prisión: emparejar a cada fugitivo con su único especialista neutralizador ordenado por nivel de amenaza.
- **Estado:**
  - [x] Sección 10: Patrón Code Act (65 - 71)

---

### 🔹 Módulo 11: Patrón 08 — Router & Specialist (Enrutamiento y Especialistas)
> **Problema que resuelve:** El antipatrón del "Agente Todólogo". Inyectar decenas de herramientas en un solo agente diluye el contexto, dispara la probabilidad de alucinación y aumenta exponencialmente la confusión en la selección de tools.  
> **Mecanismo:** Arquitectura de centralita telefónica.
> 1. **Clasificador (Router):** Evalúa la intención inicial mediante salida estructurada (`Output.object` con `routingSchema`), transfiere la llamada a **un único especialista** y se retira definitivamente.
> 2. **Especialistas Aislados:** Cada departamento (`ventas`, `soporte`, `facturación`) posee un subconjunto estrictamente disjunto de herramientas.
> - **Garantía estructural:** Si el router transfiere al departamento equivocado, la operación no puede resolverse porque nadie allí tiene la herramienta adecuada. Es imposible por construcción.

- **Código implementado:** [`src/patterns/08-routing/multi-routing.ts`](./src/patterns/08-routing/multi-routing.ts)
- **Caso práctico:** Centralita de atención al cliente de DevTalles: enrutamiento de consultas entre catálogo de cursos, tickets de soporte o emisión de facturas.
- **Estado:**
  - [x] Sección 11: Patrón Enrutamiento y Especialistas (73 - 79)

---

### 🔹 Módulo 12: Patrón 09 — Orchestrator & Workers (Orquestador y Trabajadores)
> **Problema que resuelve:** Cuando una petición de usuario requiere atender múltiples áreas simultáneamente (ej. "quiero el catálogo de Flutter, abrir un ticket de acceso y pedir mi factura"), el Router simple fracasa estructuralmente (techo: resuelve como máximo 1 de 3 partes porque se retira tras transferir).  
> **Mecanismo:** Un solo bucle agéntico donde el **Orquestador Central** tiene como herramientas a los propios **Workers especializados**.
> 1. El orquestador analiza la petición completa y coordina las llamadas necesarias a los workers.
> 2. Cada worker ejecuta su tool y devuelve un identificador de prueba único (`catalogId`, `ticketId`, `invoiceId`).
> 3. El orquestador verifica las evidencias retornadas y redacta la respuesta unificada final para el cliente.
> - **Diferencia vs Router:** El Router delega una vez y suelta el control; el Orquestador permanece en la conversación hasta verificar y consolidar todas las subtareas.

- **Código implementado:** [`src/patterns/09-orchestrator/orchestrator.ts`](./src/patterns/09-orchestrator/orchestrator.ts)
- **Estado:**
  - [x] Sección 12: Patrón Orquestador y Trabajadores (81 - 87)

---

### 🔹 Módulo 13: Patrón 10 — Parallelization (Paralelización)
> **Problema que resuelve:** Alta latencia en investigaciones independientes. La ejecución secuencial acumula los tiempos de cada búsqueda en serie (`t_total = t_1 + t_2 + ... + t_n`).  
> **Mecanismo:** Flujo estructurado en 3 fases:
> 1. **Planificar:** Un agente descompone la solicitud en una lista de investigaciones desacopladas y autocontenidas (`planSchema`).
> 2. **Ejecutar en Paralelo (Fan-out):** Despacho concurrente de workers (`Promise.all`), reduciendo la latencia al tiempo del worker más lento (`t_total = max(t_i)`).
> 3. **Integrar:** Un agente unificador compila los hallazgos en un reporte final y desduplica solapamientos.
> - **Coste Oculto:** Los workers trabajan en silos y no se ven entre sí (un juego multiplataforma aparece en múltiples ramas). Por eso la fase 3 de integración es obligatoria.

- **Código implementado:** [`src/patterns/10-parallelization/parallelization.ts`](./src/patterns/10-parallelization/parallelization.ts)
- **Caso práctico:** Radar de lanzamientos de videojuegos en los próximos 90 días para Nintendo, PC, PlayStation y Xbox, contrastando agente único vs. arquitectura paralela.
- **Estado:**
  - [x] Sección 13: Patrón Paralelización (89 - 95)

---

### 🔹 Módulo 14: Patrón 11 — Human in the Loop (Humano en el Ciclo)
> **Problema que resuelve:** Acciones con efectos irreversibles o de alto impacto financiero/operativo (ej. reembolsos de dinero, borrado de bases de datos, envíos masivos).  
> **Mecanismo:** **Approval Gates Condicionales** nativas mediante `toolApproval` del Vercel AI SDK.
> - **La decisión de diseño:** No es cómo pausar, sino **cuándo pausar**.
> - **Compuerta inteligente:** Operaciones dentro de política (≤ 30 días) se autorizan y ejecutan automáticamente; solicitudes fuera de plazo disparan un `tool-approval-request`.
> - **Intervención y Reanudación:** El bucle de ejecución se suspende, presenta al revisor un panel interactivo en terminal (`review`) con el contexto completo y reanuda enviando un `tool-approval-response` (aprobado o rechazado con motivo).
> - **Libro Mayor (`LEDGER`):** Cada acción irreversible queda firmada de forma inmutable con su autorizador (`política (automático)` vs `humano:consola`).

- **Código implementado:** [`src/patterns/11-human-loop/human-loop.ts`](./src/patterns/11-human-loop/human-loop.ts)
- **Caso práctico:** Atención de tickets de soporte con solicitud de reembolsos en DevTalles.
- **Estado:**
  - [x] Sección 14: Patrón Humano en el Ciclo (97 - 103)

---

### 🔹 Módulo 15: Cierre & Criterio Agéntico
> **Objetivo:** Consolidación de criterios de ingeniería para seleccionar la arquitectura adecuada según las restricciones del problema, evitando la sobre-ingeniería.

- **Matriz de Criterio Agéntico:**
  - **Prompting / Prompt Chaining:** Para tareas deterministas con transformaciones de formato y restricciones duras (longitud, formato, tono).
  - **Tool Use / ReAct:** Para consultas dinámicas, flujos de descubrimiento y tareas con longitud de pasos indeterminada.
  - **Plan and Execute:** Para flujos con pasos predecibles y herramientas independientes donde no se justifica el coste paso a paso de ReAct.
  - **CodeAct:** Para cálculos analíticos, combinatoria y transformaciones de datos masivas en entornos sandbox seguros.
  - **Router:** Para aislar contextos y especializar herramientas cuando el dominio es único por consulta.
  - **Orchestrator-Workers:** Para peticiones heterogéneas que cruzan múltiples dominios en una sola interacción.
  - **Parallelization:** Para abatir latencia en tareas ortogonales (investigación, comparación, consenso).
  - **Human-in-the-Loop:** Imprescindible en cualquier efecto secundario irreversible o fuera de política predefinida.
- **Estado:**
  - [x] Sección 15: Conclusiones y evaluación final de arquitecturas (105)

---

## 🛡️ Mecanismos de Control y Seguridad Agéntica

A lo largo del código de los patrones se integran primitivas esenciales para producción:

| Mecanismo | Propósito en el Código |
| :--- | :--- |
| **Circuit Breakers** | Límites máximos de iteraciones y tokens para evitar bucles infinitos (`stepCountIs`). |
| **Structured Outputs** | Garantía estricta de esquemas y tipos mediante `zod` y `Output.object`. |
| **Auditores Deterministas** | Funciones regulares en TypeScript que auditan al modelo sin sesgos ni complacencia de LLM. |
| **Approval Gates & Fallbacks** | Validación con compuertas en código (longitud, reglas de negocio) y recortes deterministas. |
| **Isolation & Tool Separation** | Evitar el agente todólogo entregando a cada worker únicamente herramientas disjuntas. |
| **Code Sandboxing (`node:vm`)** | Aislamiento de ejecución para prevenir vulnerabilidades RCE en patrones CodeAct. |
| **Conditional HITL Gates** | Suspensión del bucle agéntico en operaciones irreversibles condicionadas por reglas de negocio (`toolApproval`). |
| **Immutable Ledger** | Trazabilidad y auditoría de efectos secundarios registrando quién autorizó cada acción. |

---