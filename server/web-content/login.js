import { html, useState } from '/preact-htm-standalone.js'

export default function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const login = async () => {
        setError('')
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ username, password })
        const res = await fetch('/api/login', { method: 'POST', headers, body })
        if (res.status === 200) {
            const user = await res.json()
            onLogin(user)
        } else if (res.status === 401) {
            setError(await res.text())
        } else {
            setError('An unknown error occurred. Please try again.')
        }
    }

    const signup = async () => {
        setError('')
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ username, password })
        const res = await fetch('/api/signup', { method: 'POST', headers, body })
        if (res.status === 201) {
            onLogin(await res.json())
        } else if (res.status === 400 || res.status === 419) {
            setError(await res.text())
        } else {
            setError('An unknown error occurred. Please try again.')
        }
    }

    return html`
        <div style='display:flex; flex-direction:column; gap: 0.5em;'>
            <h2>${isLogin ? 'Login' : 'Sign Up'}</h2>
            <input type='text' value=${username} onInput=${e => setUsername(e.target.value)} placeholder='Username' required autoFocus />
            <input type='password' value=${password} onInput=${e => setPassword(e.target.value)} placeholder='Password' required />
            ${isLogin ? html`
            <button class=primary onclick=${login}>Login</button>
            ` : html`
            <button class=primary onclick=${signup}>Sign Up</button>
            `}
            <div class='error'>${error}</div>
            <div style='text-align:center; margin-top:1em;'>
                <a href='#' onClick=${e => { e.preventDefault(); setIsLogin(x => !x); setError('') }}>
                    ${isLogin ? 'Don\'t have an account? Sign up' : 'Already have an account? Login'}
                </a>
            </div>
        </div>
    `
}
