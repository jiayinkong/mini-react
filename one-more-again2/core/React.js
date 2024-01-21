let nextWorkOfUnit = null

function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  }
}


function performWorkOfUnit(fiber) {
  // 创建 dom
  if(!fiber.dom) {
    const dom = (fiber.dom = fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type))

    // 添加 dom 到 容器
    fiber.parent.dom.append(fiber.dom)

    // 处理 props
    Object.keys(fiber.props).forEach((key) => {
      if (key !== 'children') {
        dom[key] = fiber.props[key]
      }
    })
  }

  const children = fiber.props.children
  let prevChild = null
  children.forEach((child, index) => {

    let newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
      parent: fiber,
      child: null,
      sibling: null,
    }

    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })

  // 链表指针指向下一个节点
  if(fiber.child) {
    return fiber.child
  }

  if(fiber.sibling) {
    return fiber.sibling
  }

  return fiber.parent?.sibling
}

function workLoop(deadline) {
  let shouldYeild = false

  while(!shouldYeild && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYeild = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "string" ? createTextNode(child) : child
      ),
    },
  }
}

const React = {
  render,
  createElement,
}

export default React