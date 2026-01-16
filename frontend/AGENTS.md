# Frontend Agent Guidelines

## Commands

### Initial Setup
```bash
cd frontend
npm install
```

### Dev Server
```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173

### Build
```bash
cd frontend
npm run build
```

### Lint
```bash
cd frontend
npm run lint
```

### Preview Production Build
```bash
cd frontend
npm run preview
```

## Tech Stack
- **React 18.2**: Frontend framework
- **Vite 5.0**: Build tool and dev server
- **Material-UI 5.14**: Component library
- **Material Icons**: Icon library
- **Emotion**: CSS-in-JS styling (required by MUI)

## Code Conventions
- Use functional components with hooks
- Use JSX extension for React components (.jsx)
- ES modules (type: "module" in package.json)
- Use Material-UI components for consistent UI
- Follow React best practices for state management
- Use async/await for API calls
- Handle errors gracefully with user-friendly messages

## Component Structure
- Components are in `src/components/`
- Services (API calls) are in `src/services/`
- Main entry point is `src/main.jsx`
- App component in `src/App.jsx`

## API Integration
The Vite dev server proxies `/api` requests to `http://localhost:3000` (backend).
