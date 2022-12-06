import React from 'react';
import logo from './logo.svg';
import './App.css';

declare global {
  interface Window { extended: any; }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        
          You have configured {window.extended.MYAPP_API_ENDPOINT}

      </header>
    </div>
  );
}

export default App;
