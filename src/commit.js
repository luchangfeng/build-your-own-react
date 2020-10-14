export function commitRoot(root) {
  commitWork(root.child);
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  fiber.parent.dom.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}