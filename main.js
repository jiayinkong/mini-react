// 1. 创建 dom
const dom = document.createElement('div')

// 2. 设置 id
dom.id = 'app'

// 3. 把 dom 添加到 root
document.querySelector('#root').append(dom)

// 4. 创建 textNode
const textNode = document.createTextNode('')
textNode.nodeValue = 'app'

// 5. textNode 添加到 dom
dom.append(textNode)
