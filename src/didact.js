import { performUnitOfWork } from './fiber';
import { commitRoot } from './commit';

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'object' ? child : createTextElement(child);
      })
    }
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let workLoopStarted = false;
window.wipFiber = null;
window.hookIndex = 0;
window.deletions = null;

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
    currentRoot = wipRoot;
    wipRoot = null;
  }

  requestIdleCallback(workLoop);
}

export function render(element, container) {
  window.deletions = [];
  nextUnitOfWork = wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  };

  if (!workLoopStarted) {
    workLoopStarted = true;
    requestIdleCallback(workLoop);
  }
}

export function useState(initialValue) {
  const oldHook = window.wipFiber
    && window.wipFiber.alternate
    && window.wipFiber.alternate.hooks
    && window.wipFiber.alternate.hooks[window.hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initialValue,
    queen: []
  };

  const queen = oldHook ? oldHook.queen : [];
  queen.forEach(action => {
    hook.state = action(hook.state);
  });

  const setState = action => {
    hook.queen.push(action);
    window.deletions = [];
    nextUnitOfWork = wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };
  };

  window.wipFiber.hooks.push(hook);
  window.hookIndex++;
  return [hook.state, setState];
}
