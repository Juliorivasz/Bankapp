import { Outlet } from "react-router-dom"
import { Footer } from "../Footer"
import { Header } from "../Header"


export const LayoutClient = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
