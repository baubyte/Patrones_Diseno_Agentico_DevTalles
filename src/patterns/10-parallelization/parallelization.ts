/**
 * PATRÓN: Paralelización - Parallelization
 * ----------------------------------------
 * Tres fases, cada una con un responsable claro:
 *
 *   1. PLANIFICAR  → un agente lee la petición y devuelve una lista de
 *                    investigaciones independientes (salida estructurada).
 *   2. EJECUTAR    → un worker por investigación, todos a la vez.
 *   3. INTEGRAR    → un agente recibe los hallazgos y redacta la salida.
 *
 * Lo que compra: latencia. Cuatro investigaciones tardan lo que tarda la
 * más lenta, no la suma de las cuatro.
 *
 * El coste oculto: los workers no se ven entre sí. Un multiplataforma
 * aparece en varias ramas y nadie puede evitarlo desde dentro. Por eso
 * la fase 3 no es opcional.
 *
 *   A) UN SOLO AGENTE  → busca y redacta él mismo, en serie.
 *   B) PLAN + FAN-OUT + INTEGRACIÓN
 *
 * REQUISITOS
 *   - Clave gratuita de RAWG: https://rawg.io/apidocs
 *   - export RAWG_API_KEY="..."
 */

import { generateText, tool, stepCountIs, Output } from 'ai';
import { z } from 'zod';

import { createTracer, model } from '../../helpers/index.js';
import { trace } from 'node:console';

const RESEARCH_REQUEST =
    'Quiero saber en los próximos 90 días, qué juegos vienen para ' +
    'Nintendo, PC, PlayStation y XBOX';

// ---------------------------------------------------------------------------
// LA HERRAMIENTA DE BÚSQUEDA — una sola, genérica
// ---------------------------------------------------------------------------

type Platform = 'pc' | 'playstation' | 'xbox' | 'nintendo';

const MOCK_GAMES: Record<
    Platform,
    Array<{ title: string; released: string; hype: number }>
