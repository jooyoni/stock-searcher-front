import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main/Main';
import Portfolio from './pages/Portfolio/Portfolio';
import Pick from './pages/Pick/Pick';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/portfolio' element={<Portfolio />} />
        <Route path='/pick' element={<Pick />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
