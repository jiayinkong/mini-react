// v1.2 vdom -> js object
const textEl = {
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue: 'app',
    children: []
  }
}

const el = {
  type: 'div',
  props: {
    id: 'app',
    children: [textEl]
  }
}

// v1.1
// 1. 创建 dom
const dom = document.createElement(el.type)

// 2. 设置 id
dom.id = el.props.id

// 3. 把 dom 添加到 root
document.querySelector('#root').append(dom)

// 4. 创建 textNode
const textNode = document.createTextNode('')
textNode.nodeValue = textEl.props.nodeValue

// 5. textNode 添加到 dom
dom.append(textNode)
