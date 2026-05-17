import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
