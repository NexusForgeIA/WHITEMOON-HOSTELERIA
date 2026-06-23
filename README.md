# WHITEMOON-HOSTELERIA — Chefka Experience (demo)

Demo de **chef privado a domicilio** para **Chefka Experience** (chef Javier Checa, Madrid).
Diseño dark premium gastronómico. HTML/CSS/JS puro en un solo `index.html`.

## Stack
- Frontend: `index.html` (sin frameworks). GSAP + ScrollTrigger, Anime.js, Locomotive Scroll.
- Backend: Supabase `mlaqtniujnvfxcvcourm`
  - Captura de leads → tabla `leads_web` (`origen='chefka-experience-web'` / `'chefka-experience-chat'`).
  - **Edge Functions** (claves SOLO server-side):
    - `chefka-chat` — agente IA **Elena** (Claude `claude-haiku-4-5-20251001`). `ANTHROPIC_API_KEY` server-side.
    - `chefka-notify` — aviso WhatsApp de nueva reserva vía CallMeBot. `CALLMEBOT_APIKEY` server-side.

> Ninguna API key se expone en el frontend. El formulario y el chat insertan el lead con la
> anon key de Supabase y delegan la notificación WhatsApp y la IA a las Edge Functions.

## Edge Functions — despliegue
```bash
supabase functions deploy chefka-chat   --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm
supabase functions deploy chefka-notify --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm
```
Secrets requeridos en el proyecto: `ANTHROPIC_API_KEY`, `CALLMEBOT_APIKEY`.

## Datos del cliente
- Chefka Experience · Chef Javier Checa
- Tel: 660 69 38 87 · info@chefkaexperience.com · @chefkaexperience
- 5 cocinas: Mediterránea, Japonesa Fusión, Italiana Siciliana, Mexicana Acapulqueña, Francesa

---
Diseñado por [WhiteMoon Agencia IA](https://whitemoon.es)
