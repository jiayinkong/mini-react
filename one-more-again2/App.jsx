import React from './core/React.js'

function Foo() {
  console.log('foo function component')

  const update = React.update()

  function handleClick() {
    console.log('foo click')
    update()
  }

  return (
    <div id="foo">
      <h1>Foo</h1>
      <button onClick={handleClick}>foo click</button>
    </div>
  )
}

function Bar() {
  console.log('bar function component')
  const update = React.update()

  function handleClick() {
    console.log('bar click')
    update()
  }

  return (
    <div id="bar">
      <h1>Bar</h1>
      <button onClick={handleClick}>bar click</button>
    </div>
  )
}

function App() {
  console.log('app function component')
  const update = React.update()


  function handleClick() {
    console.log('app click')
    update()
  }

  return (
    <div id="app">
      <h1>App</h1>
      <button onClick={handleClick}>app click</button>

      <Foo />

      <Bar />
    </div>
  )
}

export default App
