# 🏥 MediCare - Sistema de Consultorio Médico

Sistema completo de gestión para consultorio médico construido con **Next.js 16**, **TypeScript** y **Supabase**.

![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green?style=for-the-badge&logo=supabase)

---

## 🌟 Características

### ✅ **Autenticación Completa**
- Registro de usuarios con validación
- Inicio de sesión seguro con Supabase
- Cierre de sesión
- Protección de rutas

### 👤 **Perfil de Usuario**
- Información personal completa
- Avatar personalizado
- Datos de contacto
- Historial de actividad

### 📊 **Dashboard Médico**
- Resumen de salud del paciente
- Estadísticas de citas y consultas
- Acciones rápidas
- Actividad reciente

### 🎨 **Diseño Premium**
- UI moderna y profesional
- Tema médico con gradientes
- Animaciones suaves
- 100% responsive

---

## 🚀 Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript 5
- **Autenticación**: Supabase Auth
- **Base de Datos**: Supabase (PostgreSQL)
- **Estilos**: CSS Modules
- **Fuentes**: Google Fonts (Inter)

---

## 📦 Instalación

### **1. Clonar el repositorio**
```bash
git clone https://github.com/JunRoLu-byte/MediCare.git
cd MediCare
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

**Obtener credenciales de Supabase:**
1. Ve a https://supabase.com/dashboard
2. Crea un proyecto o usa uno existente
3. Ve a Settings → API
4. Copia `Project URL` y `anon public` key

### **4. Configurar Supabase**

**Importante:** Desactiva la confirmación de email para desarrollo:

1. Ve a **Authentication** → **Providers** → **Email**
2. Desactiva **"Confirm email"**
3. Guarda los cambios

Ver guía completa en: [DISABLE_EMAIL_CONFIRMATION.md](./DISABLE_EMAIL_CONFIRMATION.md)

### **5. Iniciar el servidor**
```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 📁 Estructura del Proyecto

```
MediCare/
├── src/
│   ├── app/
│   │   ├── login/              # Página de inicio de sesión
│   │   ├── signup/             # Página de registro
│   │   ├── home/               # Página principal con perfil
│   │   ├── dashboard/          # Dashboard médico
│   │   ├── globals.css         # Estilos globales
│   │   └── layout.tsx          # Layout principal
│   └── lib/
│       └── supabase.ts         # Cliente de Supabase
├── public/                     # Archivos estáticos
├── .env.local                  # Variables de entorno (crear)
├── package.json
└── README.md
```

---

## 🎯 Funcionalidades

### **Autenticación**
- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Cierre de sesión
- ✅ Protección de rutas
- ✅ Validación de formularios

### **Perfil de Usuario**
- ✅ Información personal
- ✅ Avatar con inicial
- ✅ Email y teléfono
- ✅ Fecha de registro
- ✅ ID de paciente

### **Dashboard**
- ✅ Resumen de salud
- ✅ Estadísticas
- ✅ Acciones rápidas
- ✅ Actividad reciente

---

## 🔐 Seguridad

- Contraseñas encriptadas por Supabase
- Tokens JWT para sesiones
- Variables de entorno para credenciales
- Protección de rutas con middleware
- Validación de formularios

---

## 🎨 Diseño

### **Paleta de Colores**
- 🔵 Azul primario: `#0066cc`
- 🟢 Verde azulado: `#00a896`
- ⚪ Grises neutros

### **Características del Diseño**
- Gradientes modernos
- Animaciones suaves
- Efectos hover
- Sombras y profundidad
- Responsive design

---

## 📱 Responsive

La aplicación se adapta perfectamente a:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

---

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint
```

---

## 📚 Documentación Adicional

- [Configuración de Supabase](./SUPABASE_SETUP.md)
- [Desactivar Confirmación de Email](./DISABLE_EMAIL_CONFIRMATION.md)
- [Configuración de Variables de Entorno](./ENV_SETUP.md)

---

## 🚧 Próximas Características

- [ ] Sistema de citas médicas
- [ ] Historial médico completo
- [ ] Recetas digitales
- [ ] Telemedicina (video consultas)
- [ ] Chat con especialistas
- [ ] Notificaciones por email
- [ ] Panel de administración
- [ ] Reportes y estadísticas

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**JunRoLu-byte**

- GitHub: [@JunRoLu-byte](https://github.com/JunRoLu-byte)
- Proyecto: [MediCare](https://github.com/JunRoLu-byte/MediCare)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)

---

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

1. Abre un [Issue](https://github.com/JunRoLu-byte/MediCare/issues)
2. Revisa la [documentación](./SUPABASE_SETUP.md)
3. Contacta al autor

---

<div align="center">

**Desarrollado con ❤️ para mejorar la gestión de consultorios médicos**

⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐

</div>
