import { Injectable } from '@nestjs/common';

interface Task {
  id: string;
  callback: () => void;
  interval: number;
  nextRun: number;
  maxRuns: number;
  currentRuns: number;
  timerId: NodeJS.Timeout;
}

@Injectable()
export class Scheduler {
  tasks: Map<string, Task>;
  running: boolean;

  constructor() {
    this.tasks = new Map();
    this.running = false;
  }

  // Schedule a task to run at specific intervals
  public scheduleTask({
    taskId,
    callback,
    interval,
    options = {},
  }: {
    taskId: string;
    callback: () => void;
    interval: number;
    options: Record<string, any>;
  }) {
    if (this.tasks.has(taskId)) {
      throw new Error(`Task with ID ${taskId} already exists`);
    }

    const {
      startTime = Date.now(),
      maxRuns = null,
      immediate = false,
    } = options;

    const task: Task = {
      id: taskId,
      callback,
      interval,
      nextRun: startTime,
      maxRuns,
      currentRuns: 0,
      timerId: null,
    };

    this.tasks.set(taskId, task);
    this.running = true;

    if (immediate) {
      this._executeTask(task);
    }

    this._scheduleNextRun(task);
    return taskId;
  }

  // Schedule a one-time task
  scheduleOnce({
    taskId,
    callback,
    delay,
  }: {
    taskId: string;
    callback: () => void;
    delay: number;
  }) {
    return this.scheduleTask({
      taskId,
      callback,
      interval: null,
      options: {
        startTime: Date.now() + delay,
        maxRuns: 1,
      },
    });
  }

  // Cancel a scheduled task
  cancelTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      if (task.timerId) {
        clearTimeout(task.timerId);
      }
      this.tasks.delete(taskId);
      return true;
    }
    return false;
  }

  // Pause all scheduled tasks
  pause() {
    if (this.running) {
      this.running = false;
      for (const task of this.tasks.values()) {
        if (task.timerId) {
          clearTimeout(task.timerId);
          task.timerId = null;
        }
      }
    }
  }

  // Resume all scheduled tasks
  resume() {
    if (!this.running) {
      this.running = true;
      for (const task of this.tasks.values()) {
        this._scheduleNextRun(task);
      }
    }
  }

  // Get information about a specific task
  getTaskInfo(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    return {
      id: task.id,
      nextRun: new Date(task.nextRun),
      runsCompleted: task.currentRuns,
      maxRuns: task.maxRuns,
      interval: task.interval,
    };
  }

  // Private method to execute a task
  _executeTask(task: Task) {
    try {
      task.callback();
      task.currentRuns++;
    } catch (error) {
      console.error(`Error executing task ${task.id}:`, error);
    }
  }

  // Private method to schedule the next run of a task
  _scheduleNextRun(task: Task) {
    if (!this.running) return;

    if (task.maxRuns && task.currentRuns >= task.maxRuns) {
      this.cancelTask(task.id);
      return;
    }

    const now = Date.now();
    const delay = Math.max(0, task.nextRun - now);

    task.timerId = setTimeout(() => {
      this._executeTask(task);

      if (task.interval) {
        task.nextRun = Date.now() + task.interval;
        this._scheduleNextRun(task);
      }
    }, delay);
  }
}
