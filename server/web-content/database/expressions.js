import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import EditExpression from './edit-expression.js'

const findEditingExpressionFromHash = () => window.location.hash.split('#database/expressions/')[1] || ''

export default function Expressions() {
    const [search, setSearch] = useState('')
    const [expressions, setExpressions] = useState([])
    const [editingExpression, setEditingExpression] = useState(findEditingExpressionFromHash())
    const searchRef = useRef(null)

    useEffect(() => fetchExpressions(''), [])

    useEffect(() => !editingExpression ? searchRef.current.focus() : null, [editingExpression])

    useEffect(() => {
        const debounceHandler = setTimeout(() => fetchExpressions(search), 300)
        return () => clearTimeout(debounceHandler)
    }, [search])

    useEffect(() => {
        const onHashChange = () => setEditingExpression(findEditingExpressionFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const canAddExpression = search.trim() && !expressions.some(expression => expression.hanzi === search.trim())

    const fetchExpressions = async (searchTerm) => {
        const res = await fetch(`/api/expressions?search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setExpressions(data)
    }

    const addExpression = async () => {
        await fetch(`/api/expressions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: search })
        })
        editExpression(search)
    }

    const editExpression = (name) => window.location.hash = `#database/expressions/${encodeURIComponent(name)}`

    const onEditFinished = () => {
        window.location.hash = `#database/expressions/${encodeURIComponent(name)}`
        fetchExpressions(search)
    }

    return html`
    ${editingExpression ? html`<${EditExpression} name=${editingExpression} onClose=${onEditFinished} />` : html`
        <div style='display: flex; gap: 0.5em; margin-bottom: 0.5em;'>
            <input ref=${searchRef} type='text' placeholder='Search or enter new name' value=${search} onInput=${e => setSearch(e.target.value)} style='width: 100%;' />
            <button onclick=${addExpression} class=primary style='padding: 0 0.5em;' disabled=${!canAddExpression}>+</button>
        </div>
        ${expressions.length === 0 ? html`<div class=minor>No expressions found with name ${search}.</div>` : html`
            <ul style='padding: 0; margin: 0;'>
            ${expressions.map(expression => html`
                <li style='display: flex; align-items: center; justify-content: space-between; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                    <span>${expression.hanzi} <span class=minor>(${expression.pinyin})</span></span>
                    <button onclick=${() => editExpression(expression.name)} style='padding: 0.3em 0.5em;'>✎</button>
                </li>
            `)}
            </ul>
        `}
    `}`
}
