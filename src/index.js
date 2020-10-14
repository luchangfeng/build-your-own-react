import Didact from './didact';
import { performUnitOfWork } from './fiber';
import { commitRoot } from './commit';

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a href="https://www.baidu.com">Baidu</a>
    <b />
    <div>
      <a href="https://www.qq.com">QQ</a>
    </div>
  </div>
);

let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    if (deadline.timeRemaining() < 1) {
      shouldYield = true;
    }
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot(wipRoot);
    wipRoot = null;
  }

  requestIdleCallback(workLoop);
}

function render(element, container) {
  nextUnitOfWork = wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  };
}

requestIdleCallback(workLoop);

const container = document.getElementById("root");
render(element, container);
