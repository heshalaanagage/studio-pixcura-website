import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Albums from './pages/Albums';
import AlbumDetails from './pages/AlbumDetails';
import Booking from './pages/Booking';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAlbums from './pages/admin/ManageAlbums';
import ManagePackages from './pages/admin/ManagePackages';
import ManageBookings from './pages/admin/ManageBookings';
import ManageSiteSettings from './pages/admin/ManageSiteSettings';
import ManageHomeContent from './pages/admin/ManageHomeContent';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('pixcura-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('pixcura-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app-shell">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/albums/:slug" element={<AlbumDetails />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="albums" element={<ManageAlbums />} />
              <Route path="packages" element={<ManagePackages />} />
              <Route path="home-content" element={<ManageHomeContent />} />
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="settings" element={<ManageSiteSettings />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
