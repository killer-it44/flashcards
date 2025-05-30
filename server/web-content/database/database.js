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
        <div style='padding: .5em;'>
            <${category.Component} />
            <footer style='position: fixed; bottom: 0; border-top: 1px solid #ddd; display: flex; justify-content: center; gap: 0.5em; left: 50%; transform: translateX(-50%);'>
            ${categories.map(cat => html`
                <a key=${cat.key} href='#database/${cat.key}' style='background: ${(category.key === cat.key) ? '#e0e0e0' : 'transparent'}; padding: 1em 1em; font-size: 0.6em; color: inherit;'>
                    <strong>${cat.label}</strong>
                </a>
            `)}
            </footer>
        </div>
    `
}
