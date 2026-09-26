import { useNavigate } from "react-router-dom"
import { clearCredentials } from "../auth/credentials"

export function LogoutButton() {
  const navigate = useNavigate()
  function handleLogout() {
    clearCredentials()
    navigate("/auth")
  }
  return (
    <button type="button" className="w-full" onClick={handleLogout}>
      Выйти
    </button>
  )
}
