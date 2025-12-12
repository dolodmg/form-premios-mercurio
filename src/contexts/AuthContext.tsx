import { createContext, useContext, useState, type ReactNode } from 'react'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

interface AuthContextType {
    isAuthenticated: boolean
    token: string | null
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true'
    })
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('authToken')
    })

    const login = async (username: string, password: string): Promise<boolean> => {
        // Development mode: permite login sin backend
        // Usuario: "dev" / Password: "dev"
        if (username === 'dev' && password === 'dev') {
            const devToken = 'dev-token-' + Date.now()
            setIsAuthenticated(true)
            setToken(devToken)
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('authToken', devToken)
            console.log('🔧 Modo desarrollo activado - Login exitoso')
            return true
        }

        try {
            console.log('🔐 Intentando login con:', { username, url: `${API_BASE_URL}${API_ENDPOINTS.login}` })

            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            console.log('📡 Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            })

            const data = await response.json()
            console.log('📦 Datos recibidos:', data)

            if (response.ok && data.success) {
                const authToken = data.data.token
                setIsAuthenticated(true)
                setToken(authToken)
                localStorage.setItem('isAuthenticated', 'true')
                localStorage.setItem('authToken', authToken)
                return true
            }

            return false
        } catch (error) {
            console.error('❌ Login error:', error)
            console.log('💡 Tip: Usa usuario "dev" y contraseña "dev" para modo desarrollo')
            return false
        }
    }

    const logout = () => {
        setIsAuthenticated(false)
        setToken(null)
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('authToken')
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
