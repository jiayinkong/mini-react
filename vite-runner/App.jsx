import * as React from './core/React.js'

function Counter({ num }) {
  return <div>mini-react：{num}</div>
}

function CounterContainer() {
  return (
    <>
      <Counter num={10} />
      <Counter num={20} />
    </>
  )
}

// 使用 jsx 语法
const App = 
<div>
  hello app
  <CounterContainer />
</div>

export default App
