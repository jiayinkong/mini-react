// v1.3 动态创建 vdom
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
    ...props,
    children,
  }
}

const textEl = createTextNode('app')
const App = createElement('div', { id: 'app' }, textEl)

// v1.1
// 1. 创建 dom
const dom = document.createElement(App.type)

// 2. 设置 id
dom.id = App.id

// 3. 把 dom 添加到 root
document.querySelector('#root').append(dom)

// 4. 创建 textNode
const textNode = document.createTextNode('')
textNode.nodeValue = textEl.props.nodeValue

// 5. textNode 添加到 dom
dom.append(textNode)
