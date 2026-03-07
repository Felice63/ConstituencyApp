# Agent Guidelines


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

## API Endpoints

### GET /api/constituents
Get all constituents (ordered by most recent first).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "wardNumber": 5,
    "householdSize": 4,
    "createdAt": "2024-01-01 12:00:00"
  }
]
```

### POST /api/constituents
Create a new constituent.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "wardNumber": 5,
  "householdSize": 4
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "wardNumber": 5,
  "householdSize": 4,
  "createdAt": "2024-01-01 12:00:00"
}
```

### PUT /api/constituents/:id
Update an existing constituent.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "address": "456 Oak Ave",
  "wardNumber": 3,
  "householdSize": 2
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "address": "456 Oak Ave",
  "wardNumber": 3,
  "householdSize": 2,
  "createdAt": "2024-01-01 12:00:00"
}
```

### DELETE /api/constituents/:id
Delete a constituent.

**Response:** `204 No Content`

## Database Schema

**Table: constituents**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `firstName` (TEXT, NOT NULL)
- `lastName` (TEXT, NOT NULL)
- `address` (TEXT, NOT NULL)
- `wardNumber` (INTEGER, NOT NULL)
- `householdSize` (INTEGER, NOT NULL)
- `createdAt` (TEXT, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
