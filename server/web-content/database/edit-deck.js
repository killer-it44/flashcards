import { html, useState, useEffect } from '/preact-htm-standalone.js'

export default function EditDeck({ name, onClose }) {
    const [deckName, setDeckName] = useState(name)
    const [entries, setEntries] = useState([])
    const [search, setSearch] = useState('')
    const [filtered, setFiltered] = useState([])

    useEffect(async () => {
        const res = await fetch(`/api/decks/${encodeURIComponent(name)}`)
        const data = await res.json()
        setEntries(data)
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

    const save = async () => {
        await fetch(`/api/decks/${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: deckName, items: entries })
        })
        onClose({ oldName: name, newName: deckName, entries })
    }

    return html`
        <div><strong>Edit Deck</strong></div>
        <div style='display: flex; margin-bottom: 1em;'>
            <input type='text' value=${deckName} onInput=${e => setDeckName(e.target.value)} style='width: 100%; padding: 0.5em; margin-top: 0.3em; border: 1px solid #ccc;' />
        </div>
        <div style='display: flex; gap: 0.5em; margin-bottom: 0.7em;'>
            <input type='text' placeholder='Search or add entry...' value=${search} onInput=${e => setSearch(e.target.value)} style='width: 100%; padding: 0.5em;'/>
            <button class=primary style='padding: 0.5em 1em;' disabled=${!search || entries.includes(search.trim())} onclick=${addEntry}>+</button>
        </div>
        <div style='max-height: 200px; overflow: auto; border: 1px solid #eee; border-radius: 8px;'>
        ${filtered.length === 0 ? html`<div style='padding: 1em; color: #888;'>No entries found.</div>` : html`
            <ul style='list-style:none; padding: 0; margin: 0;'>
            ${filtered.map(entry => html`
                <li style='display: flex; justify-content: space-between; padding:0.5em 1em; border-bottom: 1px solid #f3f3f3;'>
                    <span>${entry}</span>
                    <button onclick=${() => deleteEntry(entry)}>❌</button>
                </li>
            `)}
            </ul>`
        }
        </div>
        <div style='display: flex; justify-content: center; gap: 1em;'>
            <button onclick=${save}>✅ OK</button>
            <button onclick=${() => onClose(null)}>❌ Cancel</button>
        </div>
    `
}
