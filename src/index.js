import * as Didact from './didact';

/** @jsx Didact.createElement */
const container = document.getElementById("root");

function App1() {
  return (
    <div>明月几时有？</div>
  );
}

function App2() {
  return (
    <div>把酒问青天！</div>
  );
}

function App() {
  const [number, setNumber] = Didact.useState(0);
  const [counter, setCounter] = Didact.useState(3);

  return (
    <div id="app" key="app">
      <button onClick={() => {
        setCounter(counter => counter + 1);
        setCounter(counter => counter * 2);
      }}>点我+1</button>
      <p>当前数字：{counter}</p>
      <hr />
      <button onClick={() => setNumber(number => number + 1)}>点我切换</button>
      {
        number % 2 === 0 ? <App1 /> : <App2 />
      }
    </div>
  );
}

function reRender() {
  const element = <App />;
  
  Didact.render(element, container);  
}
reRender();
