import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import ProductPage from './pages/ProductPage';
import Wishlist from './pages/Wishlist';
import Stores from './pages/Stores';
import About from './pages/About';
import AdminDashboard from './pages/admin/AdminDashboard';

const Layout = () => (
  <div className="container py-12">
    <Outlet />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ThemeProvider>
            <Router>
              <div className="app-wrapper">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<Layout />}>
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<OrderTracking />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/stores" element={<Stores />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                  </Routes>
                </main>
              </div>
            </Router>
          </ThemeProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
