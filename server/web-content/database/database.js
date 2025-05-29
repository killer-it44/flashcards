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

    function selectCategory(key) {
        window.location.hash = `#database/${key}`
    }

    return html`
        <div style='padding:2em; min-height:300px;'>
            <h2>Database</h2>
            <div style='margin-bottom:2em;'>
                <${category.Component} />
            </div>
            <footer style='position:fixed; left:0; right:0; bottom:0; border-top:1px solid #ddd;display:flex;justify-content:space-around;'>
            ${categories.map(cat => html`
                <button key=${cat.key} style='background:${category.key===cat.key?'#e0e0e0':'transparent'};border:none;padding:1em 1em;font-size:0.6em;cursor:pointer;' onClick=${() => selectCategory(cat.key)}>
                    <strong>${cat.label}</strong>
                </button>
            `)}
            </footer>
        </div>
    `
}
