import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import StatsPage from './pages/StatsPage';
import SubmitPage from './pages/SubmitPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import './App.scss';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/company/:id" element={<DetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <TabBar />
      </HashRouter>
    </AppProvider>
  );
}

export default App;
