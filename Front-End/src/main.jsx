import { Provider } from "./components/ui/provider"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './containers/home/index'
import Login from "./containers/login"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <Login />
    </Provider>
  </StrictMode>,
)
