学习React源码实现，参考[Build your own react](https://pomb.us/build-your-own-react/)一文，一步一步完成极简React框架的实现。

#### step1~step2
这两步是将jsx转化为dom

#### concurrent mode
并发模型，老版本是递归处理dom，如果dom过大，会占用较多时间，此时用户有操作，会出现卡顿问题，所以引入并发模型，在浏览器空闲时间处理dom，之前使用requestIdelCallback，后面使用react自己的shedule库

#### commit
增加了并发模型之后，因为渲染流程会被浏览器打断，所以会出现渲染部分UI的场景，为了避免这个问题，增加commit阶段，在完成的fiber树准备好之后，一次性渲染到页面上

#### Reconciliation
做dom比较并更新到真实dom，在Commit阶段完成新fiber树与老fiber树的对比，并完成赠、删、改。

1. 每个fiber增加一个alternate属性，用来保存老的fiber树
2. 增加reconcileChildren函数，用来完成老fiber和新fiber的比较
3. dom比较逻辑，
  a) 类型相同，保持dom不变，仅更新props，打上UPDATE的标签
  b) 类型不同，创建新的dom，并打上PLACEMENT标签
  c) 类型不同，如果存在老的dom，也需要删除老的dom，将需要删除的fiber打上DELETION标签，并单独存放到待删除数组中
4. commit阶段根据每一个fiber上打的标签进行对应的操作，针对更新的fiber，需要增加新的props并删除老的props中已经不再使用的项目
5. commit阶段添加事件，针对on开头的props作为事件处理

#### Function Component
函数组件，函数组件跟普通组件的区别在于会增加一个type属性，type就是该函数，获取它的子组件需要调用该函数才能得到。

同时函数组件本身是没有dom结构的，只有它的子组件才有

所以我们在创建fiber时，需要将函数组件和普通组件区分开创建，函数组件不用创建Dom，直接递归处理其子组件即可
同时在渲染时，也需要特殊处理，找父节点时，需要依次网上找，直到找到存在Dom的父节点，用于后续追加Dom
删除组件时，同样需要递归处理，直到找到有Dom的子节点。

#### Hooks
实现一个useState的hook
1. 在didact中实现一个空useState函数，此函数接收一个初始state值作为参数，返回一个数组，数组内容为[stateValue, setStateFunction]
2. 定义一个wipFiber的全局变量，用来保存当前正在执行中的函数组件的fiber对象
3. 在useState中创建hook对象，并将其挂载wipFiber下面，hook对象结构如下
```javascript
const hook = {
  state: initialValue,
  // queen内部保存业务调用setState时传入的函数，之所以使用数组是为了满足业务多次调用的使用方式
  // Value的更新在下次render调用useState时进行计算，调用setState仅将其压入数组即可
  queen: [actions]
};
```
4. 通过fiber.alternate.hook.queen取出业务之前setState传入的函数，依次执行，更新hook.state的值
5. 定义setState函数，函数接收一个函数作为参数用于计算新的state，将传入的函数压入hook.queen，之后更新nextUnitOfWork用于workLoop下次更新使用，最后将hook对象挂载到wipFiber上面
6. 返回[hook.state, setState];
7. 因为用户可以在一个函数组件内部使用多个hook，所以fiber上面挂载的是一个hook数组，内部放在每一个hook对象，同时还需要创建一个hookIndex，用于标识处理到哪一个hook了，每次updateFunctionComponent时将这些信息以及hooks重置
