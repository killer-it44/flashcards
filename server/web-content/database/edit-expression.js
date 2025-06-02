import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'

export default function EditExpression({ name, onClose }) {
    const [expression, setExpression] = useState(null)
    const [newName, setNewName] = useState(name)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/expressions/${encodeURIComponent(name)}`)
            .then(res => res.json())
            .then(data => {
                setExpression(data)
                setNewName(data.name)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load expression.')
                setLoading(false)
            })
    }, [name])

    useEffect(() => {
        if (!loading && inputRef.current) inputRef.current.focus()
    }, [loading])

    const save = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`/api/expressions/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            })
            if (!res.ok) throw new Error('Failed to save')
            onClose && onClose(newName)
        } catch (err) {
            setError('Failed to save changes.')
            setLoading(false)
        }
    }

    const cancel = e => {
        e.preventDefault()
        onClose && onClose()
    }

    if (loading) return html`<div>Loading...</div>`
    if (error) return html`<div class="error">${error}</div>`
    if (!expression) return html`<div>Expression not found.</div>`

    return html`
        <form onSubmit=${save} style="background: #fff; border: 1px solid #ccc; padding: 1em; max-width: 400px; margin: 2em auto; border-radius: 6px;">
            <h2>Edit Expression</h2>
            <div style="margin-bottom: 1em;">
                <label>Name:<br/>
                    <input ref=${inputRef} type="text" value=${newName} onInput=${e => setNewName(e.target.value)} style="width: 100%;" required />
                </label>
            </div>
            <div style="display: flex; gap: 0.5em;">
                <button type="submit" class="primary" disabled=${loading || !newName.trim()}>Save</button>
                <button type="button" onClick=${cancel} disabled=${loading}>Cancel</button>
            </div>
        </form>
    `
}
