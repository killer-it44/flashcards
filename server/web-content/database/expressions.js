import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import AddExpressions from './add-expressions.js'
import EditExpression from './edit-expression.js'

const findNavTargetFromHash = () => window.location.hash.split('#database/expressions/')[1] || ''

export default function Expressions() {
    const [search, setSearch] = useState('')
    const [expressions, setExpressions] = useState([])
    const [nav, setNav] = useState(findNavTargetFromHash())
    const searchRef = useRef(null)

    useEffect(() => !nav ? searchRef.current.focus() : null, [nav])

    useEffect(() => {
        const debounceHandler = setTimeout(() => fetchExpressions(search), 300)
        return () => clearTimeout(debounceHandler)
    }, [search])

    useEffect(() => {
        const onHashChange = () => setNav(findNavTargetFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const fetchExpressions = async (searchTerm) => {
        const res = await fetch(`/api/expressions?search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setExpressions(data)
    }

    const addExpression = () => window.location.hash = `#database/expressions/add`

    const editExpression = (name) => window.location.hash = `#database/expressions/edit/${encodeURIComponent(name)}`

    const onEditFinished = () => {
        window.location.hash = `#database/expressions`
        // REVISE check if needed or if it happens automatically
        fetchExpressions(search)
    }

    if (nav.split('/')[0] === 'add') return html`<${AddExpressions} onClose=${onEditFinished} />`
    if (nav.split('/')[0] === 'edit') return html`<${EditExpression} hanzi=${decodeURIComponent(nav.split('/')[1])} onClose=${onEditFinished} />`

    return html`
        <div style='display: flex; gap: 0.5em; margin-bottom: 0.5em;'>
            <input ref=${searchRef} type='text' placeholder='Search or enter new expression' value=${search} oninput=${e => setSearch(e.target.value)} style='width: 100%;' />
            <button onclick=${addExpression} class=primary style='padding: 0 0.5em;'>+</button>
        </div>
        ${expressions.length === 0 ? html`<div class=minor>No expressions found with name ${search}.</div>` : html`
        <ul style='overflow: auto; padding: 0; margin: 0;'>
            ${expressions.map(expression => html`
            <li style='display: flex; align-items: center; justify-content: space-between; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                <button onclick=${() => editExpression(expression.hanzi)}>${expression.hanzi} <span class=minor>(${expression.pinyin})</span></button>
            </li>
            `)}
        </ul>
        `}
    `
}
