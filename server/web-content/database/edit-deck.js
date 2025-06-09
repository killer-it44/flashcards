import { html, useState, useEffect } from '/preact-htm-standalone.js'

export default function EditDeck({ user, name, onClose }) {
    const [deckName, setDeckName] = useState(name)
    const [entries, setEntries] = useState([])
    const [search, setSearch] = useState('')
    const [filtered, setFiltered] = useState([])

    useEffect(async () => {
        const res = await fetch(`/api/decks/${name}`)
        const data = await res.json()
        setEntries(data.items)
    }, [name])

    useEffect(() => {
        const s = search.trim()
        setFiltered(s ? entries.filter(e => e.includes(s)) : entries)
    }, [search, entries])

    const deleteEntry = (entry) => setEntries(entries.filter(e => e !== entry))

    const addEntry = () => {
        if (!search.trim() || entries.includes(search.trim())) return
        setEntries([...entries, search.trim()])
        setSearch('')
    }

    const saveDeck = async () => {
        if (!user.username) return alert('You must be logged in to save a deck.')

        await fetch(`/api/decks/${name}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: deckName, items: entries })
        })
        onClose({ oldName: name, newName: deckName, entries })
    }

    const deleteDeck = async () => {
        if (!user.username) return alert('You must be logged in to delete decks.')

        if (!confirm(`Are you sure you want to delete the deck "${name}"? This action cannot be undone.`)) return
        await fetch(`/api/decks/${name}`, { method: 'DELETE' })
        onClose(null)
    }

    return html`
        <div style='margin-bottom: 0.5em;'><strong>Edit Deck "${name}"</strong></div>
        <input type='text' placeholder='Enter deck name...' value=${deckName} oninput=${e => setDeckName(e.target.value)} style='margin-bottom: 0.5em; width: calc(100% - 0.6em); padding: 0.3em; border: 1px solid #ccc;' />
        <div style='display: flex; gap: 0.5em;'>
            <input type='text' placeholder='Search or add entry...' value=${search} oninput=${e => setSearch(e.target.value)} />
            <button class=primary style='padding: 0.3em 1em;' disabled=${!search || entries.includes(search.trim())} onclick=${addEntry}>+</button>
        </div>
        ${filtered.length === 0 ? html`<div style='padding: 1em; color: #888;'>No entries found.</div>` : html`
        <ul style='overflow: auto; border: 1px solid #eee; border-radius: 8px; padding: 0; margin: 0;'>
            ${filtered.map(entry => html`
            <li style='display: flex; justify-content: space-between; padding:0.3em 1em; border-bottom: 1px solid #f3f3f3;'>
                <span>${entry}</span>
                <button onclick=${() => deleteEntry(entry)}>❌</button>
            </li>
            `)}
        </ul>`
        }
        <div style='width: 100%; display: flex; justify-content: space-evenly; margin-top: 1em;'>
            <button class=primary onclick=${saveDeck}>Save</button>
            <button class=secondary onclick=${() => onClose(null)}>Cancel</button>
            <button class=warning onclick=${deleteDeck}>Delete</button>
        </div>
    `
}
