import { LOG_LEVEL, Logger } from "../log";
import type { EditorOptions } from "./types";

export class Editor {
  private container: HTMLDivElement;
  public logger: Logger;

  constructor(options: EditorOptions) {
    const { logLevel = LOG_LEVEL.ERROR } = options;
    this.logger = new Logger(logLevel);
    this.container = document.createElement("div");
    this.container.setAttribute("data-type", "placeholder");
  }

  public onMount(container: HTMLDivElement) {
    this.container = container;
  }

  public destroy() {}

  public getContainer() {
    return this.container;
  }
}
