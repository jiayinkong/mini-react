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

    if(!nextWorkOfUnit) {
      commitRoot()
    }
  }
}

let root = null
function commitRoot() {
  commitWork(root.child)
}

function commitWork(work) {
  work.parent.dom.append(work.dom)

  if(work.child) {
    commitWork(work.child)
  }
  if(work.sibling) {
    commitWork(work.sibling)
  }
}

function performWokOfUnit(work) {
  if(!work.dom) {
    const dom = work.dom = work.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(work.type)

    Object.keys(work.props).forEach(key => {
      if(key !== 'children') {
        dom[key] = work.props[key]
      }
    })
  }

  const children = work.props.children

  children.forEach((child, index) => {
    let newWork = {
      type: child.type,
      props: child.props,
      parent: work,
      sibling: null,
      child: null
    }

    let prevChild = null

    if(index === 0) {
      work.child = newWork
    } else {
      prevChild.sibling = newWork
    }
    prevChild = newWork
  })

  if(work.child) {
    return work.child
  }

  if(work.sibling) {
    return work.sibling
  }

  return work.parent?.sibling
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
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child),
    }
  }
}

export {
  render,
  createElement,
}