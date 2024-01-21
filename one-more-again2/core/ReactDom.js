import React from './React.js'

const ReactDom = {
  createRoot: function(container) {
    return {
      render(App) {
        React.render(App, container)
      }
    }
  }
}

export default ReactDom