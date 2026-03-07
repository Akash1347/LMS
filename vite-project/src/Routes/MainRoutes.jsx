import Home from '../pages/User/Home'
import LogIn from '../pages/Auth/LogIn'
import Register from '../pages/Auth/Register'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectecRoutes } from './ProtectedRoutes'

const MainRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={
        <ProtectecRoutes>
          <Home />
        </ProtectecRoutes>
      } />
      <Route path='/login' element={<LogIn />} />
      <Route path='/register' element={<Register />} />

    </Routes>
  )
}

export default MainRoutes