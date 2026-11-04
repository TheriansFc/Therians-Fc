(()=>{'use strict';
const conf=window.TAFC_CONFIG||{}, online=Boolean(conf.supabaseUrl&&conf.supabaseAnonKey&&window.supabase);
const db=online?window.supabase.createClient(conf.supabaseUrl,conf.supabaseAnonKey):null;
const sample={noticias:[{id:'demo-n1',titulo:'Bienvenidos a Therians F.C.',contenido:'Este es el nuevo hogar digital del equipo. Próximamente publicaremos noticias y actualizaciones reales.',fecha:'2026-11-03'}],jugadores:[{id:'demo-j1',nombre:'Jugador de ejemplo',numero:7,posicion:'Delantero',goles:0,asistencias:0,valor:8.5}],partidos:[]};
const tables=['noticias','jugadores','partidos'];let data=structuredClone(sample),audits=[],session=null,editing=null;
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=n=>Number(n||0),date=s=>s?new Date(s+'T12:00:00').toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'}):'Sin fecha';
function canEdit(){return Boolean(session?.user)}
function render(){const players=data.jugadores, matches=data.partidos, played=matches.filter(m=>m.goles_favor!=null&&m.goles_contra!=null),wins=played.filter(m=>val(m.goles_favor)>val(m.goles_contra)).length;
$('metrics').innerHTML=[['Jugadores',players.length],['Partidos',played.length],['Victorias',wins],['Goles',played.reduce((s,m)=>s+val(m.goles_favor),0)]].map(([l,n])=>`<div class="metric"><strong>${n}</strong><span>${l}</span></div>`).join('');
const edit=(t,id)=>canEdit()?`<button class="edit" data-edit="${t}" data-id="${esc(id)}">Editar ↗</button>`:'';
$('newsList').innerHTML=data.noticias.length?data.noticias.map(x=>`<article class="card"><span class="tag">${date(x.fecha)}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.contenido)}</p>${edit('noticias',x.id)}</article>`).join(''):'<p class="empty">Todavía no hay noticias.</p>';

$('playersList').innerHTML = players.length
  ? players.map(x => `
    <article class="card fifaCard">

<div class="fifaTop">  
<div class="fifaRating">
  <strong>${esc(x.media_general ?? 50)}</strong>
  <span>${esc(x.posicion)}</span>
  
<img
  src="https://theriansfc.github.io/Therians-Fc/assets/escudo-tafc-transparente.png""
  alt="Escudo Therians F.C."
  class="fifaShield"
>


</div>
</div>

        ${x.foto_url
          ? `<img
              src="${esc(x.foto_url)}"
              alt="Fotografía de ${esc(x.nombre)}"
              class="fifaPhoto"
              loading="lazy"
              onerror="this.style.display='none'"
            >`
          : `<div class="playerPhotoPlaceholder">⚽</div>`
        }
      </div>

      <h3 class="fifaName">${esc(x.nombre)}</h3>
      <p class="fifaNumber">Dorsal #${esc(x.numero ?? '—')}</p>

      <div class="fifaStats">
        <div><b>${val(x.velocidad)}</b> VEL</div>
        <div><b>${val(x.tiro)}</b> TIR</div>
        <div><b>${val(x.pase)}</b> PAS</div>
        <div><b>${val(x.regate)}</b> REG</div>
        <div><b>${val(x.defensa)}</b> DEF</div>
        <div><b>${val(x.fisico)}</b> FIS</div>
      </div>

      <div class="fifaActions">
        ${edit('jugadores', x.id)}
      </div>

    </article>
  `).join('')
  : '<p class="empty">La plantilla está vacía.</p>';

$('matchesList').innerHTML=matches.length?matches.map(x=>`<article class="card"><span class="tag">${date(x.fecha)}</span><h3>Therians F.C. vs ${esc(x.rival)}</h3><div class="value">${x.goles_favor==null?'—':val(x.goles_favor)} : ${x.goles_contra==null?'—':val(x.goles_contra)}</div><p>${esc(x.lugar||'Sede por confirmar')}</p>${edit('partidos',x.id)}</article>`).join(''):'<p class="empty">No hay partidos registrados. Agrega el primero cuando esté confirmado.</p>';
const sorted=[...players].sort((a,b)=>val(b.goles)-val(a.goles));$('statsList').innerHTML=sorted.length?sorted.map(x=>`<article class="card"><span class="tag">#${esc(x.numero)} · ${esc(x.posicion)}</span><h3>${esc(x.nombre)}</h3><p>⚽ ${val(x.goles)} goles · 🎯 ${val(x.asistencias)} asistencias</p></article>`).join(''):'<p class="empty">Sin estadísticas.</p>';
$('fantasyList').innerHTML=[...players].sort((a,b)=>val(b.valor)-val(a.valor)).map(x=>`<article class="card"><span class="tag">VALOR FICTICIO</span><h3>${esc(x.nombre)}</h3><div class="value">$${val(x.valor).toFixed(1)} M</div><p>${esc(x.posicion)} · #${esc(x.numero)}</p>${edit('jugadores',x.id)}</article>`).join('')||'<p class="empty">Sin valores todavía.</p>';
$('auditList').innerHTML=audits.length?audits.map(a=>`<article><b>${esc(a.accion)} · ${esc(a.tabla)}</b><small>${esc(a.editor||'Sistema')} · ${new Date(a.fecha).toLocaleString('es-MX')}</small></article>`).join(''):'<p class="empty">No hay cambios registrados todavía.</p>';
$('authBtn').textContent=canEdit()?'Salir':'Ingresar';document.querySelectorAll('.editAction').forEach(b=>b.textContent=canEdit()?'+ '+({noticias:'Publicar noticia',jugadores:'Agregar jugador',partidos:'Registrar partido'}[b.dataset.type]):'🔒 '+({noticias:'Publicar noticia',jugadores:'Agregar jugador',partidos:'Registrar partido'}[b.dataset.type]));
}
const definitions={
  noticias:[
    ['titulo','Título','text',true],
    ['contenido','Contenido','textarea',true],
    ['fecha','Fecha','date',true]
  ],
  jugadores:[
    ['nombre','Nombre','text',true],
    ['numero','Dorsal','number',true],
    ['posicion','Posición','select',true],
    ['goles','Goles','number',true],
    ['asistencias','Asistencias','number',true],
    ['valor','Valor Fantasy (millones)','number',true],
    ['velocidad','Velocidad','number',true],
['tiro','Tiro','number',true],
['pase','Pase','number',true],
['regate','Regate','number',true],
['defensa','Defensa','number',true],
['fisico','Físico','number',true],
    ['foto_url','URL de fotografía','text',false]
  ],
  partidos:[
    ['rival','Rival','text',true],
    ['fecha','Fecha','date',true],
    ['lugar','Lugar','text',false],
    ['goles_favor','Goles de Therians','number',false],
    ['goles_contra','Goles del rival','number',false]
  ]
};
function openEdit(type,id){
  if(!online){
    alert('Primero configura Supabase.');
    return;
  }

  if(!canEdit()){
    $('authDialog').showModal();
    return;
  }

  const item=data[type].find(
    x=>String(x.id)===String(id)
  )||{};

  editing={type,id:id||null};

  $('editTitle').textContent=
    (id?'Editar ':'Agregar ')+
    ({
      noticias:'noticia',
      jugadores:'jugador',
      partidos:'partido'
    }[type]);

  $('fields').innerHTML=definitions[type]
    .map(([key,label,kind,required])=>{

      const value=item[key]??(
        kind==='date'
          ?new Date().toISOString().slice(0,10)
          :''
      );

      let field;

      if(key==='foto_url' && type==='jugadores'){
        field=`
          <input
            type="file"
            id="playerPhotoFile"
            accept="image/jpeg,image/png,image/webp"
          >
          <input
            type="hidden"
            name="foto_url"
            value="${esc(value)}"
          >
          <img
            id="playerPhotoPreview"
            src="${esc(value)}"
            style="
              display:${value?'block':'none'};
              width:130px;
              height:150px;
              object-fit:cover;
              border-radius:12px;
              margin-top:10px;
            "
          >
        `;
      }else if(kind==='textarea'){
        field=`<textarea name="${key}"
          ${required?'required':''}>${esc(value)}</textarea>`;
      }else if(kind==='select'){
        field=`<select name="${key}">
          ${['Portero','Defensa','Medio','Delantero']
            .map(v=>`<option ${v===value?'selected':''}>${v}</option>`)
            .join('')}
        </select>`;
      }else{
        field=`<input
          name="${key}"
          type="${kind}"
          value="${esc(value)}"
          ${kind==='number'
  ? (['velocidad','tiro','pase','regate','defensa','fisico'].includes(key)
      ? 'step="1" min="0" max="99"'
      : 'step="any" min="0"')
  : ''}
          ${required?'required':''}
        >`;
      }

      return `<label>${label}${field}</label>`;
    }).join('');

  if(type==='jugadores'){
    const photoInput=$('playerPhotoFile');
    const preview=$('playerPhotoPreview');

    photoInput.addEventListener('change',()=>{
      const file=photoInput.files[0];
      if(!file)return;

      if(!['image/jpeg','image/png','image/webp']
        .includes(file.type)){
        alert('Selecciona una imagen JPG, PNG o WebP.');
        photoInput.value='';
        return;
      }

      if(file.size>5*1024*1024){
        alert('La fotografía debe pesar menos de 5 MB.');
        photoInput.value='';
        return;
      }

      preview.src=URL.createObjectURL(file);
      preview.style.display='block';
    });
  }

  $('editMsg').textContent='';
  $('editDialog').showModal();
}
async function load(){if(!online){render();return}try{const results=await Promise.all([...tables.map(t=>db.from(t).select('*').order('created_at',{ascending:false})),db.rpc('ver_historial_tafc')]);for(let i=0;i<tables.length;i++){if(results[i].error)throw results[i].error;data[tables[i]]=results[i].data||[]}if(results[3].error)throw results[3].error;audits=results[3].data||[];$('notice').textContent='Datos compartidos en línea. Para editar, inicia sesión con tu correo.'}catch(e){$('notice').textContent='No se pudieron cargar los datos compartidos: '+e.message}render()}
$('authBtn').onclick=async()=>{if(!online){alert('Primero configura Supabase siguiendo README.md.');return}if(canEdit()){await db.auth.signOut();session=null;render()}else $('authDialog').showModal()};
$('authForm').onsubmit=async e=>{e.preventDefault();if(!online)return;const email=$('email').value.trim();$('authMsg').textContent='Enviando...';const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});$('authMsg').textContent=error?error.message:'Revisa tu correo para abrir el enlace de acceso.'};
$('editForm').onsubmit=async e=>{
  e.preventDefault();

  if(!editing||!canEdit())return;

  const saveButton=e.target.querySelector(
    'button[type="submit"]'
  );

  const form=new FormData(e.target);
  const record={};

  for(const [key,,kind] of definitions[editing.type]){
    const v=String(form.get(key)||'').trim();

    record[key]=kind==='number'
      ?(v===''?null:Number(v))
      :v||null;
  }

  saveButton.disabled=true;
  $('editMsg').textContent='Guardando cambios...';

  try{
    if(editing.type==='jugadores'){
      const photoInput=$('playerPhotoFile');
      const file=photoInput?.files?.[0];

      if(file){
        const allowed=[
          'image/jpeg',
          'image/png',
          'image/webp'
        ];

        if(!allowed.includes(file.type)){
          throw new Error('Formato de imagen no permitido.');
        }

        if(file.size>5*1024*1024){
          throw new Error('La imagen supera los 5 MB.');
        }

        const extension={
          'image/jpeg':'jpg',
          'image/png':'png',
          'image/webp':'webp'
        }[file.type];

        const fileName=
          crypto.randomUUID()+'.'+extension;

        $('editMsg').textContent='Subiendo fotografía...';

        const {error:uploadError}=await db.storage
          .from('Jugadores')
          .upload(fileName,file,{
            contentType:file.type,
            upsert:false
          });

        if(uploadError)throw uploadError;

        const {data:urlData}=db.storage
          .from('Jugadores')
          .getPublicUrl(fileName);

        record.foto_url=urlData.publicUrl;
      }
    }

    $('editMsg').textContent='Guardando jugador...';

    const {error}=editing.id
      ?await db.from(editing.type)
        .update(record)
        .eq('id',editing.id)
      :await db.from(editing.type)
        .insert(record);

    if(error)throw error;

    $('editDialog').close();
    await load();

  }catch(error){
    $('editMsg').textContent=
      'Error: '+error.message;
  }finally{
    saveButton.disabled=false;
  }
};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('.editAction').forEach(b=>b.onclick=()=>openEdit(b.dataset.type));document.body.addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)openEdit(b.dataset.edit,b.dataset.id)});
if(online){db.auth.getSession().then(({data:s})=>{session=s.session;render()});db.auth.onAuthStateChange((_event,s)=>{session=s;render()})}load();
})();
