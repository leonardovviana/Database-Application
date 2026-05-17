import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default function MainLayout({ children }) {
  const isDesktop = useMediaQuery('(min-width: 992px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isDesktop]);

  function handleToggle() {
    setSidebarOpen(prev => !prev);
  }

  function handleClose() {
    if (!isDesktop) setSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={handleClose} />
      <div className="main-wrapper">
        <Navbar onToggleSidebar={handleToggle} />
        <main className="main-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
