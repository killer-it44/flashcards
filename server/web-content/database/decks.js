import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import EditDeck from './edit-deck.js'

export default function Decks() {
    const [search, setSearch] = useState('')
    const [decks, setDecks] = useState([])
    const [editingDeck, setEditingDeck] = useState(null)
    const searchRef = useRef(null)

    useEffect(() => fetchDecks(''), [])

    useEffect(() => !editingDeck ? searchRef.current.focus() : null, [editingDeck])

    useEffect(() => {
        const debounceCandler = setTimeout(() => fetchDecks(search), 300)
        return () => clearTimeout(debounceCandler)
    }, [search])

    const canAddDeck = search.trim() && !decks.some(deck => deck.name.toLowerCase() === search.trim().toLowerCase())

    const fetchDecks = async (searchTerm) => {
        const res = await fetch(`/api/decks?search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setDecks(data)
    }

    const handleAddDeck = async () => {
        const name = prompt('Enter new deck name:')
        if (!name) return
        await fetch('/api/decks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        fetchDecks(search)
    }

    const handleEditDeck = (name) => setEditingDeck(name)

    const handleCloseEdit = () => setEditingDeck(null)
    const handleSavedEdit = async (data) => {
        await fetch(`/api/decks/${encodeURIComponent(editingDeck)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        setEditingDeck(null)
        fetchDecks(search)
    }

    return html`
    ${editingDeck ? html`<${EditDeck} name=${editingDeck} onClose=${handleCloseEdit} onSaved=${handleSavedEdit} />` : html`
        <div style='display: flex; gap: 0.5em;'>
            <input ref=${searchRef} type='text' placeholder='Search or enter new name' value=${search} onInput=${e => setSearch(e.target.value)} style='width: 100%;' />
            <button onclick=${handleAddDeck} class=primary style='padding: 0 0.5em;' disabled=${!canAddDeck}>+</button>
        </div>
        <div>
        ${decks.length === 0 ? html`<div class=minor>No decks found.</div>` : html`
            <ul style='padding: 0;'>
            ${decks.map(deck => html`
                <li style='display: flex; align-items: center; justify-content: space-between; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                    <span>${deck.name} <span class=minor>(${deck.size})</span></span>
                    <button onclick=${() => handleEditDeck(deck.name)} style='padding: 0.3em 0.5em;'>✎</button>
                </li>
            `)}
            </ul>
        `}
        </div>
    `}`
}
