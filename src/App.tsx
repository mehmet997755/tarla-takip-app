import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './router/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import FieldDetail from './pages/FieldDetail';
import AddField from './pages/AddField';
import AddDay from './pages/AddDay';
import Navbar from './components/Navbar';
import OfflineSync from './components/OfflineSync';
import { useAuth } from './hooks/useAuth';

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pb-12 pt-6">
        <OfflineSync />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="fields" element={<Fields />} />
            <Route path="fields/new" element={<AddField />} />
            <Route path="fields/:id" element={<FieldDetail />} />
            <Route path="fields/:id/add-day" element={<AddDay />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
            <Route path="employer/fields" element={<Fields />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/*" element={<AppLayout />} />
      {user && <Route path="*" element={<AppLayout />} />}
    </Routes>
  );
}

export default App;
