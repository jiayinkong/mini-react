// v1.4 动态创建 dom
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextWorkOfUnit = wipRoot
}

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  }

  nextWorkOfUnit = wipRoot
}


let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYeild = false

  while(!shouldYeild && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    shouldYeild = deadline.timeRemaining() < 1
  }

  // 当完成所有链表转化时，统一添加DOM到容器，只添加一次
  if(!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

let wipRoot = null
let currentRoot = null
let deletions = []
function commitRoot() {
  // 移除旧节点
  deletions.forEach(commitDeletions)
  commitWork(wipRoot.child)
  // 在提交完当前的 wipRoot 之后，保存 wipRoot
  currentRoot = wipRoot
  // 只提交一次，提交完就置空
  wipRoot = null
  // 完成一次提交，需要清空这一轮的旧节点集合
  deletions = []
}

function commitDeletions(fiber) {
  if(fiber.dom) {
    let fiberParent = fiber.parent

    // 函数组件vdom没有 dom 属性，需要向上查找带有dom属性的祖先节点
    while(!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletions(fiber.child)
  }
}

function commitWork(fiber) {
  if(!fiber) return

  let fiberParent = fiber.parent
  // 使用 while 解决嵌套组件没有dom的问题
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if(fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
    
  } else if(fiber.effectTag === 'placement') {
    if(fiber.dom) {
      fiberParent.dom.append(fiber.dom)
    }
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
  Object.keys(prevProps).forEach(key => {
    if(key !== 'children') {
      if(!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })

  Object.keys(nextProps).forEach(key => {
    if(key !== 'children') {
      if(nextProps[key] !== prevProps[key]) {
        // 处理事件
        if(key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase()

          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])

        } else {
          dom[key] = nextProps[key]
        }
      }
    }
  })
}

function reconcileChildren(fiber, children) {
  let prevChild = null

  // 设置指向旧节点的指针
  let oldFiber = fiber.alternate?.child

  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type
    let newFiber

    if(isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'update',
      }
    } else {
      if(oldFiber) {
        deletions.push(oldFiber)
      }
      // 处理 edge case
      if(child) {
        newFiber = {
          type: child.type,
          props: child.props,
          parent: fiber,
          child: null,
          sibling: null,
          dom: null,
          effectTag: 'placement',
        }
      }
    }

    // 移动指针
    if(oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }

    // 处理 edge case
    if(newFiber) {
      prevChild = newFiber
    }
  })

  // 新的比老的少，删除多出来的
  while(oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if(!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))

    updateProps(dom, fiber.props, {})
  }

  const children = fiber.props.children
  reconcileChildren(fiber, children)
}

function performWorkOfUnit(fiber) {
  // debugger
  const isFunctionComponent = typeof fiber.type === 'function'
  if(isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

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
  update,
}