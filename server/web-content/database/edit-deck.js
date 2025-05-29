import { html, useState, useEffect } from '/preact-htm-standalone.js'

export default function EditDeck({ name, onClose, onSaved }) {
    const [deckName, setDeckName] = useState(name)
    const [entries, setEntries] = useState([])
    const [search, setSearch] = useState('')
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        setLoading(true)
        fetch(`/api/decks/${encodeURIComponent(name)}`)
            .then(res => res.json())
            .then(data => {
                setEntries(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [name])

    useEffect(() => {
        const s = search.trim()
        setFiltered(s ? entries.filter(e => e.includes(s)) : entries)
    }, [search, entries])

    const handleDelete = (entry) => {
        setEntries(entries.filter(e => e !== entry))
    }

    const handleAdd = () => {
        if (!search.trim() || entries.includes(search.trim())) return
        setEntries([...entries, search.trim()])
        setSearch('')
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const res = await fetch(`/api/decks/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: deckName, items: entries })
            })
            if (!res.ok) throw new Error('Failed to save')
            onSaved && onSaved(deckName)
        } catch (e) {
            setError('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    return html`
        <div style='max-width:500px;margin:2em auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px #0001;padding:2em;position:relative;'>
            <div style='margin-bottom:1.5em;'>
                <label style='font-weight:bold;'>Deck name:</label><br/>
                <input type='text' value=${deckName} onInput=${e => setDeckName(e.target.value)} style='width:100%;padding:0.5em;font-size:1em;margin-top:0.3em;border:1px solid #ccc;border-radius:4px;' />
            </div>
            <div style='margin-bottom:1.5em;'>
                <div style='display:flex;gap:0.5em;align-items:center;margin-bottom:0.7em;'>
                    <input type='text' placeholder='Search or add entry...' value=${search} onInput=${e => setSearch(e.target.value)} style='flex:1;padding:0.5em;font-size:1em;border:1px solid #ccc;border-radius:4px;' />
                    <button style='padding:0.5em 1em;font-size:1em;background:${search && !entries.includes(search.trim()) ? '#007bff' : '#ccc'};color:white;border:none;border-radius:4px;cursor:${search && !entries.includes(search.trim()) ? 'pointer' : 'not-allowed'};' disabled=${!search || entries.includes(search.trim())} onclick=${handleAdd}>
                        Add
                    </button>
                </div>
                <div style='max-height:200px;overflow:auto;border:1px solid #eee;border-radius:4px;'>
                    ${loading ? html`<div style='padding:1em;color:#888;'>Loading...</div>` :
                        filtered.length === 0 ? html`<div style='padding:1em;color:#888;'>No entries found.</div>` :
                        html`<ul style='list-style:none;padding:0;margin:0;'>
                            ${filtered.map(entry => html`
                                <li style='display:flex;align-items:center;justify-content:space-between;padding:0.5em 1em;border-bottom:1px solid #f3f3f3;'>
                                    <span>${entry}</span>
                                    <button onclick=${() => handleDelete(entry)} style='background:#ff4d4f;color:white;border:none;padding:0.3em 0.8em;border-radius:4px;cursor:pointer;'>Delete</button>
                                </li>
                            `)}
                        </ul>`
                    }
                </div>
            </div>
            <div style='display:flex;justify-content:space-between;align-items:center;margin-top:2em;'>
                <button onclick=${onClose} style='padding:0.6em 2em;font-size:1em;background:#eee;border:none;border-radius:4px;cursor:pointer;'>Cancel</button>
                <button onclick=${handleSave} disabled=${saving} style='padding:0.6em 2em;font-size:1em;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;'>${saving ? 'Saving...' : 'Save'}</button>
            </div>
            ${error && html`<div style='color:#c00;margin-top:1em;'>${error}</div>`}
        </div>
    `
}
