import { generateText } from "ai";
import {createTracer, model} from '../../helpers/index.js';

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

export async function toolUseMain() {
    const resultWithoutTools = await withoutTools();

    console.log('\n=== Comparativa ===');

    console.table({
        'Respuesta sin herramientas': resultWithoutTools
    })
}
