# NOTE

## 笔记  
我非常喜欢`slate`的`core react`这样分包的设计，但是并不太喜欢`slate`的`json`形式的数据结构，我个人认为扁平化才是大文档的解决方案。我也很喜欢`quill`的`delta`设计，这是一个扁平化的数据结构，但是我并不太喜欢`quill`自己实现的视图层，当然这也是一种解决方案，毕竟框架也是在不断发展更迭的。  

那么我在想为什么不搞一个像是`slate`一样的分包设计，再配合上`quill`的`delta`数据结构，并且解决一些我认为是不太合适的设计，所以便有了这个项目，当然我也并没有指望整个项目有很多人用，更多的是满足自己的好奇心，如何从零做一套富文本编辑器。其实最初起名为`Blocks`目的是想做一套`canvas`的编辑器，但是成本太高了。所以我目前是想利用这种分包结构先做好`react`的，然后有机会先做仅渲染的`canvas`，这样成本应该会低很多。

因为整个富文本编辑器还是非常复杂的，各大框架都是按年维护的，我也只是想做一下满足一下好奇心，这个文档就是随手记一些想法与设计上的思考。

## Blocks
最开始我思考了很长时间如何设计`Block`化的编辑器，除了对于交互上的设计比较难做之外，对于数据的设计也没有什么比较好的想法，特别是实际上是要管理一棵树形结构，并且同时还需要支持对富文本内容的描述。最开始我想如果直接通过`JSON`来处理嵌套的数据结构表达，但是想了想这岂不是又回到了`Slate`的设计，在这种设计方案下数据描述特别是数据处理会很麻烦。后来我又想分别管理树结构与引用关系，这样当然是没有问题的，只不过看起来并没有那么清晰，特别是还要设计完备的插件化类型支持，这部分可能就没有那么好做了。

后来，我想是不是可以单独将`Blocks`类型放在单独的包里，专门用来管理整棵树的描述，以及类型的扩展等等，而且在扩展类型时不会因为重新`declare module`导致不能实际引用原本的包结构，当然单独引用独立的模块用来做扩展也是可以的。此外，这里就不再单独维护树结构与引用关系了，每个块都会携带自己的引用关系，即父节点`parent`的`id`与子节点`children`的`id`，这里只存储节点的`id`而不是具体的对象引用，在运行时通过状态管理再来获取实际的引用。此外在编辑器的实际对象中也需要维护状态对象，在状态树里需要维护基本的数据操作，最终的操作还是需要映射到所存储的数据结构`BlockSet`。

## 多实例Editor
在上边也提到了，在这里我想做的就是纯`Blocks`的编辑器，而实际上目前我并没有找到比较好的编辑器实现来做参考，主要是类似的编辑器都设计的特别复杂，在没有相关文章的情况很难理解。此外我还是比较倾向于`quill-delta`的数据结，因为其无论是对于协同的支持还是`diff`、`ops`的表达都非常完善，所以我想的是通过多个`Quill Editor`实例来实现嵌套`Blocks`，实际上这里边的坑会有很多，需要禁用大量的编辑器默认行为并且重新实现，例如`History`、`Enter`回车操作、选区变换等等，可以预见这其中需要关注的点会有很多，但是相对于从零实现编辑器需要适配的各种浏览器兼容事件还有类似于输入事件的处理等等，这种管理方式还算是可以接受的。

