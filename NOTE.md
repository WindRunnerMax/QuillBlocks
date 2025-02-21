# NOTE
纸上得来终觉浅，绝知此事要躬行。

最初，希望基于 [Quill](https://github.com/slab/quill) 实现块结构组织的编辑器，却被跨行的选区问题所困扰。

后来，希望基于 [Embed Blot](https://github.com/slab/parchment) 设计插件实现块结构的嵌套，却被复杂交互所需要的视图层实现掣肘。

最终，希望能以 [Quill](https://github.com/slab/quill)、[Slate](https://github.com/ianstormtaylor/slate)、[EtherPad](https://github.com/ether/etherpad-lite) 的核心理念为参考，从零实现富文本编辑器，以便能够解决相关的问题，并且将一些想法付诸实现：

- 现有编辑器引擎通常具有完整的`API`文档，却鲜有开发过程中的问题记录。因此希望能够将开发过程中的问题都记录下来，用以解决两个问题：为什么要这么设计、这种设计方案有什么优劣。
- 嵌套的数据结构能够更好地对齐`DOM`表达，然而这样对于数据的操作却变得更加复杂。扁平的数据结构且独立分包设计，无论是在编辑器中操作，还是在服务端数据解析，都可以更加方便地处理。
- 多数编辑器实现了自己的视图层，而重新设计视图层需要面临渲染问题，无法复用组件生态且存在新的学习成本。因此需要实现可扩展视图层的核心模式，在编辑器的设计上可以支持多种视图层的接入实现。
- 无论是`OT`还是`CRDT`协同调度都不是简单的问题，编辑器内部的数据设计可能无法用于实时协同编辑。因此协同设计必须要从底层数据结构出发，在编辑器模块实现细节设计，整体方案上都需要考虑数据一致性。
- 编辑器的模块可能是硬编码的，不容易对格式进行自定义。因此明确核心界限与插件优先架构的架构非常重要，核心实现和自定义模块之间的界限需要更加清晰，这就意味着任何富文本格式都应该通过插件的方式来实现。

## 架构设计  
我非常喜欢`slate`的`core react`这样分包的设计，但是并不太喜欢`slate`的`json`形式的数据结构，我个人认为扁平化才是大文档的最佳实践。我也很喜欢`quill`的`delta`设计，这是一个扁平化的数据结构，但是我并不太喜欢`quill`自己实现的视图层，当然这也是一种解决方案，毕竟框架也是在不断发展更迭的。  

自行实现视图层的好处是可以做到框架无关，不需要局限于引入的框架本身，但是很明显这样就会导致新的视图结构学习成本，并且无法使用现有的`UI`组件库来绘制`UI`，这就导致如果需要实现复杂的文档系统而引入大量的额外工作。那么我在想如果我们实现核心层，而各种`UI`框架则可以根据核心层的事件来适配可能也是个不错的方案。

那么我在想为什么不搞一个像是`slate`一样的分包设计，再配合上`quill`的`delta`数据结构，并且解决一些我认为是不太合适的设计，所以便有了这个项目，当然我也并没有指望整个项目有很多人用，更多的是满足自己的好奇心，如何从零做一套富文本编辑器。其实最初起名为`Blocks`目的是想做一套`canvas`的编辑器，但是成本太高了。所以我目前是想利用这种分包结构先做好`react`的，然后有机会先做仅渲染的`canvas`，这样成本应该会低很多。

因为整个富文本编辑器还是非常复杂的，各大框架都是按年维护的，从零开始实现必然需要很大的精力，我也只是想做一下满足一下好奇心，这个文档就是随手记一些想法与设计上的思考，顺便还能为后期写文章作为参考。最开始的话可能仅仅是实现最基本的富文本输入框这种类型，实现最基本的行内格式以及行格式，后续再考虑实现`Blocks`来构建复杂的文档编辑器，毕竟一口不能吃成胖子，但一口一口吃却可以。

## Blocks
最开始我思考了很长时间如何设计`Block`化的编辑器，除了对于交互上的设计比较难做之外，对于数据的设计也没有什么比较好的想法，特别是实际上是要管理一棵树形结构，并且同时还需要支持对富文本内容的描述。最开始我想如果直接通过`JSON`来处理嵌套的数据结构表达，但是想了想这岂不是又回到了`Slate`的设计，在这种设计方案下数据描述特别是数据处理会很麻烦。后来我又想分别管理树结构与引用关系，这样当然是没有问题的，只不过看起来并没有那么清晰，特别是还要设计完备的插件化类型支持，这部分可能就没有那么好做了。

后来，我想是不是可以单独将`Blocks`类型放在单独的包里，专门用来管理整棵树的描述，以及类型的扩展等等，而且在扩展类型时不会因为重新`declare module`导致不能实际引用原本的包结构，当然单独引用独立的模块用来做扩展也是可以的。此外，这里就不再单独维护树结构与引用关系了，每个块都会携带自己的引用关系，即父节点`parent`的`id`与子节点`children`的`id`，这里只存储节点的`id`而不是具体的对象引用，在运行时通过状态管理再来获取实际的引用。此外在编辑器的实际对象中也需要维护状态对象，在状态树里需要维护基本的数据操作，最终的操作还是需要映射到所存储的数据结构`BlockSet`。

`Blocks`的编辑器实际上是由`Notion`引发的编辑器设计方案，这样就可以以独立块为单位，做到更细粒度的数据管理。以此得到更加灵活的管理，例如块级拖拽、结构嵌套、内容复用等，此外还可以做到流式加载，服务端数据存储也可以更加轻量，而不必将内容全部都放置于同一个字段中。此外，细粒度的块结构管理，可以更好的实现细粒度的权限控制，在跨文档关联、协作编辑方面会更有优势。

而还有个重要的特点是更好的扩展性，如果在常见的编辑器中扩展节点，需要大量的编辑器基础知识来组织和管理模块，因为这些扩展完全耦合于编辑器中。而`Blocks`架构的编辑器则是实现了块的管理框架，相当于是维护了`N`个编辑器实例以及`N`个其他类型的实例，编辑器实例是个特殊的块结构，其他类型的实例就完全由扩展实现，数据变更协同则同样需要我们规范设计。在这个框架下，无论是实现虚拟滚动、流式载入，还是实现块级的错误捕获，以及按需`diff`等能力，都会更加容易。

## 扁平多实例结构
在上边也提到了，在这里我想做的就是纯`Blocks`的编辑器，而实际上目前我并没有找到比较好的编辑器实现来做参考，主要是类似的编辑器都设计的特别复杂，在没有相关文章的情况很难理解。此外我还是比较倾向于`quill-delta`的数据结，因为其无论是对于协同的支持还是`diff`、`ops`的表达都非常完善，所以我想的是通过多个`Quill Editor`实例来实现嵌套`Blocks`，实际上这里边的坑会有很多，需要禁用大量的编辑器默认行为并且重新实现，例如`History`、`Enter`回车操作、选区变换等等，可以预见这其中需要关注的点会有很多，但是相对于从零实现编辑器需要适配的各种浏览器兼容事件还有类似于输入事件的处理等等，这种管理方式还算是可以接受的。

在这里需要关注一个问题，对于整个编辑器状态管理非常依赖于架构设计，从最开始我想做的就是`Blocks`的编辑器，所以在数据结构上必然需要以嵌套的数据结构来描述，当然在这里我设计的扁平化的`Block`，然后对每个`Block`都存储了`string[]`的`Block`节点信息来获取引用。而在实现的过程中，我关注到了一个特别的问题，如果在设计编辑器时不希望有嵌套的结构，而是希望通过扁平的数据结构描述内容，而在内容中如果引用了块结构那么就再并入`Editor`实例，这种设计虽然在数据结构上与上边的`BlockSet`非常类似，但是整体的表达却是完全不同。

`Blocks`的编辑器是完全由最外层的`Block`结构管理引用关系，也就是说引用是在`children`里的，而块引用的编辑器则需要由编辑器本身来管理引用关系，也就是说引用是在`ops`里的。所以说对于数据结构的设计与实现非常依赖于编辑器整体的架构设计，当然在上边这个例子中也可以将块引用的编辑器看作单入口的`Blocks`编辑器，这其中的`Line`表达全部交由`Editor`实例来处理，这就是不同设计中却又相通的点。


## 选区变换
对于选区的问题，我思考了比较久，最终的想法依然还是通过首尾的`RangePoint`来标记节点，需要注意的是如果节点的块不属于同块节点，那么不会继续处理选区`Range`变换。同样的，目前依然是通过首尾节点来标记，所以特别需要关注的是通过首尾节点来标记整个`Range`，采用这个方案可以通过首尾节点与`index`来获取`Range`，这里需要关注的是当节点的内容发生变化时，需要重新计算`index`。实际上这里如果直接遍历当前节点直属的所有`index`状态更新也是可以的，在实际`1`万次加法运算，实际上的时间消耗也只有`0.64306640625ms`不到`1ms`。

我们的编辑器实际上是要完成类似于`slate`的架构，当前设计的架构的是`core`与视图分离，并且此时我们不容易入侵到`quill`编辑器的选区能力，所以最终相关的选区变换还是需要借助`DOM`与`Editor`实例完成，还需要考量在`core`中维护的`state`状态管理。在`DOM`中需要标记`Block`节点、`Line`节点、`Void`节点等等，然后在浏览器`onSelectionChange`事件中进行`Model`的映射。当然整个说起来容易，做起来就难了，这一套下来还是非常复杂的，需要大量时间不断调试才行。

## DOM模型与浏览器选区
浏览器中存在明确的选区策略，在`State 1`的`ContentEditable`状态下，无法做到从`Selection Line 1`选择到`Selection Line 2`，这是浏览器默认行为，而这种选区的默认策略就定染导致我无法基于这种模型实现`Blocks`。

而如果是`Stage 2`的模型状态，是完全可以做到选区的正常操作的，在模型方面没有什么问题，但是我们此时的`Quill`选区又出现了问题，由于其在初始化时是会由`<br/>`产生到`div/p`状态的突变，导致其选区的`Range`发生异动，此时在浏览器中的光标是不正确的，而我们此时没有办法入侵到`Quill`中帮助其修正选区，且`DOM`上没有任何辅助我们修正选区的标记，所以这个方式也难以继续下去。

因此在这种状态下，我们可能只能选取`Stage 3`策略的形式，并不实现完整的`Blocks`，而是将`Quill`作为嵌套结构的编辑器实例，在这种模型状态下编辑器不会出现选区的偏移问题，我们的嵌套结构也可以借助`Quill`的`Embed Blot`来实现插件扩展嵌套`Block`结构。

```html
<p>State 1</p>
<div contenteditable="false" data-block>
  <div contenteditable="true" data-line>Selection Line 1</div>
  <div contenteditable="true" data-line>selection Line 2</div>
</div>

<p>State 2</p>
<div contenteditable="true" data-block>
  <div contenteditable="true" data-line>Selection Line 1</div>
  <div contenteditable="true" data-line>selection Line 2</div>
</div>

<p>State 3</p>
<div contenteditable="true" data-block>
  <div data-line>Selection Line 1</div>
  <div data-line>selection Line 2</div>
  <div contenteditable="false" data-block>
    <div contenteditable="true" data-line>Selection Line 1</div>
    <div contenteditable="true" data-line>selection Line 2</div>
  </div>
</div>
```

## 状态维护与视图刷新
`core -> react`中使用`context/redux/mobx`是否可以避免自行维护各个状态对象，也可以达到局部刷新而不是刷新整个页面的效果。  

想了想似乎不太行，就拿`context`来说，即使有`immer.js`似乎也做不到局部刷新，因为整个`delta`的数据结构不能够达到非常完整的与`react props`对应的效果，诚然我们可以根据`op & attributes`作为`props`再在组件内部做数据转换，但是这样似乎并不能避免维护一个状态对象，最基本的是应该要维护一个`LineState`对象，每个`op`可能与前一个或者后一个有状态关联，以及行属性需要处理，这样一个基础的`LineState`对象是必不可少的。  

后边我又仔细想了想，毕竟现在没有实现就纯粹是空想，`LineState`对象是必不可少的，再加上是要做插件化的，那么给予`react`组件的`props`应该都实际上可以隐藏在插件里边处理，如果我使用`immer`的话，似乎只需要保证插件给予的参数是不变的即可，但是同样的每一个`LineState`都会重新调用一遍插件化的`render`方法(或者其他名字)，这样确实造成了一些浪费，即使能够保证数据不可变即不会再发生`re-render`，但是如果在插件中解构了这个对象或者做了一些处理，那么又会触发`react`函数执行，当然因为`react diff`的存在可能不会触发视图重绘罢了。

那么既然`LineState`对象不可避免，如果再在这上边抽象出一层`ZoneState`来管理`LineState`，这样是不是会更简单一些，同样因为上边也说过目前是在`delta`的基础上又包了一层`zone`，那么就又需要一个`ContentState`来管理`ZoneState`了，当然这层`ContentState`也是可以直接放在`editor`对象里的，只不过`editor`对象包含了太多的模块，还是抽离出来更合适。通过`editor`的`Content Change`事件作为`bridge`，以及这种一层管理一层的方式，精确地更新每一行，减少性能损耗，甚至于因为我们能够比较精确的得知究竟是哪几个`op`更新了，做到精准更新也不是不可能。

## LineState
即然确定好是`Editor -> ContentState -> ZoneState -> LineState`的结构设计，那么`LineState`应该怎么设计才能让编辑器在`apply`的时候能够精确的修改`Line`的状态呢，因为咱们的数据结构是`delta`，是一个扁平化的结构，选区的设计是`start length`的结构，那么`LineState`最少要保存一个`start`和一个`offset`，考虑到执行更新的时候大概率是要处理这两个值的，所以这两个值应该与`Ops`和`line attrs`独立放置，或者直接在原对象上修改，保证数据不可变的状态，另外每层结构还需要传一个`parent`进去，方便处理父级信息。

另外又想到一个问题，选区是一个很重要的点，所以通过选区来对应到指定状态也很重要，目前延续的设计是`{ start, length, zoneId }`的三元组，所以需要一个转换是很必要的，比如转换出来的位置需要有`{ zoneState, lineState }`这一些状态信息，当然也可以直接通过提供参数来取得这些状态信息，都是可行的。

## Selection
`Selection`选区，我思考了很长时间这部分应该如何表示，虽然最根本的思想就是从浏览器的选区映射到`Editor`自己维护的选区，以及可以反向将自己维护的选区再设置到浏览器上。浏览器的选区`API`挺多的，主要集中在`getSelection`、`onSelectionChange`上，虽然这些`API`我们不需要全部实现，但是基本的`Range`、`getSelection`、`setSelection`、`onSelectionChange`都需要有，还有焦点等一系列的状态需要处理。想一想，我们是通过插件的形式生成的`DOM`结构，那么`core`肯定是不能完全控制这些`DOM`节点的生成，那么怎么映射就是个复杂的问题。综上，选区将会是个非常复杂的模块。

趁着五一假期我研究了下`quill`和`slate`的选区实现，实际上看的是似懂非懂的样子，感觉类似的东西还是需要实际操作才能真的明白，而且我看相关的实现会有大量的`case`需要特殊处理，当然这块主要是对于`ZeroSpace/Void`与浏览器的选区兼容的实现。当然我也总结了一些内容，因为是看的并不是很懂，所以可能并不是很正确，有可能后边在真的实现的时候会被推翻，但是目前来看还是有助于理解的。

* 无论是`slate`还是`quill`都是更专注于处理点`Point`，当然`quill`的最后一步是将点做减法转化为`length`，但是在这一步之前，都是在处理`Point`这个概念的，我想这似乎是因为本身浏览器的选区也是通过`Anchor`与`Focus`这两个`Point`来实现的，所以转换也是需要继承这个实现。
* 无论是`slate`还是`quill`也都会将浏览器选区进行一个`Normalize`化，这一块我没太看明白，似乎是为了将选区的内容打到`Text`节点上，并且再来计算`Text`节点的`offset`，毕竟富文本实际上专注的还是`Text`节点，各种富文本内容也是基于这个节点类似于`fake-text`来实现的。另外还有可能因为浏览器的选区可能不很合适，才需要这个规范化。
* `quill`因为是自行实现的`View`层，所以其维护的节点都在`Blot`中，所以将浏览器的选区映射到`quill`的选区相对会简单一些。那么`slate`是借助于`React`实现的`View`层，那么映射的过程就变的复杂了起来，所以在`slate`当中可以看到大量的形似于`data-slate-leaf`的节点，这都是`slate`用来计算的标记，当然不仅仅是选区的标记。那么还有一个问题，在每次选区变换的时候，总不能将所有的节点都遍历一遍来找这些节点，再遍历一遍去计算每个点对应的位置来构造`Range`，所以实际上在渲染视图时就需要一个`Map`来做映射，将真实的`DOM`节点来映射一个对象，这个对象保存着这个节点的`key`，`offset`，`length`，`text`等信息，这样`WeakMap`对象就派上了用场，之后在计算的时候就可以直接通过`DOM`节点作为`key`来获取这个节点的信息，而不需要再去遍历一遍。

那么其实看以上这几点，我们的编辑器实际上是要完成类似于`slate`的架构，因为我们希望的是`core`与视图分离，所以选区、渲染这方面的实现都需要在`react`这个包里实现，相关的`state`是在`core`里实现的，通过`onContentChange`来实现通信，在内容变化的时候通知`react`去`setState`进行渲染。当然整个说起来容易，做起来就难了，这一套下来还是非常复杂的，需要大量时间不断调试才行。

## Input 模块
到这里，其实可以感觉到我们主要是用到了浏览器的`ContentEditable`编辑、选区以及`DOM`的能力，那么我们的编辑器最重要的一个能力就是输入，有了之前聊到的一些设计与抽象，我们似乎可以比较简单的设计整个流程: 

* 通过选区映射到我们自行维护的`Range Model`，包括选区变换时根据`DOMRange`映射到`Model`，这一步需要比较多的查找和遍历，还需要借助我们之前聊的`WeakMap`对象来查找`Model`来计算位置。
* 通过键盘进行输入，借助于浏览器的`BeforeInputEvent`以及`CompositionEvent`分别处理输入/删除与`IME`输入，基于输入构造`Delta Change`应用到`DeltaSet`上并且触发`ContentChange`，视图层由此进行更新。
* 当视图层更新之后，需要根据浏览器的`DOM`以及我们维护的`Model`刷新选区，需要根据`Model`映射到`DOMRange`，再应用到浏览器的`selection`对象中，这其中也涉及了很多边界条件。

实际上在完成上边整个流程的过程中，我遇到了两个非常麻烦的问题，而且也是在解决问题的过程中，慢慢地完善了整个流程的实现，路程还是比较曲折的。

第一个遇到的问题是选区的的同步，此时我已经完成了第一步，也就是通过选区映射到我们自行维护的`Range Model`，接下来我想来处理输入，这时候还没有考虑到`IME`的问题，只是在处理英文的输入，那么对于输入部分当前其实就是劫持了`BeforeInputEvent`事件。那么当我进行输入操作的时候，问题来了，假设我们此时有两个`span`，最开始当前的DOM结构是`<span>DOM1</span><span>DO|M2</span>`，`|`表示光标位置，我要在第二个`span`的`DO`和`M2`字符之间插入内容`x`，此时无论是用代码`apply`还是用户输入的方式，都会使得`DOM2`这个`span`由于`apply`造成`ContentChange`继而`DOM`节点会刷新，也就是说就是第二个`span`已经不是原来的`span`而是创建了一个新对象，那由于这个`DOM`变了导致浏览器光标找不到原本的`DOM2`这个`span`结构了，那么此时光标就变成了`<span>DOM1|</span><span>DOxM2</span>`。本身我认为起码在输入的时候选区应该是会跟着变动的，实践证明这个方法是不行的，所以实际上在这里就是缺了一步根据我们的`Range Model`来更新`DOM Range`的操作，而且由于我们应该在`DOM`结构完成后尽早更新`DOM Range`，这个操作需要在`useLayoutEffect`中完成而不是`useEffect`中，也就对标了类组件的`componentDidUpdate`，更新`DOM Range`的操作应该是主动完成的，例如当前的`DOM`视图刷新，`Paste`事件等等。

第二个遇到的问题是脏数据的问题，此时上边的三步操作都已经实现了，但是在输入的时候我遇到了一个问题，最开始当前的`DOM`结构是`<span>DOM1</span><bold>DOM2</bold>`，此时我在两个`div`的最后输入了中文，也就是唤起了`IME`输入，当我输入了 试试 这两个字(不追加样式)之后，此时的`DOM`结构变成了`<span>DOM1</span><bold>DOM2试试</bold><span>试试</span>`，很明显在`bold`标签里边的文字是异常的，我们此时的数据结构`Delta`内容上是没问题的。然而也就是因为这样造成了问题，我们的`Delta Model`没有改变，那么由我们维护的`Model`映射到`React`维护的`Fiber`时，由于`Model`没有变化那么`React`根据`VDOM diff`的结果发现没有改变于是原地复用了这个`DOM`结构，而实际上这个`DOM`结构由于我们的`IME`输入是已经被破坏了的，而由于英文输入时我们阻止了默认行为是不会去改变原本的`DOM`结构的，所以在这里我们需要进行脏数据检查，并且将脏数据进行修正，确保最后的数据是正常的，目前采取的一个方案是对于最基本的`Text`组件进行处理，在`ref`回调中检查当前的内容是否与`op.insert`一致，不一致要清理掉除第一个节点外的所有节点，并且将第一个节点的内容回归到原本的`text`内容上。

其实曾经我也想通过自绘选区和光标的形式来完成，因为我发现通过`ContentEditable`来控制输入太难控制了，特别是在`IME`中很容易影响到当前的`DOM`结构，由此还需要进行脏数据检查，强行更新`DOM`结构，但是简单了解了下听说坑也不少，于是放弃了这个想法而依然选用了大多数`L1`编辑器都在用的`ContentEditable`。但是实际上`ContentEditable`的坑也很多，这其中有非常多的细节，我们很难把所有的边界条件都处理完成，如何检测`DOM`被破坏由此需要强制刷新，当我们将所有的边界`case`都处理到位了，那么代码复杂度就上来了，可能接下来就需要处理性能问题了，例如我们本身涉及`DOM`与`Model`的映射，所以有大量的计算，这部分也是需要考虑如何去进行优化的，特别是对于大文档来说。

首先我们来聊聊输入部分，输入其实分为了好几种方法，一种是非受控的方法，采用这种方法的时候，我们需要`MutationObserver`来确定当前正在输入字符，之后通过解析`DOM`结构得到最新的`Text Model`，之后需要与原来的`Text Model`做`diff`，由此来得到`ops`，这样就可以应用到当前的`Model`中进行后续的工作了。一种是半受控的方法，通过`BeforeInputEvent`以及`CompositionEvent`分别处理输入/删除与`IME`输入，以及额外的`onKeyDown`、`onInput`事件来辅助完成这部分工作，通过这种方式就可以劫持用户的输入，由此构造`ops`来应用到当前的`Model`，当然对于类似`CompositionEvent`需要一些额外的处理，这也是当前主流的实现方法，当然由于浏览器的兼容性，通常会需要对`BeforeInputEvent`做兼容，例如借助`React`的合成事件或者`onKeyDown`来完成相关的兼容。还有一种是全受控的方法，当我们自绘选区的时候，就必须将所有的内容进行绘制，比如`IME`输入的时候，相关的字符需要记录并且分配`id`，当结束的时候将原来的内容删除并且构造为新的`Model`，全受控通常需要一个隐藏的输入框甚至是`iframe`来完成，这其中也有很多细节需要处理，例如在`CompositionEvent`时需要绘制内容但不能触发协同。

在性能方面，除了上边提到的`WeakMap`可以算作是一种优化方案之外，我们还有很多值得优化的地方，例如因为`Delta`数据结构的关系，我们在这里需要维护一个`PointRange - RawRange`选区的相互变换，而在这其中由于我们对`LineState`的`start`和`size`有所记录，那么我们在变换查找的时候就可以考虑到用二分的方法，因为`start`必然是单向递增的。此外，由于我们实际上是完全可以推算出本次更新究竟是更新了什么内容，所以对于原本的`State`对象是可以通过计算来进行复用的，而不是每次更新都需要刷新所有的对象，当然这可能并不是非常好的操作，没有`immutable`增加了维护的细节和难度。还有一点，对于大文档来说扁平化的数据结构应该是比较好的，扁平化意味着没有那么复杂，例如现在的`Delta`就是扁平化的数据结构，但是随机访问的效率就有些棘手了，或许到了那时候需要结合一些数据存储的方案例如`PieceTable`，当然对于现在来说还是有点远，现在我们的编辑器也只是跑通了基本流程而已。

## 内容导入导出
这次想聊一下业务场景以及相关的技术细节，主要是关于富文本内容导入导出的，这个话题其实是非常大的因为细节会特别多，所以在这里也只是简述。

在线文档会有很多场景需要用到导入导出，导入的场景比如从`Markdown`迁移到我们的富文本形式，这就需要解析`Markdown`转成我们的`ZoneDeltaSet`数据结构，这是一些做文档增量的重要环节。再比如一些文档需要外部供应商的修改，这就需要我们支持导出并且能够将其完备的导入回来，一个非常常见的场景就是文档翻译。在导出方面非常标准的场景就是私有化交付，这种情况下我们通常就需要导出`Word`，当然导出`Markdown`、`PDF`都是比较常见的私有化交付能力，但是对于要求比较高的客户文档还是要求导出`Word`会更正规一些，因为`Markdown`不能支持富文本的所有格式，`PDF`又不太容易编辑，而`Word`就相对能承载更加复杂场景并且拥有可以继续编辑的能力。

导出`Word`实际上是个比较复杂的工作，在这种情况下我们就需要了解`OOXML(Office Open XML)`，`Office Word`的`.docx`文件就是使用`OOXML`标准实现的。如果简单了解下的话，就可以明显的感觉到`Word`的设计就很靠拢于`Quill-Delta`的设计，实际上会更加靠拢我们的`ZoneDeltaSet`设计，当然我们直接构造`OOXML`是很麻烦的，通常需要借助框架，在我个人调研过后能力比较完备的框架是`docx.js`，在研究这个框架之后可以发觉我们的`ZoneDeltaSet`设计是可以相对轻松地进行转换的，这同样也是我个人比较喜欢`quill-delta`而不是`slate-json`数据结构的一个原因。当然即使是使用了框架，我们的工作也是比较复杂的，因为使用`Word`需要比较大量的计算，比如嵌套和缩进的情况下计算宽度，然后`Zone`的嵌套设计是需要使用`Table`来实现的，整体来说还是比较复杂的。当然我们在这里探讨的都是需要非常定制化的场景，如果要求不高的话，直接使用`HTML - Word`就可以了，只不过我们要是实现在线文档私有化交付的话通常都是定制化要求比较高的，所以还是需要相关能力开发的。


## 状态模型管理
在先前的`State`模块更新文档内容时，我们是直接重建了所有的`LineState`以及`LeafState`对象，然后在`React`视图层的`BlockModel`中监听了`OnContentChange`事件，以此来将`BlockState`的更新应用到视图层。这种方式简单直接，全量更新状态能够保证在`React`的状态更新，然而这种方式的问题在于性能，当文档内容非常大的时候，全量计算将会导致大量的状态重建，并且其本身的改变也会导致`React`的`diff`差异进而全量更新文档视图，这样的性能开销通常是不可接受的。

那么通常来说我们就需要基于`Changes`来确定状态的更新，首先我们需要确定更新的粒度，例如以行为基准则`retain`跨行的时候就直接复用原有的`LineState`，这当然是个合理的方法，相当于尽可能复用`Origin List`然后生成`Target List`，这样的方式自然可以避免部分状态的重建，尽可能复用原本的对象。整体思路大概是分别记录旧列表和新列表的`row`和`col`两个`index`值，然后更新时记录起始`row`，删除和新增自然是正常处理，对于更新则认为是先删后增，对于内容的处理则需要分别讨论单行和跨行的问题，最后可以将这部分增删`LineState`数据放置于`changes`中，就可以得到实际增删的`Ops`了，这部分数据在`apply`的`delta`中是不存在的，同样可以认为是数据的补充。

那么这里实际上是存在非常需要关注的点是我们现在维护的是状态模型，那么也就是说所有的更新就不再是直接的`Delta.compose`，而是使用我们实现的`Mutate`，假如我们对于数据的处理存在偏差的话，那么就会导致状态出现问题，本质上我们是需要实现`Line`级别的`compose`方法。实际上我们可以重新考虑这个问题，如果我们整个行的`LeafState`都没有变化的话，是不是就可以意味着`LineState`就可以直接复用了，在`React`中`Immutable`是很常用的概念，那么我们完全可以重写`compose`等方法做到`Imuutable`，然后在更新的时候重新构建新的`Delta`，当行中`Ops`都没有发生变化的时候，我们就可以直接复用`LinState`，当然`LeafState`是完全可以直接复用的，这里我们将粒度精细到了`Op`级别。

此外在调研了相关编辑器之后，我发现关于`key`值的管理也是个值的探讨的问题。先前我认为`Slate`生成的`key`跟节点是完全一一对应的关系，例如当`A`节点变化时，其代表的层级`key`必然会发生变化，然而在关注这个问题之后，我发现其在更新生成新的`Node`之后，会同步更新`Path`以及`PathRef`对应的`Node`节点所对应的`key`值，包括飞书的`Block`行状态管理也是这样实现的，飞书`Block`的叶子节点则更加抽象，`key`值是`stringify`化的`Op`属性值拼接其`Line`内的属性值`index`，用以处理重复的属性对象。我思考在这里`key`值应该是需要主动控制强制刷新的时候，以及完全是新节点才会用得到的，应该跟`React`以及`ContentEditable`非受控有关系，这个问题还是需要进一步的探讨。

因此关于整个状态模型的管理，还有很多问题需要处理，例如我们即使需要重建`LineState`，也需要尽可能找到其原始的`LineState`以便于复用其`key`值，避免整个行的`ReMount`，当然即使复用了`key`值，因为重建了`State`实例，`React`也会继续后边的`ReRender`流程。说到这里，我们对于`ViewModel`的节点都补充了`React.memo`，以便于我们的`State`复用能够正常起到效果。但是，目前来说我们的重建方案效率是不如最开始提到的行方案的，因为此时我们相当于从结果反推，大概需要经过`O(3N)`的时间消耗，而同时`compose`以及复用`state`才是效率最高的方案，这里还存在比较大的优化空间，特别是在多行文档中只更改小部分行内容的情况下，实际上这也是最常见的形式。

## 零宽字符 IME
通常实现`Void/Embed`节点时，我们都需要在`Void`节点中实现一个零宽字符，用来处理选区的映射问题。通常我们都需要隐藏其本身显示的位置以隐藏光标，然而在特定条件下这里会存在吞`IME`输入的问题。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void<span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span></span><span>!</span></div>
```

处理这个问题的方式比较简单，我们只需要将零宽字符的标识放在`EmbedNode`之前即可，这样也不会影响到选区的查找。`https://github.com/ianstormtaylor/slate/pull/5685`。此外飞书文档的实现方式也是这样的，`ZeroNode`永远在`FakeNode`前。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;"><span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span>Void</span><span>!</span></div>
```

## Void IME
在这里我还发现了一个很有趣的事情，是关于`ContentEditable`以及`IME`的交互问题。在`slate`的`issue`中发现，如果最外层节点是`editable`的，然后子节点中某个节点是`not editable`的，然后其后续紧接着是`span`的文本节点，当前光标位于这两者中间，此时唤醒`IME`输入部分内容，如果按着键盘的左键将`IME`的编辑向左移动到最后，则会使整个编辑器失去焦点，`IME`以及输入的文本也会消失，此时如果在此唤醒`IME`则会重新出现之前的文本。这个现象只在`Chromium`中存在，在`Firefox/Safari`中则表现正常。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void</span><span>!</span></div>
```

这个问题我在`https://github.com/ianstormtaylor/slate/pull/5736`中进行了修复，关键点是外层`span`标签有`display:inline-block`样式，子`div`标签有`contenteditable=false`属性。

```html
<div contenteditable="true"><span contenteditable="false" style="background: #eee; display: inline-block;"><div contenteditable="false">Void</div></span><span>!</span></div>
```
## 选区校正
1. `ZeroEnter`节点选区位置前置。
2. 方向键选区位置调整，目标预测`Next`状态，折叠/`shift`状态处理。

```js
// Case 1: 当前节点为 data-zero-enter 时, 需要将其修正为前节点末尾
// content\n[cursor] => content[cursor]\n
const isEnterZero = isEnterZeroNode(node);
if (isEnterZero && offset) {
  leafOffset = Math.max(leafOffset - 1, 0);
  return new Point(lineIndex, leafOffset);
}
```

```html
<div id="$1" contenteditable style="outline: 1px solid #aaa">1234567890</div>
<script>
  const text = $1.firstChild;
  class Range {
    constructor(start, end, isBackward) {
      [this.start, this.end] = start > end ? [end, start] : [start, end];
      this.isBackward = isBackward;
      this.isCollapsed = false;
      if (start === end) {
        this.isCollapsed = true;
        this.isBackward = false;
      }
    }
  }
  let range = null;
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (selection.anchorNode !== text || selection.focusNode !== text || selection.rangeCount <= 0) {
      return;
    }
    const sel = selection.getRangeAt(0);
    range = new Range(sel.startOffset, sel.endOffset, selection.anchorOffset !== sel.startOffset);
    console.log("Range :>> ", range);
  });
  $1.addEventListener("keydown", (event) => {
    const leftArrow = event.key === "ArrowLeft";
    const rightArrow = event.key === "ArrowRight";
    if (leftArrow || (rightArrow && range)) {
      event.preventDefault();
      const focus = range.isBackward ? range.start : range.end;
      const anchor = range.isBackward ? range.end : range.start;
      let newRange = null;
      if (!range.isCollapsed && !event.shiftKey) {
        newRange = leftArrow
          ? new Range(range.start, range.start, false)
          : new Range(range.end, range.end, true);
      }
      if (leftArrow && !newRange) {
        const newFocus = Math.max(0, focus - 1);
        const isBackward = event.shiftKey && range.isCollapsed ? true : range.isBackward;
        const newAnchor = event.shiftKey ? anchor : newFocus;
        newRange = new Range(newAnchor, newFocus, isBackward);
      }
      if (rightArrow && !newRange) {
        const newFocus = Math.min(text.length, focus + 1);
        const isBackward = event.shiftKey && range.isCollapsed ? false : range.isBackward;
        const newAnchor = event.shiftKey ? anchor : newFocus;
        newRange = new Range(newAnchor, newFocus, isBackward);
      }
      if (newRange) {
        const sel = window.getSelection();
        if (newRange.isBackward) {
          sel.setBaseAndExtent(text, newRange.end, text, newRange.start);
        } else {
          sel.setBaseAndExtent(text, newRange.start, text, newRange.end);
        }
      }
    }
  });
</script>
```

## Input Undo
1. `BeforeInput`事件完全`PreventDefault`，则由于浏览器内置`Stack`永远为空，不会触发`historyUndo`的`InputType`。
2. `KeyDown`事件完全接管`undo/redo`，则由于非`Firefox`会即使在非聚焦状态也会触发上次编辑的`undo/redo`，导致状态不同步。
3. `Input`事件的`historyUndo/historyRedo`接管，则由于`BeforeInput`阻止默认行为，根本不会触发事件，但非聚焦状态的`undo`会触发。

```html
<div id="$1" contenteditable style="outline: 1px solid #aaa;"></div>
<script>
  $1.addEventListener("beforeinput", (event) => {
    console.log("before input event :>> ", event);
    event.preventDefault();
  });
  $1.addEventListener("input", (event) => {
    console.log("input event :>> ", event);
  });
</script>
```

## History 协同基础
无论是在数据结构还是诸多模块的设计中，我一直都是比较协同相关的基础建设，因此对于`History`模块自然需要设计协同基础能力。对于`History`的栈基础设计则不是此处关注的重点，设想一下对于远程的`Op`我们自然不能由非此`Op`产生的客户端撤销，即`A`不应该撤销`B`的`Op`，那么在这里需要先回顾一下协同的基本实现，即`Delta`的`transform`函数的使用`ob1 = transform(a, b)`。

```js
// https://quilljs.com/playground/snow
// https://www.npmjs.com/package/quill-delta#transform
const Delta = Quill.imports.delta;
let baseA = new Delta().insert("12");
let baseB = new Delta().insert("12");
const oa = new Delta().retain(2).insert("A");
const ob = new Delta().retain(2).insert("B");
baseA = baseA.compose(oa); // [{insert:"12A"}]
baseB = baseB.compose(ob); // [{insert:"12B"}]
const ob1 = oa.transform(ob, true); // [{retain:3},{insert:"B"}]
const oa1 = ob.transform(oa); // [{retain:2},{insert:"A"}]
baseA = baseA.compose(ob1); // [{insert:"12AB"}]
baseB = baseB.compose(oa1); // [{insert:"12AB"}]
```

那么对于协同存储的栈内容，我们就需要`Delta`的`invert`函数来实现，这个函数需要将`previous`作为基准来得到`inverted`，即`changes.invert(previous)`。如下面的示例中在得到`inverted`之后，我们此时的`undo`栈则是存在两个值，如果此时得到了一个`undoable`的`op`例如远程操作或者图片的上传完成操作，就需要为栈内的存量数据做变换操作，类似于`oa1 = transform(remoteOp, a)`将所有的栈内操作全部处理。

```js
// https://www.npmjs.com/package/quill-delta#invert
// https://github.com/slab/quill/blob/main/packages/quill/src/modules/history.ts
const Delta = Quill.imports.delta;
let base = new Delta();
const op1 = new Delta().insert("1");
const op2 = new Delta().retain(1).insert("2");
let invert1 = op1.invert(base); // [{delete:1}]
base = base.compose(op1); // [{insert:"1"}]
let invert2 = op2.invert(base); // [{retain:1},{delete:1}]
base = base.compose(op2); // [{insert:"12"}]
let undoable = new Delta().retain(2).insert("3");
base = base.compose(undoable); // [{insert:"123"}]
invert2 = undoable.transform(invert2, true); // [{retain:1},{delete:1}]
invert1 = undoable.transform(invert1, true); // [{delete:1}]
```

上述的算法实现其实存在一个问题，我们的`undoable op`是一直处于原始状态，而实际上由于假设`inverted`内容会实际应用到`base`，因此这里的`undoable`同样也需要做变换。在下面的例子上若不做`undoable transform`的话，则`invert2`的结果则是`retain: 3, delete: 1`，此时的基准是`00031000`则删除的字符是`3`，此时明显是错误的，而在做了`transform`之后是`retain: 4, delete: 1`则能正确删除`1`字符。

```js
const Delta = Quill.imports.delta;
let base = new Delta().insert("000000");
const op1 = new Delta().retain(3).insert("1");
const op2 = new Delta().retain(3).insert("2");
let invert1 = op1.invert(base); // [{retain:3},{delete:1}]
base = base.compose(op1); // [{insert:"0001000"}]
let invert2 = op2.invert(base); // [{retain: 3},{delete:1}]
base = base.compose(op2); // [{insert:"00021000"}]
let undoable = new Delta().retain(4).insert("3");
base = base.compose(undoable); // [{insert:"000231000"}]
invert2 = undoable.transform(invert2, true); // [{retain:3},{delete:1}]
undoable = invert2.transform(undoable); // [{retain:3},{insert:"3"}]
invert1 = undoable.transform(invert1, true); // [{retain:4},{delete:1}]
```

## 状态/视图更新优化策略
在最开始的时候，我们的状态管理形式是直接全量更新`Delta`，然后使用`EachLine`遍历重建所有的状态，并且实际上我们维护了`Delta`与`State`两个数据模型。但是这样的模型必然是耗费性能的，每次`Apply`的时候都需要全量更新文档并且再次遍历分割行状态，当然实际上只是计算迭代的话，实际上是不会太过于耗费性能，但是由于我们每次都是新的对象，那么在更新视图的时候，更容易造成性能的损耗。

那么在后来的设计中，我们实现了一套`Immutable Delta+Iterator`来处理更新，这种时候我们就可以借助不可变的方式来实现`React`视图的更新，此时的`key`是根据`WeakMap`来实现的对应`id`值，此时就可以借助`key`的管理以及`React.memo`来实现视图的复用。但是这种方式也是有问题的，因为此时我们即使输入简单的内容，也会导致整个行的`key`发生改变，而此时我们是不必要更新此时的`key`的。

此外在这种方式中，我们判断`LineState`是否需要新建则是根据整个行内的所有`LeafState`来重建的，也就是说这种时候我们是需要再次将所有的`op`遍历一遍，当然实际上由于最后还需要将`compose`后的`Delta`切割为行级别的内容，所以其实这里最少需要遍历两遍。那么此时我们需要思考优化方向，首先是首个`retain`，在这里我们应该直接完整复用原本的`LineState`，包括处理后的剩余节点也是如此。而对于中间的节点，我们就需要为其独立设计更新策略。

首先是对于新建的节点，我们直接构建新的`LineState`即可，删除的节点则不从原本的`LineState`中放置于新的列表。而对于更新的节点，我们实际上是需要更新原本的`LineState`对象的，因为我们实际上的行是存在更新的，而重点是我们需要将原本的`LineState`的`key`值复用，这里我们方便的实现则是直接以`\n`的标识为目标的`State`，即如果在`123|312\n`的`|`位置插入`\n`的话，那么我们就是`123`是新的`LineState`，`312`是原本的`LineState`，这样我们就可以实现`key`的复用。

## Void 选区变换
本质上富文本编辑器是图文混排的编辑器，在通过`Void/Embed`来实现图片的时候，我发现如果点击图片节点并不能触发`DOM`选区的变化，而由于`DOM`选区本身不变化则会导致我们的`Model`选区不会跟随变动，因此诸如焦点和选择等问题就会出现。

```html
<div contenteditable>
  <div><span>123</span></div>
  <div><span><img src="https://windrunnermax.github.io/DocEditor/favicon.ico" /></span></div>
  <div><span>123</span></div>
</div>
<script>
  document.addEventListener("selectionchange", function() {
    console.log(window.getSelection());
  });
</script>
```

在`Slate`中的实现是当触发`OnClick`事件时，会主动调用`ReactEditor.toSlateNode`方法查找`data-slate-node`对应的`DOM`节点，然后通过`ELEMENT_TO_NODE`查找对应的`Slate Node`节点，再通过`ReactEditor.findPath`来获取其对应的`Path`节点，如果此时两个基点都是`Void`则会创建`range`，然后最终设置最新的`DOM`。

```js
// https://github.com/ianstormtaylor/slate/blob/f2e211/packages/slate-react/src/components/editable.tsx#L1153
const node = ReactEditor.toSlateNode(editor, event.target)
const path = ReactEditor.findPath(editor, node)
const start = Editor.start(editor, path)
const end = Editor.end(editor, path)
const startVoid = Editor.void(editor, { at: start })
const endVoid = Editor.void(editor, { at: end })

if (
  startVoid &&
  endVoid &&
  Path.equals(startVoid[1], endVoid[1])
) {
  const range = Editor.range(editor, start)
  Transforms.select(editor, range)
}
```

在当前的编辑器实现中，由于我们的设计是通过`Void`节点作为高阶组件来实现，因此在这里可以直接借助`onMouseDown`事件来实现选区的设置即可，而在这里的选区又出现了问题，此处的节点状态是` \n`，此处实际上会被分为三个位置，而我们实际上的`Void`只应该在第二个位置，而这个位置实际上也应该被认为是行首，因为在按键盘左右键的时候也需要用到。

```js
const onMouseDown = () => {
  const el = ref.current;
  if (!el) return void 0;
  const leafNode = el.closest(`[${LEAF_KEY}]`) as HTMLElement | null;
  const leafState = editor.model.getLeafState(leafNode);
  if (leafState) {
    const point = new Point(leafState.parent.index, leafState.offset + leafState.length);
    const range = new Range(point, point.clone());
    editor.selection.set(range, true);
  }
};

// Case 2: 光标位于 data-zero-void 节点前时, 需要将其修正为节点末
// [cursor][void]\n => [void][cursor]\n
const isVoidZero = isVoidZeroNode(node);
if (isVoidZero && offset === 0) {
  return new Point(lineIndex, 1);
}

const firstLeaf = lineState.getLeaf(0);
const isBlockVoid = firstLeaf && firstLeaf.block && firstLeaf.void;
const isFocusLineStart = focus.offset === 0 || (isBlockVoid && focus.offset === 1);
```

## 节点选中状态
在编辑器场景中，节点的选中状态是非常常见的功能，例如在当点击图片节点时，通常需要为图片节点添加选中状态，当前我思考了两种实现方式，分别是使用`React Context`和内建的事件管理来实现，`React Context`是在最外层维护选区的`useState`状态，而内建事件管理则是监听编辑器内部的`selection change`事件来处理回调。

`Slate`是使用`Context`来实现的，在每个`ElementComponent`节点的外层都会有`SelectedContext`来管理选中状态，当选区状态变化时则会重新执行`render`函数。这样的方式实现起来方便，只需要预设`Hooks`就可以直接在渲染后的组件中获取到选中状态，但是这样的方式需要在最外层将`selection`状态传递到子组件当中。

```js
// https://github.com/ianstormtaylor/slate/blob/f2e2117/packages/slate-react/src/hooks/use-children.tsx#L64
const sel = selection && Range.intersection(range, selection)
children.push(
  <SelectedContext.Provider key={`provider-${key.id}`} value={!!sel}>
    <ElementComponent
      decorations={ds}
      element={n}
      key={key.id}
      renderElement={renderElement}
      renderPlaceholder={renderPlaceholder}
      renderLeaf={renderLeaf}
      selection={sel}
    />
  </SelectedContext.Provider>
)
```

在这里我们使用的方式则是管理编辑器事件来管理选区，因为在我们的插件里是实例化后调用方法来完成视图渲染的调度，那么在这里我们就实现继承于`EditorPlugin`的类以及选区高阶组件，在实例中监听编辑器的选区变化，用以触发高阶组件的状态变化，而高阶组件的选择状态则可以直接根据`leaf`的位置与当前选区的位置来判断。

```js
export abstract class SelectionPlugin extends EditorPlugin {
  protected idToView: Map<string, SelectionHOC>;
  public mountView(id: string, view: SelectionHOC) {
    this.idToView.set(id, view);
  }
  public unmountView(id: string) {
    this.idToView.delete(id);
  }
  public onSelectionChange = (e: SelectionChangeEvent) => {
    const current = e.current;
    this.idToView.forEach(view => {
      view.onSelectionChange(current);
    });
  };
}

export class SelectionHOC extends React.PureComponent<Props, State> {
  public onSelectionChange(range: Range | null) {
    const nextState = range ? isLeafRangeIntersect(this.props.leaf, range) : false;
    if (this.state.selected !== nextState) {
      this.setState({ selected: nextState });
    }
  }

  public render() {
    const selected = this.state.selected;
    if (this.props.selection.readonly) {
      return this.props.children;
    }
    return (
      <div className={cs(this.props.className, selected && "doc-block-selected")}>
        {React.Children.map(this.props.children, child => {
          if (React.isValidElement(child)) {
            const { props } = child;
            return React.cloneElement(child, { ...props, selected: selected });
          } else {
            return child;
          }
        })}
      </div>
    );
  }
}
```

## Void 移动光标
在我们的设计中`DOM`结构是完整对应数据结构的，在`Void`结构中本体的空节点会被渲染为`ZeroWidth`的`Text`节点以及延续的嵌入节点，整体节点渲染如下所示。

```html
<div data-node="true" dir="auto">
  <span data-leaf="true" class="">
    <span data-zero-space="true" data-zero-void="true" style="width: 0px; height: 0px; color: transparent; position: absolute;">​</span>
    <span class="editor-image-void" contenteditable="false" data-void="true" style="user-select: none;">
      <img src="https://windrunnermax.github.io/DocEditor/favicon.ico" width="200" height="200">
    </span>
  </span>
  <span data-leaf="true">
    <span data-zero-space="true" data-zero-enter="true" style="width: 0px; height: 0px; color: transparent; position: absolute;">​</span>
  </span>
</div>
```

然而这个实现在移动光标的时候会出现问题，如果此时光标在`Void`节点时按下方向键时会导致光标无法移动，因为此时选区会移动到回车零宽字符的末尾，而由于我们的选区校正会将其又校正回`Void`节点的零宽字符后，这就导致了光标无法移动的问题。因此这里需要主动控制选区的移动，在`Void`节点上绑定键盘事件，按上下方向键时受控处理。

```js
const sel = editor.selection.get();
if (sel && sel.isCollapsed && Point.isEqual(sel.start, range.end)) {
  switch (e.keyCode) {
    case KEY_CODE.DOWN: {
      e.preventDefault();
      const nextLine = leafState.parent.next();
      if (!nextLine) break;
      const point = new Point(nextLine.index, nextLine.length - 1);
      editor.selection.set(new Range(point, point.clone()), true);
      break;
    }
    case KEY_CODE.UP: {
      e.preventDefault();
      const prevLine = leafState.parent.prev();
      if (!prevLine) break;
      const point = new Point(prevLine.index, prevLine.length - 1);
      editor.selection.set(new Range(point, point.clone()), true);
      break;
    }
  }
}
```

## Void 键入内容
如果光标此时在`Void`节点时，此时按下任何输入键则会导致节点内容变成`inline-block`的形式，这里的问题是`BlockVoid`节点应该是独占一行的，而输入内容之后，则实际的状态变成了如下内容。

```
[Zero][input]\n
```

因此在这里最简单的方案则是此时如果光标在`Void`节点时按下输入键则直接阻止默认行为，如果输入内容则不会触发`insert`具体的文本，这个行为跟`Slate`的表现是一致的。

```js
const indexOp = pickOpAtRange(editor, sel);
if (editor.schema.isVoid(indexOp)) {
  return void 0;
}
```

但是在这里我们还需要处理中文输入的情况，因为`beforeinput`事件是不能够实际阻止`IME`的行为的，而此时我们的内容虽然没有办法输入进去，但是选区发生了变化，还会导致我们的`toDOMRange`方法出现了问题，选区此时会被重置为`null`，因此我们需要在选区从`DOM`到`Modal`时重新为其校正。

```js
// Case 3: 光标位于 data-zero-void 节点唤起 IME 输入, 修正为节点末
// [ xxx[cursor]]\n => [ [cursor]xxx]\n
const isVoidZero = isVoidZeroNode(node);
if (isVoidZero && offset !== 1) {
  return new Point(lineIndex, 1);
}
```

## 数据结构与协同算法
对编辑器而言数据结构的设计非常重要，我在最开始就是希望实现`blocks`化的编辑器，因此在基本包的设计中并没有设计块级的嵌套结构，而是更专注于基本图文混排的富文本能力。而在基本的块结构上实现`Blocks`能力，目前我能设想到两种设计，第一种是类似于`slate`的嵌套数据结构，即通过多层的`children`来组织所有的块结构，而`leaf`节点中的每个`delta`都是行结构内容。

```js
{
  children: [
    { delta: Delta(), attributes: {} },
    { delta: Delta(), attributes: {} }
  ]
}
```

第二种方式则是借助`delta`本身来管理块结构，也就是说块的引用是借助`op`节点来完成，同样的每个`id`指向的`block`我们依然只维护行级别的内容。其实也就是相当于我们需要设计一个独立的`L(list)`类型的`block`，以此来按行管理所有的子级`blocks`，此外例如表格的表达，则同样需要需要独立的`G(group)`来组织非受控的单元格`blocks`，其并不参与实际渲染而仅作为桥接内容。

```js
({
  xxx: {
    ops: [ { insert: "abc" } ]
  },
  yyy: {
    ops: [ { insert: "123" } ]
  },
  ROOT: {
    ops: [
      { insert: " ", attributes: { blockId: "xxx" } },
      { insert: " ", attributes: { blockId: "yyy" } },
    ]
  }
})
```

在思考这个问题的时候，我想到先前在飞书开放平台的服务端的读取文档内容接口，其内容的设计是基于`block`的嵌套结构设计，类似于我们上述的第一种方案，只不过粒度会更细一些，预测是将文本的内容也做了转换。但是问题是之前看过飞书的协同算法是`easy-sync`来实现的，而`easy-sync`是针对于文本的扁平结构实现的协同算法，那么是如何用扁平结构的协同算法实现的嵌套结构协同。

理论上这种方式并不容易实现，而恰好我又想起来了`ot-json`的协同算法，因此直接在飞书的文档代码中搜索了一下`ot-json`的硬编码字符串，果然存在相关内容，因此我猜测整个协同的实现则是`ot-json0`来实现结构协同，`easy-sync`来实现文本协同，而不直接使用`ot-json0`的`text-type`来实现文本协同，则是因为`json0`仅实现了纯文本的协同，没有携带`attrs`相关的数据，如果需要组合来维护线性结构的富文本则还有些成本在内。

实际上我个人觉得嵌套的数据结构是比较难以处理的，以`list + quote`格式为例，在嵌套结构中 `list`嵌套`quote` / `quote`嵌套`list` 的表现是不一致的，类似的内容需要特殊处理，而对于扁平的结构则无论怎么套`list + quote`都是在`op`独立的`attributes`中，无论先后都不会有差异。因此我还是比较希望使用第二种方法来实现`blocks`，这种实现则不需要`ot-json`的介入，仅需要`rich-text/easy-sync`类型的协同数据基类即可，这样对于数据的操作类型则简单很多，但是在数据可读性上就稍微弱了一些，而实现的协同算法对于数据结构则极为依赖，因此这里对于方案的选用还是需要再考虑一下。

关注协同算法的实现即使对于非协同的场景也是非常重要的，对于我们的纯本地内容而言，假设此时我们需要上传图片则由于上传的过程是异步的，我们就需要在上传中加一个`loading`状态，而在上传完成之后则需要将`src`的位置替换为正式的`url`，初始的`src`则可以是`blob`的临时`url`。那么在这个过程中我们就需要`blob -> http`的这个状态作为`undoable`的操作，否则就会导致`undo`的时候会回退到`loading`的暂态。而如果在不实现协同依赖的`transform`操作变换的情况下，则通常不会记录`invert2`即可，下面的内容也是可以实现的。

```js
const Delta = Quill.imports.delta;
let base = new Delta();
const op1 = new Delta().insert(" ", { src: "blob" });
const invert1 = op1.invert(base); // { delete: 1 }
base = base.compose(op1); // { insert: " ", attributes: { src: "blob" } }
const undoable = new Delta().retain(1, { src: "http" });
base = base.compose(undoable); // { insert: " ", attributes: { src: "http" } }
base = base.compose(invert1); // []
```

在通常情况下这里并没有什么问题，而`invert`的数据中如果存在`attributes`则可能出现问题，在下面的例子中，假如我们不进行`undoable.transform`的操作，则会导致最终的结果是`src: mock`，但是别忘了我们的`undoable`是`src: http`，这里的`http`是不应该被替换的，因此这里的`transform`操作是非常重要的，当我们依照先前的`History`协同基础设计上将其做操作变换，然后再进行`compose`应用`inverted`结果，就可以得到正确的`src: http`属性。

```js
const Delta = Quill.imports.delta;
let base = new Delta().insert(" ", { src: "mock" });
const op1 = new Delta().retain(1, { src: "blob" });
let invert1 = op1.invert(base); // { retain: 1, attrs: { src: "mock" } }
base = base.compose(op1); // { insert: " ", attributes: { src: "blob" } }
const undoable = new Delta().retain(1, { src: "http" });
base = base.compose(undoable); // { insert: " ", attributes: { src: "http" } }
invert1 = undoable.transform(invert1, true); // []
base = base.compose(invert1); // { insert: " ", attrs: { src: "http" } }
```

## 行末零宽字符
我们使用零宽字符的主要目的是为了放置光标，而目前我们的视图渲染是完全对等于数据结构的，也就是说我们的行末必然存在一个零宽字符，用来对等数据结构中末尾的`\n`对应的`Leaf`节点，实现这个节点的目的主要有几个方面。

1. 完全对等数据结构，与我们设计的`LineState`数据对齐，每个`LeafState`都必然渲染一个`DOM`节点，数据模型友好，且这样就可以在空行时必然会留存有文本节点，而不必要特殊处理。
2. `Mention`节点的渲染，如果行的最后一个节点是`Void`节点，则会导致光标无法放置于末尾，这个问题的处理我们则按需渲染一个零宽字符节点即可，`slate`即如此处理的末尾`Mention`节点。
3. 在研究`Lark`的编辑器时发现每个文本行末尾必然会存在零宽字符，预计是为了解决`Blocks`的相关问题，请教了大佬还得知早起的`etherpad`每行也是实现了零宽字符，用来处理`DOM`与选区的相关问题。

在这里我们实现了太多的兼容方案来处理这个问题，例如上边的选区校正部分以及`Void`选区变换部分内容，而如果实际上我们不渲染这个节点的话就不需要处理这两处相关问题，但是这样的话我们就需要处理其他的`case`来保证`DOM`与`Model`的对等性。那么此时我们需要解决空行的选区问题，此时如果直接使用空节点即`<span></span>`设置为子节点的话，则会由于此时并没有实际的文本内容，因此这里的高度并没有撑起来并且选区是无法聚焦到此处的，因此这里我们还是需要空节点的内容为零宽字符，这样的话就可以实现选区的聚焦。

```js
const nodes: JSX.Element[] = [];
leaves.forEach((leaf, index) => {
  if (leaf.eol) {
    // COMPAT: 空行则仅存在一个 Leaf, 此时需要渲染空的占位节点
    !index && nodes.push(<EOLModel key={EOL} editor={editor} leafState={leaf} />);
    return void 0;
  }
  nodes.push(<LeafModel key={index} editor={editor} index={index} leafState={leaf} />);
});
return nodes;
```

实际上末尾的节点如果是`<br />`节点的话，是可以不需要零宽字符来解决这个问题的，选区节点是可以放置于此节点上的，且不会有`0/1`两个`offset`的偏移需要处理，`quill`对于空行就是如此处理的。不过对于我们来说，对于`Void`节点是需要处理零宽字符，因为`BR`节点仅存在`0 offset`，这就导致了选区在`Void`节点时依赖默认行为无法正常删除当前节点还需要特殊处理，此外监听`Arrow`方向键的处理还是需要处理的，大佬说`<br />`节点还可能存在卡断`IME`的情况，所以当前还是保持了现状。

```js
export const getTextNode = (node: Node | null): Text | null => {
  if (isDOMText(node)) {
    return node;
  }
  if (isDOMElement(node)) {
    const textNode = node.childNodes[0];
    if (textNode && (isDOMText(textNode) || isBRNode(textNode))) {
      return textNode;
    }
  }
  return null;
};
```

行末的零宽字符还有个比较重要的应用，如果我们的选区操作是从上一行的末尾选到下一行的部分内容时，通过`Selection`得到的选区变换的`Model`是跨越两行的。此时如果做一些操作例如`TAB`缩进的话，是会对多行应用的操作，然而我们的淡蓝色选区看起来只有一行，因此看起来会像是个`BUG`，主要还是视觉上与实际操作上的不一致。

在腾讯文档、谷歌文档等类似的`Canvas`实现的编辑器中，这个问题是通过额外绘制了淡蓝色的选区来解决的。而我们如果通过`DOM`来实现的话，则不能直接绘制内容，这样我们就可以使用零宽字符来实现，即在行末添加一个零宽字符节点，这其中实现的重点是，而当我们选区在零宽字符后时，主动将其修正为零宽字符前。这个实现在`Chrome`上表现良好，但是在`FireFox`上就没有效果了。

```html
<div contenteditable="true">
  <div><span>末尾零宽字符 Line 1</span><span>&#8203;</span></div>
  <div><span>末尾零宽字符 Line 2</span><span>&#8203;</span></div>
  <div><span>末尾纯文本 Line 1</span></div>
  <div><span>末尾纯文本 Line 2</span></div>
</div>
<script>
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (selection.rangeCount < 1) return;
    const staticSel = selection.getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset, collapsed } = staticSel;
    if (startContainer?.textContent === "\u200B" && startOffset > 0) {
      selection.setBaseAndExtent( startContainer, 0, endContainer, collapsed ? 0 : endOffset);
    }
  });
</script>
```

## Embed 节点
我们的`Embed`节点实际上应该是`InlineVoid`节点，但是因为组件名太长所以就起了别名为`Embed`，而在具体实现的时候遇到了太多了的问题，我只得感慨纸上得来终觉浅，绝知此事要躬行。在之前我一直都是在使用富文本引擎来实现应用层的功能，而虽然我也基本阅读过`slate`的代码并且提过了一些`pr`来解决一些问题，但在真正想对照实现的时候发现问题实在是太多。

现在的问题是我们是借助浏览器本身的`contentable`来绘制的光标位置，而不是采用自绘选区的方式，这样就导致我们必须要依赖浏览器本身对于选区的实现。而此时如果我们是实现`InlineVoid`节点且行内只有该节点时，就会导致光标无法放在周围的位置上，这跟文本内容的表现是不一致的。在下面的例子中，中间的行是做不到单击时光标落在节点末尾的，虽然可以通过双击或者方向键来实现，但是此时的节点并不是在文本节点上的，与我们的选区设计不符。

```html
<div contenteditable style="outline: none">
  <div data-node><span data-leaf><span>123</span></span></div>
  <div data-node>
    <span data-leaf><span contenteditable="false">321</span></span>
  </div>
  <div data-node><span data-leaf><span>123</span></span></div>
</div>
```

对于这个问题的解决，无论是`quill`、`slate`都是在`Embed`节点的两侧添加了零宽字符`&#xFEFF;`用以放置光标，当然这仅仅是当`Embed`节点左右没有文本节点时的情况，如果两侧有文本则不需要这样的特殊处理。那么如果我们此时如果按照`slate`的设计，即此时存在三个可选位置可以放置光标作为选区，即`Embed`本身以及左右光标`CARET`，那么此时就会存在三个零宽字符位置。

```html
<span data-zero-enter> </span>
<span data-zero-embed> </span>
<span data-zero-enter> </span>
```

而且在`slate`中的数据结构是经过`normalize`之后与数据结构格式严格对应的，也就是说在上边这个例子中，`slate`的行结构内容将会类似下面的内容，其实这样也就很容易理解为什么类似于图片这种`Void`节点也必须要存在`children`结构了，因为其存在的零宽字符必须要完整对应数据结构，且由于其计算时会真正计算为零宽，光标落点也在零宽字符节点上，这样则可以保证选区只会在零宽节点的`0 offset`上。

```js
[
  { text: "" },
  { type: "embed", children: [{ text: "" }] },
  { text: "" }
]
```

但是有个重要的问题是，零宽字符是存在两个光标位置的，即`0|1`两个`offset`，那么此时我们就存在了`4`个光标位置`|||`，而此时我们的`Model`在此时只有两个节点即` \n`，那么即使我们不允许光标放在`\n`后，也才能勉强对应上三个光标位置，而这里最重要的是我们前边说的一个零宽字符存在两个`offset`，那么对于`toDOMPoint`时同一个光标位置的处理就会存在两个情况。


```html
<span data-zero-enter> |</span>
<span data-zero-embed>| </span>
<span data-zero-enter> </span>
```

而我们最开始设计`toDOMPoint`的时候优先将光标放置于前一个节点的末尾，那么我们点击行末尾的时候，此时的光标会位于`zero-enter`节点后，那么此时的`offset`是`2`，而此时由于我们的选区校正存在，这里的`offset`会被校正为`1`。那么此时我们的选区则会被校正为第一个`data-zero-enter`节点，且`offset`的值为`1`，那么此时我们本应该希望放置于最后一个`data-zero-enter`节点上的光标，现在却被校正到首个节点上了。

```html
<span data-zero-enter> |</span>
<span data-zero-embed> </span>
<span data-zero-enter> </span>
```

那么假设我们最开始不将`offset`的`2`值校正为`1`的话，此时我们的选区则会被设置到`data-zero-embed`节点的`offset -> 1`位置上，依然不是我们希望的光标位置，因此这里依然不是正确的选区位置，这样依然需要存在额外校正的情况。

```html
<span data-zero-enter> </span>
<span data-zero-embed> |</span>
<span data-zero-enter> </span>
```

那么这里如果改造起来可能存在不少问题，主要是这里存在了两个节点的突变，那么我们如果换个思路减少零宽字符的节点，即去掉第一个零宽字符节点。那么我们这样就无法保持三个选区状态了，而如果希望`zero-embed`的`0 offset`为左光标，`offset 1`为嵌入内容的选中效果则是不容易实现的，因为光标本身不能是左出现右消失的状态，这里需要样式的额外处理才可以。

那么根据上述的问题，`data-zero-embed`节点则会是我们要处理的左光标，右光标则依然是`data-zero-enter`节点，左光标的处理则需要让右侧的`Embed`内容存在`margin`样式。那么在默认情况下，此时我们在校正`\n`节点后的选区`offset`为`1`，默认的选区位置则如下所示。

```html
<span data-zero-embed> |</span>
<span data-zero-enter> </span>
```

那么这里依然会有问题，我们点击行末尾时，此时的选区则会被调度到左光标的位置上，这里的效果显然是不合适的，因为这样的话我们无法聚焦到行末，因此这里我们需要为`toDOMPoint`设置额外的处理逻辑，即取消了默认的`offset`优先逻辑，而是采用`node`优先逻辑，在`data-zero-embed`节点且`offset`为`1`时，优先聚焦到后续的`data-zero-enter`节点`offset -> 0`上。

```js
const nodeOffset = Math.max(offset - start, 0);
const nextLeaf = leaves[i + 1];
// CASE1: 对同个光标位置, 且存在两个节点相邻时, 实际上是存在两种表达
// 即 <s>1|</s><s>1</s> / <s>1</s><s>|1</s>
// 当前计算方法的默认行为是 1, 而 Embed 节点在末尾时则需要额外的零宽字符放置光标
// 如果当前节点是 Embed 节点, 并且 offset 为 1, 并且存在下一个节点时
// 需要将焦点转移到下一个节点, 并且 offset 为 0
if (
  leaf.hasAttribute(ZERO_EMBED_KEY) &&
  nodeOffset === 1 &&
  nextLeaf &&
  nextLeaf.hasAttribute(ZERO_SPACE_KEY)
) {
  return { node: nextLeaf, offset: 0 };
}
```

这里实际上还存在问题，如果后续的节点是文本节点，会依然导致无法放置光标，因此这里实际上只需要判断`nextLeaf`存在即需要移动选区位置。而此时依然存在问题，因为同节点会存在两个`offset`位置，所以此时我们还是需要先校正`toModelPoint`的位置，即如果光标位于`data-zero-embed`节点后时, 需要将其修正为节点前。

```js
// Case 4: 光标位于 data-zero-embed 节点后时, 需要将其修正为节点前
// 若不校正会携带 DOM-Point CASE1 的零选区位置, 按下左键无法正常移动光标
// [embed[cursor]]\n => [[cursor]embed]\n
const isEmbedZero = isEmbedZeroNode(node);
if (isEmbedZero && offset) {
  return new Point(lineIndex, leafOffset - 1);
}
```

那么此时又会出现新的问题，当光标位于节点左时，会导致我们按右键无法移动光标，因为此时的选区会被上述的逻辑校正回原本的位置，因此我们依然需要在`onKeyDown`事件中受控处理这个问题，当选区位于`data-zero-embed`节点时，按下右键则主动调整选区。

```js
const sel = getStaticSelection();
if (rightArrow && sel && isEmbedZeroNode(sel.startContainer)) {
  event.preventDefault();
  const newFocus = new Point(focus.line, focus.offset + 1);
  const isBackward = event.shiftKey && range.isCollapsed ? false : range.isBackward;
  const newAnchor = event.shiftKey ? anchor : newFocus.clone();
  this.set(new Range(newAnchor, newFocus, isBackward), true);
  return void 0;
}
```

## 零宽字符选区移动
在实现`Embed`节点时，我是将内置的零宽字符`0/1`两个位置作为光标的放置位置，而`offset 1`的位置会被实际移动到后一个节点的`offset 0`上，那么实际上如果此时我们仅使用该偏移方案而不校正`ModelPoint`的话，理论上而言是可行的，然而在实际的操作中，我们发现如果两个选区节点之间不连续的话，按左键会导致选区从`node2 offset 0`移动到`node1 offset 1`的位置，而如果连续的话则是会正常移动到`node1 offset len-1`的位置。

```html
<div contenteditable style="outline: none">
  <div><span id="$1">123</span><span contenteditable="false">Embed</span><span id="$2">456</span></div>
  <div><span id="$3">123</span><span id="$4">456</span></div>
</div>
<div>
  <button id="$5">Embed</button>
  <button id="$6">Span</button>
</div>
<script>
  const sel = window.getSelection();
  document.addEventListener("selectionchange", () => {
    console.log("selection", sel?.anchorNode.parentElement, sel?.focusOffset);
  });
  $5.onclick = () => {
    const text = $2.firstChild;
    sel.setBaseAndExtent(text, 0, text, 0); 
  };
  $6.onclick = () => {
    const text = $4.firstChild;
    sel.setBaseAndExtent(text, 0, text, 0);
  };
</script>
```

在这个例子中按`Embed`按钮后再按左键选区变换的`offset`会得到`3`，而使用`Span`按钮后则会得到`2`。而如果直接将零宽字符节点放到`Embed`节点后的话虽然可以解决这个问题，但是这样就无法将光标放置于`Emebd`节点前了，此时这就需要在最前边再放一个零宽字符，这样额外的交互处理更是麻烦，且在`slate`我还提过零宽字符打断中文`IME`的输入问题`PR`。

其实这里的选区映射也有个有趣的问题，光标位于`data-zero-embed`节点后时, 需要将其修正为节点前，那么此时我们按右键选区会被这段`toModelPoint`中的逻辑重新映射回原本的位置，即`L => L`并没有变化，那么也就无法触发`Model Sel Change`，而`DOM`选区则会从`offset 1`重新被`force`校正为`0`。那么如果我们在按下右键主动调整选区的话，则会先出发`Model Sel Change`进而`UpdateDOM`，然后再由`DOM Sel Change`来校正选区，因为这时候选区不在`Embed`零宽字符上了，就不会命中校正逻辑，因而可以正常进行选区的移动。

```js
// CASE2: 当 Embed 元素前存在内容且光标位于节点末时, 需要校正到 Embed 节点上
// <s>1|</s><e> </e> => <s>1</s><e>| </e>
if (nodeOffset === len && nextLeaf && nextLeaf.hasAttribute(ZERO_EMBED_KEY)) {
  return { node: nextLeaf, offset: 0 };
}
// [[cursor]embed]\n => right => [embed[cursor]]\n => [[cursor]embed]\n
// SET(1) => [embed[cursor]]\n => [embed][[cursor]\n] => SET(1) => EQUAL
```

## L-I-O Range
当前我们的选区实现是`L-O`的实现，也就是`Line`与`Offset`索引级别的实现，而这里的`Offset`是会跨越多个实际的`LeafState`节点的，那么这里的`Offset`就会导致我们在实现选区查找的时候需要额外的迭代，也就是在通过`Range`来获取实际`DOM`节点的`toDOMPoint`，是需要从`lineNode`为基准查找文本节点。

```js
const lineNode = editor.model.getLineNode(lineState);
const selector = `[${LEAF_STRING}], [${ZERO_SPACE_KEY}]`;
const leaves = Array.from(lineNode.querySelectorAll(selector));
let start = 0;
for (let i = 0; i < leaves.length; i++) {
  const leaf = leaves[i];
  let len = leaf.textContent.length;
  const end = start + len;
  if (offset <= end) {
    return { node: leaf, offset: Math.max(offset - start, 0) };
  }
}
return { node: null, offset: 0 };
```

而在先前我们处理`Embed`节点的时候其实能够很明显地发现由于此时我们需要按行查找内容，那么实际要处理的文本前存在的零宽字符都会被记入偏移序列，这样就让我们很难把这件事情处理好，每次都迭代一遍`Leaf`的`Offset`来查找也并不太现实。但其实话又说回来了，这样做的实际上就很像是`slate`的数据结构了，只不过我们将其简化为`3`级，而不是像`slate`一样可以无限层即嵌套下去。

```js
export class Point {
  constructor(
    /** 行索引 */
    public line: number,
    /** 节点索引 */
    public offset: number,
    /** 节点内偏移 */
    public offset: number
  ) {}
}
```

## 行格式继承
在我们的`Mutate`的设计中，在行样式的处理上我们是完全遵循着`delta`的数据结构设计，即最后的`EOL`节点才承载行样式。那么这样会造成一个比较反直觉的问题，如果我们直接在行中间插入`\n`的话，原本的行样式是会处于下一行的，因为本质上是因为`EOL`节点是在末尾的，此时插入`\n`自然原本的`EOL`是会直接跟随到下一行的。

那么对于这个问题的解决我设想了几种方案，首先是这个问题本质上是由于`\n`太滞后了导致了，而如果我们将承载行内容的节点前提，也就是在行首加入`SOL-Start Of Line`节点，由该节点来承载样式，`\n`节点仅用于分割行，那么在执行`Mutate Insert`的时候自然就能很轻松地得到将行样式保留在上一行，而不是跟随到下一行。但是这种方式很明显会因为破坏了原本的数据结构，因此导致整个状态管理发生新的问题，需要很多额外的`Case`来处理这个不需要渲染的节点所带来的问题。

还有一种方案是在`Mutate Iterator`对象中加入`used`标记，当插入的节点为`\n`时会检查当前的存量`LineState`是否被复用过，如果没有被复用过的话就直接将该`State`的`key`、`attrs`全部复用过来，当后续的`\n`节点再读区时则会因为已经复用过导致无法再复用，此时就是完全重新创建的新状态。但是这里的问题是无法很好地保证第二个`\n`的实际值，也就是说破坏了我们原本的模型结构，其并不是交换式的，也无法将确定的新值传递到第二个`\n`上，而且在`Mutate Compose`的过程中做这件事是会导致真的需要实现这种效果时无法规避这个行为。

实际上`Quill`则是会存在同样的问题，我发现其如果直接执行插入`\n`的话也是会将样式跟随到下一行，那么其实这样就意味着其行样式继承是在`Enter Event`的事件处理的，设想了一下这种方式的处理是合理的，这种情况下我们就可以是完全受控的情况处理，即使在插件中实现的话也是没问题的，只不过这里需要将这个行为明确化，也可以封装一下这个行为的处理方案。

```js
// https://quilljs.com/playground/snow
quill.updateContents([{ retain: 3 }, { insert: "\n" }]);
```

那么在这里就需要区分多种情况，此时插入回车的时候可以携带`attributes`。那么如果是在行首，就将当前属性全部带入下一行，这实际上就是默认的行为。如果此时光标在末尾插入回车，则需要将下一行的属性全部清空，当然此时也需要合并传入的属性。如果在行中间插入属性，则需要拷贝当前行属性放置于当前插入的新行属性，而如果此时存在传入的属性则同样需要合并。

```js
// |xx(\n {y:1}) => (\n)xx(\n {y:1})
// xx|(\n {y:1}) => xx(\n {y:1})(\n)
// xx|(\n {y:1}) => xx(\n {y:1})(\n & attributes)
// x|x(\n {y:1}) => x(\n {y:1})x(\n {y:1})
// x|x(\n {y:1}) => x(\n {y:1})x(\n {y:1 & attributes})
```

## 块结构变更
对于块结构的更新，如果是`JSON`嵌套结构的组织方式，对于块结构的变更如果直接参考`OT-JSON`的数据结构变更是不会有什么问题的，但是这样就就会导致我们的数据结构变得复杂，那么这样我们就失去了最开始使用`Delta`作为扁平数据结构所带来的优势，此时`Mutate`的设计同样也会变得复杂。那么如果我们将数据结构扁平化结构，即`Map<id, Delta>`的设计，此时我们的整体设计就可以完整复用，以引用的方式组织块嵌套也会清晰很多。

这种方式对于文档的变更描述也是比较清晰的，块结构的变更使用`Delta`来描述是完全没问题的，选区的描述则同样可以基于块碰撞与文本选区的实现来完成，选区的块顺序与基点描述则可以使用数组来表达。然而在文档内容变更的时候存在一个比较复杂的问题，就是我们无法得知哪些块被删除了，或者说哪些块是不再需要的，不需要再被查找或者渲染，这里的复杂点在于我们的`Delta`描述中不存在删除块的描述。

检查当前活跃的块实际上是一件比较重要的事情，首先是对于数据的存储，我们通常不会直接将全量的数据存储起来，而是应该按块存储，细粒度的数据对于内容的查找/更新/复用等更加高效。基于这种设计的话，如果我们能够准确收集活跃的块，则可以在读取的时候避免不必要的数据处理。再者则是对于数据的搜索，如果某个块被认为是不活跃的，那么这个内容不应该被搜索到。

那么如果需要确定当前活跃的块，重要的点就是在变更内容的时候确定块结构的活跃状态变化，而我们是通过`Delta`描述变更，那么我们就不能得知究竟哪些块被删除了，而且本身我们的描述语言中也不存在删除块的变更描述，那么我们最好的方式就是记录好我们实际构建的`state-tree`状态，如果发生内容变更的话，则自动处理块的状态，那么目前我能设想到的几种方式:

* 实际渲染的时候记录树结构的状态，在渲染`Editable`的时候，我们需要将此时渲染的`context`状态传递到组件当中，那么此时我们就可以借助组件的生命周期来记录块的状态，树形结构自然也可以通过`parent`状态来实现，而`children`集合理论上应该不实际需要建立。
* 在`Mutate`的时候记录块的状态，也就是我们约定`_blockId`关键字来记录块状态的变更，或者实现`op - id`映射关系的模式注册。而我们使用`Delta`描述变更时是无法得知是哪些`op`内容实现了插入/删除/更新，这部分实现就涉及到了`Mutate/State`模块的改造，最好是实现`State - Id`的相互映射模块，并且实现行的状态的变更来更新映射关系。
* 动态获取并解析树结构状态，这里的重点是关注于树的状态，既然我们维护的`Block/Line/Leaf`状态是完备的，那么我们可以直接借助内建状态来获取当前绑定在各个`State`状态上的块。这里的映射关系同样需要上述约定或者注册，甚至于我们粒度做的粗一些可以基于`LineState`来按需收集，无论是`Leaf`还是`Line`产生变更的时候都会重新实例化并且计算状态。

其实这里将`3`个方案融合可能是比较好的方法，当产生`Op`的时候，我们必须要知道究竟是哪些`op`是新增的或者删除的。那么在单次`op`应用之后，我们需要解析出此时究竟新增/删除了哪些`block`，就需要将相关的内容传递到后端，新增则初始化空值，删除则清理整个`block`长度的内容，并且在后端检查`block`结构级别的新增或删除。而在`undo`的时候，还是做同样的操作，此时的`changes`还是正向的变更，复用相关逻辑即可。

## Key 值的维护
在`LineState`节点的`key`值维护中，如果是初始值则是根据`state`引用自增的值，在变更的时候则是尽可能地复用原始行的`key`，这样可以避免过多的行节点重建并且可以控制整行的强刷。而对于`LeafState`节点的`key`值目前是直接使用`index`值，这样实际上会存在隐性的问题，而如果直接根据`Immutable`来生成`key`值的话，任何文本内容的更改都会导致`key`值改变进而导致`DOM`节点的频繁重建。

```js
export const NODE_TO_KEY = new WeakMap<Object.Any, Key>();
export class Key {
  /** 当前节点 id */
  public id: string;
  /** 自动递增标识符 */
  public static n = 0;

  constructor() {
    this.id = `${Key.n++}`;
  }

  /**
   * 根据节点获取 id
   * @param node
   */
  public static getId(node: Object.Any): string {
    let key = NODE_TO_KEY.get(node);
    if (!key) {
      key = new Key();
      NODE_TO_KEY.set(node, key);
    }
    return key.id;
  }
}
```

通常使用`index`作为`key`是可行的，然而在一些非受控场景下则会由于原地复用造成渲染问题，`diff`算法导致的性能问题我们暂时先不考虑。在下面的例子中我们可以看出，每次我们都是从数组顶部删除元素，而实际的`input`值效果表现出来则是删除了尾部的元素，这就是原地复用的问题，在非受控场景下比较明显，而我们的`ContentEditable`组件就是一个非受控场景，因此这里的`key`值需要再考虑一下。

```js
const { useState, Fragment, useRef, useEffect } = React;
function App() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [nodes, setNodes] = useState(() => Array.from({ length: 10 }, (_, i) => i));

  const onClick = () => {
    const [_, ...rest] = nodes;
    console.log(rest);
    setNodes(rest);
  };

  useEffect(() => {
    const el = ref.current;
    el && Array.from(el.children).forEach((it, i) => ((it as HTMLInputElement).value = i + ""));
  }, []);

  return (
    <Fragment>
      <p ref={ref}>
        {nodes.map((_, i) => (<input key={i}></input>))}
      </p>
      <button onClick={onClick}>slice</button>
    </Fragment>
  );
}
```

考虑到先前提到的我们不希望任何文本内容的更改都导致`key`值改变引发重建，因此就不能直接使用计算的`immutable`对象引用来处理`key`值，而描述单个`op`的方法除了`insert`就只剩下`attributes`了，但是如果基于`attributes`来获得就需要精准控制合并`insert`的时候取需要取旧的对象引用，且没有属性的`op`就不好处理了，因此这里可能只能将其转为字符串处理，但是这样同样不能保持`key`的完全稳定，因此前值的索引改变就会导致后续的值出现变更。

```js
const prefix = new WeakMap<LineState, Record<string, number>>();
const suffix = new WeakMap<LineState, Record<string, number>>();
const mapToString = (map: Record<string, string>): string => {
  return Object.keys(map)
    .map(key => `${key}:${map[key]}`)
    .join(",");
};
const toKey = (state: LineState, op: Op): string => {
  const key = op.attributes ? mapToString(op.attributes) : "";
  const prefixMap = prefix.get(state) || {};
  prefix.set(state, prefixMap);
  const suffixMap = suffix.get(state) || {};
  suffix.set(state, suffixMap);
  const prefixKey = prefixMap[key] ? prefixMap[key] + 1 : 0;
  const suffixKey = suffixMap[key] ? suffixMap[key] + 1 : 0;
  prefixMap[key] = prefixKey;
  suffixMap[key] = suffixKey;
  return `${prefixKey}-${suffixKey}`;
};
```

## 事件绑定
在事件绑定的时候，在类中使用箭头函数的方式进行事件绑定能够保证`this`的正确指向，这种方式编译后是在`constructor`中将箭头函数直接绑定到实例上。通常情况下这是没有问题的，然而在继承的情况下，如果子类中存在同名的箭头函数虽然可以实现继承，但是由于`super`调用的时机问题，事件绑定的回调函数实际上是父类的箭头函数，而不是我们希望的子类方法。

因此在继承的情况下，如果在子类中将`super`的事件绑定函数移除，然后重新绑定事件函数的话，这样是可以保证事件绑定是子类的方法，但是这就必须要非常了解父类的实现才可以。而如果我们使用装饰器来实现事件绑定的话，则可以解决这个问题，但是这里依然需要明确该方法是需要绑定的，否则仍然会因为事件实际被调用的时候没有`this`指向而导致问题。

```js
// experimentalDecorators: Enable experimental support for TC39 stage 2 draft decorators.
function Bind<T>(_: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  return {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      Object.defineProperty(this, key, { value: boundFunction, configurable: true, enumerable: false });
      return boundFunction;
    },
  };
}

class A {
  protected value = 1;
  constructor(){
    document.addEventListener("mousedown", this.c);
    document.addEventListener("mousedown", this.d);
  }
  protected c = () => {
    console.log(this.value);
  }
  @Bind
  protected d() {
    console.log(this.value);
  }
}

class B extends A {
  protected value2 = 2;
  protected c = () => {
    console.log(this.value2);
  }
  @Bind
  protected d() {
    console.log(this.value2);
  }
}

new B();
```

## 客户端变更
`Local ChangeSet`指的是在本地的变更处理，例如图片上传时的本地预览状态，在没有实际上传到服务器之前，其内容的属性是临时状态。那么对于协同类似这种情况就需要特殊处理: 

1. 客户端属性: `client-side`属性值不会协同，也就是常见的`client-side-*`属性，对于客户端的属性处理，例如代码块的高亮处理等，类似仅限于本地处理的属性不会实际被协同。
2. 临时隐藏块: 以上述图片上传为例，此时的临时状态是`insert op`而不是`client-side`属性，因此这种情况下无法直接通过属性状态处理。因此这里我们可以实际将`op`协同，但是协同到其他客户端仅限于数据，视图上会将其隐藏起来，因此是临时隐藏了块。
3. 临时关闭协同: 如果临时`op`是不希望被协同的，而且最终状态是希望将状态合并起来再协同出去。那么最简单的办法就是在本地处理时关闭协同，等到最终状态确定后再开启协同，即`i(" ", {src: "blob"}) + r(1, {src: "http"}) = i(" ", {src: "http"})`。
4. 本地状态变更: 在`easysync`中调度协同的方法中，提到了`AXY`的调度模型，可以观察`ot.js`可视化工具，以此来尽可能保持服务端无状态，避免复杂状态图。而如果需要完整处理本地的变更，则需要扩展`Z`即本地队列，但由于队列内容已经本地应用，需要实现`op`在队列前后移动的方法。

除了协同之外，还有关于`History`模块的处理，也同样会存在上述的本地图片预览等状态的处理。

1. 远程操作: 将其作为`remote op`处理，即`undoable`的操作，相当于将器放置于快照最前方。我们遵循的原则是不能`undo`其他人的`op`，因此将其放置于最前方相当于在所有操作被`undo`后的空白草稿留下的内容。
2. 合并状态: 由于本身这些`op`不会真正发送出去，不需要额外的调度。因此相对需要服务端来调度协同来说，这里的处理可以相对比较自由地合并，类似于下面的形式:
    ```js
    const id1 = state.apply(i(" ", { src: "blob" }));
    const id2 = state.apply(r(1, { src: "http" }));
    editor.history.merge(id1, id2);
    ```

实际上对于最开始聊的`case`而言，方案`1`是不适用的。因为执行这个操作的前提是需要有执行这个操作的前提，即上述`insert op`，仅`undo retain op`的话是没有意义的，因为在执行`undo`的时候会将操作的基准删除。因此对于这种情况，我们还是需要将主要的设计放在允许`undo`栈状态合并上。此外，由于`delta`的数据结构设计，我们不需要关心实际的顺序造成的问题，只需要`compose`即可。

## Wrapper DOM
我们现在实现的富文本编辑器是没有块结构的，因此实现任何具有嵌套的结构都是个复杂的问题。在这里我们原本就不会处理诸如表格类的嵌套结构，但是例如`blockquote`这种`wrapper`级结构我们是需要处理的。类似的结构还有`list`，但是`list`我们可以完全自己绘制，但是`blockquote`这种结构是需要具体组合才可以的。

然而如果仅仅是`blockquote`还好，在`inline`节点上使用`wrapper`是更常见的实现。因为我们将文本分割为`bold`、`italic`等`inline`节点时，会导致`DOM`节点被实际切割，此时如果嵌套`<a>`节点的话，就会导致`hover`的效果出现切割。因此如果能够将其`wrapper`在同一个`<a>`标签的话，就不会出现这种问题。

但是新的问题又来了，如果仅仅是单个`key`来实现渲染时嵌套并不是什么复杂问题，而同时存在多个需要`wrapper`的`key`则变成了令人费解的问题。如下面的例子中，如果将`34`单独合并`b`，外层再包裹`a`似乎是合理的，但是将`34`先包裹`a`后再合并`5`的`b`也是合理的，甚至有没有办法将`67`一并合并，因为其都存在`b`标签。

```html
1 2 3  4  5 6  7 8 9 0
a a ab ab b bc b c c c
```

思来想去，我最终想到了个简单的实现，对于需要`wrapper`的元素，如果其合并`list`的`key`和`value`全部相同的话，那么就作为同一个值来合并。那么这种情况下就变的简单了很多，我们将其认为是一个组合值，而不是单独的值，在大部分场景下是足够的。

```html
1 2 3  4  5 6  7 8 9 0
a a ab ab b bc b c c c
12 34 5 6 7 890
```

不过话又说回来，这种`wrapper`结构是比较特殊的场景下才会需要的，在某些操作例如缩进这个行为中，是无法判断究竟是要缩进引用块还是缩进其中的文字，这个问题在很多开源编辑器中都存在。其实也就是在没有块结构的情况下，对于类似的行为不好控制，而整体缩进这件事配合`list`在大型文档中也是很合理的行为，因此这部分实现还是要等我们的块结构编辑器实现才可以。

## Mark 属性处理
`Mark`属性的处理是个相对比较复杂的问题，对于选区内的节点我们的策略是，将选区内所有的标记节点都存在时，才会认为标记是完全应用到了节点上，而纯内容的处理上在这里会存在三种情况:

- 普通`Mark`节点: 例如`bold`、`italic`等，这些节点是直接继承先前的内容属性。
- 行内`Inline`节点: 例如`link`、`code`等，这些节点是需要单独处理的，在尾部写的数据不会继承到后续节点。
- 折叠光标节点操作: 当用户点击工具栏时，是可以处理临时的`Mark`节点，也就是说此时`Mark`节点属性是可以临时操作继承的。

## Blocks 选区状态管理
最近考虑了个问题，以`blocks`为基础构建的文档例如飞书文档中，每个文本行都是块。在这种情况下，选区的跨行选择就成了比较复杂的问题，先说纯文本块，那其实就是比较常规的类似于`LineState`的选区模式。

- <https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/list>
- <https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block>

然而如果存在块嵌套时，从文本块选择到代码块内，或者相反的操作，交互会变得非常复杂。以我们现在的选区模式为例，我们希望能以`anchorNode`和`focusNode`两个节点就能计算出选区的范围。

还有像是`editor.js`一样的表现，干脆完全不支持任何节点的跨行选中，无论是文本结构还是块结构。最开始我是考虑到使用`Range.cloneContents`来完整映射所有的选区内容，也就是说通过浏览器选区计算后，最后的`Model`选区大概是下面的内容。

```js
[
  { type: "text", start: 1, end: 10, id: "xxx" },
  { type: "block", id: "yyy" },
  { type: "text", start: 0, end: 3, id: "zzz" },
]
```

简单看了下飞书文档的处理，发现其选区竟然本身是多段式，这里我确实是没太理解其中的原因，可能是直接计算并不会有太大的计算成本。

```js
// PageMain.editor.selectionAPI.getSelection()
[
  { "id": 2, "type": "text", "selection": { "start": 3, "end":6 } },
  { "id": 3, "type": "text", "selection": { "start": 0, "end":4 } },
  { "id": 4, "type": "text", "selection": { "start": 0, "end":3 } }
]
```

在无法考虑清楚的情况下，还是看下熟悉的`slate`，以`getFragment`方法为起点研究了`slate`的选区到数据的选区实现。这里的逻辑大概是从`editor.chidren`取得所有的节点，然后从内容中剔除所有不在`range`的节点，以及文本节点的切割。

- <https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/node.ts#L287>
- <https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/node.ts#L477>

因此也能解答出之前我没想好的问题，在`slate`调用`getFragment`时如果本身的层级很深，会有保留原始的层级嵌套结构。也就是在调用`Node.nodes`时，以`editor`为基点就能构建出完整的`path`，然后对比`path`和`match`函数裁剪即可。

```js
[{
  children: [{
    children: [{
      children: [{
        // ...
        text: "content"
      }]
    }]
  }]
}]
```

但是如果以这种方式来处理选区的话，似乎性能并不会太好，当然`slate`本身的选区是对应了浏览器的`anchor`和`focus`节点来确定，只不过是具体使用的时候才会选取节点。

而后又研究了下飞书具体的交互实现，发现其并没有我想象的那么复杂的选区状态管理，总结起来就是:

- 纯文本情况下仅能选同级节点的内容。
- 块级结构下选区状态也是以同级节点为单位。

仅处理同级节点的选区内容，就类似我们的此时实现的`LineState`状态，处理两个节点的共同父级，这样就可以直接从`children`的`start`取到`end`即可。这样其实还解决了我之前考虑的虚拟滚动时，任意两个节点都的高度都可比较的问题，我们的对比基准应该是同父级的节点，而且比较的结构应该是`LineState`而不仅仅是`BlockState`状态树。

说回飞书的这个交互实现，纯文本的节点选区是以`text`为单位，如果出现跨行的情况则是直接用的浏览器的状态展示。而块级结构的选区是以`block`为单位，此时的浏览器焦点在`body`上，也就是说选区的选中实际上是飞书自行管理的状态。如果是从文本选到块还是比较有趣的，文本是浏览器状态，块内的文本则会被`selected::selection`隐藏掉，而块本身则会被选中，且块内文本的在松手时会全部选中。

## History Merge
如果只是正常的`History`模块实现，我们之前已经基本设计完成了。但是存在一些特殊的情况，需要合并`undo`栈的数据。例如图片上传时是个`insert`，此时处于`loading`状态，最后当异步图片上传成功后，此时需要应用的是`retain attrs`修改属性。

那么这种情况下，如果触发`ctrl+z`的话，会导致上传回到`loading`状态而不是撤销`insert`。因此明显这里应该将`retain attrs`这个`op`在`History`模块中合并到`insert`上，这样就可以保证`undo`的时候是撤销`insert`而不是`retain attrs`。

我们先来实现合并，因为我们这些模块都是分离的，所以没有办法直接跟`History`模块通信，这里需要改造一下`apply`，并且将标识写入`undo`栈。但是仅仅是移除`retain`的`op`并且将其合并到`insert`上是不够的，这里还需要`transform`的数据处理。

```js
const { id: id1 } = state.apply(new Delta().insert());
const { id: id2 } = state.apply(new Delta().retain());
const index1 = editor.history.stack.findIndex(it => it.id === id1);
const index2 = editor.history.stack.findIndex(it => it.id === id2);
const delta1 = editor.history.stack[index1].delta;
const delta2 = editor.history.stack[index2].delta;
const delta = delta1.compose(delta2);
editor.history.stack[index1] = { id: id1, delta };
editor.history.stack.splice(index2, 1);
```

在这里需要先看看`transform`的具体含义，如果是在协同中的话，`b'=a.t(b)`的意思是`a`和`b`都是从相同的`draft`分支出来的，而那么`b'`就是假设`a`已经应用了，此时`b`需要在`a`的基础上变换出`b'`才能直接应用，我们可以简单理解为`tf`解决了`a`操作对`b`操作造成的影响。

那么先前的`undoable`实现，需要将历史所有的`undo`栈处理一遍，这里的假设是`undoable op`是早已存在`draft`中。也就是说此时即使`undo`栈内的所有`op`都以执行，那么此时的`draft`中还是存在`undoable op`。那么由于这个假设存在，就会将所有历史数据影响到，由此需要做变换。

那么假设此时我们此时存在`abc`三个记录，`c`为栈顶，目标是合并`ac`记录。那么我们先来看`c`这个`op`，因为`b`可能会插入新的内容，导致`a/c`的`retain`并不一致，做了`inverted`之后`c`的`retain`会比`a`大，因此我们需要消除`b`带来的影响。

举个具体的例子，假设此时我们的内容为`132`，文本的插入顺序是`123`，那么我们可以构造出相关的`inverted op`。此时我们来将`4`合并到`2`上，但是明显如果直接取出来并且`compose`结果是不对的，`retain`的值并不能对到`2`上。因此就需要对其之间所有的操作进行变换，这里`2`和`4`之间只有`3`, 就只需要处理`3`带来的影响。

```js
const op1 = new Delta().insert("1");
const op2 = new Delta().retain(1).insert("2");
const op3 = new Delta().retain(1).insert("3");
const op4 = new Delta().retain(2).retain(1, { src: "2" });

const invert1 = new Delta().delete(1);
const invert2 = new Delta().retain(1).delete(1);
const invert3 = new Delta().retain(1).delete(1);
const invert4 = new Delta().retain(2).retain(1, { src: "1" });

invert3.transform(invert4); // [{"retain":1},{"retain":1,"attributes":{"src":"1"}}]
```

这里其实还有个问题，设想一下为什么先前处理`undoable`的时候，做的变换是针对历史记录的，而这里的变化就是针对新来的记录了。实际上我们还是需要处理历史记录的，而`undoable`的`op`因为根本不会实际参与到我们的`undo`进程中，其处理完后直接就消失了，所以可以不需要处理。

再举个例子，假如此时我们的内容是`312`，写入的顺序是`123`，由此`inverted op`则可以推断出来。此时如果我们只是将`invert3`移除，并且合并到先前的某个`op`上，之后执行`invert2`的时候，就会发现删除的是`1`而不是`2`，这就导致了索引指向的问题。

```js
const op1 = new Delta().insert("1");
const op2 = new Delta().retain(1).insert("2");
const op3 = new Delta().insert("3");

const invert1 = new Delta().delete(1);
const invert2 = new Delta().retain(1).delete(1);
const invert3 = new Delta().delete(1);
```

由此可知，最开始那个例子仅仅适用于处理`attrs`的场景，因为被`merge`的这个`op`本身不会影响到其他的`op`，但是实际的场景基本也只有这个。又会影响到历史记录索引，又会被先前操作过的`op`影响本身的索引，就像是`xxx|yyy`。这种情况并不常见，倒是在`Local CS`中倒是会用的上。

因此我们还需要与`undoable`一样，将其变换应用到历史记录上。但是因为这里是互相影响的，究竟应该是以被合并`op`变换后的值为基准，还是原始的值为准。考虑了一下我觉得还是应该以原始值为准，毕竟互相影响的时候是初始值。

依然是上面的例子，假如此时我们的内容是`312`，写入的顺序是`123`。这里需要注意的是，我们是假设新`op`不存在来做的变换，因此应该是先将其再次`invert`后再变换，相当于需要在当前的基准上将`invert3`做了`undo`，也就是下面例子中的`op3`。

```js
const op1 = new Delta().insert("1");
const op2 = new Delta().retain(1).insert("2");
const op3 = new Delta().insert("3");

const invert1 = new Delta().delete(1);
const invert2 = new Delta().retain(1).delete(1);
const invert3 = new Delta().delete(1);

const invert21 = op3.transform(invert2); // [{"retain":2},{"delete":1}]
const invert11 = op3.transform(invert1); // [{"retain":1},{"delete":1}]
```

## Unicode 字符处理
`Unicode`可以视为`Map`，可以从数值`code point`映射到具体的字形，这样就可以直接引用符号而不需要实际使用符号本身。可能的代码点值范围是从`U+0000`到`U+10FFFF`，有超过`110`万个可能的符号，为了保持条理性，`Unicode`将此代码点范围划分为`17`个平面。

首个平面`U+0000 -> U+FFFF`称为基本多语言平面或`BMP`，包含了最常用的字符。这样`BMP`之外就剩下大约`100`万个代码点`U+010000 -> U+10FFFF`，这些代码点所属的平面称为补充平面或星面。

`JavaScript`的单个字符由无符号的`16`位整数支持，因此其无法容纳任何高于`U+FFFF`的代码点，而是需要将其拆分为代理对。这其实就是`JS`的`UCS-2`编码形式，造成了所有字符在`JS`中都是`2`个字节，而如果是`4`个字节的字符，那么就会当作两个双字节的字符处理即代理对。

其实这么说起来`UTF-8`的变长`1-4`字节的编码是无法表示的，代理对自然是可以解决这个问题。而表达`UTF-16`的编码长度要么是`2`个字节，要么是`4`个字节。在`ECMAScript 6`中引入了新的表达方式，但是为了向后兼容`ECMAScript 5`依然可以用代理对的形式表示星面。

```js
"\u{1F3A8}"
// 🎨
"\uD83C\uDFA8"
// 🎨
```

实际上在`ES6`中引入的函数也解决了字符串遍历的问题，正则表达式也提供了`u`修饰符来处理`4`字节的字符。

```js
Array.from("1🎨1")
// ["1", "🎨", "1"]
/^.$/u.test("🎨")
// true
"1🎨1".split("")
// ["1", "\uD83C", "\uDFA8", "1"]
```

另外在基本平面即低位代理对内，从`U+D800`到`U+DFFF`是一个空段，即这些码点不对应任何字符，自然可以避免原本基本平面的冲突，因此可以用来映射辅助平面的字符。高位`[\uD800-\uDBFF]`与低位`[\uDC00-\uDFFF]`恰好是`2^10 * 2^10`长度，恰好`100`多万个代码点。

```js
(0xDBFF - 0xD800 + 1) * (0xDFFF - 0xDC00 + 1) = 1024 * 1024 = 1048576
```

虽然可以已经用`Unicode`代理对的方式表达`4`字节符号，但是类似`Emoji`这些符号是可以组合的。那么这样会导致字形上看起来是单个字符，实际上是通过`\u200d`即`ZWJ`组合起来的字符，因此其长度会更长，且`ES6`的函数也是会将其拆离表现的。

```js
"🧑" + "\u200d" + "🎨"
// 🧑‍🎨
"🧑‍🎨".length
// 5
Array.from("🧑‍🎨")
// ["🧑", "‍", "🎨"]
```

- <https://mathiasbynens.be/notes/javascript-unicode>
- <http://www.ruanyifeng.com/blog/2014/12/unicode.html>
- <https://eev.ee/blog/2015/09/12/dark-corners-of-unicode>

## 连续 Block Op
- 连续的`inline + void => embed`不能合并，例如`mention`组件，在增量时的`mutate`处理数据。
- 连续的`block + void`节点需要预处理，在增量时主动加入`\n`控制兜底换行，且需要将长度压缩为`1`。
- 已经合并的`block`长度值需要体现在`void`节点属性上，在选区变换时使用，存量数据可能会存在此种情况。

## Readonly 状态
前段时间在考虑`readonly`这个状态的实现，最开始的实现是将这个状态置于插件当中，但是这种实现会让编辑器的状态管理变得复杂了不少。因为当`readonly`这个状态变化时，无法将其状态变化直接通知到所有渲染出的组件当中，因此状态的传递就变成了问题。

当然，我们可以在这个状态发生变化时，重新渲染整个编辑器渲染出来的组件。但是这样看起来会有些性能浪费，毕竟全量重新渲染在内容比较多的情况下会卡一下。那么如果不重建状态而原地复用的话，则会导致我们使用的`React.memo`导致的组件不会重新渲染。

因此这种情况下由于整个重建了状态，似乎跟重建整个编辑器实例也差不多了。此外，目前的`Selection`插件中也会存在`readonly`状态，主要是控制选区结构的显示与隐藏。这种情况下，目前的管理形式就需要作为依赖整个重建`editor`。

```js
const [readonly, setReadonly] = useState(false);
const editor = useMemo(() => {
  prevEditor.destroy();
  return new Editor({
    plugins: [ /* xxx */ ],
  });
}, [readonly]);
```

后续想来，这件事完全可以在视图层处理，也就是将整个只读状态的变化放置于`Context`中，然后在渲染的组件中将其`use`出来。这样就可以按需在用到的时候才会刷新组件，而不需要刷新整个编辑器实例。

```js
export const BlockKit: React.FC<{ editor: Editor; readonly?: boolean }> = props => {
  const { editor, readonly, children } = props;

  return (
    <BlockKitContext.Provider value={editor}>
      <ReadonlyContext.Provider value={!!readonly}>{children}</ReadonlyContext.Provider>
    </BlockKitContext.Provider>
  );
};

export const useReadonly = () => {
  const readonly = React.useContext(ReadonlyContext);
  return { readonly };
};
```

此外，这个只读状态还是需要将其同步到编辑器实例当中的，这样编辑器中如果需要状态的话，就可以从中读取状态。此外，在`Selection`插件中是类组件，这里可以采用静态`contextType`静态属性的形式处理，单个状态就不调度`Context.Consumer`了。

```js
if (editor.state.get(EDITOR_STATE.READONLY) !== readonly) {
  editor.state.set(EDITOR_STATE.READONLY, readonly || false);
}

export class SelectionHOC extends React.PureComponent<Props, State> {
  public static contextType = ReadonlyContext;
  public render() {
    if (this.context as boolean) {
      // xxx
    }
  }
}
```

`DOM`的只读模式就直接依靠`contenteditable`属性来处理即可，这样就无法直接输入内容了，自然不会触发与输入有关的事件，例如`beforeinput`等。当然在代码中主动调度相关`API`操作文档的话，还是可以修改内容的。

此外，`Editable`还需要考虑到嵌套的情况，如果有需要考虑到整体编辑器的只读状态与内部嵌套编辑节点只读状态不一致的情况，那么这个`Provider`就不能仅仅放在最外层，还是需要在`Editable`组件中再放置`Context`，且优先考虑使用传入的参数。

```js
const { readonly } = props;
const { readonly: defaultReadonly } = useReadonly();

return (
  <ReadonlyContext.Provider value={readonly || defaultReadonly}>
    {children}
  </ReadonlyContext.Provider>
);
```

## 跨行的复杂操作
我们的数据结构是从`quill-delta`设计改造而来，那么主体结构必然是保持了`delta`的描述，这本身并没有什么问题。然而在跨行的操作中，需要进行的操作会变得比较复杂，这里的跨行操作指的是存在操作`\n`符号的可能，例如删除、插入回车等。

那么最基本的段落结构如下所示，其中首行是标题行，下一行是居中格式，行属性值全部放置于`\n`符号中。此时我们先来看回车操作，分别是在标题的行首、行中、行末进行操作。

```js
[
  { insert: "Heading" },
  { insert: "\n", attributes: { heading: "h1" } },
  { insert: "Center" },
  { insert: "\n", attributes: { align: "center" } },
]
```

- 在行首按下回车时，相当于是在上一行的行末插入了`\n`，此时标题行相当于会跟随下移一行，这个操作比较符合直觉。
- 在行中按下回车时，相当于在行中的位置插入了没有格式的`\n`，表现为拆分了两行，首行没有格式，尾行携带标题格式。这样就并不太符合直觉了，应该采用格式继承的方式，即首行和末行都是标题格式。
- 在行末按下回车时，由于先前提到过我们的选区模型是在`\n`前的位置，那么此时表现同样会导致拆分了两行，且效果与行中相同。这样就存在问题，首先是格式不应该到下一行，而是保持在首行上。此外由于我们的`key`结构，这样会导致整行`remount`，导致图片等格式重新加载。

除了回车存在交互问题外，还有删除的操作同样会造成类似的现象。依然以上述数据为例，分别在标题行末、居中行首进行删除操作。

- 在标题行末操作`forward`删除时，相当于把行末的`\n`删掉，那么此时标题行的格式就会丢失，行内容变成居中的。
- 在居中行首操作`backward`删除时，同样会相当于把标题行末的`\n`删掉，然后整行会被合并到标题行，同样变成居中格式。

类似这些操作直接处理都是不符合直觉的，理论上而言我们删除的格式应该更像是居中行的格式，这样就需要我们主动兼容这些问题。实际上这都还算比较清晰的操作，而如果将格式混杂起来处理，那么就会变得难以处理。

因此这里可以大概参考飞书的交互方案，即当前行存在行属性时，且当前光标在行首，按下删除时就删除当前的所有行属性。这样就可以保证当前行的格式不会与上一行的格式混杂，此时再点击删除时，就必定是纯文本格式合并上一行的行属性值。

特别是还有类似于有序列表的结构，举个例子，我们此时是在空行上的，而前一行和后一行都是有序列表。当我们此时执行删除操作的时候，删除的应该是本身的`\n`，并且合并有序列表序号，但是以当前的选区模型会删掉前一行的需要并合并为普通行。

实际上这里更加符合直觉的操作应该是像`EtherPad`一样，在行首放置一个`lmkr`的`op`，通过这个`op`来放置行格式。当然即是这样的数据操作看起来会更加符合直觉，但是对于我们整体架构来说需要兼容的地方就更多了。例如插入行时可能需要插入`\n`和`lmkr`两个`op`，以及修改行属性时可能同样需要插入`lmkr`而不是仅仅修改属性值即可。

```js
// https://juejin.cn/post/7075227637601271816#heading-20
// https://github.com/ether/etherpad-lite/blob/9bc91c/src/static/js/AttributeManager.ts#L9
{
  apool: {
    numToAttrib: {
      0: ["author", "a.cRSEzJOZbZxaRlta"],
      1: ["heading", "h1"],
      2: ["insertorder", "first"],
      3: ["lmkr", "1"],
    },
    nextNum: 4,
  },
  initialAttributedText: {
    text: "*测试1\n测试2\n",
    attribs: "*0*1*2*3+1*0|1+4*0+3|1+1",
  },
}
```

## 客户端数据一致性
从最开始我们就考虑协同相关的问题，那么在协同中比较重要的一点就是数据一致性。在前边我们也聊过跨行操作存在复杂性，如果以`EtherPad`的结构引入`*`行首标记的话，就会出现某些行存在该标记某些行不存在的情况，这样就需要特殊处理相关操作，例如行首删除操作长度可能是`1/2`。

那么这里我们需要考虑的是，为什么不可以在初始化数据的时候，就直接将行首标记直接放在`state`中，这样就不需要特殊处理相关操作了。然而如果我们的实现是纯客户端的话，这是没有问题的，但是如果是协同的数据操作，那么就可能会存在问题。

如果这些操作是`client-side`的话，自然是不会出现问题，因为其不会影响协同操作的索引位置，即不会修改原始的文本长度。但是我们的`*`操作是在行首增加了一个字符，那么如果本地在该行首后插入了字符，那么本地协同发出的`index`会比服务端的`index`大`1`，这样就会导致双端数据不一致，因此导致协同校验数据不通过的问题。

当然这个问题并不是不能解决，只是还需要记录原本的标记与变化的索引，这种情况下成本应该会更高。此外，实际上如果用户处理删除文档最末尾的`\n`也会导致数据不一致的问题，因为我们的`Mutate`是会兜底最末尾的`\n`，因为我们总是需要存在`LineState`来承载内容。

那么此时如果用户删除了末尾的`\n`，而此时兜底的`\n`数据还在数据中。如果在最后进行回车操作的话，由于我们先前进行过跨行操作的兼容，此时插入回车就是`\n(caret)`后执行，这时候操作索引会超越服务端的值，服务端的操作数据会被丢弃掉，就会导致数据不一致。

因此，我们需要处理这种情况，避免末尾的`\n`被删除，在这种情况下就需要根据`retain`和`delete`来计算索引是否越界，`insert`的操作则是由于本身插入后自然地移动了索引，因此不需要特殊处理计算。

```
1234567890\n

r(5).i(3).r(3).d(1).d(2)

123453678
```

## Lexical React 节点渲染
我们希望实现的是视图层分离的通信架构，相当于所有的渲染都采用`React`，类似于`Slate`的架构设计。而`Facebook`在推出的`Draft`富文本引擎中，是使用纯`React`来渲染的，然后当前`Draft`已经不再维护，转而推出了`Lexical`。

后来我发现`Lexical`虽然是`Facebook`推出的，但是却没用`React`进行渲染，从`DOM`节点上就可以看出来是没有`Fiber`的，因此可以确定普通的节点并不是`React`渲染的。诚然使用`React`可能存在性能问题，而且由于非受控模式下可能会造成`crash`，但是能够直接复用视图层还是有价值的。

在`Lexical`的`README`中可以看到是可以支持`React`的，那么这里的支持实际上仅有`DecoratorNode`可以用`React`来渲染，例如在`Playground`中加入`ExcaliDraw`画板的组件的话，就可以发现`svg`外的`DOM`节点是`React`渲染的，可以发现`React`组件是额外挂载上去的。

也就是说，仅有`Void/Embed`类型的节点才会被`React`渲染，其他的内容都是普通的`DOM`结构。这怎么说呢，就有种文艺复兴的感觉，如果使用`Quill`的时候需要将`React`结合的话，通常就需要使用`ReactDOM.render`的方式来挂载`React`节点。还有一点是需要协调的函数都需要用`$`符号开头，这也有点`PHP`的文艺复兴。

那么有趣的事，在`Lexical`中我是没有看到使用`ReactDOM.render`的方法，所以我就难以理解这里是如何将`React`节点渲染到`DOM`上的。于是在`useDecorators`中找到了`Lexical`实际上是以`createPortal`的方法来渲染的。使用这种方式实际与`ReactDOM.render`效果基本一致，但是`createPortal`是可以自由使用`Context`的，且在`React`树渲染的位置是用户挂载的位置。

```js
// https://react-lab.skyone.host/
const Context = React.createContext(1);
const Customer = () => <span>{React.useContext(Context)}</span>;
const App = () => {
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const [decorated, setDecorated] = React.useState<React.ReactPortal | null>(null);
    
  React.useEffect(() => {
    const div1 = ref1.current!;
    setDecorated(ReactDOM.createPortal(<Customer />, div1));
    const div2 = ref2.current!;
    ReactDOM.render(<Customer />, div2);
  }, []);
    
  return (
    <Context.Provider value={2}>
      {decorated}
      <div ref={ref1}></div>
      <div ref={ref2}></div>
      <Customer></Customer>
    </Context.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

## 自绘选区实现
在我们的设计中是基于`ContentEditable`实现，也就是说没有准备实现自绘选区，只是最近思考了一下自绘选区的实现。通常来说在整体编辑器内的`contenteditable=false`节点会存在特殊的表现，在类似于`inline-block`节点中，例如`Mention`节点中，当节点前后没有任何内容时，我们就需要在其前后增加零宽字符，用以放置光标。

在下面的例子中，`line-1`是无法将光标放置在`@xxx`内容后的，虽然我们能够将光标放置之前，但此时光标位置是在`line node`上，是不符合我们预期的文本节点的。那么我们就必须要在其后加入零宽字符，在`line-2/3`中我们就可以看到正确的光标放置效果。这里的`0.1px`也是个为了兼容光标的放置的`magic`，没有这个`hack`的话，非同级节点光标同样无法放置在`inline-block`节点后。

```html
<div contenteditable style="outline: none">
  <div data-line-node="1">
    <span data-leaf><span contenteditable="false" style="margin: 0 0.1px;">@xxx</span></span>
  </div>
  <div data-line-node="2">
    <span data-leaf>&#8203;</span>
    <span data-leaf><span contenteditable="false" style="margin: 0 0.1px;">@xxx</span></span>
    <span data-leaf>&#8203;</span>
  </div>
  <div data-line-node="3">
    <span data-leaf>&#8203;<span contenteditable="false">@xxx</span>&#8203;</span>
  </div>
</div>
```

那么除了通过零宽字符或者`<br>`标签来放置光标外，自然也可以通过自绘选区来实现，因为此时不再需要`ContentEditable`属性，那么自然就不会存在这些奇怪的行为。因此如果借助原生的选区实现，然后在此基础上实现控制器层，就可以实现完全受控的编辑器。

但是这里存在一个很大的问题，就是内容的输入，因为不启用`ContentEditable`的话是无法出现光标的，自然也无法输入内容。而如果我们想唤醒内容输入，特别是需要唤醒`IME`输入法的话，浏览器给予的常规`API`就是借助`<input>`来完成，因此我们就必须要实现隐藏的`<input>`来实现输入，实际上很多代码编辑器例如 [CodeMirror](https://github.com/codemirror/codemirror5) 就是类似实现。

但是使用隐藏的`<input>`就会出现其他问题，因为焦点在`input`上时，浏览器的文本就无法选中了。因为在同个页面中，焦点只会存在一个位置，因此在这种情况下，我们就必须要自绘选区的实现了。例如钉钉文档、有道云笔记就是自绘选区，开源的 [Monaco](https://github.com/microsoft/monaco-editor) 同样是自绘选区，[TextBus](https://github.com/textbus/textbus) 则绘制了光标，选区则是借助了浏览器实现。

其实这里说起来`TextBus`的实现倒是比较有趣，因为其自绘了光标焦点需要保持在外挂的`textarea`上，但是本身的文本选区也是需要焦点的。因此这里的实现应该是具有比较特殊的实现，特别是`IME`的输入中应该是有特殊处理，可能是重新触发了事件。而且这里的`IME`输入除了本身的非折叠选区内容删除外，还需要唤醒字符的输入，此外还有输入过程中暂态的字符处理，自绘选区复杂的地方就在输入模块上。

那么除了特殊的`TextBus`外，`CodeMirror`、`Monaco/VSCode`、钉钉文档、有道云笔记的编辑器都是自绘选区的实现。那么自绘选区就需要考虑两点内容，首先是如何计算当前光标在何处，其次就是如何绘制虚拟的选区图层。选区图层这部分我们之前的`diff`和虚拟图层实现中已经聊过了，我们还是采取相对简单的三行绘制的形式实现，现在基本都是这么实现的，折行情况下的独行绘制目前只在飞书文档的搜索替换中看到过。

因此复杂的就是光标在何处的计算，我们的编辑器选区依然可以保持浏览器的模型来实现，主要是取得`anchor`和`focus`的位置即可。那么在浏览器中是存在`API`可以实现光标的位置选区`Range`的，目前我看只有`VSCode`中使用了这个`API`，而`CodeMirror`和钉钉文档则是自己实现了光标的位置计算。`CodeMirror`中通过二分查找来不断对比光标和字符位置，这其中折行的查找会导致复杂了不少。

说起来，`VSCode`的包管理则是挺有趣的管理，`VSC`是开源的应用，在其中提取了核心的`monaco-editor-core`包。然后这个包会作为`monaco-editor`的`dev`依赖，在打包的时候会将其打包到`monaco-editor`中，`monaco-editor`则是重新包装了`core`来让编辑器可以运行在浏览器`web`容器内，这样就可以实现`web`版的`VSCode`。

- <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/caretRangeFromPoint>
- <https://github.com/codemirror/codemirror5/blob/b60e456/src/edit/mouse_events.js#L75>
- <https://github.com/microsoft/vscode/blob/18a64b/src/vs/editor/browser/controller/mouseTarget.ts#L975>

## 非受控的 DOM 行为
`DOM`结构与`Model`结构的同步在非受控的`React`组件中变得复杂，这其实也就是需要自绘选区的部分原因，可以以此避免非受控问题。那么非受控的行为造成的主要问题可以比较容易地复现出来，首先我们此时存在两个节点，分别是`inline`类型和`text`类型的节点。

```
inline|text
```

此时我们的光标在`inline`后，我们的`inline`规则是不会继承前个节点的格式，那么此时如果我们输入内容例如`1`，此时的文本就变成了`inline1|text`。这个操作是符合直觉的，然而当我们在上述的位置唤醒`IME`输入中文内容时，这里的文本就变成了错误的内容。

```
inline中文|中文text
```

这里究其原因还是在于非受控的`IME`问题，在输入英文时我们的输入在`beforeinput`事件中被阻止了默认行为，因此不会触发浏览器默认行为的`DOM`变更。然而当前在唤醒`IME`的情况下，`DOM`的变更行为是无法被阻止的，因此此时属于半受控的输入，这样就导致了问题。

此时由于浏览器的默认行为，`inline`节点的内容会被输入法插入中文的文本，而当我们输入完成后，数据结构`Model`层的内容是会将文本放置于`text`前，这跟我们输入非中文的表现是一致的，也是符合预期表现的。

那么由于我们的`immutable`设计，再加上`React.memo`以及`useMemo`的执行，即是我们在最终的纯文本节点加入了脏`DOM`检测也是不够的。就纯粹的是因为我们的策略，导致`React`原地复用了当前的`DOM`节点，因此造成了`IME`输入的`DOM`变更和`Model`层的不一致。

```js
const onRef = (dom: HTMLSpanElement | null) => {
  if (props.children === dom.textContent) return void 0;
  const children = dom.childNodes;
  // If the text content is inconsistent due to the modification of the input
  // it needs to be corrected
  for (let i = 1; i < children.length; ++i) {
    const node = children[i];
    node && node.remove();
  }
  // Guaranteed to have only one text child
  if (isDOMText(dom.firstChild)) {
    dom.firstChild.nodeValue = props.children;
  }
};
```

如果我们直接将`leaf`的`React.memo`以及`useMemo`移除，这个问题自然是会消失，然而这样就会导致编辑器的性能下降。因此我们就需要考虑尽可能检查到脏`DOM`的情况，实际上如果是在`input`事件或者`MutationObserver`中处理输入的纯非受控情况，也需要处理脏`DOM`的问题。

那么我们可以明显的想到，当行状态发生变更时，我们就直接检查当前行的所有`leaf`节点，然后对比文本内容，如果存在不一致的情况则直接进行修正。如果直接使用`querySelector`的话显然不够优雅，我们可以借助`WeakMap`来映射叶子状态到`DOM`结构，以此来快速定位到需要的节点。

然后在行节点的状态变更后，在处理副作用的时候检查脏`DOM`节点，并且由于我们的行状态也是`immutable`的，因此也不需要担心性能问题。那么检查节点的方法自然也跟上述`onRef`一致。

```js
const leaves = lineState.getLeaves();
for (const leaf of leaves) {
  const dom = LEAF_TO_TEXT.get(leaf);
  if (!dom) continue;
  const text = leaf.getText();
  // 避免 React 非受控与 IME 造成的 DOM 内容问题
  if (text === dom.textContent) continue;
  editor.logger.debug("Correct Text Node", dom);
  const nodes = dom.childNodes;
  for (let i = 1; i < nodes.length; ++i) {
    const node = nodes[i];
    node && node.remove();
  }
  if (isDOMText(dom.firstChild)) {
    dom.firstChild.nodeValue = text;
  }
}
```

这里需要注意的是，脏节点的状态检查是需要在`useLayoutEffect`时机执行的，因为我们需要保证执行的顺序是先校正`DOM`再更新选区，如果反过来的话就会，即先更新选区则选区依然停留在脏节点上，此时再校正`DOM`就会导致选区的丢失，表现是此时选区会在`inline`的最前方。此外，这里的实现在首次渲染并不需要检查，此时不会存在脏节点的情况。

以这种策略来处理脏`DOM`的问题，还可以避免部分其他可能存在的问题，零宽字符文本的内容暂时先不处理，如果再碰到类似的情况是需要额外的检查的。此外，这里的问题也可能是我们的选区策略是尽可能偏左侧的查找，如果在这种情况将其校正到右侧节点可能也可以解决问题，不过因为在空行的情况下我们的末尾`\n`节点并不会渲染，因此这样的策略目前并不能彻底解决问题。

## 全量存储 VS 增量存储
假设我们现在的编辑器是表单、输入框等场景，那么自然是不需要协同的调度的，在这种情况下数据就可以直接全量存储。但是假如我们现在并不是这种小型场景，而是类似于知识库、笔记文档等这种相对不太需要多人协同的情况，或者以此为基础搭建`CMS`管理系统，就需要考虑增量文档存储的情况了。

这种场景下，相当于是处于小型编辑器和重型协同编辑器的中间状态。通常来说可以使用编辑锁来保证可能存在的协作需求，而在这里对于增量存储和全量存储就是值得讨论的情况，我们这里主要是讨论增量存储带来的优势，增量存储相当于在客户端和服务端同时将变更应用。

- 降低宽带的消耗，全量文档存储会导致每次保存都需要上传整个文档，而增量存储则只需要上传变更的部分。当然成本通常不会消失只会转移，增量存储情况下会需要服务端同时应用变更，这样就增加了计算的成本。
- 文字级别变更记录，在实现自动保存的情况下通常是不能将所有草稿都存储起来的，这样的存储压力会很大。增量存储则可以直接应用存储过的`op`，直接根据版本号读取变更即可，在检查相关文档的变更记录时非常有用。
- 降低数据覆盖风险，全量文档存储需要将全部内容写入数据库，如果状态控制不好就容易造成文档覆盖的情况。增量存储可以增加校验位，在文档变更时就可以检查变更文本的附近文档状态，以此可以数据覆盖带来的风险。
- 精准统计变更片段，全量存储的情况下通常是不容易精确统计变更人的，主要是全量存储是需要从客户端发起的，这样的数据是不可信的。基于变更的数据则可以在服务端将变更人记录，甚至能统计每个人的字数变更来统计人效。
- 避免全量数据处理，当存储数据时可能会读取其中数据来处理相关的功能，例如复用文档关系，断链关系等。使用增量存储的话，则数据处理不再需要遍历整个数据结构，直接根据增量数据变更处理，降低了服务端的数据处理成本。
- 客户端临时变更，全量数据存储是需要将文档全部存储的，而增量存储则可以实现`client-side`数据。也就是说某些数据属性可以仅临时处于客户端，例如代码块的高亮结构、超链接编辑面板失去焦点时的状态，这样的数据无需真正存储在数据库。
- 评论数据位置更新，当实现评论功能时，假设我们整套系统是不存在协同，并存在管理/消费的多端内容，那么此时就会存在多个文档状态需要同步。这种情况下如果是全量存储，那么必须要在发布时进行`diff`再同步，增量存储则仅需要根据版本差异来同步即可。

## 选区与输入 Magic
先前已经提到了`TextBus`是个非常特殊的实现，其既没有使用`ContentEditable`这种常见的实现方案，也没有像`CodeMirror`或者`Monaco`一样自绘选区。从`Playground`的`DOM`节点上来看，其是维护了一个隐藏的`iframe`来实现的，这个`iframe`内存在一个`textarea`，以此来处理`IME`的输入。

这种实现非常的特殊，因为内容输入的情况下，文本的选区会消失，也就是说两者的焦点是会互相抢占的。那么先来看一个简单的例子，以`iframe`和文本选区的焦点抢占为例，可以发现在`iframe`不断抢占的情况下，我们是无法拖拽文本选区的。这里值得一提的是，我们不能直接在`onblur`事件中进行`focus`，这个操作会被浏览器禁止，必须要以宏任务的异步时机触发。

```html
<span>123123</span>
<iframe id="$1"></iframe>
<script>
  const win = $1.contentWindow;
  win.addEventListener("blur", () => {
    console.log("blur");
    setTimeout(() => $1.focus(), 0);
  });
  win.addEventListener("focus", () => console.log("focus"));
  win.focus();
</script>
```

实际上这个问题是我踩过的坑，注意我们的焦点聚焦调用是直接调用的`$1.focus`，假如此时我们是调用`win.focus`的话，那么就可以发现文本选区是可以拖拽的。通过这个表现其实可以看出来，主从框架的文档的选区是完全独立的，如果焦点在同一个框架内则会相互抢占，如果不在同一个框架内则是可以正常表达，也就是`$1`和`win`的区别。

其实可以注意到此时文本选区是灰色的，这个可以用`::selection`伪元素来处理样式，而且各种事件都是可以正常触发的，例如`SelectionChange`事件以及手动设置选区等。当然如果直接在`iframe`中放置`textarea`的话，可以得到同样的表现，同样也可以正常的输入内容，并且不会打断`IME`的输入法，这个`Magic`的表现在诸多浏览器都可以正常触发。

```html
<span>123123</span>
<iframe id="$1"></iframe>
<script>
  const win = $1.contentWindow;
  const textarea = document.createElement("textarea");
  $1.contentDocument.body.appendChild(textarea);
  textarea.focus();
  textarea.addEventListener("blur", () => {
    setTimeout(() => textarea.focus(), 0);
  });
  win.addEventListener("blur", () => console.log("blur"));
  win.addEventListener("focus", () => console.log("focus"));
  win.focus();
</script>
```
