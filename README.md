# MediCare - Sistema de Consultorio Médico

Sistema de gestión para consultorio médico construido con Next.js 16 y Supabase.

## 🚀 Características

- ✅ **Autenticación Completa**: Login y registro con Supabase
- ✅ **Diseño Moderno**: UI inspirada en Facebook con tema médico
- ✅ **Validación de Formularios**: Validación en tiempo real
- ✅ **Dashboard Protegido**: Acceso solo para usuarios autenticados
- ✅ **Responsive**: Diseño adaptable a todos los dispositivos
- ✅ **TypeScript**: Código con tipado estático
- ✅ **Animaciones**: Transiciones y efectos suaves

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratuita)
- npm o yarn

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**

Sigue las instrucciones detalladas en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Resumen rápido:
- Crea un proyecto en [supabase.com](https://supabase.com)
- Obtén tu Project URL y anon key
- Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
my-app/
├── src/
│   ├── app/
│   │   ├── login/          # Página de inicio de sesión
│   │   ├── signup/         # Página de registro
│   │   ├── dashboard/      # Dashboard protegido
│   │   ├── globals.css     # Estilos globales
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página principal (redirige a login)
│   └── lib/
│       └── supabase.ts     # Cliente y helpers de Supabase
├── public/                 # Archivos estáticos
├── .env.local             # Variables de entorno (crear este archivo)
├── package.json
└── README.md
```

## 🎨 Páginas Disponibles

### `/login` - Inicio de Sesión
- Formulario de login con email y contraseña
- Validación de credenciales
- Redirección al dashboard después del login
- Enlace a página de registro

### `/signup` - Registro
- Formulario completo de registro
- Validación en tiempo real
- Integración con Supabase Auth
- Confirmación por email (opcional)

### `/dashboard` - Panel de Control
- Acceso solo para usuarios autenticados
- Información del usuario
- Tarjetas de servicios médicos
- Botón de cerrar sesión

## 🔐 Seguridad

- Las contraseñas se manejan de forma segura con Supabase Auth
- Row Level Security (RLS) en Supabase
- Variables de entorno para credenciales sensibles
- Rutas protegidas con verificación de autenticación

## 🎯 Funcionalidades Implementadas

### Autenticación
- [x] Registro de usuarios
- [x] Inicio de sesión
- [x] Cierre de sesión
- [x] Protección de rutas
- [ ] Recuperación de contraseña (próximamente)
- [ ] Verificación de email (próximamente)

### UI/UX
- [x] Diseño responsive
- [x] Animaciones y transiciones
- [x] Validación de formularios
- [x] Mensajes de error/éxito
- [x] Estados de carga

## 🚧 Próximas Características

- [ ] Sistema de citas médicas
- [ ] Gestión de pacientes
- [ ] Historial médico
- [ ] Recetas digitales
- [ ] Chat con especialistas
- [ ] Notificaciones por email
- [ ] Panel de administración
- [ ] Reportes y estadísticas

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Autenticación**: Supabase Auth
- **Base de Datos**: Supabase (PostgreSQL)
- **Estilos**: CSS Modules
- **Fuentes**: Google Fonts (Inter)

## 📝 Scripts Disponibles

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

## 🐛 Solución de Problemas

### Error: "Invalid API credentials"
- Verifica que las variables de entorno en `.env.local` sean correctas
- Asegúrate de reiniciar el servidor después de crear `.env.local`

### Error: "User not found"
- Verifica que el usuario esté registrado en Supabase
- Revisa la configuración de autenticación en Supabase

### La página no carga
- Verifica que el servidor esté corriendo (`npm run dev`)
- Revisa la consola del navegador para errores
- Asegúrate de que todas las dependencias estén instaladas

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Autenticación de Supabase](https://supabase.com/docs/guides/auth)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, por favor abre un issue en el repositorio.

---

Desarrollado con ❤️ para mejorar la gestión de consultorios médicos
