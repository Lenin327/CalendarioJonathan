# Mi Agenda Diaria 🗓️

Planificador de bloques de tiempo de 30 minutos con calendario mensual.
Construido con **Angular 22** + **AWS Serverless** backend.

## Características

- 📅 **Bloques de tiempo de 30 min** (06:00 – 23:30)
- ✅ **Tareas del día** — agregar, completar, eliminar
- 📝 **Apuntes libres** del día
- 🗓️ **Calendario mensual** con indicadores de días con datos
- 🌙 **Modo oscuro / claro**
- 📤 **Export/Import** JSON para respaldo
- ☁️ **Sincronización con AWS** (DynamoDB via API Gateway + Lambda)
- 📱 **Responsive** — PC, laptop, tablet, móvil (web)

## Arquitectura

```
SCREAM Architecture + Atomic Design
src/app/
├── core/          → Services, Models (singletons)
├── shared/        → Atoms, Molecules, Organisms (reutilizables)
└── features/      → Pages/Views (Agenda)
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 22 (standalone) |
| Estilos | Vanilla CSS con Custom Properties |
| State | Angular Signals |
| Backend | AWS Lambda + API Gateway |
| DB | AWS DynamoDB |
| Deploy | GitHub Pages |

## Desarrollo local

```bash
npm install
npm start           # Servidor en http://localhost:4200
```

## Deploy a GitHub Pages

1. Configura tu API Gateway URL en `src/environments/environment.prod.ts`
2. Ejecuta:
```bash
npm run deploy
```

## Setup AWS Backend

Ver [`aws_setup_guide.md`](aws_setup_guide.md) para instrucciones paso a paso.

## Estructura de carpetas

```
aws-backend/lambdas/    → Funciones Lambda (Node.js)
src/
├── app/
│   ├── core/services/  → AgendaService, ApiService, ThemeService
│   ├── core/models/    → DayData, Task, TimeSlot
│   └── shared/components/
│       ├── atoms/      → Btn, Badge, Toast, Spinner
│       ├── molecules/  → DateNavigator, TaskItem, TimeSlotItem
│       └── organisms/  → Header, Calendar, TimeBlocks, TasksPanel, NotesPanel, SyncModal
└── environments/       → Dev (LocalStorage) / Prod (AWS)
```
