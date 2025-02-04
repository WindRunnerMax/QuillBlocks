# BlockKit

<p>
<a href="https://github.com/WindRunnerMax/QuillBlocks">GitHub</a>
<span>｜</span>
<a href="https://windrunnermax.github.io/QuillBlocks/">DEMO</a>
<span>｜</span>
<a href="./NOTE.md">NOTE</a>
<span>｜</span>
<a href="https://github.com/WindRunnerMax/QuillBlocks/issues/1">BLOG</a>
</p>

最初是希望基于`Quill`实现`Blocks`的编辑器，却被跨行的选区问题所困扰。到后来希望以`Embed Blot`为基础实现块结构的嵌套，却被复杂交互所需要的视图层实现掣肘。最终希望能从零实现富文本编辑器，以便能够解决这些问题，并且将想法付诸实现:

- **完备的开发文档:** 在实现过程中将遇到的问题都记录了下来，主要解决了两个问题，为什么要这么设计、这么设计有什么优劣。
- **精简的数据结构:** 扁平的数据结构设计，无论是在编辑器还是在服务端数据处理的过程中，都能更加方便和精准地操作数据。
- **可扩展的视图层:** 视图层相关则可以自由地选择组件库实现复杂交互，在编辑器的设计上可以支持多种视图层的接入实现。
- **精细的协同考量:** `OT`的协同编辑从来都不是简单的问题，除了数据上支持操作变换外，编辑器模块同样需要很多细节设计。
- **丰富的插件系统:** 任何富文本格式都应该通过插件的方式来实现，编辑器的示例中所有的组件都是通过插件的形式来扩展能力。

