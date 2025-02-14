import type { LeafContext, LineContext } from "../../src/index";
import { CorePlugin, Editor, Priority } from "../../src/index";

describe("plugin priority", () => {
  class Plugin1 extends CorePlugin {
    public key = "plugin1";
    public destroy(): void {}
    public match = () => true;
    @Priority(10)
    public renderLeaf(context: LeafContext) {
      return context.children;
    }
  }

  class Plugin2 extends CorePlugin {
    public key = "plugin2";
    public destroy(): void {}
    public match = () => true;
    @Priority(9)
    public renderLeaf(context: LeafContext) {
      return context.children;
    }
    public renderLine(context: LineContext) {
      return context.children;
    }
  }

  const editor = new Editor();
  editor.plugin.register(new Plugin1(), new Plugin2());
  const renderPlugins = editor.plugin.getPriorityPlugins("renderLeaf");
  const renderLinePlugins = editor.plugin.getPriorityPlugins("renderLine");

  it("pick plugins", () => {
    expect(renderPlugins.length).toBe(2);
    expect(renderLinePlugins.length).toBe(1);
    expect(renderPlugins[0]).toBeInstanceOf(Plugin2);
    expect(renderPlugins[1]).toBeInstanceOf(Plugin1);
    expect(renderLinePlugins[0]).toBeInstanceOf(Plugin2);
  });

  it("pick cache", () => {
    // @ts-expect-error cache
    const cache = editor.plugin.cache;
    expect(renderPlugins).toBe(cache.renderLeaf);
    expect(renderLinePlugins).toBe(cache.renderLine);
    const renderPlugins1 = editor.plugin.getPriorityPlugins("renderLeaf");
    const renderLinePlugins1 = editor.plugin.getPriorityPlugins("renderLine");
    expect(renderPlugins).toBe(renderPlugins1);
    expect(renderLinePlugins).toBe(renderLinePlugins1);
  });
});
