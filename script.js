// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
// Sustituye estos valores con los de tu proyecto en Supabase
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

// Inicializamos el cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDisplay = document.getElementById('user-email-display');

// ==========================================
// CONTROL DE AUTENTICACIÓN
// ==========================================

// Comprobar si hay una sesión activa al cargar la página
async function checkSession() {
    // Si no se han configurado las claves, no hacemos la comprobación
    if (SUPABASE_URL === '[TU_URL]') {
        console.warn("Por favor, configura tu SUPABASE_URL y SUPABASE_ANON_KEY en script.js");
        showLogin();
        return;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        showDashboard(session.user);
    } else {
        showLogin();
    }

    // Escuchar cambios de estado (login, logout)
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            showDashboard(session.user);
        } else if (event === 'SIGNED_OUT') {
            showLogin();
        }
    });
}

// Iniciar sesión con email y contraseña
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Modo demostración si no hay URL configurada
    if (SUPABASE_URL === '[TU_URL]') {
        alert("Modo demostración: Faltan las claves de Supabase. Accediendo simuladamente...");
        showDashboard({ email: email });
        return;
    }

    loginBtn.textContent = 'Accediendo...';
    loginBtn.disabled = true;
    loginError.classList.add('hidden');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginError.textContent = 'Credenciales inválidas o error de conexión.';
        loginError.classList.remove('hidden');
        loginBtn.textContent = 'Acceder';
        loginBtn.disabled = false;
    } else {
        // El onAuthStateChange manejará la transición al dashboard
        loginForm.reset();
        loginBtn.textContent = 'Acceder';
        loginBtn.disabled = false;
    }
});

// Cerrar sesión
logoutBtn.addEventListener('click', async () => {
    if (SUPABASE_URL === '[TU_URL]') {
        showLogin();
        return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
});

// ==========================================
// UI / NAVEGACIÓN
// ==========================================

function showDashboard(user) {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    if(user && user.email) {
        userEmailDisplay.textContent = user.email;
    }
    
    // Cargar datos al entrar al dashboard
    if (SUPABASE_URL !== '[TU_URL]') {
        cargarUsuarios();
        cargarAvisos();
        cargarEventos();
        cargarDocumentos();
    }
}

function showLogin() {
    dashboardContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginError.classList.add('hidden');
}

// Navegación del menú lateral
function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(sec => sec.classList.add('hidden'));

    // Remover clase active del menú
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => item.classList.remove('active'));

    // Mostrar sección actual
    document.getElementById(`section-${sectionId}`).classList.remove('hidden');

    // Cerrar menú en móvil tras hacer clic
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Marcar menú como activo
    const currentLink = document.querySelector(`a[onclick="showSection('${sectionId}')"]`);
    if(currentLink) {
        currentLink.parentElement.classList.add('active');
        
        // Actualizar el título en la barra superior
        const titleText = currentLink.textContent.trim();
        document.getElementById('current-section-title').textContent = titleText;
    }
}

// Iniciar aplicación y eventos
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('mobile-open');
        });
    }
});

// ==========================================
// LÓGICA DE USUARIOS / CONTACTOS
// ==========================================
async function cargarUsuarios() {
    const { data, error } = await supabase.from('contactos').select('*').order('fecha_registro', { ascending: false });
    if (error) { console.error("Error al cargar usuarios:", error); return; }
    
    const lista = document.getElementById('lista-usuarios');
    if (!lista) return;
    lista.innerHTML = '';
    
    data.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-item user';
        li.innerHTML = `
            <div class="item-content">
                <strong><i class="fas fa-envelope"></i> ${user.email}</strong>
                <p>Añadido el ${new Date(user.fecha_registro).toLocaleDateString()}</p>
            </div>
            <button onclick="eliminarRegistro('contactos', '${user.id}')" class="btn-delete">Eliminar</button>
        `;
        lista.appendChild(li);
    });
}

// ==========================================
// LÓGICA DE AVISOS
// ==========================================
async function cargarAvisos() {
    const { data, error } = await supabase.from('avisos').select('*').order('fecha', { ascending: false });
    if (error) { console.error("Error al cargar avisos:", error); return; }
    
    const lista = document.getElementById('lista-avisos');
    lista.innerHTML = '';
    
    data.forEach(aviso => {
        const li = document.createElement('li');
        li.className = 'list-item aviso';
        li.innerHTML = `
            <div class="item-content">
                <strong>${aviso.titulo}</strong>
                <p>${aviso.mensaje}</p>
                <small>${new Date(aviso.fecha).toLocaleString()}</small>
            </div>
            <button onclick="eliminarRegistro('avisos', '${aviso.id}')" class="btn-delete">Eliminar</button>
        `;
        lista.appendChild(li);
    });
}

