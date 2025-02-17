import { isHTMLElement } from "block-kit-utils";

import type { Editor } from "../editor";
import type { Point } from "../selection/modules/point";
import type { Range } from "../selection/modules/range";
import { toDOMPoint, toDOMRange } from "../selection/utils/native";
import type { Rect as RectType } from "./types";
import { fromDOMRect, relativeTo } from "./utils/convert";

export class Rect {
  /**
   * 构造函数
   */
  constructor(protected editor: Editor) {}

  /**
   * 获取光标的 Rect
   * - 相对页面 (0, 0) 的位置
   */
  public getRawCaretRect(): RectType | null {
    const selection = this.editor.selection.get();
    if (!selection) return null;
    return this.getRawRangeRect(selection);
  }

  /**
   * 获取指定 Point 的 Rect
   * - 相对页面 (0, 0) 的位置
   * @param point
   */
  public getRawPointRect(point: Point): RectType | null {
    const domPoint = toDOMPoint(this.editor, point);
    if (!domPoint || !domPoint.node || !isHTMLElement(domPoint.node)) return null;
    const clientRect = domPoint.node.getBoundingClientRect();
    return fromDOMRect(clientRect);
  }

  /**
   * 获取指定 Range 的 Rect
   * - 相对页面 (0, 0) 的位置
   * @param range
   */
  public getRawRangeRect(range: Range): RectType | null {
    const domRange = toDOMRange(this.editor, range);
    if (!domRange) return null;
    const clientRect = domRange.getBoundingClientRect();
    return fromDOMRect(clientRect);
  }

  /**
   * 获取编辑器位置
   */
  public getEditorRect(): RectType {
    const root = this.editor.getContainer();
    const clientRect = root.getBoundingClientRect();
    return fromDOMRect(clientRect);
  }

  /**
   * 获取光标的 Rect
   * - 相对编辑器 (0, 0) 的位置
   */
  public getCaretRect(): RectType | null {
    const caretRect = this.getRawCaretRect();
    if (!caretRect) return null;
    const editorRect = this.getEditorRect();
    return relativeTo(caretRect, editorRect);
  }

  /**
   * 获取指定 Point 的 Rect
   * - 相对编辑器 (0, 0) 的位置
   * @param point
   */
  public getPointRect(point: Point): RectType | null {
    const pointRect = this.getRawPointRect(point);
    if (!pointRect) return null;
    const editorRect = this.getEditorRect();
    return relativeTo(pointRect, editorRect);
  }

  /**
   * 获取指定 Range 的 Rect
   * - 相对编辑器 (0, 0) 的位置
   * @param range
   */
  public getRangeRect(range: Range): RectType | null {
    const rangeRect = this.getRawRangeRect(range);
    if (!rangeRect) return null;
    const editorRect = this.getEditorRect();
    return relativeTo(rangeRect, editorRect);
  }

  /**
   * 获取原始选区的 Rect
   * - 相对页面 (0, 0) 的位置
   */
  public getRawSelectionRect(): RectType | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!range) return null;
    const clientRect = range.getBoundingClientRect();
    return fromDOMRect(clientRect);
  }

  /**
   * 获取编辑器选区的 Rect
   * - 相对编辑器 (0, 0) 的位置
   */
  public getSelectionRect(): RectType | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!range) return null;
    const clientRect = range.getBoundingClientRect();
    const editorRect = this.getEditorRect();
    return relativeTo(clientRect, editorRect);
  }
}
