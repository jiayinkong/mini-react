import * as React from './core/React.js'

let fooCount = 1;
function Foo() {
  console.log('foo return')
  const update = React.update()
  function handleClick() {
    fooCount++
    update()
    // React.update()
  }
  return (
    <div id='foo'>
      {fooCount}
      <button onClick={handleClick}>foo click</button>
    </div>
  )
}

let barCount = 1;
function Bar() {
  console.log('bar return')
  const update = React.update()
  function handleClick() {
    barCount++
    update()
    // React.update()
  }
  return (
    <div id='bar'>
      {barCount}
      <button onClick={handleClick}>bar click</button>
    </div>
  )
}

function TestUsetate() {
  const [count, setCount] = React.useState(10)
  const [bar, setBar] = React.useState('bar')

  function handleClick() {
    setCount(c => c + 1)
    setBar('bar!')
  }

  return (
    <div>
      {count}
      <div>{bar}</div>
      <div>
        <button onClick={handleClick}>click</button>
      </div>
    </div>
  )
}

let appCount = 1;
function App() {
  console.log('app return')
  const update = React.update()
  function handleClick() {
    appCount++
    update()
    // React.update()
  }
  return (
    <div id='app'>
      {appCount}
      <button onClick={handleClick}>app click</button>
      <Foo />
      <Bar />
      <TestUsetate />
    </div>
  )
}

export default App
