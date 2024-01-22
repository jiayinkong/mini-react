import React from './core/React.js'

function App() {
  console.log('app function component')
  const update = React.update()
  const [count, setCount] = React.useState(10)
  const [name, setName] = React.useState('TOM')

  React.useEffect(() => {
    console.log('init')
  }, [])

  React.useEffect(() => {
    console.log('update')
    return () => {
      console.log('clearup')
    }
  }, [])


  function handleClick() {
    setName( 'Tom Jerry')
    setCount((n) => n + 1)
    
  }

  return (
    <div id="app">
      <h1>App</h1>
      <div>count is: {count}</div>
      <div>name is: {name}</div>
      <button onClick={handleClick}>app click</button>
    </div>
  )
}

export default App
