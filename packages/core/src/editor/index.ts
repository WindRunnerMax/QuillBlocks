import { Delta } from "block-kit-delta";

import { Clipboard } from "../clipboard";
import { Event } from "../event";
import { History } from "../history";
import { Input } from "../input";
import { LOG_LEVEL, Logger } from "../log";
import { Model } from "../model";
import { Plugin } from "../plugin";
import { Schema } from "../schema";
import { Selection } from "../selection";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/types";
import type { EditorOptions } from "./types";
import { BLOCK_LIKE } from "./utils/constant";

export class Editor {
  /** 编辑容器 */
  private container: HTMLDivElement;
  /** 配置模块 */
  public schema: Schema;
  /** 事件模块 */
  public event: Event;
  /** 模型映射 */
  public model: Model;
  /** 输入模块 */
  public input: Input;
  /** 日志模块 */
  public logger: Logger;
  /** 插件模块 */
  public plugin: Plugin;
  /** 状态模块 */
  public state: EditorState;
  /** 选区模块 */
  public selection: Selection;
  /** 历史模块 */
  public history: History;
  /** 剪贴板模块 */
  public clipboard: Clipboard;

  constructor(options: EditorOptions = {}) {
    const { delta = new Delta(BLOCK_LIKE), logLevel = LOG_LEVEL.ERROR, schema = {} } = options;
    this.container = document.createElement("div");
    this.container.setAttribute("data-type", "mock");
    this.logger = new Logger(logLevel);
    this.schema = new Schema(schema);
    this.model = new Model();
    this.state = new EditorState(this, delta);
    this.event = new Event(this);
    this.selection = new Selection(this);
    this.input = new Input(this);
    this.plugin = new Plugin(this);
    this.history = new History(this);
    this.clipboard = new Clipboard(this);
  }

  /**
   * 挂载编辑器
   * @param container
   */
  public onMount(container: HTMLDivElement) {
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container = container;
    this.state.set(EDITOR_STATE.MOUNTED, true);
    this.event.bind();
  }

  /**
   * 获取编辑器容器
   * @returns
   */
  public getContainer() {
    return this.container;
  }

  /**
   * 销毁编辑器
   */
  public destroy() {
    this.event.unbind();
    this.input.destroy();
    this.model.destroy();
    this.plugin.destroy();
    this.selection.destroy();
    this.history.destroy();
    this.clipboard.destroy();
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }
}
