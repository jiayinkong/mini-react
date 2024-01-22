let nextWorkOfUnit = null
let wipRoot = null
let currentRoot = null // 用于更新 dom
let deletions = []
let wipFiber = [] // 用于指向当前更新的函数组件根节点
let stateHooks // 用于存储 stateHook
let stateHookIndex // 用于记录当前 stateHook 的 index

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    }
  }
  nextWorkOfUnit =  wipRoot
}

function update() {
  const currentFiber = wipFiber


  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }

    nextWorkOfUnit = wipRoot
  }
}

function useState(initial) {
  const currentFiber = wipFiber
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]

  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  }

  stateHook.queue.forEach(action => {
    const eagerState = typeof action === 'function' ? action(stateHook.state) : action

    if(eagerState != stateHook.state) {
      stateHook.state = action(stateHook.state)
    }
  })

  stateHooks.push(stateHook)
  stateHookIndex++
  stateHook.queue = [] // 遍调用完清空

  currentFiber.stateHooks = stateHooks

  function setState(action) {
    // stateHook.state = action(stateHook.state)
    stateHook.queue.push(typeof action === 'function' ? action : () => action)

    // 需要更新 wipRoot，nextWorkOfUnit，
    // 以重新调用函数组件->调用useState->更新 state
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }

    nextWorkOfUnit = wipRoot
  }

  return [stateHook.state, setState]
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  stateHooks = [] // 每次调用函数组件，先清空
  stateHookIndex = 0 // 先置0

  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {

  // 创建 dom
  if(!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber))

    // 处理 props
    updateProps(dom, fiber.props, {})
  }

  const children = fiber.props.children
  reconcileChildren(fiber, children)
}

function createDom(fiber) {
  return fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)
}

function updateProps(dom, nextProps, prevProps) {
  Object.keys(prevProps).forEach(key => {
    if(key !== 'children') {
      // 旧有新无，删除
      if(!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })

  
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      // 新有旧有，修改；新有旧无，新增
      if(nextProps[key] !== prevProps[key]) {
        // 绑定事件
        if(key.startsWith('on')) {
          const eventName = key.slice(2).toLowerCase()
          dom.removeEventListener(eventName, prevProps[key])
          dom.addEventListener(eventName, nextProps[key])
        
          // 绑定 props 属性
        } else {
          dom[key] = nextProps[key]
        }
      }
    }
  })
}

function reconcileChildren(fiber, children) {
  let prevChild = null
  let oldFiber = fiber.alternate?.child // 旧fiber，指向当前fiber的后备指针的child

  children.forEach((child, index) => {
    // 判断新旧fiber是否同类型
    const isSameType = oldFiber && oldFiber.type === child.type
    let newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      child: null,
      sibling: null,
      
    }

    if(isSameType) {
      newFiber = {
        ...newFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'update'
      }
    } else {
      if(child) {
        newFiber = {
          ...newFiber,
          dom: null,
          effectTag: 'placement',
        }
      }

      // !isSameType，收集oldFiber
      if(oldFiber) {
        deletions.push(oldFiber)
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
    
    // 如果存在 newFiber 的话才把 prevChild 更新为 newFiber
    if(newFiber) {
      prevChild = newFiber
    }
  })

  // 循环结束，还有 oldFiber 的话，需要收集到 deletions（旧有新无）
  while(oldFiber) {
    deletions.push(oldFiber)

    // 移动指针指向兄弟节点
    oldFiber = oldFiber.sibling
  }
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
  deletions.forEach(commitDeletions) // 在 commitWork 之前先删除oldFiber
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot =  null
  deletions = [] // 完成一次提交，需要清空这一轮的旧节点集合
}

function commitDeletions(fiber) {
  // 函数组件
  if(!fiber.dom) {
    commitDeletions(fiber.child)
  } else {
    let fiberParent = fiber.parent
    while(!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  }
}

function commitWork(fiber) {
  if(!fiber) return

  // 区分函数组件节点和普通节点，因为函数组件不存在 fiber.dom
  // 所以其孩子节点需要向上寻找有 fiber.dom 的祖先节点进行 append
  let fiberParent = fiber.parent
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  // fiber.effectTag 与 fiber.dom，优先判断 fiber.effectTag，只要是 update，就走 update 逻辑
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

function workLoop(deadline) {
  let shouldYeild = false

  while(!shouldYeild && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    if(wipRoot.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined
    }

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
  update,
  useState,
  createElement,
}

export default React