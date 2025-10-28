import { Navigate, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage.jsx";
import PurchaseCancelPage from "./pages/PurchaseCancelPage.jsx";

import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

import { Toaster } from "react-hot-toast";

import { useEffect } from "react";

import { useUserStore } from "./stores/useUserStore.js"
import { useCartStore } from "./stores/useCartStore.js"

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  useEffect(() => {
    if(!user) return
    getCartItems();
  }, [getCartItems, user]);

  if(checkingAuth) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className='relative z-50 pt-20'>
        <Navbar />
        <Routes>
          <Route path="/" element={ <HomePage/> } />
          <Route path="/signup" element={ !user ? <SignUpPage/> : <Navigate to='/' />} />
          <Route path="/login" element={ !user ? <LoginPage /> : <Navigate to='/' /> } />
          <Route path="/secret-dashboard" element={ user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' /> } />
          <Route path="/category/:category" element={ <CategoryPage /> } />
          <Route path="/cart" element={ user ? <CartPage /> : <Navigate to='/login' /> } />
          <Route
						path='/purchase-success'
						element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />}
					/>
					<Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  )
}

export default App
