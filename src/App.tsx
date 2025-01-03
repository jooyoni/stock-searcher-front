import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main/Main';
import Portfolio from './pages/Portfolio/Portfolio';
import Pick from './pages/Pick/Pick';
import RealizedProfit from './pages/RealizedProfit/RealizedProfit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/portfolio' element={<Portfolio />} />
        <Route path='/pick' element={<Pick />} />
        <Route path='/realized-profit' element={<RealizedProfit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
