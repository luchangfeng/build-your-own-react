import * as Didact from './didact';
/** @jsx Didact.createElement */

const container = document.getElementById("root");
let number = 0;
const clickMe = () => {
  number++;
  reRender();
};

function reRender() {
  const element = (
    <div id="foo">
      <div>
        <span>数字：</span>
        <span>{number}</span>
      </div>
      <button onClick={clickMe}>点我+1</button>
    </div>
  );
  
  Didact.render(element, container);  
}
reRender();
