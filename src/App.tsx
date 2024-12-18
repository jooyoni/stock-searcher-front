import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main/Main';
import Portfolio from './pages/Portfolio/Portfolio';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path='/' element={<Main />} />
      </Routes>
      <Routes>
        <Route path='/portfolio' element={<Portfolio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
