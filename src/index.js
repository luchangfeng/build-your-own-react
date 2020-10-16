import * as Didact from './didact';

/** @jsx Didact.createElement */
const container = document.getElementById("root");
let number = 0;
const clickMe = () => {
  number++;
  reRender();
};

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

function App(props) {
  return (
    <div id="app" key="app">
      {
        props.number % 2 === 0 ? <App1 /> : <App2 />
      }
      <button onClick={clickMe}>点我切换</button>
    </div>
  );
}

function reRender() {
  const element = <App number={number} />;
  
  Didact.render(element, container);  
}
reRender();
