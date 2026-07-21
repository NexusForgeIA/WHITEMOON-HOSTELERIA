/* ==========================================================================
   WhiteMoon · Chef Privado (demo) — JS compartido de las páginas de menú.
   Nav + dropdown "Mis propuestas" + menú móvil + cursor + reveal + chatbot.
   El chatbot replica exactamente el de index.html (Supabase edge functions).
   ========================================================================== */
(function(){
  "use strict";
  var REDUCE  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESKTOP = window.matchMedia('(min-width: 901px)').matches && window.matchMedia('(hover:hover)').matches;

  /* ---------- Config (idéntico a index.html) ---------- */
  var SUPABASE_URL = 'https://mlaqtniujnvfxcvcourm.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYXF0bml1am52ZnhjdmNvdXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzUyMzIsImV4cCI6MjA5MzQxMTIzMn0.Neh7VUS8ADsxf0DPab0JoJyGXOAXnLIaXzXbKzj2BGs';
  var CHAT_FN   = SUPABASE_URL + '/functions/v1/chef-chat';
  var NOTIFY_FN = SUPABASE_URL + '/functions/v1/chef-notify';

  function saveLead(payload){
    return fetch(SUPABASE_URL + '/rest/v1/leads_web', {
      method:'POST',
      headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify(payload)
    }).catch(function(e){ console.warn('saveLead', e); });
  }
  /* Aviso por Telegram; el token vive solo en la Edge Function (Deno.env). */
  function notifyTelegram(data){
    return fetch(NOTIFY_FN, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
      .catch(function(e){ console.warn('notify', e); });
  }

  /* ---------- Las 5 propuestas (enlazan a su página hermana ../slug/) ---------- */
  var PROPUESTAS = [
    { slug:'mediterraneo',        name:'Cocina Mediterránea',         desc:'Jamón ibérico, gambas y producto de la ría gallega. Carnes, pescados y postres de autor.' },
    { slug:'japones-fusion',      name:'Cocina Japonesa Fusión',      desc:'Sushi artesano, gyozas y ramen con alma madrileña y tailandesa. Tatakis y mochis cítricos.' },
    { slug:'italiano-siciliano',  name:'Cocina Italiana Siciliana',   desc:'La Sicilia auténtica: entrantes refinados, pastas, risottos y postres tradicionales.' },
    { slug:'mexicano-acapulqueno',name:'Cocina Mexicana Acapulqueña', desc:'Cochinita pibil, enchiladas de pato y tamales ibéricos. Fusión con guiños a Japón y Francia.' },
    { slug:'francesa',            name:'Cocina Francesa',             desc:'Mousse de foie, vieiras braseadas, magret de pato y solomillo Rossini. Clásicos de autor.' }
  ];
  function renderItems(container, itemClass){
    if (!container) return;
    PROPUESTAS.forEach(function(m){
      var a = document.createElement('a');
      a.href = '../' + m.slug + '/';
      a.className = itemClass;
      a.setAttribute('role','menuitem');
      a.setAttribute('data-cursor','');
      a.innerHTML = '<span class="nav__drop-name">' + m.name + '</span>' +
                    '<span class="nav__drop-desc">' + m.desc + '</span>';
      container.appendChild(a);
    });
  }
  renderItems(document.querySelector('#navDrop .nav__drop-menu'), 'nav__drop-item');
  renderItems(document.querySelector('#navMobileDrop .nav__mdrop-menu'), 'nav__mdrop-item');

  /* ---------- Nav: estado scrolled ---------- */
  var nav = document.getElementById('nav');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---------- Burger -> menú móvil + acordeón ---------- */
  var burger = document.getElementById('burger');
  var navMobile = document.getElementById('navMobile');
  var navMDrop = document.getElementById('navMobileDrop');
  function closeMobileMenu(){
    if (navMobile){ navMobile.classList.remove('open'); navMobile.setAttribute('aria-hidden','true'); }
    if (burger){ burger.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
    if (navMDrop){ navMDrop.classList.remove('open'); var mt=navMDrop.querySelector('.nav__mdrop-toggle'); if(mt) mt.setAttribute('aria-expanded','false'); }
  }
  if (burger && navMobile){
    burger.addEventListener('click', function(){
      var open = navMobile.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      navMobile.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }
  if (navMDrop){
    var mToggle = navMDrop.querySelector('.nav__mdrop-toggle');
    if (mToggle) mToggle.addEventListener('click', function(){
      var open = navMDrop.classList.toggle('open');
      mToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (navMobile){
    navMobile.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMobileMenu); });
  }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMobileMenu(); });

  /* ---------- Reveal on scroll ---------- */
  var revEls = document.querySelectorAll('.rv');
  if (REDUCE || !('IntersectionObserver' in window)){
    revEls.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    revEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- Custom cursor (desktop) ---------- */
  if (DESKTOP && !REDUCE){
    var cursor = document.getElementById('cursor');
    if (cursor){
      var cx=0,cy=0,tx=0,ty=0;
      window.addEventListener('mousemove', function(e){ tx=e.clientX; ty=e.clientY; });
      (function loop(){ cx+=(tx-cx)*0.18; cy+=(ty-cy)*0.18; cursor.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
      document.querySelectorAll('a,button,[data-cursor]').forEach(function(el){
        el.addEventListener('mouseenter', function(){ cursor.classList.add('is-active'); });
        el.addEventListener('mouseleave', function(){ cursor.classList.remove('is-active'); });
      });
    }
  }

  /* ---------- Chatbot (idéntico a index.html) ---------- */
  var fab = document.getElementById('fab');
  var chat = document.getElementById('chat');
  var chatBody = document.getElementById('chatBody');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var chatQuick = document.getElementById('chatQuick');
  var chatClose = document.getElementById('chatClose');
  var history = [];
  var greeted = false;
  var leadDone = false;

  function openChat(){
    chat.classList.add('open');
    if (!greeted){
      greeted = true;
      setTimeout(function(){ addMsg('bot', 'Bienvenido a WhiteMoon · Chef Privado. Soy LUNA, la asistente de reservas. ¿En qué puedo ayudarle?'); }, 800);
    }
  }
  function closeChat(){ chat.classList.remove('open'); }
  /* Abre el chat y lanza la reserva simulando click en "Reservar experiencia". */
  function openChatAndReserve(){
    greeted = true;
    openChat();
    setTimeout(function(){
      if (!chatQuick) return;
      var btns = chatQuick.querySelectorAll('button'), rb = btns[0];
      btns.forEach(function(b){ if (b.textContent.trim() === 'Reservar experiencia') rb = b; });
      if (rb) rb.click();
    }, 300);
  }
  window.openChat = openChat;
  window.openChatAndReserve = openChatAndReserve;

  function addMsg(role, text){
    var d = document.createElement('div');
    d.className = 'msg ' + role; d.textContent = text;
    chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight; return d;
  }
  function typing(){
    var d = document.createElement('div');
    d.className = 'msg bot typing'; d.innerHTML = '<i></i><i></i><i></i>';
    chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight; return d;
  }
  function handleLeadMarker(text){
    var m = text.match(/\[LEAD\]([\s\S]*?)\[\/LEAD\]/);
    var clean = text.replace(/\[LEAD\][\s\S]*?\[\/LEAD\]/,'').trim();
    if (m && !leadDone){
      leadDone = true;
      var d = {};
      try { d = JSON.parse(m[1]); } catch(e){ d = {}; }
      if (d.telefono){
        var mensaje = 'Reserva vía chat LUNA | Fecha: ' + (d.fecha||'-') + ' | Personas: ' + (d.personas||'-') +
                      ' | Cocina: ' + (d.cocina||'-') + ' | Localidad: ' + (d.localidad||'-');
        saveLead({ nombre:d.nombre||'', telefono:d.telefono||'', email:'', sector:'hosteleria-chef',
          interes:'whitemoon-chef-demo', mensaje:mensaje, origen:'whitemoon-chef-demo-chat', fecha:new Date().toISOString() });
        notifyTelegram({ nombre:d.nombre, telefono:d.telefono, fecha:d.fecha, personas:d.personas, servicio:d.cocina, cocina:d.cocina, localidad:d.localidad });
      }
    }
    return clean || text;
  }
  function send(text){
    if (!text) return;
    addMsg('user', text);
    history.push({role:'user', content:text});
    chatInput.value='';
    var t = typing();
    fetch(CHAT_FN, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ messages:history }) })
      .then(function(r){ return r.json(); })
      .then(function(data){
        t.remove();
        var reply = (data && data.reply) ? data.reply : 'Disculpe, puede contactar con nosotros en el 643 199 580.';
        var shown = handleLeadMarker(reply);
        history.push({role:'assistant', content:reply});
        addMsg('bot', shown);
      })
      .catch(function(){ t.remove(); addMsg('bot', 'Disculpe, ha habido un inconveniente. Puede llamar al 643 199 580.'); });
  }

  if (fab){
    fab.addEventListener('click', openChat);
    fab.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ') openChat(); });
  }
  if (chatClose) chatClose.addEventListener('click', closeChat);
  if (chatSend) chatSend.addEventListener('click', function(){ send(chatInput.value.trim()); });
  if (chatInput) chatInput.addEventListener('keydown', function(e){ if(e.key==='Enter'){ send(chatInput.value.trim()); } });
  if (chatQuick) chatQuick.addEventListener('click', function(e){ var b=e.target.closest('button'); if(!b) return; send(b.getAttribute('data-q')); });

  /* ---------- "Reservar este menú" -> abre el chat e inicia el flujo de reserva ---------- */
  document.querySelectorAll('[data-openchat]').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); openChatAndReserve(); });
  });
})();
