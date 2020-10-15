学习React源码实现，参考[Build your own react](https://pomb.us/build-your-own-react/)一文，一步一步完成极简React框架的实现。

step1~step2
这两步是将jsx转化为dom

concurrent mode
并发模型，老版本是递归处理dom，如果dom过大，会占用较多时间，此时用户有操作，会出现卡顿问题，所以引入并发模型，在浏览器空闲时间处理dom，之前使用requestIdelCallback，后面使用react自己的shedule库

commit
增加了并发模型之后，因为渲染流程会被浏览器打断，所以会出现渲染部分UI的场景，为了避免这个问题，增加commit阶段，在完成的fiber树准备好之后，一次性渲染到页面上

Reconciliation
做dom比较并更新到真实dom，在Commit阶段完成新fiber树与老fiber树的对比，并完成赠、删、改。

1. 每个fiber增加一个alternate属性，用来保存老的fiber树
2. 增加reconcileChildren函数，用来完成老fiber和新fiber的比较
3. dom比较逻辑，
  a) 类型相同，保持dom不变，仅更新props，打上UPDATE的标签
  b) 类型不同，创建新的dom，并打上PLACEMENT标签
  c) 类型不同，如果存在老的dom，也需要删除老的dom，将需要删除的fiber打上DELETION标签，并单独存放到待删除数组中
4. commit阶段根据每一个fiber上打的标签进行对应的操作，针对更新的fiber，需要增加新的props并删除老的props中已经不再使用的项目
5. commit阶段添加事件，针对on开头的props作为事件处理