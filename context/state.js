import { createContext, useContext, useState } from "react"
import { useCookies } from "react-cookie"

export const AppContext = createContext(null)

export const AppWrapper = ({ children }) => {
    const [cookies, setCookie, removeCookie] = useCookies(["token", "userid"])
    const [course, setCourse] = useState(null)
    const [user, setUser] = useState(cookies.userid ? cookies.userid : null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [token, setToken] = useState(cookies.token ? cookies.token : null)
    const [authType, setAuthType] = useState(null)
    const [backip, setBackIp] = useState("https://thinkapply.co.uk/api/")
    const [ref, setRef] = useState(null)

    const apply = (course) => {
        setCourse(course)
    }
    const login = (token, pk) => {
        setCookie("token", token, { path: "/" })
        setCookie("userid", pk, { path: "/" })
        setToken(token)
    }
    return (
        <AppContext.Provider
            value={{
                course,
                user,
                loggedIn,
                token,
                backip,
                authType,
                ref,
                setUser,
                setCourse,
                setLoggedIn,
                login,
                setAuthType,
                apply,
                setRef,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    return useContext(AppContext)
}
export default AppWrapper
