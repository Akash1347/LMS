import React from 'react'
import MainRoutes from './Routes/MainRoutes'
import Navbar from './ui/Navbar'
import Footer from './ui/Footer'
import { useLocation } from 'react-router-dom'

const App = () => {
  const location = useLocation()
  const hiddenRoute = ['/login', '/register']
  const shouldHideNavbar = hiddenRoute.some((route) => location.pathname.startsWith(route))

  return (
    <div>
      {!shouldHideNavbar && <Navbar/>}
      
      <MainRoutes />
      <Footer />
    </div>
  )
}

export default App