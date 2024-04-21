import type { BlockSet } from "blocks-kit-delta";
import { Block } from "blocks-kit-delta";
import { ROOT_BLOCK } from "blocks-kit-utils";

import type { Editor } from "../editor";
import { DEFAULT_BLOCK_LIKE } from "../editor/constant";
import { BlockState } from "./modules/block";
import { Model } from "./modules/model";
import type { EDITOR_STATE } from "./utils/constant";

export class EditorState {
  public entry: BlockState;
  public readonly model: Model;
  private active = ROOT_BLOCK;
  private status: Map<string, boolean>;
  private blocks: Map<string, BlockState>;

  constructor(private editor: Editor, private blockSet: BlockSet) {
    this.model = new Model();
    this.status = new Map();
    this.blocks = new Map();
    const entryDelta = this.editor.blockSet.get(ROOT_BLOCK);
    const entry = entryDelta || new Block(DEFAULT_BLOCK_LIKE);
    this.blocks.set(entry.id, new BlockState(this, entry));
    this.entry = this.getBlockState(ROOT_BLOCK);
    this.createBlockStateTree();
  }

  public destroy() {
    this.active = ROOT_BLOCK;
    this.status = new Map();
    this.blocks = new Map();
  }

  private createBlockStateTree() {
    // 初始化构建整个`Block`状态树
    const dfs = (block: Block) => {
      const state = this.getBlockState(block.id);
      if (!state) return void 0;
      block.children.forEach(id => {
        const child = this.editor.blockSet.get(id);
        if (!child) return void 0;
        // 按需创建`state`以及关联关系
        const childState = new BlockState(this, child);
        this.blocks.set(id, childState);
        state.addChild(childState);
        dfs(childState.getRaw());
      });
    };
    dfs(this.entry.getRaw());
  }

  public getActiveBlock() {
    return this.active;
  }

  public setActiveBlock(blockId: string) {
    this.active = blockId;
  }

  public get(key: keyof typeof EDITOR_STATE) {
    return this.status.get(key);
  }

  public set(key: keyof typeof EDITOR_STATE, value: boolean) {
    this.status.set(key, value);
    return this;
  }

  public getBlockState(zoneId: typeof ROOT_BLOCK): BlockState;
  public getBlockState(zoneId: string): BlockState | null;
  public getBlockState(zoneId: string): BlockState | null {
    return this.blocks.get(zoneId) || null;
  }

  public renderEditableDOM() {
    const div = this.editor.getContainer();
    // 完整清理`DOM`节点
    div.innerHTML = "";
    const root = this.entry.render();
    div.appendChild(root);
  }
}
