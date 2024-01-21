function render(el, container) {
  // 1. 创建 dom
  const dom = el.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(el.type)

  // 2. 处理 props
  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key]
    }
  })

  // 3. 递归 children
  const children = el.props.children
  children.forEach(child => {
    render(child, dom)
  })

  // 4. 添加 dom 到容器
  container.append(dom)
}

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
      children: children.map((child) =>
        typeof child === "string" ? createTextNode(child) : child
      ),
    },
  }
}

const React = {
  render,
  createElement,
}

export default React