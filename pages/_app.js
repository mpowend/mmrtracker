import "../styles/globals.css"
import { AppWrapper } from "../context/state"
import { CookiesProvider } from "react-cookie"

function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </CookiesProvider>
  )
}

export default MyApp
