import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import EditDeck from './edit-deck.js'

const findEditingDeckFromHash = () => window.location.hash.split('#database/decks/')[1] || ''

export default function Decks() {
    const [search, setSearch] = useState('')
    const [decks, setDecks] = useState([])
    const [editingDeck, setEditingDeck] = useState(findEditingDeckFromHash())
    const searchRef = useRef(null)

    useEffect(() => fetchDecks(''), [])

    useEffect(() => !editingDeck ? searchRef.current.focus() : null, [editingDeck])

    useEffect(() => {
        const debounceHandler = setTimeout(() => fetchDecks(search), 300)
        return () => clearTimeout(debounceHandler)
    }, [search])

    useEffect(() => {
        const onHashChange = () => setEditingDeck(findEditingDeckFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const canAddDeck = search.trim() && !decks.some(deck => deck.name.toLowerCase() === search.trim().toLowerCase())

    const fetchDecks = async (searchTerm) => {
        const res = await fetch(`/api/decks?search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setDecks(data)
    }

    const addDeck = async () => {
        await fetch(`/api/decks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: search })
        })
        editDeck(search)
    }

    const editDeck = (name) => window.location.hash = `#database/decks/${encodeURIComponent(name)}`

    const onEditClose = () => window.location.hash = '#database/decks'

    const onEditSave = async () => {
        setEditingDeck('')
        fetchDecks(search)
    }

    return html`
    ${editingDeck ? html`<${EditDeck} name=${editingDeck} onClose=${onEditClose} onSave=${onEditSave} />` : html`
        <div style='display: flex; gap: 0.5em;'>
            <input ref=${searchRef} type='text' placeholder='Search or enter new name' value=${search} onInput=${e => setSearch(e.target.value)} style='width: 100%;' />
            <button onclick=${addDeck} class=primary style='padding: 0 0.5em;' disabled=${!canAddDeck}>+</button>
        </div>
        <div>
        ${decks.length === 0 ? html`<div class=minor>No decks found.</div>` : html`
            <ul style='padding: 0;'>
            ${decks.map(deck => html`
                <li style='display: flex; align-items: center; justify-content: space-between; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                    <span>${deck.name} <span class=minor>(${deck.size})</span></span>
                    <button onclick=${() => editDeck(deck.name)} style='padding: 0.3em 0.5em;'>✎</button>
                </li>
            `)}
            </ul>
        `}
        </div>
    `}`
}
