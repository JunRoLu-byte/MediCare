# ⚠️ IMPORTANTE: Configuración de Variables de Entorno

## 🔧 Pasos Rápidos para Configurar

### 1️⃣ Crear el archivo `.env.local`

En la raíz de tu proyecto (donde está `package.json`), crea un archivo llamado `.env.local`

**Ubicación exacta**: `c:\Users\rolu1\Desktop\AI-Antigra\my-app\.env.local`

### 2️⃣ Agregar las siguientes líneas

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-key-aqui
```

### 3️⃣ Obtener tus credenciales de Supabase

1. Ve a https://supabase.com
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto (o usa uno existente)
4. Ve a **Settings** ⚙️ → **API**
5. Copia:
   - **Project URL** → Pégalo en `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Pégalo en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4️⃣ Reiniciar el servidor

```bash
# Detén el servidor (Ctrl + C en la terminal)
# Luego reinicia:
npm run dev
```

## ✅ Verificar que funciona

1. Abre http://localhost:3000
2. Haz clic en "Crear Cuenta Nueva"
3. Completa el formulario
4. Si ves un mensaje de éxito, ¡está funcionando! 🎉

## 🚨 Errores Comunes

### "supabaseUrl is required"
- El archivo `.env.local` no existe o está mal ubicado
- Asegúrate de que esté en la raíz del proyecto

### "Invalid API credentials"
- Las credenciales son incorrectas
- Verifica que copiaste correctamente la URL y la key

### Los cambios no se reflejan
- Reinicia el servidor de desarrollo
- Limpia el caché: elimina la carpeta `.next` y reinicia

## 📝 Ejemplo de archivo `.env.local` completo

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzQ1Njc4OSwiZXhwIjoxOTM5MDMyNzg5fQ.ejemplo-de-key-muy-larga
```

---

**Nota**: El archivo `.env.local` NO debe compartirse públicamente ni subirse a Git (ya está en `.gitignore`)
