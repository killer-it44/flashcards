import { html, useState, useEffect } from './preact-htm-standalone.js'
import Flashcard from './flashcard.js'
import Stories from './stories.js'
import Database from './database.js'
import Statistics from './statistics.js'
import Profile from './profile.js'

const navMenu = [
    { hash: '#flashcards', label: '⚡️', title: 'Flashcards', component: Flashcard },
    { hash: '#stories', label: '📖', title: 'Stories', component: Stories },
    { hash: '#database', label: '🗃️', title: 'Database', component: Database },
    { hash: '#statistics', label: '📈', title: 'Statistics', component: Statistics },
    { hash: '#profile', label: '👤', title: 'Profile', component: Profile },
]

export default function App() {
    const [current, setCurrent] = useState(window.location.hash || '#flashcards')

    useEffect(() => {
        const onHashChange = () => {
            const h = window.location.hash || '#flashcards'
            setCurrent(navMenu.findIndex(n => n.hash === h) !== -1 ? h : '#flashcards')
        }
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const navButtons = navMenu.map(n => html`<button title=${n.title} onclick=${() => window.location.hash = n.hash} style=${current === n.hash ? 'font-weight:bold;' : ''}>${n.label}</button>`)
    const CurrentComponent = navMenu.find(n => n.hash === current)?.component || Flashcard

    return html`
        <nav style='font-size: 2em; display: flex; justify-content: center; gap: .7em;'>
            ${navButtons}
        </nav>
        <div style='display: flex; justify-content: center; width: 100%;'>
            <${CurrentComponent} />
        </div>
    `
}
