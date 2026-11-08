(()=>{'use strict';
const conf=window.TAFC_CONFIG||{}, online=Boolean(conf.supabaseUrl&&conf.supabaseAnonKey&&window.supabase);
const db=online?window.supabase.createClient(conf.supabaseUrl,conf.supabaseAnonKey):null;
const sample={noticias:[{id:'demo-n1',titulo:'Bienvenidos a Therians F.C.',contenido:'Este es el nuevo hogar digital del equipo. Próximamente publicaremos noticias y actualizaciones reales.',fecha:'2026-11-03'}],jugadores:[{id:'demo-j1',nombre:'Jugador de ejemplo',numero:7,posicion:'Delantero',goles:0,asistencias:0,valor:8.5}],partidos:[]};
const tables=['noticias','jugadores','partidos','galeria'];let data=structuredClone(sample),audits=[],session=null,editing=null;
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=n=>Number(n||0),date=s=>s?new Date(s+'T12:00:00').toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'}):'Sin fecha';
function canEdit(){
  const ADMIN_UID = '698b854b-f9f3-4c54-99db-b56cad92e6c0';
  return session?.user?.id === ADMIN_UID;
}
function render(){
  const galeria = data.galeria || [];

$('galeriaList').innerHTML = galeria.length
  ? galeria.map(item => `
      <article class="galeriaItem">
        ${item.tipo === 'videos'
          ? `<video controls preload="metadata"
               src="${esc(item.archivo_url || '')}"></video>`
          : `<img src="${esc(item.archivo_url || '')}"
               alt="${esc(item.titulo || 'Galería TAFC')}"
               class="galeriaFotoAmpliable"
               loading="lazy">`
        }

       <div class="galeriaInfo">
  <h3>${esc(item.titulo || 'Momento TAFC')}</h3>
  <p>${esc(item.descripcion || '')}</p>

  ${canEdit() ? `
 <div class="galeriaActions">
  <button
    type="button"
    class="galeriaEditarBtn"
    data-edit="galeria"
    data-id="${esc(item.id)}">
    ✏️ Editar publicación
  </button>

  <button
    type="button"
    class="galeriaEliminarBtn"
    data-delete-galeria="${esc(item.id)}">
    🗑️ Eliminar publicación
  </button>
</div>
  ` : ''}
</div>

      </article>
    `).join('')
    : `<div class="empty">
       Próximamente, los mejores momentos de Therians F.C.
     </div>`;

  const players=data.jugadores,
        matches=data.partidos,
        played=matches.filter(m=>m.goles_favor!=null&&m.goles_contra!=null),
        wins=played.filter(m=>val(m.goles_favor)>val(m.goles_contra)).length;
$('metrics').innerHTML=[['Jugadores',players.length],['Partidos',played.length],['Victorias',wins],['Goles',played.reduce((s,m)=>s+val(m.goles_favor),0)]].map(([l,n])=>`<div class="metric"><strong>${n}</strong><span>${l}</span></div>`).join('');
const edit=(t,id)=>canEdit()?`<button class="edit" data-edit="${t}" data-id="${esc(id)}">Editar ↗</button>`:'';
$('newsList').innerHTML=data.noticias.length?data.noticias.map(x=>`<article class="card"><span class="tag">${date(x.fecha)}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.contenido)}</p>${edit('noticias',x.id)}</article>`).join(''):'<p class="empty">Todavía no hay noticias.</p>';

$('playersList').innerHTML = players.length
  ? [...players].sort((a, b) => {
  const orden = {
    DELANTERO: 1,
    MEDIO: 2,
    DEFENSA: 3,
    PORTERO: 4
  };

  const posicionA = String(a.posicion || "").trim().toUpperCase();
  const posicionB = String(b.posicion || "").trim().toUpperCase();

  return (orden[posicionA] ?? 99) - (orden[posicionB] ?? 99);
}).map(x => `
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


$('matchesList').innerHTML=matches.length?matches.map(x=>`<article class="card"><span class="tag">${date(x.fecha)}</span><h3>Therians F.C. vs ${esc(x.rival)}</h3><div class="value">${x.goles_favor==null?'—':val(x.goles_favor)} : ${x.goles_contra==null?'—':val(x.goles_contra)}</div><p>${esc(x.lugar||'Sede por confirmar')}</p><button type="button" class="verAlineacion" data-partido-id="${esc(x.id)}">⚽ Ver alineación</button>${edit('partidos',x.id)}</article>`).join(''):'<p class="empty">No hay partidos registrados. Agrega el primero cuando esté confirmado.</p>';
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
  ['hora','Hora del partido','time',false],
  ['lugar','Lugar','text',false],
  ['estado','Estado del partido','select',true],
  ['duracion_minutos','Duración (minutos)','number',true],
  ['goles_favor','Goles de Therians','number',false],
  ['goles_contra','Goles del rival','number',false]
],

galeria:[
  ['titulo','Título','text',true],
  ['descripcion','Descripción','textarea',false],
  ['tipo','Tipo de publicación','text',true]
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
  (id ? 'Editar ' : 'Agregar ') +
  ({
    noticias: 'noticia',
    jugadores: 'jugador',
    partidos: 'partido',
    galeria: 'publicación de galería'
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
  const opciones = key === 'estado'
    ? ['programado','finalizado']
    : ['Portero','Defensa','Medio','Delantero'];

  field=`<select name="${key}">
    ${opciones.map(v=>`
      <option value="${v}" ${v===value?'selected':''}>
        ${v === 'programado' ? 'Programado'
          : v === 'finalizado' ? 'Finalizado'
          : v}
      </option>
    `).join('')}
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
async function load(){if(!online){render();return}try{const results=await Promise.all([...tables.map(t=>db.from(t).select('*').order('created_at',{ascending:false})),db.rpc('ver_historial_tafc')]);for(let i=0;i<tables.length;i++){if(results[i].error)throw results[i].error;data[tables[i]]=results[i].data||[]}if(results[4].error)throw results[4].error;audits=results[4].data||[];$('notice').textContent='Datos compartidos en línea. Para editar, inicia sesión con tu correo.'}catch(e){$('notice').textContent='No se pudieron cargar los datos compartidos: '+e.message}render()}
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

const galeriaForm = document.getElementById('galeriaForm');

if (galeriaForm) {
  galeriaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!online || !canEdit()) {
      alert('Debes iniciar sesión para publicar.');
      return;
    }

    const msg = document.getElementById('galeriaMsg');
    const boton = galeriaForm.querySelector('button[type="submit"]');
    const archivo = document.getElementById('galeriaArchivo').files[0];
    const form = new FormData(galeriaForm);

    if (!archivo) return;

    const tipo = form.get('tipo');
    const esVideo = tipo === 'videos';

    if (esVideo ? !['video/mp4', 'video/webm'].includes(archivo.type)
                : !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(archivo.type)) {
      msg.textContent = 'El archivo no corresponde al tipo de publicación.';
      return;
    }

    if (archivo.size > 20 * 1024 * 1024) {
      msg.textContent = 'El archivo no debe superar los 20 MB.';
      return;
    }

    boton.disabled = true;
    msg.textContent = 'Subiendo archivo...';

    try {
      const extension = archivo.name.split('.').pop().toLowerCase();
      const nombre = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await db.storage
        .from('galeria-tafc')
        .upload(nombre, archivo, {
          contentType: archivo.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = db.storage
        .from('galeria-tafc')
        .getPublicUrl(nombre);

      msg.textContent = 'Guardando publicación...';

      const { error } = await db.from('galeria').insert({
        titulo: String(form.get('titulo') || '').trim(),
        descripcion: String(form.get('descripcion') || '').trim(),
        tipo: tipo,
        archivo_url: urlData.publicUrl,
        fecha: new Date().toISOString().slice(0, 10)
      });

      if (error) throw error;

      galeriaForm.reset();
      msg.textContent = '';
      document.getElementById('galeriaDialog').close();

      await load();
      alert('¡Publicación agregada correctamente!');
    } catch (error) {
      msg.textContent = 'Error al publicar: ' + error.message;
    } finally {
      boton.disabled = false;
    }
  });
}

const galeriaPublicarBtn = document.getElementById('galeriaPublicarBtn');

if (galeriaPublicarBtn) {
  galeriaPublicarBtn.addEventListener('click', () => {
    if (!canEdit()) {
      alert('Debes iniciar sesión para publicar en la galería.');
      return;
    }

    document.getElementById('galeriaDialog').showModal();
  });
}
 // VISOR DE FOTOGRAFÍAS - THERIANS F.C.

const visorGaleria = document.createElement('div');
visorGaleria.className = 'visorGaleria';

visorGaleria.innerHTML = `
  <button class="cerrarVisor" type="button">✕</button>
  <img src="" alt="Fotografía ampliada">
`;

document.body.appendChild(visorGaleria);

document.addEventListener('click', (e) => {
  const foto = e.target.closest('.galeriaFotoAmpliable');

  if (foto) {
    visorGaleria.querySelector('img').src = foto.src;
    visorGaleria.querySelector('img').alt = foto.alt;
    visorGaleria.classList.add('activo');
    return;
  }

  if (
    e.target === visorGaleria ||
    e.target.closest('.cerrarVisor')
  ) {
    visorGaleria.classList.remove('activo');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    visorGaleria.classList.remove('activo');
  }
});
// ELIMINAR PUBLICACIONES DE GALERÍA - TAFC

document.addEventListener('click', async (e) => {
  const boton = e.target.closest('[data-delete-galeria]');
  if (!boton) return;

  if (!db || !session?.user) {
    alert('Debes iniciar sesión.');
    return;
  }

  const id = boton.dataset.deleteGaleria;

  const confirmar = confirm(
    '¿Seguro que deseas eliminar esta publicación?\n\n' +
    'Esta acción no se puede deshacer.'
  );

  if (!confirmar) return;

  boton.disabled = true;
  boton.textContent = 'Eliminando...';

  try {
    const { data: eliminadas, error } = await db
      .from('galeria')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw error;

    if (!eliminadas || eliminadas.length === 0) {
      alert('No se eliminó la publicación. Verifica tus permisos de administrador.');
      return;
    }

    alert('Publicación eliminada correctamente.');

    await load();

  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    alert('No se pudo eliminar: ' + error.message);

  } finally {
    boton.disabled = false;
    boton.textContent = '🗑️ Eliminar publicación';
  }
});

  // THERIANS F.C. - Abrir y cerrar alineaciones
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.verAlineacion');
    if (!boton) return;

    const partidoId = boton.dataset.partidoId;
    const partido = (data.partidos || []).find(
      p => String(p.id) === String(partidoId)
    );

    if (!partido) {
      alert('No se encontró el partido.');
      return;
    }

    const ventana = document.getElementById('alineacionDialog');

    document.getElementById('alineacionTitulo').textContent =
      'Therians F.C. vs ' + partido.rival;

    document.getElementById('alineacionMensaje').textContent =
      'Próximamente podrás consultar y editar la alineación de este partido.';


const cancha = document.getElementById('alineacionCancha');
// Jugadores disponibles para la alineación
const jugadoresDisponibles = data.jugadores || [];

console.log(
  'Jugadores disponibles para la alineación:',
  jugadoresDisponibles.map(jugador => ({
    id: jugador.id,
    nombre: jugador.nombre,
    numero: jugador.numero,
    posicion: jugador.posicion
  }))
);
if (!cancha.querySelector('.areaPorteria')) {
  cancha.insertAdjacentHTML('afterbegin', `
    <div class="areaPorteria areaSuperior"></div>
    <div class="areaPorteria areaInferior"></div>
  `);
}
const obtenerJugadoresDisponibles = (circuloActual) => {
  const ocupados = [...cancha.querySelectorAll('.alineacionJugador')]
    .filter(circulo => circulo !== circuloActual)
    .map(circulo => circulo.dataset.jugadorId)
    .filter(Boolean);

  return jugadoresDisponibles.filter(
    jugador => !ocupados.includes(String(jugador.id))
  );
};
cancha.querySelectorAll('.alineacionJugador').forEach(circulo => {
  circulo.onclick = () => {
    const disponibles = obtenerJugadoresDisponibles(circulo);

    const opciones = disponibles.map((jugador, i) =>
      `${i + 1}. ${jugador.nombre} (#${jugador.numero})`
    ).join('\n');

    const seleccion = prompt(
      'Selecciona un jugador:\n\n' + opciones
    );

    if (seleccion === null) return;

    const indice = Number(seleccion) - 1;

    if (!Number.isInteger(indice) || !disponibles[indice]) {
      alert('Selecciona un número válido.');
      return;
    }

    const jugador = disponibles[indice];

    circulo.dataset.jugadorId = jugador.id;
    circulo.querySelector('span').textContent = jugador.nombre;
    actualizarRotaciones();
  };
});
const actualizarRotaciones = () => {
  const rotaciones = obtenerJugadoresDisponibles(null);

  const contenedor = document.getElementById('alineacionRotaciones');

  contenedor.innerHTML = rotaciones.length
    ? rotaciones.map(jugador => `
        <div class="tarjetaRotacion">
          <img
            src="${jugador.foto_url || ''}"
            alt=""
            class="fotoRotacion"
          >
          <div>
            <strong>${jugador.nombre}</strong>
            <p>#${jugador.numero} · ${jugador.posicion}</p>
          </div>
        </div>
      `).join('')
    : '<p class="muted">No hay jugadores en rotación.</p>';
};

actualizarRotaciones();

    ventana.showModal();
  });

  document.getElementById('cerrarAlineacion')
    .addEventListener('click', () => {
      document.getElementById('alineacionDialog').close();
    });
      
})();
