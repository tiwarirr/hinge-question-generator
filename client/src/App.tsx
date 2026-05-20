import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GenerateQuestions from './pages/GenerateQuestions';
import ManageQuestions from './pages/ManageQuestions';
import CreateSession from './pages/CreateSession';
import StudentView from './pages/StudentView';
import ManualEntry from './pages/ManualEntry';
import DiagnosticReport from './pages/DiagnosticReport';
import CreateQuestionManual from './pages/CreateQuestionManual';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading, login, register, logout } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register onRegister={register} />} />
        <Route path="/join/:code" element={<StudentView />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout user={user!} onLogout={logout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/generate" element={<GenerateQuestions />} />
                  <Route path="/create-question" element={<CreateQuestionManual />} />
                  <Route path="/questions" element={<ManageQuestions />} />
                  <Route path="/session/new" element={<CreateSession />} />
                  <Route path="/session/:id/manual" element={<ManualEntry />} />
                  <Route path="/report/:sessionId" element={<DiagnosticReport />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
