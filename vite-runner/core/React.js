// v1.4 动态创建 dom
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  root = nextWorkOfUnit
}


let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYeild = false

  while(!shouldYeild && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    shouldYeild = deadline.timeRemaining() < 1
  }

  // 当完成所有链表转化时，统一添加DOM到容器，只添加一次
  if(!nextWorkOfUnit && root) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

let root = null
function commitRoot() {
  commitWork(root.child)

  // 只提交一次，提交完就置空
  root = null
}

function commitWork(fiber) {
  if(!fiber) return
  fiber.parent.dom.append(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}

function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    if(key !== 'children') {
      dom[key] = props[key]
    }
  })
}

function initChildren(fiber) {
  let prevChild = null
  const children = fiber.props.children
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      child: null,
      sibling: null,
      dom: null,
    }
    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })
}

function performWorkOfUnit(fiber) {
  if(!fiber.dom) {
    // 1. 创建DOM
    const dom = (fiber.dom = createDom(fiber.type))
    // 把 dom 添加到 parent
    // fiber.parent.dom.append(dom)

    // 2. 设置 props
    updateProps(dom, fiber.props)
  }

  // 3. 转换链表结构
  initChildren(fiber)

  // 4. 返回下一个work
  if(fiber.child) {
    return fiber.child
  }

  if(fiber.sibling) {
    return fiber.sibling
  }

  return fiber.parent?.sibling
}

requestIdleCallback(workLoop)

// v1.3 动态创建 vdom
function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    },
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child),
    },
  }
}

export {
  render,
  createElement,
}