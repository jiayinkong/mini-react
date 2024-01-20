import * as React from './core/React.js'

function Counter() {
  return <div>mini-react</div>
}

// 使用 jsx 语法
// const App = 
// <div id='app'>
//   <MyButton />
// </div>

let fooCount = 1
function Foo() {
  console.log('Foo return')

  const update = React.update()

  function handleClick() {
    fooCount++
    update()
    // React.update()
  }
  return (
    <div id="foo">
      {fooCount}
      <button onClick={handleClick}>foo click</button>
    </div>
  )
}

let barCount = 1
function Bar() {
  console.log('Bar return')

  const update = React.update()

  function handleClick() {
    barCount++
    // React.update()
    update()
  }
  return (
    <div id="bar">
      {barCount}
      <button onClick={handleClick}>bar click</button>
    </div>
  )
}

let appCount = 1
let showBar = false
function App() {
  console.log('App return')

  const update = React.update()

  function handleClick() {
    appCount++
    showBar = !showBar
    // React.update()
    update()
  }
  const foo = <div>foo<div>child1</div><p>child2</p></div>
  const bar = <p>foo</p>
  return (
    <div id="app">
      {appCount}
      <button onClick={handleClick}>click</button>
      {showBar && bar}
      <Foo />
      <Bar />
      {/* {showBar ? bar : foo} */}
      {showBar && bar}
    </div>
  )
}

export default App
