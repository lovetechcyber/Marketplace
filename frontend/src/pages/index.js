import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export default function HomePage() {
  return (
    <div>
      <Navbar />
      <section className="text-center p-6">
        <h1 className="text-3xl font-bold">Secure Marketplace</h1>
        <p className="mt-2 text-gray-600">Buy & sell electronics and kitchen items securely with Escrow</p>
      </section>
      <Footer />
    </div>
  );
}