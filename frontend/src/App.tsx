import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { useUserStore } from './stores/userStore';

function App() {
  const { hasOnboarded } = useUserStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/onboarding" 
          element={
            hasOnboarded ? <Navigate to="/" replace /> : <Onboarding />
          } 
        />
        <Route 
          path="/" 
          element={
            hasOnboarded ? <Dashboard /> : <Navigate to="/onboarding" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