> = {
    pc: [
        { title: 'Hades II', released: '2025-04-15', hype: 9500 },
        { title: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl', released: '2025-05-10', hype: 8800 },
        { title: 'Civilization VII', released: '2025-06-01', hype: 7200 },
        { title: 'Frostpunk 2', released: '2025-04-20', hype: 6900 },
    ],
    playstation: [
        { title: 'Death Stranding 2: On The Beach', released: '2025-05-25', hype: 9800 },
        { title: 'Ghost of Yōtei', released: '2025-06-15', hype: 9400 },
        { title: 'Monster Hunter Wilds', released: '2025-04-28', hype: 9100 },
    ],
    xbox: [
        { title: 'Fable', released: '2025-06-10', hype: 8900 },
        { title: 'Avowed', released: '2025-04-18', hype: 8200 },
        { title: 'Doom: The Dark Ages', released: '2025-05-30', hype: 8700 },
    ],
    nintendo: [
        { title: 'Metroid Prime 4: Beyond', released: '2025-05-12', hype: 9600 },
        { title: 'Pokémon Legends: Z-A', released: '2025-06-20', hype: 9300 },
        { title: 'Mario & Luigi: Brothership', released: '2025-04-22', hype: 7800 },
    ],
};

const searchUpcomingGames = tool({
    description:
        'Busca los videojuegos que salen en una plataforma dentro de una ' +
        'ventana de días, ordenados por expectación. Úsala antes de responder: ' +
        'no inventes títulos ni fechas.',
    inputSchema: z.object({
        platform: z.enum(['pc', 'playstation', 'xbox', 'nintendo']),
        days: z.number().min(1).max(365).default(90),
        limit: z.number().min(3).max(20).default(10),
    }),
    execute: async ({ platform, limit }) => {
        // Simulamos latencia de red (400ms) para evaluar paralelismo vs serie
        await new Promise((resolve) => setTimeout(resolve, 400));

        const games = (MOCK_GAMES[platform] || []).slice(0, limit);

        return {
            platform,
            games,
        };
    },
});

// ---------------------------------------------------------------------------
// A) UN SOLO AGENTE — busca y redacta él mismo
// ---------------------------------------------------------------------------

async function singleAgent() {
    console.log('\n═══ A) UN SOLO AGENTE ═══\n'.blue);
    const tracer = createTracer('agente-único');
    const startedAt = Date.now();

    const { text } = await generateText({
        model,
        tools: { searchUpcomingGames },
        stopWhen: stepCountIs(8),
        instructions:
            'Eres redactor de una newsletter de videojuegos. Consulta la ' +
            'herramienta para cada plataforma que te pidan y redacta un repaso ' +
            'de máximo 200 palabras con los 2 lanzamientos más relevantes de ' +
            'cada una. Responde en español.',
        prompt: RESEARCH_REQUEST,
        onStepEnd: tracer.onStepFinish,
    });

    console.log(text.green);

    return { ...tracer.summary(), ms: Date.now() - startedAt };
}

// ---------------------------------------------------------------------------
// B) PLANIFICAR → EJECUTAR EN PARALELO → INTEGRAR
// ---------------------------------------------------------------------------

// ----- Fase 1: el plan -----------------------------------------------------

/**
 * Salida estructurada. La forma importa:
 *   - `topic` es lo que vemos en consola y en la comparativa.
 *   - `assignment` es el encargo completo para el worker. Debe ser
 *     autocontenido: el worker no ve la petición original ni a los demás.
 */
const planSchema = z.object({
    tasks: z
        .array(
            z.object({
                topic: z.string().describe('Nombre corto, ej: "PlayStation"'),
                assignment: z
                    .string()
                    .describe(
                        'Encargo completo y autocontenido para un investigador que no conoce la petición original '
                    ),
            })
        )
        .min(1)
        .max(8)
        .describe('Investigaciones independientes entre sí '),
});

async function planResearch(tracer: ReturnType<typeof createTracer>) {
    // TODO: Implementar un plan (output) para seguirlo

    const { output } = await generateText({
        model,
        output: Output.object({ schema: planSchema }),
        instructions:
            'Eres un planificador. No investigues.' +
            ' Descompón la petición en investigaciones independientes que puedan hacerse a la vez, ' +
            ' una por tema. No incluyas temas que no se mencionan y responde en español. ',
        prompt: RESEARCH_REQUEST,
        onStepEnd: tracer.onStepFinish,
    });

    return output.tasks;
}

// ----- Fase 2: el worker ---------------------------------------------------

/**
 * Un sub-agente con la herramienta de búsqueda y un encargo.
 * Devuelve texto. Es el mismo runWorker que en los labs anteriores.
 */
async function runWorker(
    assignment: string,
    tracer: ReturnType<typeof createTracer>
) {
    const { text } = await generateText({
        model,
        tools: { searchUpcomingGames },
        stopWhen: stepCountIs(4),
        instructions:
            'Eres un investigador de videojuegos. Cumple tu encargo consultando ' +
            'la herramienta y responde con una lista breve: título, fecha y una ' +
            'frase de por qué importa. Copia títulos y fechas literalmente. ' +
            'Responde en español.',
        prompt: assignment,
        onStepEnd: tracer.onStepFinish,
    });

    return text;
}

// ----- Fase 3: la integración ----------------------------------------------

async function integrateFindings(
    findings: { topic: string; findings: string }[],
    tracer: ReturnType<typeof createTracer>
) {
    const { text } = await generateText({
        model,
        instructions:
            'Eres editor de una newsletter de videojuegos. Integra los hallazgos ' +
            'en un repaso de máximo 200 palabras. Si un juego aparece en varios ' +
            'temas, menciónalo UNA sola vez indicando todas sus plataformas. ' +
            'Responde en español.',
        prompt:
            `Petición original: ${RESEARCH_REQUEST} \n\n` +
            'Hallazgos por tema: \n' +
            //JSON.stringify(findings),
            findings
            .map((item) => `--- ${item.topic} --- \n ${item.findings}`)
            .join('\n\n'),
        onStepEnd: tracer.onStepFinish,
    });

    return text;
}

// ----- Las tres fases juntas -----------------------------------------------

async function planExecuteIntegrate() {
    console.log('\n═══ B) PLAN → PARALELO → INTEGRACIÓN ═══\n'.blue);

    const tracer = createTracer('paralelo');
    const startedAt = Date.now();

    // 1. Planificar
    const tasks = await planResearch(tracer);

    console.log(` Plan: ${tasks.length} investigaciones`.blue);
    for (const task of tasks) {
        console.log(`   · ${task.topic.yellow}: ${task.assignment}`);
    }

    // 2. Ejecutar en paralelo — aquí es donde se gana la latencia
    const workersStartedAt = Date.now();

    const findings = await Promise.all(
        tasks.map(async (task) => {
            console.log(`\n --> worker [${task.topic.yellow}] arranca`);
            const result = await runWorker(task.assignment, tracer);
            console.log(`\n <-- worker [${task.topic.yellow}] termina`);

            return { topic: task.topic, findings: result };
        })
    );

    const workersMs = Date.now() - workersStartedAt;

    // 3. Integrar
    const report = await integrateFindings(findings, tracer);

    console.log('\n Informe integrado:\n'.blue);
    console.log(report.green);

    return {
        ...tracer.summary(),
        ms: Date.now() - startedAt,
        workersMs,
        workers: tasks.length,
    };
}

// ---------------------------------------------------------------------------
// EJECUCIÓN DEL PROGRAMA
// ---------------------------------------------------------------------------

export async function parallelizationMain() {
    // const a = await singleAgent();
    const b = await planExecuteIntegrate();

    console.log('\n═══ COMPARATIVA ═══\n'.blue);
    console.table({
        // 'A) Agente único': a,
        'B) Plan + paralelo + integración': b,
    });
}