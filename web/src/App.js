import {useState} from 'react';
import './App.css';
import Photos from './containers/Photos';
import Uploader from './containers/Uploader';

function App() {
  const [state, setState] = useState(0)

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Uploader refreshPage={setState} />
          <Photos refreshState={state}/>
        </div>
      </main>
    </div>
  );
}

export default App;
