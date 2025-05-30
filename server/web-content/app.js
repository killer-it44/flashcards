import { html, useState, useEffect } from '/preact-htm-standalone.js'
import Flashcard from './flashcards/flashcard.js'
import Stories from './stories.js'
import Database from './database/database.js'
import Statistics from './statistics.js'
import Profile from './profile.js'

const navMenu = [
    { hash: '#flashcards', label: '⚡️', title: 'Flashcards', Component: Flashcard },
    { hash: '#stories', label: '📖', title: 'Stories', Component: Stories },
    { hash: '#database', label: '🗃️', title: 'Database', Component: Database },
    { hash: '#statistics', label: '📈', title: 'Statistics', Component: Statistics },
    { hash: '#profile', label: '👤', title: 'Profile', Component: Profile },
]

const findNavTargetFromHash = () => navMenu.find(n => n.hash === window.location.hash.split('/')[0]) || navMenu[0]

export default function App() {
    const [current, setCurrent] = useState(findNavTargetFromHash)

    useEffect(() => {
        const onHashChange = () => setCurrent(findNavTargetFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    return html`
        <div style='margin: 8px; display: flex; flex-direction: column; align-items: center; height: min(100dvh - 16px, (100vw - 16px) * 2); aspect-ratio: 0.5;'>
            <nav style='font-size: 2em; display: flex; justify-content: center; gap: 0.5em; margin-bottom: 0.2em;'>
            ${navMenu.map(n => html`
                <a title=${n.title} href=${n.hash} style='padding: 0 0.1em' class=${current === n ? 'selected-nav' : ''}>${n.label}</a>
            `)}
            </nav>
            <div style='display: flex; justify-content: center; width: 100%; height: 100%;'>
                <${current.Component} />
            </div>
        </div>
    `
}
