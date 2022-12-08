import React from 'react';
import logo from './logo.svg';
import './App.css';

type Config={
    MYAPP_API_ENDPOINT:string
}
function App(props : Config) {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          You have configured {props.MYAPP_API_ENDPOINT}
        </div>
      </header>
    </div>
  );
}

export default App;
