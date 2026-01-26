# 💰 Fintrack - Gestor Financiero Personal

Una aplicación web progresiva (PWA) moderna para gestionar tus finanzas personales con IA integrada.

![Fintrack](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

## ✨ Características Principales

### 📊 Gestión Financiera
- **Registro de Transacciones**: Manual, por voz, texto natural y escaneo de recibos (OCR)
- **Categorías Personalizables**: Crea y gestiona tus propias categorías
- **Múltiples Métodos de Pago**: Efectivo, tarjeta, transferencia, etc.

### 💳 Presupuestos Inteligentes
- **Períodos Flexibles**: Diario, semanal, mensual y anual
- **Alertas Personalizadas**: Configura umbrales de 70%, 80%, 90%
- **Proyecciones**: Visualiza tu consumo promedio y días restantes
- **Auto-renovación**: Presupuestos que se renuevan automáticamente

### 🎯 Metas Financieras
- **Tipos de Metas**: Ahorro, inversión, pago de deudas
- **Seguimiento de Progreso**: Visualización en tiempo real
- **Aportes Manuales**: Registra contribuciones cuando quieras
- **Proyecciones**: Calcula el aporte mensual necesario

### 📧 Sincronización con Gmail
- **Detección Automática**: Escanea emails bancarios
- **Extracción con IA**: Gemini 2.0 extrae información financiera
- **Aprobación Manual**: Revisa antes de registrar

### 💡 Insights de IA
- **Análisis Automático**: Gemini 2.0 analiza tus patrones de gasto
- **Recomendaciones Personalizadas**: Consejos específicos para ti
- **Detección de Anomalías**: Identifica gastos inusuales

### 📈 Analytics y Reportes
- **Gráficos Interactivos**: Pie charts, line charts con Recharts
- **Reportes Personalizados**: Filtra por período
- **Exportación**: Descarga tus datos en CSV

### 🔐 Seguridad y Privacidad
- **Autenticación Segura**: Supabase Auth con OAuth
- **Row Level Security**: Tus datos solo para ti
- **Encriptación**: Tokens y datos sensibles protegidos

## 🚀 Tecnologías

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **IA**: Google Gemini 2.0 Flash, Google Cloud Vision
- **Gráficos**: Recharts
- **Animaciones**: Framer Motion
- **PWA**: next-pwa
- **Notificaciones**: Firebase Cloud Messaging

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase
- API Key de Google Gemini
- (Opcional) Firebase para notificaciones push

### Pasos

1. **Clonar el repositorio**
```bash
git clone [https://github.com/tu-usuario/fintrack.git](https://github.com/tu-usuario/fintrack.git)
cd fintrack