import { html, useEffect, useState } from '/preact-htm-standalone.js'
import Characters from './characters.js'
import Expressions from './expressions.js'
import Decks from './decks.js'

const categories = [
    { key: 'characters', label: 'Characters', Component: Characters },
    { key: 'expressions', label: 'Expressions', Component: Expressions },
    { key: 'decks', label: 'Decks', Component: Decks }
]

const findCategoryFromHash = () => categories.find(c => c.key === window.location.hash.split('/')[1]) || categories[0]

export default function Database({ user }) {
    const [category, setCategory] = useState(findCategoryFromHash())

    useEffect(() => {
        const onHashChange = () => setCategory(findCategoryFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    return html`
        <nav style='margin-bottom: 1em; width: 100%; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; display: flex; justify-content: space-evenly;'>
            ${categories.map(cat => html`
            <a key=${cat.key} href='#database/${cat.key}' class=${category.key === cat.key ? 'selected-nav' : ''} style='padding: 1em 0.7em; font-size: 0.6em; color: inherit;'>
                <strong>${cat.label}</strong>
            </a>
            `)}
        </nav>
        <${category.Component} user=${user} />
    `
}
