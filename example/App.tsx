import { useState } from 'react';
import DndTestApp from './DndTestApp';
import NestedDndExample from './NestedDndExample';
import '../src/diego-dnd.css';

const App = () => {
  const [activeExample, setActiveExample] = useState<'simple' | 'nested'>('nested');
  
  return (
    <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>diego-dnd Demo</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveExample('simple')}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: activeExample === 'simple' ? '#0078d4' : '#e0e0e0',
            color: activeExample === 'simple' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ejemplo Simple
        </button>
        <button 
          onClick={() => setActiveExample('nested')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeExample === 'nested' ? '#0078d4' : '#e0e0e0',
            color: activeExample === 'nested' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ejemplo Anidado
        </button>
      </div>
      
      {activeExample === 'simple' ? <DndTestApp /> : <NestedDndExample />}
    </div>
  );
};

export default App;