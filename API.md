# Task List REST API Documentation

A RESTful API for managing users, task lists, and tasks built with Express and TypeScript.

## Getting Started

### Installation

```bash
npm install
```

### Running the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev

# Run the CLI version
npm run cli
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Root

#### Get API Information
```
GET /
```

Returns API documentation and available endpoints.

---

## User Endpoints

### Get All Users
```
GET /api/users
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "taskList": {
      "id": 1,
      "tasks": [...]
    }
  }
]
```

### Get User by ID
```
GET /api/users/:id
```

**Parameters:**
- `id` (number) - User ID

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "taskList": {
    "id": 1,
    "tasks": [...]
  }
}
```

### Search Users by Name
```
GET /api/users/search?name=<search_term>
```

**Query Parameters:**
- `name` (string) - Search term for user name

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "taskList": {...}
  }
]
```

### Create New User
```
POST /api/users
```

**Request Body:**
```json
{
  "name": "John Doe"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "name": "John Doe",
  "taskList": {
    "id": 1,
    "tasks": []
  }
}
```

### Update User
```
PUT /api/users/:id
```

**Parameters:**
- `id` (number) - User ID

**Request Body:**
```json
{
  "name": "Jane Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "taskList": {...}
}
```

### Delete User
```
DELETE /api/users/:id
```

**Parameters:**
- `id` (number) - User ID

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Task Endpoints

### Get All Tasks
```
GET /api/tasks
```

**Response:**
```json
[
  {
    "id": 1,
    "description": "Buy groceries",
    "finished": false
  }
]
```

### Get Task by ID
```
GET /api/tasks/:id
```

**Parameters:**
- `id` (number) - Task ID

**Response:**
```json
{
  "id": 1,
  "description": "Buy groceries",
  "finished": false
}
```

### Get All Tasks for a User
```
GET /api/users/:userId/tasks
```

**Parameters:**
- `userId` (number) - User ID

**Response:**
```json
[
  {
    "id": 1,
    "description": "Buy groceries",
    "finished": false
  },
  {
    "id": 2,
    "description": "Walk the dog",
    "finished": true
  }
]
```

### Create Task for User
```
POST /api/users/:userId/tasks
```

**Parameters:**
- `userId` (number) - User ID

**Request Body:**
```json
{
  "description": "Buy groceries"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "description": "Buy groceries",
  "finished": false
}
```

### Update Task Description
```
PUT /api/tasks/:id
```

**Parameters:**
- `id` (number) - Task ID

**Request Body:**
```json
{
  "description": "Buy groceries and cook dinner"
}
```

**Response:**
```json
{
  "id": 1,
  "description": "Buy groceries and cook dinner",
  "finished": false
}
```

### Mark Task as Finished
```
PATCH /api/tasks/:id/finish
```

**Parameters:**
- `id` (number) - Task ID

**Response:**
```json
{
  "id": 1,
  "description": "Buy groceries",
  "finished": true
}
```

### Mark Task as Unfinished
```
PATCH /api/tasks/:id/unfinish
```

**Parameters:**
- `id` (number) - Task ID

**Response:**
```json
{
  "id": 1,
  "description": "Buy groceries",
  "finished": false
}
```

### Delete Task
```
DELETE /api/tasks/:id
```

**Parameters:**
- `id` (number) - Task ID

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

## Task List Endpoints

### Get Task List by ID
```
GET /api/tasklists/:id
```

**Parameters:**
- `id` (number) - Task List ID

**Response:**
```json
{
  "id": 1,
  "tasks": [
    {
      "id": 1,
      "description": "Buy groceries",
      "finished": false
    }
  ]
}
```

### Get Task List for User
```
GET /api/users/:userId/tasklist
```

**Parameters:**
- `userId` (number) - User ID

**Response:**
```json
{
  "id": 1,
  "tasks": [
    {
      "id": 1,
      "description": "Buy groceries",
      "finished": false
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid user ID"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch users",
  "details": {...}
}
```

---

## Example Usage with curl

### Create a new user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

### Get all users
```bash
curl http://localhost:3000/api/users
```

### Create a task for a user
```bash
curl -X POST http://localhost:3000/api/users/1/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": "Buy groceries"}'
```

### Get all tasks for a user
```bash
curl http://localhost:3000/api/users/1/tasks
```

### Mark a task as finished
```bash
curl -X PATCH http://localhost:3000/api/tasks/1/finish
```

### Delete a task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

---

## Example Usage with JavaScript/Fetch

```javascript
// Create a new user
const createUser = async (name) => {
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  return await response.json();
};

// Get all tasks for a user
const getUserTasks = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}/tasks`);
  return await response.json();
};

// Create a task for a user
const createTask = async (userId, description) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });
  return await response.json();
};

// Mark task as finished
const finishTask = async (taskId) => {
  const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/finish`, {
    method: 'PATCH',
  });
  return await response.json();
};
```

---

## Technology Stack

- **Express**: Web framework for Node.js
- **TypeScript**: Type-safe JavaScript
- **Prisma**: Database ORM
- **SQLite**: Database
- **CORS**: Cross-Origin Resource Sharing support

---

## Database Schema

The application uses the following database schema:

```prisma
model User {
  id       Int        @id @default(autoincrement())
  name     String
  taskList TaskList?
}

model TaskList {
  id       Int    @id @default(autoincrement())
  userId   Int    @unique
  user     User   @relation(fields: [userId], references: [id])
  tasks    Task[]
}

model Task {
  id          Int      @id @default(autoincrement())
  finished    Boolean
  description String
  taskListId  Int
  taskList    TaskList @relation(fields: [taskListId], references: [id])
}
```

---

## Notes

- Each user automatically gets a task list when created
- All timestamps are handled automatically by the database
- CORS is enabled for all origins in development
- The API uses JSON for all request and response bodies

