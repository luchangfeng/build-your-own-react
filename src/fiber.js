function isProperty(key) {
  return key !== 'children';
}

function createDom(fiber) {
  const $dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(key => {
      $dom[key] = fiber.props[key];
    });

  return $dom;
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
//   }
// }
export function performUnitOfWork(fiber) {
  console.log('perform unit of work,', fiber);

  // 1. add the element to the DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  
  // 2. create the fibers for the element’s children
  let previousFiber = null;
  if (fiber.props.children) {
    for (let i = 0, len = fiber.props.children.length; i < len; i++) {
      const child = fiber.props.children[i];
      const newFiber = {
        ...child,
        parent: fiber,
        dom: null
      };

      if (i === 0) {
        fiber.child = newFiber;
      } else {
        previousFiber.sibling = newFiber;
      }

      previousFiber = newFiber;
    }
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