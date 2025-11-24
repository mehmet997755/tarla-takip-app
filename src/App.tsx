import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './router/ProtectedRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import OfflineSync from './components/OfflineSync';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AddField from './pages/AddField';
import AddDay from './pages/AddDay';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Fields = lazy(() => import('./pages/Fields'));
const FieldDetail = lazy(() => import('./pages/FieldDetail'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminFields = lazy(() => import('./pages/Admin/AdminFields'));
const AdminWorkers = lazy(() => import('./pages/Admin/AdminWorkers'));
const AdminReports = lazy(() => import('./pages/Admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 pb-20 pt-4">
              <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Yükleniyor...</div>}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route element={<ProtectedRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/fields" element={<Fields />} />
                    <Route path="/fields/:id" element={<FieldDetail />} />
                    <Route path="/add-field" element={<AddField />} />
                    <Route path="/add-day" element={<AddDay />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={[ 'admin', 'owner' ]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/fields" element={<AdminFields />} />
                    <Route path="/admin/workers" element={<AdminWorkers />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <OfflineSync />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
