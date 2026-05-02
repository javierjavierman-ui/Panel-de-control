#!/bin/bash
echo "============================================="
echo "  SKILL: CARGAR USUARIOS EN SUPABASE"
echo "============================================="

# 1. Comprobar si existe el archivo de correos
if [ ! -f "usuarios.csv" ]; then
    echo "❌ ERROR: No se encuentra el archivo 'usuarios.csv'."
    echo "Por favor, crea un archivo llamado usuarios.csv en esta carpeta con un email por línea."
    exit 1
fi

# 2. Comprobar si existe el script de Node
if [ ! -f "importar.js" ]; then
    echo "❌ ERROR: No se encuentra el script 'importar.js'."
    echo "Asegúrate de tener el archivo importar.js en esta carpeta."
    exit 1
fi

# 3. Instalar la librería de Supabase si no está instalada
if [ ! -d "node_modules/@supabase/supabase-js" ]; then
    echo "📦 Instalando la librería de Supabase..."
    npm install @supabase/supabase-js
else
    echo "✅ Librería de Supabase ya instalada."
fi

# 4. Ejecutar la importación
echo "🚀 Iniciando proceso de importación masiva..."
node importar.js

echo "============================================="
echo "  PROCESO FINALIZADO"
echo "============================================="
