# ⚔️ Work OS

A local-first personal operating system for managing projects, weekly sprints, goals and execution.

Construido para resolver un problema real: información y trabajo dispersos entre Notion, documentos, chats con IA y decenas de proyectos. Work OS centraliza todo en Áreas → Proyectos → Tareas, organizadas en sprints de 7 días.

## Features (v0.1)

- 🏠 Home con resumen del sprint actual y prioridades del día
- ⚔️ Vista "Hoy" con Quick Add (`Crear landing Fiverr P1 #ingresos`)
- 📋 Kanban con 6 columnas (Backlog → Esta semana → Hoy → En curso → Revisión → Hecho) y drag & drop
- 🧬 6 Áreas: Negocio, Marca, Finanzas, Empresa, Proyectos, Personal
- 💾 Persistencia real en SQLite (nada se pierde al cerrar la app)
- 🖥️ 100% local: sin cuentas, sin nube, sin backend externo

## Stack

- **Cliente**: React + TypeScript + Vite + Tailwind + Zustand
- **Servidor**: Node + Express + TypeScript + better-sqlite3
- Todo corre en `localhost`, sin dependencias externas ni autenticación

## Por qué

Construido para resolver mi propio problema: información y trabajo dispersos entre Notion, documentos y docenas de chats con IA. En vez de forzar una herramienta genérica a adaptarse a mi forma de trabajar, construí exactamente el sistema que necesitaba.

## Estado

🚧 En desarrollo activo — v0.1

## Instalación

Requisitos: Node.js 18+ instalado.

```bash
# 1. Instalar dependencias del servidor
cd server
npm install

# 2. Instalar dependencias del cliente
cd ../client
npm install
```

## Cómo correrlo

Necesitas dos terminales (o usa el script raíz con concurrently, ver abajo).

**Terminal 1 — servidor (API + SQLite, puerto 4000):**
```bash
cd server
npm run dev
```

**Terminal 2 — cliente (Vite, puerto 5173):**
```bash
cd client
npm run dev
```

Abre **http://localhost:5173**

### Opción con un solo comando

Desde la raíz del proyecto:
```bash
npm install
npm run dev
```
Esto instala `concurrently` en la raíz y levanta cliente + servidor juntos.

## Datos

La base de datos SQLite se crea automáticamente en `server/data/work-os.db` la primera vez que corres el servidor, con las 5 áreas y el sprint actual ya cargados. Ese archivo es tu única fuente de verdad — respáldalo si quieres, pero no necesitas ninguna cuenta ni sincronización para no perder tus datos.

## Roadmap (fuera de v0.1)

- Focus Mode
- Sprint review semanal (¿qué funcionó / qué no / qué cambio?)
- Objetivos (goals) por área con progreso
- Vista "Semana"
- Time tracking
