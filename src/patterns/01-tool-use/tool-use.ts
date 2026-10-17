/**
 * PATRÓN: Uso de herramientas - Tool use
 * ---------------------------
 * El catálogo de cursos NO está en el entrenamiento
 * del modelo. Sin herramientas, el modelo inventa precios y cursos con
 * total confianza o en su defecto, no hace nada.
 * Con herramientas, consulta el dato real.
 */

import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createTracer, model } from '../../helpers/index.js';

// ---------------------------------------------------------------------------
//  LA "BASE DE DATOS" — datos que el modelo no puede conocer
// ---------------------------------------------------------------------------

type Course = {
    id: string;
    title: string;
    hours: number;
    priceUSD: number;
    level: 'basic' | 'intermediate' | 'advanced';
    students: number;
};

const COURSE_CATALOG: Course[] = [
    {
        id: 'ts-01',
        title: 'TypeScript desde cero',
        hours: 22,
        priceUSD: 19.99,
        level: 'basic',
        students: 48_120,
    },
    {
        id: 'nest-02',
        title: 'NestJS: API REST modular',
        hours: 31,
        priceUSD: 24.99,
        level: 'intermediate',
        students: 22_450,
    },
    {
        id: 'flu-03',
        title: 'Flutter: apps multiplataforma',
        hours: 46,
        priceUSD: 29.99,
        level: 'intermediate',
        students: 61_300,
    },
    {
        id: 'agt-04',
        title: 'Agentes de IA con TypeScript',
        hours: 18,
        priceUSD: 34.99,
        level: 'advanced',
        students: 1_890,
    },
    {
        id: 'dkr-05',
        title: 'Docker para desarrolladores',
        hours: 14,
        priceUSD: 17.99,
        level: 'basic',
        students: 35_770,
    },
];

const QUESTION = `¿Cuanto costarían juntos el curso de TypeScript y el de Docker con un 20% de descuento? Dame también las horas Totales.`;


async function withoutTools() {
    const tracer = createTracer('Sin Herramientas');

    const {text} =  await generateText({
        model,
        prompt: QUESTION,
        onStepEnd: tracer.onStepFinish,
    });

    console.log(`Respuesta: ${text}`, text.green);
    console.log('Verificar la respuesta en el catalogo')

    return tracer.summary();
}

//! ======= Implementación con tools

//* Tool #1 Find Courses

const findCoursesTool = tool({
    description:
        'Buscar cursos en el catalogo de devtalles por texto ' +
        'por titulo o por nivel. Utiliza siempre antes de responder ' +
        'cualquier pregunta sobre cursos, precios, cantidad de alumnos '+
        'o cualquier informacion sobre los cursos del catalogo.',
    inputSchema: z.object({
        text: z
        .string()
        .optional()
        .describe('Término de búsqueda, por ejemplo: "Typescript" o "NestJS".'),
        level: z
        .enum(['basic', 'intermediate', 'advanced'])
        .optional()
        .describe('Nivel de los cursos a buscar.'),
    }),
    execute: async function ({ text, level }) {
        const filteredCourses = COURSE_CATALOG.filter((course) => {
            const matchesText = !text || course.title.toLowerCase().includes(text.toLowerCase());
            const matchesLevel = !level || course.level === level;
            return matchesText && matchesLevel;
        });

        return {
            found: filteredCourses.length,
            courses: filteredCourses,
        };
    },
});

//* Tool #2 Calculate Totals

const calculateTotalsTool = tool({
    description:
        'Calcula el precio total de una lista de cursos aplicando un descuento porcentual.' +
        'Utilizala simopre para cualquier operación aritmética no calcules mentalmente.',
    inputSchema: z.object({
        ids: z
        .array(z.string()
        .describe('IDs de los cursos Ej: ["ts-45454", "dkr-15454"]')),
        discountPercent: z
        .number()
        .min(0)
        .max(70)
        .default(0)
        .describe('Porcentaje de descuento a aplicar'),
    }),
    execute: async function ({ ids, discountPercent }) {
        const foundCourses = COURSE_CATALOG.filter(
            (course) => ids.includes(course.id)
        );

       const notFound = ids.filter(
            (id) => !COURSE_CATALOG.some((course) => course.id === id)
       );

        const subTotal = foundCourses.reduce(
            (total, course) => total + course!.priceUSD, 
            0
        );

        const discount = subTotal * (discountPercent / 100);

        const total = subTotal - discount;

        return {
            notFound,
            subTotal: Number(subTotal.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            total: Number(total.toFixed(2)),
        };
    },
})

async function withTools() {
    const tracer = createTracer('Con Herramientas');

    const { text } = await generateText({
        model,
        prompt: QUESTION,
        tools: {
            findCoursesTool,
            calculateTotalsTool,
        },
        // Circuit Breaker
        stopWhen: stepCountIs(6),
        instructions:
            'Eres un asistente del catálogo de cursos de devtalles. ' +
            ' No inventes precios, duraciones ni nombres de cursos. ' +
            ' Consúltalos siempre con las herramientas disponibles. ',
        onStepEnd: tracer.onStepFinish,
    });

    console.log(`Respuesta: ${text}`, text.green);
    console.log('Verificar la respuesta en el catalogo')

    return tracer.summary();
}


export async function toolUseMain() {
    //const resultWithoutTools = await withoutTools();

    const resultWithTools = await withTools();

    console.log('\n=== Comparativa ===');

    console.table({
        //'Respuesta sin herramientas': resultWithoutTools,
        'Respuesta con herramientas': resultWithTools,
    })
}