async function enviarCorreoBrevo(titulo, mensaje, destinatarios, esPrueba) {
    const htmlMsg = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
            ${esPrueba ? '<div style="background: #f39c12; color: white; padding: 5px 10px; text-align: center; font-weight: bold; margin-bottom: 15px; border-radius: 4px;">ESTO ES UNA PRUEBA DEL PANEL</div>' : ''}
            <h2 style="color: #4a69bd;">${titulo}</h2>
            <p style="font-size: 16px;">${mensaje.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">Recibes este correo porque estás suscrito a los avisos de IAparaSeniors.</p>
        </div>`;

    const bodyData = {
        sender: { email: 'javier@iaparaseniors.org', name: 'IAparaSeniors' },
        subject: esPrueba ? `[PRUEBA] ${titulo}` : titulo,
        htmlContent: htmlMsg
    };

    if (esPrueba) {
        bodyData.to = [{ email: 'javier@iaparaseniors.org', name: 'Javier' }];
    } else {
        bodyData.to = [{ email: 'javier@iaparaseniors.org', name: 'Javier' }];
        bodyData.bcc = destinatarios;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': '__BREVO_API_KEY__', // Sustituir por tu clave real o usar variables de entorno
            'content-type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error de Brevo');
    }
}

async function probarAviso() {
    const titulo = document.getElementById('aviso-titulo').value;
    const mensaje = document.getElementById('aviso-mensaje').value;
    if (!titulo || !mensaje) { alert("Por favor rellena ambos campos para poder probar."); return; }

    const btn = document.querySelector('button[onclick="probarAviso()"]');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Enviando prueba...";

    try {
        await enviarCorreoBrevo(titulo, mensaje, [], true);
        alert("¡Prueba enviada! Revisa el buzón de javier@iaparaseniors.org");
    } catch (err) {
        console.error(err);
        alert("Hubo un problema enviando la prueba: " + err.message);
    }

    btn.disabled = false;
    btn.textContent = originalText;
}

async function crearAviso() {
    const titulo = document.getElementById('aviso-titulo').value;
    const mensaje = document.getElementById('aviso-mensaje').value;
    if (!titulo || !mensaje) { alert("Por favor rellena ambos campos."); return; }

    if (!confirm("⚠️ ¿Estás completamente seguro de enviar este aviso a TODOS los suscriptores? Esta acción no se puede deshacer.")) return;

    const btn = document.querySelector('button[onclick="crearAviso()"]');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Obteniendo contactos...";

    try {
        // 1. Obtener la lista de contactos de Supabase
        const { data: contactos, error: dbError } = await supabase.from('contactos').select('email');
        if (dbError || !contactos || contactos.length === 0) {
            throw new Error("No hay contactos en la agenda o error de conexión.");
        }

        const destinatarios = contactos.map(c => ({ email: c.email }));
        btn.textContent = `Enviando a ${destinatarios.length} personas...`;

        // 2. Enviar los correos masivos mediante Brevo
        await enviarCorreoBrevo(titulo, mensaje, destinatarios, false);

        // 3. Guardar el aviso en el historial de Supabase (Panel)
        const { error: insertError } = await supabase.from('avisos').insert([{ titulo, mensaje }]);
        if (insertError) throw insertError;

        alert(`¡Aviso publicado y enviado por correo a ${destinatarios.length} personas con éxito!`);
        document.getElementById('aviso-titulo').value = '';
        document.getElementById('aviso-mensaje').value = '';
        cargarAvisos();

    } catch (err) {
        console.error(err);
        alert("Hubo un problema: " + err.message);
    }

    btn.disabled = false;
    btn.textContent = originalText;
}

// ==========================================
// LÓGICA DE EVENTOS
// ==========================================
async function cargarEventos() {
    const { data, error } = await supabase.from('eventos').select('*').order('fecha', { ascending: true });
    if (error) { console.error("Error al cargar eventos:", error); return; }
    
    const lista = document.getElementById('lista-eventos');
    lista.innerHTML = '';
    
    data.forEach(evento => {
        const estadoColor = evento.estado === 'publicado' ? '#10b981' : '#f59e0b';
        const li = document.createElement('li');
        li.className = 'list-item evento';
        li.innerHTML = `
            <div class="item-content">
                <strong>${evento.titulo} <span style="background: ${estadoColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px; vertical-align: middle;">${evento.estado}</span></strong>
                <p>${evento.descripcion || ''}</p>
                <small>${evento.fecha ? new Date(evento.fecha).toLocaleString() : 'Sin fecha'}</small>
            </div>
            <button onclick="eliminarRegistro('eventos', '${evento.id}')" class="btn-delete">Eliminar</button>
        `;
        lista.appendChild(li);
    });
}

async function crearEvento() {
    const titulo = document.getElementById('evento-titulo').value;
    const descripcion = document.getElementById('evento-desc').value;
    const fecha = document.getElementById('evento-fecha').value;
    const estado = document.getElementById('evento-estado').value;
    if (!titulo) { alert("El título es obligatorio."); return; }

    const { error } = await supabase.from('eventos').insert([{ 
        titulo, 
        descripcion, 
        fecha: fecha ? new Date(fecha).toISOString() : null, 
        estado 
    }]);
    
    if (error) { alert("Error al añadir evento"); } else {
        document.getElementById('evento-titulo').value = '';
        document.getElementById('evento-desc').value = '';
        document.getElementById('evento-fecha').value = '';
        cargarEventos();
    }
}

// ==========================================
// LÓGICA DE DOCUMENTACIÓN
// ==========================================
async function cargarDocumentos() {
    const { data, error } = await supabase.from('documentos').select('*').order('fecha_subida', { ascending: false });
    if (error) { console.error("Error al cargar docs:", error); return; }
    
    const lista = document.getElementById('lista-documentos');
    lista.innerHTML = '';
    
    data.forEach(doc => {
        const li = document.createElement('li');
        li.className = 'list-item doc';
        
        // Obtener URL pública (asume bucket público)
        const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(doc.ruta_archivo);
        
        li.innerHTML = `
            <div class="item-content">
                <strong><i class="fas fa-file"></i> ${doc.nombre}</strong>
                <small>${new Date(doc.fecha_subida).toLocaleString()}</small>
            </div>
            <div>
                <a href="${publicUrlData.publicUrl}" target="_blank" class="btn-download">Descargar</a>
                <button onclick="eliminarDocumento('${doc.id}', '${doc.ruta_archivo}')" class="btn-delete">Eliminar</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

async function subirDocumento() {
    const nombreDoc = document.getElementById('doc-nombre').value;
    const inputArchivo = document.getElementById('doc-archivo');
    const statusText = document.getElementById('doc-status');
    const btnSubir = document.getElementById('btn-subir-doc');

    if (!nombreDoc || inputArchivo.files.length === 0) { alert("Introduce un nombre y selecciona un archivo."); return; }

    const archivo = inputArchivo.files[0];
    const extension = archivo.name.split('.').pop();
    const nombreArchivoSeguro = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const rutaEnStorage = `public/${nombreArchivoSeguro}`;

    btnSubir.disabled = true;
    statusText.textContent = "Subiendo archivo al servidor...";
    statusText.style.color = "blue";

    const { error: uploadError } = await supabase.storage.from('documentos').upload(rutaEnStorage, archivo);
    if (uploadError) {
        console.error("Error subiendo el archivo:", uploadError);
        statusText.textContent = "Error al subir el archivo.";
        statusText.style.color = "red";
        btnSubir.disabled = false;
        return;
    }

    statusText.textContent = "Guardando información en base de datos...";
    const { error: dbError } = await supabase.from('documentos').insert([{ nombre: nombreDoc, ruta_archivo: rutaEnStorage }]);

    if (dbError) {
        console.error("Error guardando en la BBDD:", dbError);
        statusText.textContent = "Error al enlazar el documento.";
        statusText.style.color = "red";
    } else {
        statusText.textContent = "¡Documento subido correctamente!";
        statusText.style.color = "green";
        document.getElementById('doc-nombre').value = '';
        inputArchivo.value = '';
        setTimeout(() => statusText.textContent = '', 3000);
        cargarDocumentos();
    }
    btnSubir.disabled = false;
}

// ==========================================
// FUNCIONES GENÉRICAS (BORRAR)
// ==========================================
async function eliminarRegistro(tabla, id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (error) {
        alert("Error al eliminar");
    } else {
        if (tabla === 'avisos') cargarAvisos();
        if (tabla === 'eventos') cargarEventos();
        if (tabla === 'contactos') cargarUsuarios();
    }
}

async function eliminarDocumento(id, ruta_archivo) {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return;
    
    // 1. Eliminar de Storage
    const { error: storageError } = await supabase.storage.from('documentos').remove([ruta_archivo]);
    if (storageError) { console.error("Error eliminando archivo del storage:", storageError); }
    
    // 2. Eliminar de Base de datos
    const { error: dbError } = await supabase.from('documentos').delete().eq('id', id);
    if (dbError) { alert("Error al eliminar registro de la base de datos"); }
    else { cargarDocumentos(); }
}
