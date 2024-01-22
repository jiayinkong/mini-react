import React from './core/React.js'

let count = 1
let props = { id: 'foo' }
let bar = <div>bar</div>
let show = false
function Foo() {
  let foo = <div>foo</div>

  function handleClick() {
    count++
    props = { className: 'foo' }
    show = !show
    console.log('foo click count: ', count)
    React.update()
  }
  return (
    <div {...props}>
      {show ? foo : bar}
      <button onClick={handleClick}>foo click</button>
    </div>
  )
}

function AppContainer() {
  return (
    <div id="app">
      <h1>App</h1>
      <Foo />
    </div>
  )
}

const App = AppContainer()

export default App
