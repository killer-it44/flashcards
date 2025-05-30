import { html, useState, useEffect } from '/preact-htm-standalone.js'

export default function AddExpressions({ onClose, onSave }) {
    const [expressions, setExpressions] = useState([{ hanzi: '', pinyin: '', meaning: '' }])

    useEffect(() => {
        const firstInput = document.querySelector('.modal-content input[type="text"]')
        if (firstInput) firstInput.focus()
    }, [])

    const handleInputChange = (index, field, value) => {
        const updatedExpressions = [...expressions]
        updatedExpressions[index][field] = value
        setExpressions(updatedExpressions)

        // Add a new row if the current row is fully filled
        if (field === 'meaning' && value && updatedExpressions[index].hanzi) {
            const hasEmptyRow = updatedExpressions.some(e => !e.hanzi && !e.meaning)
            if (!hasEmptyRow) {
                setExpressions([...updatedExpressions, { hanzi: '', pinyin: '', meaning: '' }])
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose(null)
        }
    }

    return html`
        <div class=modal-overlay onclick=${(e) => { e.stopPropagation(); onClose(); }}>
            <div class=modal-content onclick=${(e) => e.stopPropagation()}>
                <h3>Add Expressions</h3>
                <div>
                ${expressions.map((entry, index) => html`
                    <div style='display: flex; gap: .4em; margin: 0.3em 0;'>
                        <input style='width: 50%;' type=text placeholder='Hanzi' value=${entry.hanzi || ''} oninput=${(e) => handleInputChange(index, 'hanzi', e.target.value)} onkeydown=${handleKeyDown} />
                        <input style='width: 50%;' type=text placeholder='Meaning' value=${entry.meaning || ''} oninput=${(e) => handleInputChange(index, 'meaning', e.target.value)} onkeydown=${handleKeyDown} />
                    </div>
                `)}
                </div>
                <div>
                    <button onclick=${(e) => { e.stopPropagation(); onSave(expressions.filter(e => e.hanzi && e.meaning)); }}>✅ OK</button>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(null); }}>❌ Cancel</button>
                </div>
            </div>
        </div>
    `
}
