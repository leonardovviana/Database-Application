import ClientNavbar from '../components/ClientNavbar';

export default function ClientLayout({ children }) {
  return (
    <div className="client-layout">
      <ClientNavbar />
      <main className="client-main">
        {children}
      </main>
    </div>
  );
}
