import { createDom } from './dom';

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let previousFiber = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  while (index < elements.length || oldFiber) {
    const el = elements[index];
    let newFiber = null;

    const sameType = oldFiber && el && oldFiber.type === el.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: el.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      };
    }

    if (el && !sameType) {
      newFiber = {
        ...el,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: 'PLACEMENT'
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      window.deletions.push(oldFiber);
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      previousFiber.sibling = newFiber;
    }

    previousFiber = newFiber;

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    index++;
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  // 1. add the element to the DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 2. create the fibers for the element’s children
  reconcileChildren(fiber, fiber.props.children);
}

// fiber的基础结构
// {
//   type: '元素类型',
//   dom: 'dom',
//   parent: 'parent fiber',
//   child: 'child fiber',
//   sibling: 'sibling fiber',
//   props: {
//     ...其他属性
//     children: 'Array，子元素'
//   },
//   alternate: '老的fiber对象'
// }
export function performUnitOfWork(fiber) {
  // console.log('perform unit of work,', fiber);

  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 3. select the next unit of work
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}