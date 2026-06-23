import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// chefka-notify — notifica por WhatsApp una nueva reserva de Chefka Experience.
// El lead ya se inserta en leads_web desde el cliente (origen='chefka-experience-web');
// esta funcion SOLO envia la notificacion WhatsApp via CallMeBot, manteniendo la
// apikey EXCLUSIVAMENTE server-side (Deno.env.get). Mismo patron que auditoria-geo-notify.
//
// La CALLMEBOT_APIKEY del proyecto esta vinculada al numero de Cristobal (WhiteMoon),
// por eso el aviso de la demo se entrega a 34643199580.
//
// Recibe (POST JSON): { nombre, telefono, fecha, personas, servicio, cocina, localidad }
//
// Regla del proyecto: si el envio falla -> console.warn, nunca interrumpe nada.
//
// Desplegar con:
//   supabase functions deploy chefka-notify --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm

const NOTIFY_PHONE = "34643199580"; // numero vinculado a la CALLMEBOT_APIKEY del proyecto

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

  const message =
    `🍽️ Nueva reserva Chefka Experience\n` +
    `Nombre: ${nombre} | Tel: ${telefono}\n` +
    `Fecha: ${fecha} | Personas: ${personas}\n` +
    `Servicio: ${servicio} | Localidad: ${localidad}`;

  let notified = false;
  try {
    const callmebotKey = Deno.env.get("CALLMEBOT_APIKEY");
    if (callmebotKey) {
      const notifyUrl =
        `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(NOTIFY_PHONE)}` +
        `&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(callmebotKey)}`;
      const r = await fetch(notifyUrl);
      notified = r.ok;
      if (!r.ok) {
        console.warn("[chefka-notify] CallMeBot fallo:", r.status);
      }
    } else {
      console.warn("[chefka-notify] sin CALLMEBOT_APIKEY, mensaje:", message);
    }
  } catch (e) {
    console.warn("[chefka-notify] error enviando WhatsApp:", e);
  }

  return json({ ok: true, notified });
});