在这里需要关注一个问题，对于整个编辑器状态管理非常依赖于架构设计，从最开始我想做的就是`Blocks`的编辑器，所以在数据结构上必然需要以嵌套的数据结构来描述，当然在这里我设计的扁平化的`Block`，然后对每个`Block`都存储了`string[]`的`Block`节点信息来获取引用。而在实现的过程中，我关注到了一个特别的问题，如果在设计编辑器时不希望有嵌套的结构，而是希望通过扁平的数据结构描述内容，而在内容中如果引用了块结构那么就再并入`Editor`实例，这种设计虽然在数据结构上与上边的`BlockSet`非常类似，但是整体的表达却是完全不同，`Blocks`的编辑器是完全由最外层的`Block`结构管理引用关系，也就是说引用是在`children`里的，而块引用的编辑器则需要由编辑器本身来管理引用关系，也就是说引用是在`ops`里的。所以说对于数据结构的设计与实现非常依赖于编辑器整体的架构设计，当然在上边这个例子中也可以将块引用的编辑器看作单入口的`Blocks`编辑器，这其中的`Line`表达全部交由`Editor`实例来处理，这就是不同设计中却又相通的点。

## 选区变换
对于选区的问题，我思考了比较久，最终的想法依然还是通过首尾的`RangePoint`来标记节点，需要注意的是如果节点的块不属于同块节点，那么不会继续处理选区`Range`变换。同样的，目前依然是通过首尾节点来标记，所以特别需要关注的是通过首尾节点来标记整个`Range`，采用这个方案可以通过首尾节点与`index`来获取`Range`，这里需要关注的是当节点的内容发生变化时，需要重新计算`index`。实际上这里如果直接遍历当前节点直属的所有`index`状态更新也是可以的，在实际`1`万次加法运算，实际上的时间消耗也只有`0.64306640625ms`不到`1ms`。

我们的编辑器实际上是要完成类似于`slate`的架构，当前设计的架构的是`core`与视图分离，并且此时我们不容易入侵到`quill`编辑器的选区能力，所以最终相关的选区变换还是需要借助`DOM`与`Editor`实例完成，还需要考量在`core`中维护的`state`状态管理。在`DOM`中需要标记`Block`节点、`Line`节点、`Void`节点等等，然后在浏览器`onSelectionChange`事件中进行`Model`的映射。当然整个说起来容易，做起来就难了，这一套下来还是非常复杂的，需要大量时间不断调试才行。

## DOM模型与浏览器选区
浏览器中存在明确的选区策略，在`State 1`的`ContentEditable`状态下，无法做到从`Selection Line 1`选择到`Selection Line 2`，这是浏览器默认行为，而这种选区的默认策略就定染导致我无法基于这种模型实现`Blocks`。而如果是`Stage 2`的模型状态，是完全可以做到选区的正常操作的，在模型方面没有什么问题，但是我们此时的`Quill`选区又出现了问题，由于其在初始化时是会由`<br/>`产生到`div/p`状态的突变，导致其选区的`Range`发生异动，此时在浏览器中的光标是不正确的，而我们此时没有办法入侵到`Quill`中帮助其修正选区，且`DOM`上没有任何辅助我们修正选区的标记，所以这个方式也难以继续下去。因此在这种状态下，我们可能只能选取`Stage 3`策略的形式，并不实现完整的`Blocks`，而是将`Quill`作为嵌套结构的编辑器实例，在这种模型状态下编辑器不会出现选区的偏移问题，我们的嵌套结构也可以借助`Quill`的`Embed Blot`来实现插件扩展嵌套`Block`结构。

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

那么通常来说我们就需要基于`Changes`来确定状态的更新，首先我们需要确定更新的粒度，例如以行为基准则`retain`跨行的时候就直接复用原有的`LineState`，这当然是个合理的方法，相当于尽可能复用`Origin List`然后生成`Target List`，这样的方式自然可以避免部分状态的重建，尽可能复用原本的对象。整体思路大概是分别记录旧列表和新列表的`row`和`col`两个`index`值，然后更新时记录起始`row`，删除和新增自然是正常处理，对于更新则认为是先删后增，对于内容的处理则需要分别讨论单行和跨行的问题，最后可以将这部分增删`LineSatet`数据放置于`changes`中，就可以得到实际增删的`Ops`了，这部分数据在`apply`的`delta`中是不存在的，同样可以认为是数据的补充。

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
{
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
}
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
