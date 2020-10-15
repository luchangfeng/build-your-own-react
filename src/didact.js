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
  currentRoot = wipRoot;
}

requestIdleCallback(workLoop);
