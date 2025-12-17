# 🔐 Configuración de Google OAuth 2.0 en Supabase

## 📋 Información del Cliente Google

**Client ID**: `26234055600-qe7t17jmiq7f37u08vt3gl8vjppsd1dv.apps.googleusercontent.com`

---

## ⚙️ Pasos para Configurar Google OAuth en Supabase

### **Paso 1: Ir al Dashboard de Supabase**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: **czwutcdsmwzhuxghsqdd**

### **Paso 2: Configurar Google Provider**
1. En el menú lateral, ve a **Authentication** → **Providers**
2. Busca **Google** en la lista de providers
3. Haz clic en **Google** para abrir la configuración

### **Paso 3: Habilitar Google OAuth**
1. Activa el toggle **"Enable Google provider"**
2. Ingresa la siguiente información:

```
Client ID (for OAuth):
26234055600-qe7t17jmiq7f37u08vt3gl8vjppsd1dv.apps.googleusercontent.com

Client Secret (for OAuth):
[Debes obtener esto de Google Cloud Console]
```

### **Paso 4: Configurar Redirect URL**
Supabase te mostrará una **Callback URL** que debes agregar en Google Cloud Console.

La URL será algo como:
```
https://czwutcdsmwzhuxghsqdd.supabase.co/auth/v1/callback
```

### **Paso 5: Configurar en Google Cloud Console**
1. Ve a https://console.cloud.google.com
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Encuentra tu OAuth 2.0 Client ID
5. En **Authorized redirect URIs**, agrega:
   ```
   https://czwutcdsmwzhuxghsqdd.supabase.co/auth/v1/callback
   ```
6. También agrega para desarrollo local:
   ```
   http://localhost:3001/auth/callback
   http://localhost:3000/auth/callback
   ```

### **Paso 6: Obtener Client Secret**
1. En Google Cloud Console, copia el **Client Secret**
2. Pégalo en Supabase en el campo **Client Secret**

### **Paso 7: Guardar Configuración**
1. Haz clic en **Save** en Supabase
2. Espera unos segundos para que los cambios se apliquen

---

## ✅ Verificación

Después de configurar:

1. Ve a http://localhost:3001/login
2. Deberías ver el botón **"Continuar con Google"**
3. Al hacer clic, te redirigirá a la página de login de Google
4. Después de autenticarte, volverás a la aplicación en `/home`

---

## 🔍 Solución de Problemas

### **Error: "Invalid redirect URI"**
- Verifica que la URL de callback en Google Cloud Console coincida exactamente con la de Supabase
- Asegúrate de incluir tanto la URL de producción como las de desarrollo

### **Error: "Client ID not found"**
- Verifica que el Client ID esté correctamente copiado en Supabase
- No debe tener espacios al inicio o final

### **Error: "Client Secret invalid"**
- Regenera el Client Secret en Google Cloud Console
- Cópialo nuevamente en Supabase

---

## 📝 Notas Importantes

1. **Client Secret**: Por seguridad, el Client Secret NO debe estar en el código. Solo se configura en Supabase.

2. **Redirect URLs**: Deben coincidir exactamente entre Google Cloud Console y Supabase.

3. **Scopes**: Supabase automáticamente solicita los scopes necesarios (email, profile).

4. **Usuarios Nuevos**: Cuando un usuario inicia sesión con Google por primera vez, se crea automáticamente una cuenta en Supabase.

5. **Metadata**: La información del perfil de Google (nombre, email, foto) se guarda automáticamente en `user_metadata`.

---

## 🎯 Flujo de Autenticación

```
1. Usuario hace clic en "Continuar con Google"
   ↓
2. Redirige a Google para autenticación
   ↓
3. Usuario autoriza la aplicación
   ↓
4. Google redirige a Supabase callback URL
   ↓
5. Supabase crea/actualiza el usuario
   ↓
6. Redirige a /home con sesión activa
```

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard**: https://supabase.com/dashboard/project/czwutcdsmwzhuxghsqdd
- **Google Cloud Console**: https://console.cloud.google.com
- **Documentación Supabase OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-google

---

**¿Ya configuraste Google OAuth en Supabase?**

Si sí, el botón de Google debería funcionar correctamente en http://localhost:3001/login
