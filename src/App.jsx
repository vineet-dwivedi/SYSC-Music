import AppShell from './components/AppShell.jsx'
import { useAppController } from './hooks/useAppController.js'

function App() {
  return <AppShell c={useAppController()} />
}

export default App
