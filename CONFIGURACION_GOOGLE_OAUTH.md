# 🔧 SOLUCIÓN: Configurar Google OAuth en Supabase

## ⚠️ ERROR ACTUAL
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

**Causa**: El provider de Google NO está habilitado en Supabase.

---

## 📋 INFORMACIÓN NECESARIA

### **Tu Proyecto Supabase**
- **Project ID**: `czwutcdsmwzhuxghsqdd`
- **URL**: `https://czwutcdsmwzhuxghsqdd.supabase.co`

### **Tu Cliente Google OAuth**
- **Client ID**: `26234055600-qe7t17jmiq7f37u08vt3gl8vjppsd1dv.apps.googleusercontent.com`
- **Client Secret**: ⚠️ NECESITAS OBTENER ESTO DE GOOGLE CLOUD CONSOLE

---

## 🎯 PASO 1: HABILITAR GOOGLE EN SUPABASE

### **1.1 Ir al Dashboard de Supabase**
```
https://supabase.com/dashboard/project/czwutcdsmwzhuxghsqdd/auth/providers
```

### **1.2 Buscar Google Provider**
1. En el menú lateral: **Authentication** → **Providers**
2. Busca **"Google"** en la lista
3. Haz clic en **Google**

### **1.3 Habilitar y Configurar**
1. ✅ Activa el toggle **"Enable Sign in with Google"**
2. Ingresa la información:

```
┌─────────────────────────────────────────────────────────────┐
│ Google OAuth Configuration                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ Enable Sign in with Google                              │
│                                                             │
│ Client ID (for OAuth):                                     │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 26234055600-qe7t17jmiq7f37u08vt3gl8vjppsd1dv.apps.  │   │
│ │ googleusercontent.com                                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Client Secret (for OAuth):                                 │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ [PEGA AQUÍ EL CLIENT SECRET DE GOOGLE]              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Authorized Client IDs:                                     │
│ (Opcional - déjalo vacío por ahora)                       │
│                                                             │
│ [Save] [Cancel]                                            │
└─────────────────────────────────────────────────────────────┘
```

3. Haz clic en **Save**

### **1.4 Copiar Callback URL**
Después de guardar, Supabase te mostrará una **Callback URL**:
```
https://czwutcdsmwzhuxghsqdd.supabase.co/auth/v1/callback
```
**⚠️ COPIA ESTA URL - LA NECESITARÁS EN EL PASO 2**

---

## 🔑 PASO 2: OBTENER CLIENT SECRET DE GOOGLE

### **2.1 Ir a Google Cloud Console**
```
https://console.cloud.google.com/apis/credentials
```

### **2.2 Encontrar tu OAuth Client**
1. Busca el cliente con ID: `26234055600-qe7t17jmiq7f37u08vt3gl8vjppsd1dv`
2. Haz clic en el nombre del cliente (ícono de lápiz para editar)

### **2.3 Copiar Client Secret**
1. Verás el **Client Secret** en la página
2. Haz clic en el ícono de copiar
3. **Pégalo en Supabase** (Paso 1.3)

### **2.4 Configurar Redirect URIs**
En la misma página de Google Cloud Console:

1. Busca la sección **"Authorized redirect URIs"**
2. Haz clic en **"+ ADD URI"**
3. Agrega las siguientes URLs:

```
✅ Para Producción (Supabase):
https://czwutcdsmwzhuxghsqdd.supabase.co/auth/v1/callback

✅ Para Desarrollo Local:
http://localhost:3001
http://localhost:3000
```

4. Haz clic en **Save**

---

## 🌐 PASO 3: CONFIGURAR ORÍGENES AUTORIZADOS DE JAVASCRIPT

En la misma página de Google Cloud Console:

### **3.1 Authorized JavaScript Origins**
1. Busca la sección **"Authorized JavaScript origins"**
2. Haz clic en **"+ ADD URI"**
3. Agrega las siguientes URLs:

```
✅ Para Producción (Supabase):
https://czwutcdsmwzhuxghsqdd.supabase.co

✅ Para Desarrollo Local:
http://localhost:3001
http://localhost:3000
```

