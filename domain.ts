export class Task {
  finished: boolean = false
  id: number

  constructor(
    public description: string
  ) {}

  finish() {
    this.finished = true
  }

  unfinish() {
    this.finished = false
  }
}

export class TaskList {
  tasks: Task[] = []
  id: number

  add(task: Task) {
    this.tasks.push(task)
  }

  remove(task: Task) {
    this.tasks = this.tasks.filter(t => t.description !== task.description)
  }
}

export class User {
  taskList: TaskList
  id: number

  constructor(
    public name: string
  ) {}
}

// Import readline for interactive CLI
import * as readline from 'readline';
import { TaskRepository, TaskListRepository, UserRepository } from './repository';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Repositories
const userRepo = new UserRepository();
const taskListRepo = new TaskListRepository();
const taskRepo = new TaskRepository();

// Active user
let currentUser: User | null = null;

// Helper function to ask questions
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Show all tasks
async function viewAllTasks() {
  if (!currentUser || !currentUser.taskList) {
    console.log('No user logged in or no task list available.');
    return;
  }

  const taskList = await taskListRepo.findById(currentUser.taskList.id);
  if (!taskList || taskList.tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.log('\nYour Tasks:');
  taskList.tasks.forEach((task, index) => {
    const status = task.finished ? '[✓]' : '[ ]';
    console.log(`${index + 1}. ${status} ${task.description} (ID: ${task.id})`);
  });
}

// Add a new task
async function addTask() {
  if (!currentUser || !currentUser.taskList) {
    console.log('No user logged in or no task list available.');
    return;
  }

  const description = await question('Enter task description: ');
  
  if (!description.trim()) {
    console.log('Task description cannot be empty.');
    return;
  }

  const task = new Task(description);
  await taskRepo.save(task, currentUser.taskList.id);
  console.log(`Task "${description}" added successfully!`);
}

// Mark a task as finished
async function markTaskAsFinished() {
  if (!currentUser || !currentUser.taskList) {
    console.log('No user logged in or no task list available.');
    return;
  }

  await viewAllTasks();
  
  const taskIdStr = await question('Enter the ID of the task to mark as finished: ');
  const taskId = parseInt(taskIdStr);
  
  if (isNaN(taskId)) {
    console.log('Invalid task ID.');
    return;
  }

  const task = await taskRepo.findById(taskId);
  if (!task) {
    console.log('Task not found.');
    return;
  }

  task.finish();
  await taskRepo.update(task);
  console.log(`Task "${task.description}" marked as finished.`);
}

// Mark a task as unfinished
async function markTaskAsUnfinished() {
  if (!currentUser || !currentUser.taskList) {
    console.log('No user logged in or no task list available.');
    return;
  }

  await viewAllTasks();
  
  const taskIdStr = await question('Enter the ID of the task to mark as unfinished: ');
  const taskId = parseInt(taskIdStr);
  
  if (isNaN(taskId)) {
    console.log('Invalid task ID.');
    return;
  }

  const task = await taskRepo.findById(taskId);
  if (!task) {
    console.log('Task not found.');
    return;
  }

  task.unfinish();
  await taskRepo.update(task);
  console.log(`Task "${task.description}" marked as unfinished.`);
}

// Remove a task
async function removeTask() {
  if (!currentUser || !currentUser.taskList) {
    console.log('No user logged in or no task list available.');
    return;
  }

  await viewAllTasks();
  
  const taskIdStr = await question('Enter the ID of the task to remove: ');
  const taskId = parseInt(taskIdStr);
  
  if (isNaN(taskId)) {
    console.log('Invalid task ID.');
    return;
  }

  const task = await taskRepo.findById(taskId);
  if (!task) {
    console.log('Task not found.');
    return;
  }

  await taskRepo.delete(taskId);
  console.log(`Task "${task.description}" removed successfully.`);
}

// User selection (login)
async function selectUser() {
  console.log('\n=== User Selection ===');
  
  // List all users
  const users = await userRepo.findAll();
  
  if (users.length === 0) {
    console.log('No users found. Creating a new user...');
    return await createNewUser();
  }
  
  console.log('Available users:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (ID: ${user.id})`);
  });
  
  console.log(`${users.length + 1}. Create new user`);
  
  const choice = await question('Select a user (enter number) or create new: ');
  const selectedIndex = parseInt(choice) - 1;
  
  if (selectedIndex >= 0 && selectedIndex < users.length) {
    currentUser = users[selectedIndex];
    console.log(`Logged in as ${currentUser.name}`);
  } else if (selectedIndex === users.length) {
    await createNewUser();
  } else {
    console.log('Invalid selection.');
    return await selectUser();
  }
}

// Create a new user with their task list
async function createNewUser() {
  const name = await question('Enter your name: ');
  
  if (!name.trim()) {
    console.log('Name cannot be empty.');
    return await createNewUser();
  }

  const user = new User(name);
  const savedUser = await userRepo.save(user);
  
  currentUser = savedUser;
  console.log(`User "${name}" created and logged in successfully!`);
}

// Main menu function
async function showMenu() {
  console.log('\n=== TODO App ===');
  console.log('Current user:', currentUser ? currentUser.name : 'None');
  console.log('\nMenu Options:');
  console.log('1. View all tasks');
  console.log('2. Add a new task');
  console.log('3. Mark a task as finished');
  console.log('4. Mark a task as unfinished');
  console.log('5. Remove a task');
  console.log('6. Switch user');
  console.log('7. Exit');
  
  const choice = await question('Enter your choice (1-7): ');
  
  switch (choice) {
    case '1':
      await viewAllTasks();
      break;
    case '2':
      await addTask();
      break;
    case '3':
      await markTaskAsFinished();
      break;
    case '4':
      await markTaskAsUnfinished();
      break;
    case '5':
      await removeTask();
      break;
    case '6':
      await selectUser();
      break;
    case '7':
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
    default:
      console.log('Invalid option. Please try again.');
  }
  
  // Return to menu after action completes
  await showMenu();
}

// Main function
async function main() {
  try {
    console.log('Welcome to the TODO App!');
    
    // First, select a user (login)
    await selectUser();
    
    // Show the main menu
    await showMenu();
  } catch (error) {
    console.error('An error occurred:', error);
    rl.close();
  }
}
