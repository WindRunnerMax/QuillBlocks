/** 提交任务 */
export type Invoke<T> = () => Promise<T>;
/** 调度任务 */
export type Task<T> = { fn: Invoke<T>; resolve: (v: T) => void };

export class Schedule<T = void> {
  /** 最大任务数 */
  private maxTask: number;
  /** 正在执行的任务 */
  private running: Invoke<T>[];
  /** 等待执行的任务 */
  private pending: Task<T>[];

  /**
   * 构造函数
   * @param maxTask
   */
  constructor(maxTask: number) {
    this.maxTask = maxTask;
    this.running = [];
    this.pending = [];
  }

  /**
   * 提交任务
   * @param {Invoke<T>} fn
   * @returns {Promise<T>}
   */
  public commit(fn: Invoke<T>): Promise<T> {
    return new Promise<T>(resolve => {
      if (this.running.length < this.maxTask) {
        this.dispatch({ fn, resolve });
      } else {
        this.pending.push({ fn, resolve });
      }
    });
  }

  /**
   * 触发任务
   * @param {Task<T>} task
   * @returns {void}
   */
  public dispatch(task: Task<T>): void {
    this.running.push(task.fn);
    task.fn().then(res => {
      task.resolve(res);
      this.running = this.running.filter(fn => fn !== task.fn);
      const nextTask = this.pending.length && this.pending.shift();
      nextTask && this.dispatch(nextTask);
    });
  }
}
