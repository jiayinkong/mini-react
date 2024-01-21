let nextWorkOfUnit = null
let wipRoot = null

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    }
  }
  nextWorkOfUnit =  wipRoot
}


function performWorkOfUnit(fiber) {
  // 创建 dom
  if(!fiber.dom) {
    const dom = (fiber.dom = fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type))

    // // 添加 dom 到 容器
    // fiber.parent.dom.append(fiber.dom)

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

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot =  null
}

function commitWork(fiber) {
  if(!fiber) return

  fiber.parent.dom.append(fiber.dom)

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function workLoop(deadline) {
  let shouldYeild = false

  while(!shouldYeild && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYeild = deadline.timeRemaining() < 1
  }

  // 完成所有节点的链表结构转换后，统一添加
  if(!nextWorkOfUnit && wipRoot) {
    commitRoot()
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