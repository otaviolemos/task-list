import { PrismaClient } from '@prisma/client';
import { Task, TaskList, User } from './domain';

const prisma = new PrismaClient();

// Task Repository
export class TaskRepository {
  async findById(id: number): Promise<Task | null> {
    const taskData = await prisma.task.findUnique({ where: { id } });
    if (!taskData) return null;
    
    const task = new Task(taskData.description);
    task.id = taskData.id;
    task.finished = taskData.finished;
    return task;
  }

  async findAll(): Promise<Task[]> {
    const tasksData = await prisma.task.findMany();
    return tasksData.map(taskData => {
      const task = new Task(taskData.description);
      task.id = taskData.id;
      task.finished = taskData.finished;
      return task;
    });
  }

  async findByTaskListId(taskListId: number): Promise<Task[]> {
    const tasksData = await prisma.task.findMany({
      where: { taskListId }
    });
    
    return tasksData.map(taskData => {
      const task = new Task(taskData.description);
      task.id = taskData.id;
      task.finished = taskData.finished;
      return task;
    });
  }

  async save(task: Task, taskListId: number): Promise<Task> {
    const taskData = await prisma.task.create({
      data: {
        description: task.description,
        finished: task.finished || false,
        taskList: {
          connect: { id: taskListId }
        }
      }
    });
    
    task.id = taskData.id;
    return task;
  }

  async update(task: Task): Promise<Task> {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        description: task.description,
        finished: task.finished
      }
    });
    
    return task;
  }

  async delete(id: number): Promise<boolean> {
    await prisma.task.delete({
      where: { id }
    });
    
    return true;
  }
}

// TaskList Repository
export class TaskListRepository {
  async findById(id: number): Promise<TaskList | null> {
    const taskListData = await prisma.taskList.findUnique({
      where: { id },
      include: { tasks: true }
    });
    
    if (!taskListData) return null;
    
    const taskList = new TaskList();
    taskList.id = taskListData.id;
    taskList.tasks = taskListData.tasks.map(t => {
      const task = new Task(t.description);
      task.id = t.id;
      task.finished = t.finished;
      return task;
    });
    
    return taskList;
  }

  async findByUserId(userId: number): Promise<TaskList | null> {
    const taskListData = await prisma.taskList.findFirst({
      where: { userId },
      include: { tasks: true }
    });
    
    if (!taskListData) return null;
    
    const taskList = new TaskList();
    taskList.id = taskListData.id;
    taskList.tasks = taskListData.tasks.map(t => {
      const task = new Task(t.description);
      task.id = t.id;
      task.finished = t.finished;
      return task;
    });
    
    return taskList;
  }

  async save(taskList: TaskList, userId: number): Promise<TaskList> {
    const taskListData = await prisma.taskList.create({
      data: {
        user: {
          connect: { id: userId }
        }
      }
    });
    
    taskList.id = taskListData.id;
    return taskList;
  }

  async update(taskList: TaskList): Promise<TaskList> {
    // For updating a TaskList, we typically don't update the tasks here
    // That would be handled by the TaskRepository
    await prisma.taskList.update({
      where: { id: taskList.id },
      data: { }  // No fields to update directly on TaskList
    });
    
    return taskList;
  }

  async delete(id: number): Promise<boolean> {
    // Note: This might fail if there are referential integrity constraints
    // You might want to delete associated tasks first or set up cascading deletes
    await prisma.taskList.delete({
      where: { id }
    });
    
    return true;
  }
}

// User Repository
export class UserRepository {
  async findById(id: number): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
      include: { taskList: { include: { tasks: true } } }
    });
    
    if (!userData) return null;
    
    const user = new User(userData.name);
    user.id = userData.id;
    
    if (userData.taskList) {
      const taskList = new TaskList();
      taskList.id = userData.taskList.id;
      taskList.tasks = userData.taskList.tasks.map(t => {
        const task = new Task(t.description);
        task.id = t.id;
        task.finished = t.finished;
        return task;
      });
      user.taskList = taskList;
    }
    
    return user;
  }

  async findAll(): Promise<User[]> {
    const usersData = await prisma.user.findMany({
      include: { taskList: { include: { tasks: true } } }
    });
    
    return usersData.map(userData => {
      const user = new User(userData.name);
      user.id = userData.id;
      
      if (userData.taskList) {
        const taskList = new TaskList();
        taskList.id = userData.taskList.id;
        taskList.tasks = userData.taskList.tasks.map(t => {
          const task = new Task(t.description);
          task.id = t.id;
          task.finished = t.finished;
          return task;
        });
        user.taskList = taskList;
      }
      
      return user;
    });
  }

  async save(user: User): Promise<User> {
    const userData = await prisma.user.create({
      data: {
        name: user.name,
        taskList: {
          create: {}  // Create an empty taskList for the user
        }
      },
      include: { taskList: true }
    });
    
    user.id = userData.id;
    
    // Initialize the taskList
    if (userData.taskList) {
      const taskList = new TaskList();
      taskList.id = userData.taskList.id;
      taskList.tasks = [];
      user.taskList = taskList;
    }
    
    return user;
  }

  async update(user: User): Promise<User> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name
      }
    });
    
    return user;
  }

  async delete(id: number): Promise<boolean> {
    // Note: This might fail if there are referential integrity constraints
    // You might want to delete associated taskList first or set up cascading deletes
    await prisma.user.delete({
      where: { id }
    });
    
    return true;
  }

  async findByName(name: string): Promise<User[]> {
    const usersData = await prisma.user.findMany({
      where: {
        name: {
          contains: name
        }
      },
      include: { taskList: { include: { tasks: true } } }
    });
    
    return usersData.map(userData => {
      const user = new User(userData.name);
      user.id = userData.id;
      
      if (userData.taskList) {
        const taskList = new TaskList();
        taskList.id = userData.taskList.id;
        taskList.tasks = userData.taskList.tasks.map(t => {
          const task = new Task(t.description);
          task.id = t.id;
          task.finished = t.finished;
          return task;
        });
        user.taskList = taskList;
      }
      
      return user;
    });
  }
}