const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uvsvyelbhjhenufndbcw.supabase.co';
const SUPABASE_SERVICE_KEY = 'TU_SUPABASE_SERVICE_KEY_AQUI';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importarDesdeCSV() {
    try {
        const csvData = fs.readFileSync('usuarios.csv', 'utf-8');
        const emails = csvData.split(/\r?\n/).map(e => e.trim()).filter(e => e !== '');
        let exitos = 0;
        console.log("Importando correos a la tabla contactos...");
        for (const email of emails) {
            const { error } = await supabase.from('contactos').insert([{ email }]);
            if (!error) exitos++;
        }
        console.log(`✅ ${exitos} contactos importados con éxito a la tabla.`);
    } catch (e) { console.error(e); }
}
importarDesdeCSV();
