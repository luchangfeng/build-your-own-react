const isEvent = key => key.startsWith("on");
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prevProps, nextProps) => key => prevProps[key] !== nextProps[key];
const isGone = nextProps => key => !(key in nextProps);

export function updateDom(dom, prevProps, nextProps) {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => {
      return isGone(nextProps)(key) || isNew(prevProps, nextProps)(key);
    })
    .forEach(name => {
      const eventName = name.toLowerCase().slice(2);
      dom.removeEventListener(eventName, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach(name => {
      dom[name] = '';
    });

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventName = name.toLowerCase().slice(2);
      dom.addEventListener(eventName, nextProps[name]);
    });
}

export function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}