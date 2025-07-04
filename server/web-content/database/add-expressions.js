import { html, useState, useRef, useEffect } from '/preact-htm-standalone.js'

export default function AddExpressions({ user, onClose }) {
    const [expressions, setExpressions] = useState([{ hanzi: '', pinyin: '', meaning: '' }])
    const firstInputRef = useRef(null)

    useEffect(() => (firstInputRef.current) ? firstInputRef.current.focus() : null, [])

    const handleInputChange = (row, field, value) => {
        const currentExpression = expressions[row]
        currentExpression[field] = value
        const allExpressionsFilled = expressions.every(e => e.hanzi.trim() && e.meaning.trim())
        const hasEmptyExpression = expressions.some(e => !e.hanzi.trim() && !e.pinyin.trim() && !e.meaning.trim())
        const hasIncompleteNonEmptyExpression = expressions.some(e => (e.hanzi.trim() || e.pinyin.trim() || e.meaning.trim()) && (!e.hanzi.trim() || !e.meaning.trim()))

        if (allExpressionsFilled) {
            setExpressions([...expressions, { hanzi: '', pinyin: '', meaning: '' }])
        } else if (hasEmptyExpression && hasIncompleteNonEmptyExpression) {
            setExpressions(expressions.filter(e => e.hanzi.trim() || e.pinyin.trim() || e.meaning.trim()))
        } else {
            setExpressions([...expressions])
        }
    }

    const validExpressions = () => expressions.map(e => ({ hanzi: e.hanzi.trim(), pinyin: e.pinyin.trim(), meaning: e.meaning.trim() })).filter(e => e.hanzi && e.meaning)
    const colorFor = (value) => value ? '#ccc' : '#dc3545'

    const save = async () => {
        if (!user.username) return alert('You must be logged in to edit expressions.')

        await fetch('/api/expressions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validExpressions())
        })
        onClose()
    }

    return html`
        <h3>Add Expressions</h3>
        <div style='display: flex; flex-direction: column; gap: 0.5em; overflow: auto;'>
            ${expressions.map((expr, i) => html`
            <div style='display: flex; gap: 0.4em;'>
                <input ref=${i === 0 ? firstInputRef : null} type='text' placeholder='Hanzi' value=${expr.hanzi} oninput=${e => handleInputChange(i, 'hanzi', e.target.value)} style='width: 33%; border: 1px solid ${colorFor(expr.hanzi)};' />
                <input type='text' placeholder='Pinyin' value=${expr.pinyin} oninput=${e => handleInputChange(i, 'pinyin', e.target.value)} style='width: 33%;' />
                <input type='text' placeholder='Meaning' value=${expr.meaning} oninput=${e => handleInputChange(i, 'meaning', e.target.value)} style='width: 33%; border: 1px solid ${colorFor(expr.meaning)};' />
            </div>
            `)}
        </div>
        <div style='display: flex; justify-content: space-evenly; margin-top: 1em; width: 100%;'>
            <button class=primary disabled=${validExpressions().length === 0} onclick=${save}>Add</button>
            <button class=secondary onclick=${onClose}>Cancel</button>
        </div>
    `
}
