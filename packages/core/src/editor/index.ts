import { BlockSet } from "blocks-kit-delta";

import { LOG_LEVEL, Logger } from "../log";
import { Reflect } from "../reflect";
import { EditorState } from "../state";
import { DATA_TYPE_KEY, EDITOR_STATE } from "../state/utils/constant";
import { DEFAULT_BLOCK_SET_LIKE } from "./constant";
import type { EditorOptions } from "./types";

export class Editor {
  public blockSet: BlockSet;
  public readonly logger: Logger;
  public readonly state: EditorState;
  public readonly reflect: Reflect;
  private container: HTMLDivElement;

  constructor(options: EditorOptions) {
    const { blockSet = new BlockSet(DEFAULT_BLOCK_SET_LIKE), logLevel = LOG_LEVEL.ERROR } = options;
    this.blockSet = blockSet;
    this.logger = new Logger(logLevel);
    this.container = document.createElement("div");
    this.container.setAttribute(DATA_TYPE_KEY, "placeholder");
    this.state = new EditorState(this);
    this.reflect = new Reflect();
  }

  public onMount(container: HTMLDivElement) {
    this.container = container;
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container.setAttribute(DATA_TYPE_KEY, "editable");
    this.state.renderEditableDOM();
  }

  public destroy() {
    this.state.destroy();
  }

  public getContainer() {
    return this.container;
  }
}
