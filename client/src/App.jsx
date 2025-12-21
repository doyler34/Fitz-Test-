import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FilterProvider } from './hooks/useFilters'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import Guests from './pages/Guests'
import Transport from './pages/Transport'
import Storage from './pages/Storage'

function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
          <Route path="guests" element={<Guests />} />
          <Route path="guests/:id" element={<Guests />} />
          <Route path="transport" element={<Transport />} />
          <Route path="storage" element={<Storage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  )
}

export default App

