// v1.3 动态创建 vdom
function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
    },
    children: []
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props,
    ...props,
    children,
  }
}

const textEl = createTextNode('app')
const App = createElement('div', { id: 'app' }, textEl)

// v1.4 动态创建 dom
function render(el, container) {
  // 1. 创建 dom
  const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(el.type)

  // 2. 设置 props
  Object.keys(el.props).forEach(key => {
    dom[key] = el.props[key]
  })

  // 3. 递归处理 children
  el.children.forEach(child => {
    render(child, dom)
  })

  // 4. 添加 dom 到 container
  container.append(dom)
}

render(App, document.querySelector('#root'))
