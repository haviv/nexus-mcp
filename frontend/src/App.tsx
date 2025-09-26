import { useEffect, useState } from 'react'
import Chat from './components/Chat'
import Login from './components/Login'

function App() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(!!localStorage.getItem('token'))
  }, [])

  return authed ? <Chat /> : <Login onSuccess={() => setAuthed(true)} />
}

export default App