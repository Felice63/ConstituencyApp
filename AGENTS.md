# Agent Guidelines

## Commands

### Initial Setup
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### Build
```bash
# Frontend
cd frontend
npm run build
```

### Lint
```bash
# Frontend
cd frontend
npm run lint
```

### Test
```bash
# Backend
npm test

# Frontend
cd frontend
npm test
```

### Dev Server
```bash
# Backend (runs on port 3000)
npm start

# Frontend (runs on port 5173, in separate terminal)
cd frontend
npm run dev
```

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express 4.21**: Web framework
- **better-sqlite3**: SQLite database driver
- **CORS**: Cross-origin resource sharing middleware

### Frontend
- **React 18.2**: Frontend framework
- **Vite 5.0**: Build tool and dev server
- **Material-UI 5.14**: Component library
- **Material Icons**: Icon library
- **Emotion**: CSS-in-JS styling

## Code Conventions

### Backend
- CommonJS modules (type: "commonjs")
- RESTful API design
- Error handling with try-catch blocks
- Input validation on all endpoints
- Use prepared statements for SQL queries

### Frontend
- Use functional components with hooks
- JSX extension for React components
- ES modules (type: "module")
- Material-UI components for consistent UI
- Async/await for API calls
- Comprehensive form validation
- User-friendly error messages

## Project Structure
```
.
├── server.js           # Express server
├── database.js         # SQLite database setup
├── package.json        # Backend dependencies
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service layer
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   ├── public/         # Static assets
│   ├── index.html      # HTML template
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Frontend dependencies
```
