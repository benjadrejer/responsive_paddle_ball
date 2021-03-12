import { useState } from 'react';
import PaddleBall from './PaddleBall';

const App = () => {
    const [start, setStart] = useState(false);

    if (start) return <PaddleBall setStart={setStart} startGame={start} />

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>PaddleBall</h1>
            <button onClick={() => setStart(true)} style={{ borderRadius: '5px', padding: '10px', fontSize: '2rem', cursor: 'pointer'}}>
                Start Game
            </button>
        </div>
    )
}

export default App;
