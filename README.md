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

从零实现的富文本编辑器 `WYSIWYG Editor` 

## Why?

最初，希望基于 [Quill](https://github.com/slab/quill) 实现块结构组织的编辑器，却被跨行的选区问题所困扰。

后来，希望基于 [Embed Blot](https://github.com/slab/parchment) 设计插件实现块结构的嵌套，却被复杂交互所需要的视图层实现掣肘。

最终，希望能以 [Quill](https://github.com/slab/quill)、[Slate](https://github.com/ianstormtaylor/slate)、[EtherPad](https://github.com/ether/etherpad-lite) 的核心理念为参考，从零实现富文本编辑器，以便能够解决相关的问题，并且将一些想法付诸实现：

- 现有编辑器引擎通常具有完整的`API`文档，却鲜有开发过程中的问题记录。因此希望能够将开发过程中的问题都记录下来，用以解决两个问题：为什么要这么设计、这种设计方案有什么优劣。

- 嵌套的数据结构能够更好地对齐`DOM`表达，然而这样对于数据的操作却变得更加复杂。扁平的数据结构且独立分包设计，无论是在编辑器中操作，还是在服务端数据解析，都可以更加方便地处理。

- 多数编辑器实现了自己的视图层，而重新设计视图层需要面临渲染问题，无法复用组件生态且存在新的学习成本。因此需要实现可扩展视图层的核心模式，在编辑器的设计上可以支持多种视图层的接入实现。

- 无论是`OT`还是`CRDT`协同调度都不是简单的问题，编辑器内部的数据设计可能无法用于实时协同编辑。因此协同设计必须要从底层数据结构出发，在编辑器模块实现细节设计，整体方案上都需要考虑数据一致性。

- 编辑器的模块可能是硬编码的，不容易对格式进行自定义。因此明确核心界限与插件优先架构的架构非常重要，核心实现和自定义模块之间的界限需要更加清晰，这就意味着任何富文本格式都应该通过插件的方式来实现。


