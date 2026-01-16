# Constituents Frontend

React frontend application for managing constituent information with Material-UI.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

```bash
cd frontend
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

Make sure the backend API server is running on `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

- **Editable Table Interface**: Click edit to modify existing constituents
- **Add New Constituents**: Use the "Add New" button to create new entries
- **Form Validation**: All fields include validation rules:
  - First Name: Required, minimum 2 characters, letters only
  - Last Name: Required, minimum 2 characters, letters only
  - Address: Required, minimum 5 characters
  - Ward Number: Required, integer between 1 and 50
  - Household Size: Required, integer between 1 and 50
- **Delete with Confirmation**: Delete button with confirmation dialog
- **Real-time Updates**: Changes are immediately reflected after save
- **Error Handling**: User-friendly error messages for failed operations

## API Integration

The frontend communicates with the backend API through:
- `GET /api/constituents` - Fetch all constituents
- `POST /api/constituents` - Create new constituent
- `PUT /api/constituents/:id` - Update existing constituent
- `DELETE /api/constituents/:id` - Delete constituent

The Vite dev server is configured to proxy API requests to `http://localhost:3000`.
