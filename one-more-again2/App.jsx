import React from './core/React.js'

function Foo() {
  return (
    <div>
      Foo
      <p>Foo content</p>
    </div>
  )
}

function Bar({ num }) {
  return (
    <div>
      Bar
      <p>Bar content</p>
      <p>num is: {num}</p>
    </div>
  )
}

// const App = <div>Hello App jsx<p>child1</p></div>
function AppContainer() {
  return (
    <div>
      <h1>App</h1>
      <Foo />
      <Bar num={10} />
    </div>
  )
}

const App = AppContainer()

export default App
