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

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {

  // 创建 dom
  if(!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber))

    // 处理 props
    Object.keys(fiber.props).forEach((key) => {
      if (key !== 'children') {
        dom[key] = fiber.props[key]
      }
    })
  }

  const children = fiber.props.children
  reconcileChildren(fiber, children)
}

function createDom(fiber) {
  return fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)
}

function reconcileChildren(fiber, children) {
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
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function'

  if(isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 链表指针指向下一个节点
  if(fiber.child) {
    return fiber.child
  }

  // if(fiber.sibling) {
  //   return fiber.sibling
  // }

  // return fiber.parent?.sibling

  // 多个函数组件相邻，因为函数组件的fiber没有sibling属性，需要向上寻找有 sibling 属性的节点指向下一个节点
  let newFiber = fiber
  while(newFiber) {
    if(newFiber.sibling) {
      return newFiber.sibling
    }
    newFiber = newFiber.parent
  }
}

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot =  null
}

function commitWork(fiber) {
  if(!fiber) return

  // 区分函数组件节点和普通节点，因为函数组件不存在 fiber.dom
  // 所以其孩子节点需要向上寻找有 fiber.dom 的祖先节点进行 append
  let fiberParent = fiber.parent
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if(fiber.dom) {
    fiberParent.dom.append(fiber.dom)
  }

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
      children: children.map((child) => {
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
      }),
    },
  }
}

const React = {
  render,
  createElement,
}

export default React