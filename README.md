# WHITEMOON-HOSTELERIA — WhiteMoon · Chef Privado (demo)

Demo de producto de **WhiteMoon Agencia IA**: web de **chef privado a domicilio** con
chatbot de reservas. Diseño dark premium (negro + amarillo fluor). HTML/CSS/JS puro.

> **Es una demo.** El chef, los textos, las reseñas y las estadísticas son **ficticios**
> y solo sirven de ejemplo. No se atribuye a nadie formación, premios ni credenciales.
> Las páginas llevan `noindex, nofollow`.

## Stack
- Frontend: `index.html` (sin frameworks). GSAP + ScrollTrigger, Anime.js, Locomotive Scroll.
- Tipografía: **Syne** (display) + **Inter Tight** (texto).
- Paleta: `--bg:#08080A` · `--acid:#D9FF00` (amarillo fluor) · `--acid2:#EBFF5C`.
- Imágenes: locales en `assets/img/` (WebP + JPG de respaldo, con `width`/`height` y `loading="lazy"`).
  Fotografías de [Unsplash](https://unsplash.com); logo y retrato del chef, propios.
- Backend: Supabase `mlaqtniujnvfxcvcourm`
  - Captura de leads → tabla `leads_web` (`origen='whitemoon-chef-demo-chat'`).
  - **Edge Functions** (claves SOLO server-side):
    - `chef-chat` — asistente IA **LUNA** (Claude `claude-haiku-4-5-20251001`). `ANTHROPIC_API_KEY` server-side.
    - `chef-notify` — aviso de nueva reserva vía **Telegram**. `TELEGRAM_BOT_TOKEN` server-side.

> Ninguna API key se expone en el frontend. El chat inserta el lead con la anon key de
> Supabase (RLS: `leads_web` solo permite INSERT a anon) y delega la IA y el aviso de
> Telegram a las Edge Functions.

## Edge Functions — despliegue
```bash
supabase functions deploy chef-chat   --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm
supabase functions deploy chef-notify --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm
```

Secrets requeridos en el proyecto:

| Secret | Usado por | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | `chef-chat` | Llamada a la API de Claude |
| `TELEGRAM_BOT_TOKEN` | `chef-notify` | Envío del aviso de lead |
| `TELEGRAM_CHAT_ID` | `chef-notify` | Chat destino (por defecto `861432965`) |

## Contenido de la demo
- Contacto mostrado en toda la web: **643 199 580** · **comercial@whitemoon.es** (WhiteMoon).
- 5 cocinas con página propia en `menu/<slug>/`: Mediterránea, Japonesa Fusión,
  Italiana Siciliana, Mexicana Acapulqueña y Francesa. Precios **bajo consulta**.
- Chatbot **LUNA**: flujo guiado de reserva (calendario → servicio → comensales →
  localidad → cocina → contacto) y conversación libre con Claude.

---
Diseñado por [WhiteMoon Agencia IA](https://whitemoon.es)
