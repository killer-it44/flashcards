import { html } from './preact-htm-standalone.js'

export default function Profile({ user, onLogin, onLogout }) {
    return html`
        <div style='padding:2em;'>
            <h2>Profile</h2>
            ${user.username ? html`
            <div><b>Username:</b> ${user.username}</div>
            <div><b>Joined:</b> ${new Date(user.createdAt).toLocaleDateString()}</div>
            <div><b>Account type: </b>${user.role}</div>
            <button class=primary onclick=${onLogout}>Log out</button>
            ` : html`
            <p>Not logged in.</p>
            <button class=primary onclick=${onLogin}>Log in now</button>
            `}
        </div>
    `
}
