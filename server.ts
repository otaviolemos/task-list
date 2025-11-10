import express, { Request, Response } from 'express';
import cors from 'cors';
import { Task, TaskList, User } from './domain';
import { TaskRepository, TaskListRepository, UserRepository } from './repository';
import { formatDate } from 'date-fns';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('Request made at', formatDate(Date.now(), "dd/MM/yyyy HH:MM:SS"))
  next()
})

app.use((req, res, next) => {
  const username = req.headers.username
  const password = req.headers.password

  if(username === 'otavio' && password === '1234') {
    next()
  } else {
    return res.status(401).send('Unauthorized');
  }
})

// Repositories
const userRepo = new UserRepository();
const taskListRepo = new TaskListRepository();
const taskRepo = new TaskRepository();

// ==================== USER ROUTES ====================

/**
 * GET /api/users
 * Get all users
 */
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await userRepo.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error });
  }
});

/**
 * GET /api/users/search?name=...
 * Search users by name
 */
app.get('/api/users/search', async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string;
    if (!name) {
      return res.status(400).json({ error: 'Name query parameter is required' });
    }

    const users = await userRepo.findByName(name);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users', details: error });
  }
});

/**
 * GET /api/users/:id
 * Get a user by ID
 */
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await userRepo.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error });
  }
});


/**
 * POST /api/users
 * Create a new user
 * Body: { name: string }
 */
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = new User(name);
    const savedUser = await userRepo.save(user);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error });
  }
});

/**
 * PUT /api/users/:id
 * Update a user
 * Body: { name: string }
 */
app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await userRepo.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    const updatedUser = await userRepo.update(user);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', details: error });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await userRepo.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRepo.delete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error });
  }
});

// ==================== TASK LIST ROUTES ====================

/**
 * GET /api/users/:userId/tasklist
 * Get the task list for a user
 */
app.get('/api/users/:userId/tasklist', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const taskList = await taskListRepo.findByUserId(userId);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    res.json(taskList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task list', details: error });
  }
});

/**
 * GET /api/tasklists/:id
 * Get a task list by ID
 */
app.get('/api/tasklists/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task list ID' });
    }

    const taskList = await taskListRepo.findById(id);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    res.json(taskList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task list', details: error });
  }
});

// ==================== TASK ROUTES ====================

/**
 * GET /api/tasks
 * Get all tasks
 */
app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await taskRepo.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: error });
  }
});

/**
 * GET /api/tasks/:id
 * Get a task by ID
 */
app.get('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await taskRepo.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task', details: error });
  }
});

/**
 * GET /api/users/:userId/tasks
 * Get all tasks for a specific user
 */
app.get('/api/users/:userId/tasks', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.taskList) {
      return res.json([]);
    }

    const tasks = await taskRepo.findByTaskListId(user.taskList.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: error });
  }
});

/**
 * POST /api/users/:userId/tasks
 * Create a new task for a user
 * Body: { description: string }
 */
app.post('/api/users/:userId/tasks', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.taskList) {
      return res.status(404).json({ error: 'User has no task list' });
    }

    const task = new Task(description);
    const savedTask = await taskRepo.save(task, user.taskList.id);
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task', details: error });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task description
 * Body: { description: string }
 */
app.put('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const task = await taskRepo.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.description = description;
    const updatedTask = await taskRepo.update(task);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', details: error });
  }
});

/**
 * PATCH /api/tasks/:id/finish
 * Mark a task as finished
 */
app.patch('/api/tasks/:id/finish', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await taskRepo.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.finish();
    const updatedTask = await taskRepo.update(task);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to finish task', details: error });
  }
});

/**
 * PATCH /api/tasks/:id/unfinish
 * Mark a task as unfinished
 */
app.patch('/api/tasks/:id/unfinish', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await taskRepo.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.unfinish();
    const updatedTask = await taskRepo.update(task);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to unfinish task', details: error });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await taskRepo.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskRepo.delete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', details: error });
  }
});

// ==================== ROOT ROUTE ====================

/**
 * GET /
 * API welcome message
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Task List API - TESTE 123',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get a user by ID',
        'GET /api/users/search?name=...': 'Search users by name',
        'POST /api/users': 'Create a new user',
        'PUT /api/users/:id': 'Update a user',
        'DELETE /api/users/:id': 'Delete a user',
        'GET /api/users/:userId/tasks': 'Get all tasks for a user',
        'POST /api/users/:userId/tasks': 'Create a task for a user',
        'GET /api/users/:userId/tasklist': 'Get the task list for a user'
      },
      tasks: {
        'GET /api/tasks': 'Get all tasks',
        'GET /api/tasks/:id': 'Get a task by ID',
        'PUT /api/tasks/:id': 'Update a task description',
        'PATCH /api/tasks/:id/finish': 'Mark a task as finished',
        'PATCH /api/tasks/:id/unfinish': 'Mark a task as unfinished',
        'DELETE /api/tasks/:id': 'Delete a task'
      },
      tasklists: {
        'GET /api/tasklists/:id': 'Get a task list by ID'
      }
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Task List API Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
});

export default app;

