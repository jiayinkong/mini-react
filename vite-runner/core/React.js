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

  let fiberParent = fiber.parent
  // 使用 while 解决嵌套组件没有dom的问题
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if(fiber.dom) {
    fiberParent.dom.append(fiber.dom)
  }

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

function initChildren(fiber, children) {
  let prevChild = null
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
  const isFunctionComponent = typeof fiber.type === 'function'
  // 1. 创建DOM的条件
  if(!isFunctionComponent) {
    if(!fiber.dom) {
      // 1. 创建DOM
      const dom = (fiber.dom = createDom(fiber.type))
  
      // 2. 设置 props
      updateProps(dom, fiber.props)
    }
  }

  // 2. 处理children
  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children // 3. 处理组件嵌套问题 4. 处理组件找不到sibling问题
  // 3. 转换链表结构
  initChildren(fiber, children)

  // 4. 返回下一个work
  if(fiber.child) {
    return fiber.child
  }

  // 解决多组件找不到sibling的问题，向上找到有sibling的parent节点，返回parent的sibling
  let nextFiber = fiber
  while(nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
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
      children: children.map(child => {
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
      }),
    },
  }
}

export {
  render,
  createElement,
}