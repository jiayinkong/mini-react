function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  }
  root = nextWorkOfUnit
}

let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYeild = false

  while(!shouldYeild && nextWorkOfUnit) {
    nextWorkOfUnit = performWokOfUnit(nextWorkOfUnit)
    shouldYeild = deadline.timeRemaining() < 1
  }

  if(!nextWorkOfUnit) {
    commitRoot()
  }
}

let root = null
function commitRoot() {
  commitWork(root.child)
}

function commitWork(work) {
  if(!work) return
  let fiberParent = work.parent
  // 向上找祖先节点，有 dom 属性的
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if(work.dom) {
    fiberParent.dom.append(work.dom) 
  }

  commitWork(work.child)
  commitWork(work.sibling)
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

function updateFunctionComponent(work) {
  const children = [work.type(work.props)]
  initChildren(work, children)
}

function updateHostComponent(work) {
  const children = work.props.children
  initChildren(work, children)
}

function initChildren(work, children) {
  let prevChild = null

  children.forEach((child, index) => {
    let newWork = {
      type: child.type,
      props: child.props,
      parent: work,
      sibling: null,
      child: null,
    }

    if(index === 0) {
      work.child = newWork
    } else {
      prevChild.sibling = newWork
    }
    prevChild = newWork
  })
}

function performWokOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function'

  if(!isFunctionComponent) {
    if(!fiber.dom) {
      const dom = (fiber.dom = createDom(fiber.type))
  
      updateProps(dom, fiber.props)
    }
     updateHostComponent(fiber)
  } else {
    updateFunctionComponent(fiber)
  }

  if(fiber.child) {
    return fiber.child
  }

  // 解决多个函数组件找不到sibling的问题
  let nextFiber = fiber

  while(nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

requestIdleCallback(workLoop)

function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
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
    }
  }
}

export {
  render,
  createElement,
}