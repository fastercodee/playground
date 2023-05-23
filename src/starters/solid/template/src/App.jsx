import logo from './logo.svg';
import h from "solid-js/h";

import './App.module.css';

function App() {
  return (
    <div class="App">
      <header class="header">
        <img src={logo} class="logo" alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <a
          class="link"
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  );
}

export default App;
