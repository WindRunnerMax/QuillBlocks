import type { CMDFunc, CMDPayload, EditorCMD } from "./types";

export class Command {
  /** 命令 Map */
  protected commands: EditorCMD;

  /**
   * 构造函数
   */
  constructor() {
    this.commands = {};
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.commands = {};
  }

  /**
   * 获取所有命令
   */
  public get() {
    return this.commands;
  }

  /**
   * 注册命令
   * @param key
   * @param fn
   */
  public register(key: string, fn: CMDFunc) {
    this.commands[key] = fn;
  }

  /**
   * 执行命令
   * @param key
   * @param data
   */
  public exec(key: string, data: CMDPayload) {
    return this.commands[key] && this.commands[key](data);
  }
}
