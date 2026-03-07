import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Team from './pages/Team';
import LawyerDetail from './pages/LawyerDetail';
import Metrics from './pages/Metrics';
import Documentos from './pages/Documentos';
import Activity from './pages/Activity';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="casos" element={<Cases />} />
          <Route path="casos/:id" element={<CaseDetail />} />
          <Route path="agentes" element={<Agents />} />
          <Route path="agentes/:id" element={<AgentDetail />} />
          <Route path="equipo" element={<Team />} />
          <Route path="equipo/:id" element={<LawyerDetail />} />
          <Route path="metricas" element={<Metrics />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="actividad" element={<Activity />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
