import * as React from './core/React.js'

let showBar = false
function MyButton() {
  function handleClick() {
    showBar = !showBar
    React.update()
  }

  function Foo() {
    return <div>foo</div>
  }
  const bar = <p>bar</p>
  return (
    <div>
      <div>{showBar ? bar : <Foo />}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}

// 使用 jsx 语法
const App = 
<div id='app'>
  <MyButton />
</div>

export default App
