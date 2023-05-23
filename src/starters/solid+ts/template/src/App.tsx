import type { Component } from 'solid-js';

import logo from './logo.svg';

import h from "solid-js/h";

import './App.module.css';

const App: Component = () => {
  return (
    <div class="App">
      <header class="header">
        <img src={logo} class="logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
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
};

export default App;
