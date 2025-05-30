import { html, useEffect, useState } from '/preact-htm-standalone.js'
import Radicals from './radicals.js'
import Characters from './characters.js'
import Expressions from './expressions.js'
import Decks from './decks.js'

const categories = [
    { key: 'radicals', label: 'Radicals', Component: Radicals },
    { key: 'characters', label: 'Characters', Component: Characters },
    { key: 'expressions', label: 'Expressions', Component: Expressions },
    { key: 'decks', label: 'Decks', Component: Decks },
]

const findCategoryFromHash = () => categories.find(c => c.key === window.location.hash.split('/')[1]) || categories[0]

export default function Database() {
    const [category, setCategory] = useState(findCategoryFromHash())

    useEffect(() => {
        const onHashChange = () => setCategory(findCategoryFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    return html`
        <div style='flex: 1; min-height: 0; display: flex; flex-direction: column;'>
            <${category.Component} />
        </div>
        <footer style='width: 100%; border-top: 1px solid #ddd; display: flex; justify-content: center; gap: 0.5em; background: white;'>
        ${categories.map(cat => html`
            <a key=${cat.key} href='#database/${cat.key}' class=${category.key === cat.key ? 'selected-nav' : ''} style='padding: 1em 1em; font-size: 0.6em; color: inherit;'>
                <strong>${cat.label}</strong>
            </a>
        `)}
        </footer>
    `
}
