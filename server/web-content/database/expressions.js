import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import AddExpressions from './add-expressions.js'
import EditExpression from './edit-expression.js'

const findNavTargetFromHash = () => window.location.hash.split('#database/expressions/')[1] || ''
const getSearchTermFromHash = () => window.location.hash.split('#database/expressions/?')[1] || ''

export default function Expressions() {
    const [searchTerm, setSearchTerm] = useState(getSearchTermFromHash())
    const [expressions, setExpressions] = useState([])
    const [nav, setNav] = useState(findNavTargetFromHash())
    const searchRef = useRef(null)

    useEffect(() => !nav ? searchRef.current.focus() : null, [nav])

    useEffect(() => {
        const debounceHandler = setTimeout(() => fetchExpressions(searchTerm), 300)
        return () => clearTimeout(debounceHandler)
    }, [searchTerm])

    useEffect(() => {
        const onHashChange = () => {
            setNav(findNavTargetFromHash())
            setSearchTerm(getSearchTermFromHash())
        }
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const fetchExpressions = async (searchTerm) => {
        const res = await fetch(`/api/expressions?search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setExpressions(data)
    }

    const search = (newSearchTerm) => {
        setSearchTerm(newSearchTerm)
        const searchHash = newSearchTerm ? `/?${encodeURIComponent(newSearchTerm)}` : ''
        history.replaceState(null, '', `#database/expressions${searchHash}`)
    }

    const onEditFinished = () => {
        window.location.hash = `#database/expressions`
        fetchExpressions(searchTerm)
    }

    if (nav.split('/')[0] === 'add') return html`<${AddExpressions} onClose=${onEditFinished} />`
    if (nav.split('/')[0] === 'edit') return html`<${EditExpression} hanzi=${decodeURIComponent(nav.split('/')[1])} onClose=${onEditFinished} />`

    return html`
        <div style='display: flex; gap: 0.5em; margin-bottom: 0.5em;'>
            <input ref=${searchRef} type='text' placeholder='Search or enter new expression' value=${searchTerm} oninput=${e => search(e.target.value)} />
            <a href='#database/expressions/add' class=primary style='padding: 0 0.5em; display: flex; align-items: center;'>+</a>
        </div>
        ${expressions.length === 0 ? html`<div class=minor>No expressions found with name ${search}.</div>` : html`
        <ul style='overflow: auto; padding: 0; margin: 0;'>
            ${expressions.map(expression => html`
            <li style='display: flex; justify-content: space-between; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                <a href='#database/expressions/edit/${expression.hanzi}'>${expression.hanzi} <span class=minor>(${expression.pinyin})</span></a>
            </li>
            `)}
        </ul>
        `}
    `
}
