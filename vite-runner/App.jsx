import * as React from './core/React.js'

let showBar = false
function Counter() {
  // const foo = <div>foo<div>child1</div><div>child2</div></div>
  const bar = <div>bar</div>

  function handleClick() {
    showBar = !showBar
    React.update()
  }

  return (
    <div>
      Counter 
      <button onClick={handleClick}>showBar</button>
      {showBar && bar}
    </div>
  )
}

// 使用 jsx 语法
const App = 
<div id='app'>
  hi-mini-react
  <Counter />
</div>

export default App
