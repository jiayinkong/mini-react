import * as React from './core/React.js'

function Counter() {
  return <div>mini-react</div>
}

let count = 1;
let props = { id: 'button' }
function MyButton() {
  function handleClick() {
    count++
    props = {}
    React.update()
  }
  return (
    <div {...props}>
      {count}
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
