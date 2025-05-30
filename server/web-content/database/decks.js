import { html, useState, useEffect } from '/preact-htm-standalone.js'
import EditDeck from './edit-deck.js'

export default function Decks() {
    const [search, setSearch] = useState('')
    const [decks, setDecks] = useState([])
    const [editingDeck, setEditingDeck] = useState(null)

    useEffect(() => fetchDecks(''), [])

    useEffect(() => {
        const debounceCandler = setTimeout(() => fetchDecks(search), 300)
        return () => clearTimeout(debounceCandler)
    }, [search])

    const fetchDecks = async (searchTerm) => {
        const res = await fetch(`/api/decks?search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setDecks(data)
    }

    const handleAddDeck = async () => {
        const name = prompt('Enter new deck name:')
        if (!name) return
        await fetch('/api/decks', { method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        fetchDecks(search)
    }

    const handleEditDeck = (name) => {
        setEditingDeck(name)
    }

    const handleCloseEdit = () => setEditingDeck(null)
    const handleSavedEdit = (newName) => {
        setEditingDeck(null)
        fetchDecks(search)
    }

    return html`
    ${editingDeck ? html`<${EditDeck} name=${editingDeck} onClose=${handleCloseEdit} onSaved=${handleSavedEdit} />` : html`
        <div style='display:flex;gap:0.5em;align-items:center;margin-bottom:1em;'>
            <input type='text' placeholder='Search decks...' value=${search} onInput=${e => setSearch(e.target.value)} style='flex:1;padding:0.5em;font-size:1em;border:1px solid #ccc;border-radius:4px;' />
            <button onclick=${handleAddDeck} style='padding:0.5em 1em;font-size:1em;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;'>New</button>
        </div>
        <div>
        ${decks.length === 0 ? html`<div style='color:#888;'>No decks found.</div>` : html`
            <ul style='list-style:none;padding:0;'>
            ${decks.map(deck => html`
                <li style='display:flex;align-items:center;justify-content:space-between;padding:0.7em 0;border-bottom:1px solid #eee;'>
                    <span><b>${deck.name}</b> <span style='color:#888;'>(${deck.size})</span></span>
                    <button onclick=${() => handleEditDeck(deck.name)} style='background:#eee;border:none;padding:0.4em 1em;border-radius:4px;cursor:pointer;'>Edit</button>
                </li>
            `)}
            </ul>
        `}
        </div>
    `}`
}
