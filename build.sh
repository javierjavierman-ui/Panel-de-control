#!/bin/bash
echo "🚀 Iniciando construcción personalizada..."

# Reemplazar placeholders en script.js
sed -i "s|__SUPABASE_URL__|$SUPABASE_URL|g" script.js
sed -i "s|__SUPABASE_ANON_KEY__|$SUPABASE_ANON_KEY|g" script.js
sed -i "s|__BREVO_API_KEY__|$BREVO_API_KEY|g" script.js

# Reemplazar placeholders en importar.js
sed -i "s|__SUPABASE_URL__|$SUPABASE_URL|g" importar.js
sed -i "s|__SUPABASE_SERVICE_KEY__|$SUPABASE_SERVICE_KEY|g" importar.js

echo "✅ Reemplazo de variables completado."
