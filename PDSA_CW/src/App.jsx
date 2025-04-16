import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TicTacToe from './pages/TicTacToe';
import TravelingSalesman from './pages/TravelingSalesman';
import TowerOfHanoi from './pages/TowerOfHanoi';
import EightQueens from './pages/EightQueens';
import KnightsTour from './pages/KnightsTour';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/traveling-salesman" element={<TravelingSalesman />} />
        <Route path="/tower-of-hanoi" element={<TowerOfHanoi />} />
        <Route path="/eight-queens" element={<EightQueens />} />
        <Route path="/knights-tour" element={<KnightsTour />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;