4. Haz clic en **Save**

---

## 📝 RESUMEN DE CONFIGURACIÓN

### **En Supabase Dashboard:**
```
Authentication → Providers → Google

✅ Enable Sign in with Google: ON
Client ID: 26234055600-qe7t17jmiq7f37u08vt3gl8vjppsd1dv.apps.googleusercontent.com
Client Secret: [TU_CLIENT_SECRET_DE_GOOGLE]
```

### **En Google Cloud Console:**
```
APIs & Services → Credentials → OAuth 2.0 Client

Authorized JavaScript origins:
  • https://czwutcdsmwzhuxghsqdd.supabase.co
  • http://localhost:3001
  • http://localhost:3000

Authorized redirect URIs:
  • https://czwutcdsmwzhuxghsqdd.supabase.co/auth/v1/callback
  • http://localhost:3001
  • http://localhost:3000
```

---

## ✅ VERIFICACIÓN

Después de completar TODOS los pasos:

1. **Espera 30-60 segundos** para que los cambios se propaguen
2. Ve a: http://localhost:3001/login
3. Haz clic en **"Continuar con Google"**
4. Deberías ver la pantalla de selección de cuenta de Google
5. Después de seleccionar tu cuenta, deberías redirigir a `/home`

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### **Error: "Unsupported provider: provider is not enabled"**
✅ **SOLUCIÓN**: Habilita Google en Supabase (Paso 1)

### **Error: "Invalid redirect URI"**
✅ **SOLUCIÓN**: Verifica que las Redirect URIs en Google Cloud coincidan exactamente con las de Supabase

### **Error: "Invalid client"**
✅ **SOLUCIÓN**: Verifica que el Client ID y Client Secret estén correctos en Supabase

### **Error: "Access blocked: This app's request is invalid"**
✅ **SOLUCIÓN**: Agrega los Authorized JavaScript origins en Google Cloud Console (Paso 3)

---

## 📋 CHECKLIST

Marca cada paso cuando lo completes:

- [ ] **Paso 1.1**: Ir al Dashboard de Supabase
- [ ] **Paso 1.2**: Encontrar Google Provider
- [ ] **Paso 1.3**: Habilitar Google y pegar Client ID
- [ ] **Paso 2.1**: Ir a Google Cloud Console
- [ ] **Paso 2.2**: Encontrar OAuth Client
- [ ] **Paso 2.3**: Copiar Client Secret y pegarlo en Supabase
- [ ] **Paso 2.4**: Agregar Redirect URIs en Google Cloud
- [ ] **Paso 3.1**: Agregar JavaScript Origins en Google Cloud
- [ ] **Paso 1.3**: Hacer clic en Save en Supabase
- [ ] **Paso 2.4**: Hacer clic en Save en Google Cloud
- [ ] **Verificación**: Probar el login con Google

---

## 🎯 URLS IMPORTANTES

### **Supabase**
- Dashboard: https://supabase.com/dashboard/project/czwutcdsmwzhuxghsqdd
- Auth Providers: https://supabase.com/dashboard/project/czwutcdsmwzhuxghsqdd/auth/providers

### **Google Cloud Console**
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent

### **Tu Aplicación**
- Desarrollo: http://localhost:3001/login
- Callback Supabase: https://czwutcdsmwzhuxghsqdd.supabase.co/auth/v1/callback

---

## 💡 NOTA IMPORTANTE

El **Client Secret** es información sensible y NO debe compartirse públicamente ni incluirse en el código. Solo se configura en:
1. ✅ Supabase Dashboard (seguro)
2. ✅ Google Cloud Console (seguro)
3. ❌ Código fuente (NUNCA)
4. ❌ GitHub (NUNCA)

---

**¿Necesitas ayuda para obtener el Client Secret?**

Si no tienes acceso a Google Cloud Console o no puedes encontrar el Client Secret, necesitarás:
1. Acceso al proyecto de Google Cloud que creó este OAuth Client
2. Permisos de "Editor" o "Owner" en el proyecto
3. Si no tienes acceso, contacta al administrador del proyecto
