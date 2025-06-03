import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import EditDeck from './edit-deck.js'

const findEditingDeckFromHash = () => window.location.hash.split('#database/decks/')[1] || ''

export default function Decks() {
    const [search, setSearch] = useState('')
    const [decks, setDecks] = useState([])
    const [editingDeck, setEditingDeck] = useState(findEditingDeckFromHash())
    const searchRef = useRef(null)

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

    const onEditFinished = () => {
        window.location.hash = `#database/decks`
        fetchDecks(search)
    }

    return html`${editingDeck 
        ? html`
            <${EditDeck} name=${editingDeck} onClose=${onEditFinished} />
        `
        : html`
            <div style='display: flex; gap: 0.5em; margin-bottom: 0.5em;'>
                <input ref=${searchRef} type='text' placeholder='Search or enter new name' value=${search} oninput=${e => setSearch(e.target.value)} style='width: 100%;' />
                <button onclick=${addDeck} class=primary style='padding: 0 0.5em;' disabled=${!canAddDeck}>+</button>
            </div>
            ${decks.length === 0 ? html`<div class=minor>No decks found with name ${search}.</div>` : html`
            <ul style='padding: 0; margin: 0;'>
                ${decks.map(deck => html`
                <li style='display: flex; align-items: center; justify-content: space-between; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                    <button onclick=${() => editDeck(deck.name)}>${deck.name} <span class=minor>(${deck.size})</span></button>
                </li>
                `)}
            </ul>
            `}
        `
    }`
}
