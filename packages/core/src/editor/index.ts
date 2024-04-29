import { BlockSet } from "blocks-kit-delta";

import { Event } from "../event";
import { LOG_LEVEL, Logger } from "../log";
import { DATA_TYPE_KEY } from "../model/modules/property";
import { Reflect } from "../reflect";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/utils/constant";
import { DEFAULT_BLOCK_SET_LIKE } from "./constant";
import type { EditorOptions } from "./types";

export class Editor {
  public blockSet: BlockSet;
  private container: HTMLDivElement;
  public readonly event: Event;
  public readonly logger: Logger;
  public readonly reflect: Reflect;
  public readonly state: EditorState;

  constructor(options: EditorOptions) {
    const { blockSet = new BlockSet(DEFAULT_BLOCK_SET_LIKE), logLevel = LOG_LEVEL.ERROR } = options;
    this.blockSet = blockSet;
    this.container = document.createElement("div");
    this.container.setAttribute(DATA_TYPE_KEY, "placeholder");
    this.logger = new Logger(logLevel);
    this.reflect = new Reflect();
    this.event = new Event(this);
    this.state = new EditorState(this);
  }

  public onMount(container: HTMLDivElement) {
    this.container = container;
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container.setAttribute(DATA_TYPE_KEY, "editable");
    this.event.bind();
    this.state.renderEditableDOM();
  }

  public destroy() {
    this.event.unbind();
    this.state.destroy();
  }

  public getContainer() {
    return this.container;
  }
}
