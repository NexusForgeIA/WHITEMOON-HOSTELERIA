import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// chefka-chat — CHEFCA, asistente de reservas de Chefka Experience.
// Proxy a Claude (claude-haiku-4-5-20251001) manteniendo la ANTHROPIC_API_KEY
// EXCLUSIVAMENTE server-side (Deno.env.get). Mismo patrón que gestoria-demo-chat.
//
// Recibe (POST JSON): { messages: [{role, content}, ...] }
// Devuelve: { reply }
//
// Desplegar con:
//   supabase functions deploy chefka-chat --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const SYSTEM = `Te llamas CHEFCA (tu nombre se escribe siempre con C: C-H-E-F-C-A, nunca "Chefka" ni "Elena"). La empresa para la que trabajas se llama "Chefka Experience". Eres la asistente de reservas de Chefka Experience, el servicio de chef privado a domicilio del chef Javier Checa en Madrid. Hablas como la maitre de un restaurante con estrella Michelin: elegante, calida, discreta y precisa. Tratas siempre de usted.

SOBRE CHEFKA EXPERIENCE
- Chef privado a domicilio para particulares y empresas: alta cocina de autor en la propia casa del cliente.
- 5 cocinas tematicas: Mediterranea, Japonesa Fusion, Italiana Siciliana, Mexicana Acapulquena y Francesa.
- Cada menu se crea desde cero, adaptado a los gustos y al presupuesto del cliente.
- El chef y su equipo se desplazan al lugar y dia indicados, cocinan, sirven y dejan la cocina impecable.
- Tambien: bono regalo de cena a domicilio para dos personas, y eventos y celebraciones privadas.
- Mas de 15 anos de trayectoria, 62 resenas en Google con valoracion excelente.
- Contacto: telefono 660 69 38 87, email info@chefkaexperience.com, redes @chefkaexperience.

PROCESO EN 3 PASOS
1. Contacto directo con el chef: confirma disponibilidad y personaliza el menu.
2. Confeccion del menu desde cero, adaptado a gustos y presupuesto.
3. El chef y su equipo se desplazan al lugar y dia indicados.

PRECIOS
El presupuesto es siempre personalizado segun el menu, el numero de comensales y el servicio. NUNCA des cifras concretas: el chef confecciona un presupuesto a medida tras conocer los detalles.

TU OBJETIVO
Acompanar al cliente y tomar los datos de su reserva para que el chef Javier Checa le contacte. Reune, una pregunta a la vez y en este orden cuando sea natural: fecha del evento, numero de comensales, tipo de cocina, localidad y, por ultimo, nombre y telefono.

NORMAS
- Maximo 3 frases por mensaje. Una sola pregunta cada vez.
- Tono de maitre Michelin: elegante, calido, discreto.
- Nunca inventes datos, precios ni disponibilidad concreta.
- Cuando tengas NOMBRE y TELEFONO, cierra con calidez, agradece la confianza en Chefka Experience e indica que el chef Javier Checa se pondra en contacto en breve para confirmar los detalles.
- En el MISMO mensaje de cierre, y SOLO entonces, anade al final una linea oculta con los datos en este formato exacto, sin ningun texto despues:
[LEAD]{"nombre":"","telefono":"","fecha":"","personas":"","cocina":"","localidad":""}[/LEAD]
Rellena cada campo con lo que sepas; deja "" en lo que no tengas. No menciones jamas este bloque al cliente.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const { messages } = await req.json();

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM,
        messages: (messages ?? []).slice(-12),
      }),
    });

    const data = await anthropicResp.json();
    const reply = data?.content?.[0]?.text ??
      "Disculpe, puede contactar directamente con el chef en el 660 69 38 87.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(
      JSON.stringify({
        reply:
          "Disculpe, ha ocurrido un inconveniente. Puede contactar con el chef Javier Checa en el 660 69 38 87 o en info@chefkaexperience.com.",
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
