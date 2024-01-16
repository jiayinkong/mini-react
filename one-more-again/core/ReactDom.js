import { render } from './React.js'

const ReactDom = {
  createRoot: function(container) {
    return {
      render(App) {
        render(App, container)
      }
    }
  }
}

export default ReactDom