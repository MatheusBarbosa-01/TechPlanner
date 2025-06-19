import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from './components/ui/provider'

import Login from './containers/login'
import Home from './containers/home'
import Calendario from './containers/calendario'
import Eventos from './containers/incluirEventos'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/eventos" element={<Eventos />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
