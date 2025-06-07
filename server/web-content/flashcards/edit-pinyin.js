import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'

export default function EditPinyin({ value, onClose }) {
    const [newPinyin, setNewPinyin] = useState(value)
    const inputRef = useRef(null)

    useEffect(() => inputRef.current.focus(), [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && newPinyin.trim()) {
            onClose(newPinyin)
        } else if (e.key === 'Escape') {
            onClose(null)
        }
    }

    return html`
        <div style='color: black;' onclick=${e => { e.stopPropagation(); onClose(null); }} class=modal-overlay>
            <div onclick=${e => e.stopPropagation()} class=modal-content>
                <h3>Edit pinyin</h3>
                <input ref=${inputRef} type='text' value=${newPinyin} oninput=${e => setNewPinyin(e.target.value)} onkeydown=${handleKeyDown} />
                <div>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(newPinyin); }} disabled=${!newPinyin.trim()}>✅ OK</button>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(null); }}>❌ Cancel</button>
                </div>
            </div>
        </div>
    `
}
