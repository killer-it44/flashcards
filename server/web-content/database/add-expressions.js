import { html, useState, useRef, useEffect } from '/preact-htm-standalone.js'

export default function AddExpressions({ onClose, onSave }) {
    const [expressions, setExpressions] = useState([{ hanzi: '', pinyin: '', meaning: '' }])
    const firstInputRef = useRef(null)

    useEffect(() => {
        if (firstInputRef.current) firstInputRef.current.focus()
    }, [])

    const handleInputChange = (row, field, value) => {
        const currentExpression = expressions[row]
        currentExpression[field] = value.trim()
        const allExpressionsFilled = expressions.every(e => e.hanzi && e.meaning)
        const hasEmptyExpression = expressions.some(e => !e.hanzi && !e.pinyin && !e.meaning)
        const hasIncompleteNonEmptyExpression = expressions.some(e => (e.hanzi || e.pinyin || e.meaning) && (!e.hanzi || !e.meaning))
        
        if (allExpressionsFilled) {
            setExpressions([...expressions, { hanzi: '', pinyin: '', meaning: '' }])
        } else if (hasEmptyExpression && hasIncompleteNonEmptyExpression) {
            setExpressions(expressions.filter(e => e.hanzi || e.pinyin || e.meaning))
        } else {
            setExpressions([...expressions])
        }
    }

    const validExpressions = () => expressions.filter(e => e.hanzi && e.meaning)
    const colorFor = (value) => value ? '#ccc' : '#dc3545'

    const save = async e => {
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
        <div style='display: flex; justify-content: space-around; margin-top: 1em; width: 100%;'>
            <button class=primary disabled=${validExpressions().length === 0} onclick=${save}>Add</button>
            <button class=secondary onclick=${onClose}>Cancel</button>
        </div>
    `
}
