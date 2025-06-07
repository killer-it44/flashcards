import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'

export default function EditRelated({ value, onClose }) {
    const [newRelated, setNewRelated] = useState(value.map(c => c.hanzi).join(' '))
    const inputRef = useRef(null)

    useEffect(() => inputRef.current.focus(), [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && newRelated.trim()) {
            onClose(newRelated)
        } else if (e.key === 'Escape') {
            onClose(null)
        }
    }

    const handleInput = (e) => {
        const filterChineseCharacters = e.target.value.replace(/[^\u4e00-\u9fff]/g, '')
        setNewRelated(filterChineseCharacters)
    }

    return html`
        <div style='color: black;' onclick=${e => { e.stopPropagation(); onClose(null); }} class=modal-overlay>
            <div onclick=${e => e.stopPropagation()} class=modal-content>
                <h3>Edit related characters</h3>
                <input ref=${inputRef} type='text' value=${newRelated} oninput=${handleInput} onkeydown=${handleKeyDown} />
                <div>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(newRelated); }} disabled=${!newRelated.trim()}>✅ OK</button>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(null); }}>❌ Cancel</button>
                </div>
            </div>
        </div>
    `
}
