import * as React from './core/React.js'

function CounterContainer() {
  return <Counter num={20} />
}

function Counter({ num }) {
  return <div>counter: {num}</div>
}

const App = <div>Hi, App2<CounterContainer /> <CounterContainer /></div>


export default App 
