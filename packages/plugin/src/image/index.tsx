import type { CMDPayload, Editor } from "block-kit-core";
import { APPLY_SOURCE, Point, Range, RawRange } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Bind, sleep, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { SelectionPlugin } from "../shared/modules/selection";
import { getMountDOM } from "../shared/utils/dom";
import { isEmptyLine } from "../shared/utils/is";
import { IMAGE_KEY, IMAGE_SRC, IMAGE_STATUS, LOADING_STATUS } from "./types";
import { ImageView } from "./view/image";

export class ImagePlugin extends EditorPlugin {
  public key = IMAGE_KEY;
  public selection: SelectionPlugin;
  protected input: HTMLInputElement | null;

  constructor(protected editor: Editor) {
    super();
    this.input = null;
    this.selection = new SelectionPlugin(editor);
    editor.command.register(IMAGE_KEY, this.onExec);
  }

  public destroy(): void {
    this.input && this.input.remove();
    this.input = null;
    this.selection.destroy();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[IMAGE_KEY];
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    return (
      <ImageView editor={this.editor} context={context} selection={this.selection}></ImageView>
    );
  }

  protected pickMultiImage() {
    let imageInput = this.input;
    if (!imageInput) {
      imageInput = document.createElement("input");
      imageInput.setAttribute("type", "file");
      imageInput.setAttribute("accept", "image/png, image/jpeg, image/svg+xml");
      imageInput.hidden = true;
      imageInput.setAttribute("multiple", "true");
      this.input = imageInput;
      getMountDOM(this.editor).append(imageInput);
    }
    return new Promise<FileList | null>(resolve => {
      imageInput!.onchange = e => {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        resolve(files);
      };
      imageInput!.click();
    });
  }

  protected uploadImage(file: File): Promise<{ src: string }> {
    this.editor.logger.debug("Upload Image", file);
    return sleep(2000).then(() => ({
      src: URL.createObjectURL(file),
    }));
  }

  @Bind
  protected async onExec(payload: CMDPayload): Promise<void> {
    const files = await this.pickMultiImage();
    const editor = this.editor;
    const sel = editor.selection.get() || payload.range;
    const line = sel && editor.state.block.getLine(sel.start.line);
    if (!sel || !line || !files) return void 0;
    // 开始计算索引值
    const isEmptyTextLine = isEmptyLine(line);
    let nextLineIndex = line.index;
    const delta = new Delta();
    let index = line.start;
    if (isEmptyTextLine) {
      delta.retain(line.start);
    } else {
      index = index + line.length;
      delta.retain(line.start + line.length);
    }
    const packIndex: number[] = [];
    // 处理临时图片文件
    for (const file of files) {
      const status = LOADING_STATUS.LOADING;
      const src = URL.createObjectURL(file);
      delta
        .insert(" ", { [IMAGE_KEY]: TRULY, [IMAGE_SRC]: src, [IMAGE_STATUS]: status })
        .insertEOL();
      packIndex.push(index);
      index = index + 2;
      nextLineIndex++;
    }
    if (!isEmptyTextLine) {
      nextLineIndex++;
      delta.insertEOL();
    }
    const point = new Point(nextLineIndex, 0);
    editor.state.apply(delta, { autoCaret: false });
    editor.selection.set(new Range(point, point));
    // 正式开始上传文件
    // 注意这里需要先 apply 再上传文件，否则 pack 的索引会被影响到
    for (let i = 0; i < packIndex.length; i++) {
      const file = files[i];
      const refIndex = packIndex[i];
      const ref = editor.ref.pack(RawRange.from(refIndex, 0));
      // 独立并行上传, 且独立 unpack
      this.uploadImage(file)
        .then(res => {
          const rawRange = ref.unpack();
          if (!rawRange) return void 0;
          const next: AttributeMap = {
            [IMAGE_SRC]: res.src,
            [IMAGE_STATUS]: LOADING_STATUS.SUCCESS,
          };
          const change = new Delta().retain(rawRange.start).retain(1, next);
          editor.state.apply(change, { source: APPLY_SOURCE.NO_UNDO });
        })
        .catch(() => {
          const rawRange = ref.unpack();
          if (!rawRange) return void 0;
          const next: AttributeMap = {
            [IMAGE_STATUS]: LOADING_STATUS.FAIL,
          };
          const change = new Delta().retain(rawRange.start).retain(rawRange.len, next);
          editor.state.apply(change, { source: APPLY_SOURCE.NO_UNDO, autoCaret: false });
        });
    }
  }
}
