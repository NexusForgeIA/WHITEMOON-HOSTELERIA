import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// chef-notify — aviso por Telegram de una nueva SOLICITUD DE RESERVA de la demo
// WhiteMoon · Chef Privado (chatbot "LUNA").
//
// El lead ya se inserta en leads_web desde el cliente
// (origen='whitemoon-chef-demo-chat'); esta función SOLO envía la notificación
// vía Telegram Bot API, manteniendo el token EXCLUSIVAMENTE server-side.
// Sustituye al aviso anterior por CallMeBot (WhatsApp).
//
// Recibe (POST JSON): { nombre, telefono, fecha, personas, servicio, cocina, localidad, test? }
//
// Secrets usados (nunca en cliente):
//   - TELEGRAM_BOT_TOKEN : token del bot de Telegram (obligatorio)
//   - TELEGRAM_CHAT_ID   : chat destino; si no está definido se usa CHAT_ID_FALLBACK
//
// IMPORTANTE: es una SOLICITUD de reserva de una DEMO, no un servicio real
// contratado. El aviso lo deja explícito para que nadie lo confunda.
//
// Regla del proyecto: si el envío falla → console.warn, nunca interrumpe nada.
//
// Desplegar con:
//   supabase functions deploy chef-notify --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm

// El chat_id no es un secreto (solo identifica el destino); el token sí lo es.
const CHAT_ID_FALLBACK = "861432965";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const data = (payload.args ?? payload) as Record<string, unknown>;
  const nombre = String(data.nombre ?? "").trim() || "-";
  const telefono = String(data.telefono ?? "").trim() || "-";
  const fecha = String(data.fecha ?? "").trim() || "-";
  const personas = String(data.personas ?? "").trim() || "-";
  const cocina = String(data.cocina ?? "").trim();
  const localidad = String(data.localidad ?? "").trim() || "-";
  // "servicio" admite almuerzo/cena; si no llega usamos la cocina como detalle.
  const servicio = String(data.servicio ?? "").trim() || cocina || "-";
  const soloPrueba = data.test === true;

  const digits = telefono.replace(/\D/g, "");

  const message =
    (soloPrueba
      ? "🧪 PRUEBA — demo WhiteMoon · Chef Privado\n\n"
      : "🍽️ NUEVA SOLICITUD DE RESERVA — demo WhiteMoon · Chef Privado\n\n") +
    `👤 ${nombre}\n` +
    `📱 ${telefono}\n` +
    `📅 ${fecha} · ${servicio}\n` +
    `👥 ${personas} comensales\n` +
    `📍 ${localidad}\n\n` +
    "⚠️ Lead de una WEB DE DEMOSTRACIÓN: no hay servicio real contratado.\n" +
    (digits.length >= 9 ? `📲 CONTACTAR: https://wa.me/34${digits}` : "");

  let notified = false;
  try {
    const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const tgChat = Deno.env.get("TELEGRAM_CHAT_ID") || CHAT_ID_FALLBACK;
    if (tgToken) {
      const r = await fetch(
        `https://api.telegram.org/bot${tgToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChat, text: message }),
        },
      );
      notified = r.ok;
      if (!r.ok) {
        console.warn("[chef-notify] Telegram falló:", r.status, await r.text());
      }
    } else {
      console.warn("[chef-notify] sin TELEGRAM_BOT_TOKEN, mensaje:", message);
    }
  } catch (e) {
    console.warn("[chef-notify] error enviando Telegram:", e);
  }

  return json({ ok: true, notified });
});
