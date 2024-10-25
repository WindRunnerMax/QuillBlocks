import type { Editor } from "../editor";
import { EventBus } from "./bus";
import { NativeEvent } from "./native";

export class Event {
  private nativeEvent: NativeEvent;
  private bus: EventBus;

  constructor(private editor: Editor) {
    this.bus = new EventBus();
    this.nativeEvent = new NativeEvent(this.bus, this.editor);
  }

  public bind() {
    return this.nativeEvent.bind();
  }

  public unbind() {
    this.bus.clear();
    return this.nativeEvent.unbind();
  }

  public on: EventBus["on"] = (key, listener, priority) => {
    return this.bus.on(key, listener, priority);
  };

  public once: EventBus["once"] = (key, listener, priority) => {
    return this.bus.once(key, listener, priority);
  };

  public off: EventBus["off"] = (key, listener) => {
    return this.bus.off(key, listener);
  };

  public trigger: EventBus["emit"] = (key, payload) => {
    return this.bus.emit(key, payload);
  };
}
