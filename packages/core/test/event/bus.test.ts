import { Delta } from "block-kit-delta";
import { getId } from "block-kit-utils";

import { EventBus } from "../../src/event/bus";
import { EDITOR_EVENT } from "../../src/index";

describe("event bus", () => {
  const event = new EventBus();
  const delta = new Delta();

  it("on", () => {
    const spy = jest.fn();
    const spy2 = jest.fn();
    event.on(EDITOR_EVENT.CONTENT_CHANGE, spy);
    event.on(EDITOR_EVENT.CONTENT_CHANGE, spy);
    event.on(EDITOR_EVENT.CONTENT_CHANGE, spy2);
    event.emit(EDITOR_EVENT.CONTENT_CHANGE, {
      current: delta,
      previous: delta,
      source: "test",
      changes: delta,
      id: getId(6),
      inserts: [],
      revises: [],
      deletes: [],
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: protected property
    const len = event.listeners.CONTENT_CHANGE?.length;
    expect(len).toEqual(2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it("once", () => {
    const spy = jest.fn();
    event.once(EDITOR_EVENT.CONTENT_CHANGE, spy);
    event.emit(EDITOR_EVENT.CONTENT_CHANGE, {
      current: delta,
      previous: delta,
      source: "test",
      changes: delta,
      id: getId(6),
      inserts: [],
      revises: [],
      deletes: [],
    });
    event.emit(EDITOR_EVENT.CONTENT_CHANGE, {
      current: delta,
      previous: delta,
      source: "test",
      changes: delta,
      id: getId(6),
      inserts: [],
      revises: [],
      deletes: [],
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("off", () => {
    const spy = jest.fn();
    event.on(EDITOR_EVENT.CONTENT_CHANGE, spy);
    event.off(EDITOR_EVENT.CONTENT_CHANGE, spy);
    event.emit(EDITOR_EVENT.CONTENT_CHANGE, {
      current: delta,
      previous: delta,
      source: "test",
      changes: delta,
      id: getId(6),
      inserts: [],
      revises: [],
      deletes: [],
    });
    event.emit(EDITOR_EVENT.CONTENT_CHANGE, {
      current: delta,
      previous: delta,
      source: "test",
      changes: delta,
      id: getId(6),
      inserts: [],
      revises: [],
      deletes: [],
    });
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
