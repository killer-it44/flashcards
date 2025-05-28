import { html, useState, useEffect, useRef } from './preact-htm-standalone.js'

export default function EditRelated({ value, onClose }) {
    const [newRelated, setNewRelated] = useState(value)
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
        <div onclick=${e => { e.stopPropagation(); onClose(null); }} style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.3); display: flex; justify-content: center; align-items: center;'>
            <div onclick=${e => e.stopPropagation()} style='background: white; padding: 20px; border-radius: 8px; text-align: center;'>
                <h3>Edit related characters</h3>
                <input ref=${inputRef} type='text' value=${newRelated} oninput=${handleInput} onkeydown=${handleKeyDown} style='font-size: 1.5em; margin-bottom: 10px;' />
                <div style='margin-top: 10px;'>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(newRelated); }} disabled=${!newRelated.trim()} style='margin-right: 10px; ${!newRelated.trim() ? 'opacity: 0.5; cursor: not-allowed;' : ''}' >✅ OK</button>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(null); }}>❌ Cancel</button>
                </div>
            </div>
        </div>
    `
}
