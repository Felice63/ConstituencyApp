# Constituents Management Application

A full-stack application for managing constituent information with a Node.js/Express REST API backend and React frontend.

## Installation

### Backend

```bash
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Backend Server

```bash
npm start
```

The server will start on port 3000 (or the PORT environment variable if set).


### Frontend Development Server

Create a new terminal while the backend is running. 
Click the plus sign in the terminal. The navigate to the `frontend` directory and run dev

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

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
