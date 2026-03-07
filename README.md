# Constituents Management Application

A full-stack application for managing constituent information with a Node.js/Express REST API backend and React frontend.

## Installation

***NOTE*** For backend server you need to be in the project directory, not inside any subfolder. If you're in a subfolder then to go up one folder do

```bash
cd ..
```


### Backend

```bash
npm install
```

### Frontend

```bash
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

## Running the Application

### Backend Server

Navigate back to the project directory. If you're in the `frontend` folder the do `cd ..` in the terminal to move up to the root.

Note that you can go to the terminal menu and choose `New Terminal`

```bash
npm start
```

The server will start on port 3000 (or the PORT environment variable if set).


### Frontend Development Server

Create a new terminal while the backend is running.

You can click the plus sign in the terminal. The navigate to the `frontend` directory and run dev

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

