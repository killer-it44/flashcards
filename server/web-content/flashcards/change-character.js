import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'

export default function ChangeCharacter({ onClose }) {
    const [newCharacter, setNewCharacter] = useState('')
    const inputRef = useRef(null)

    useEffect(() => inputRef.current.focus(), [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && newCharacter.trim()) {
            onClose(newCharacter)
        } else if (e.key === 'Escape') {
            onClose('')
        }
    }

    return html`
        <div onclick=${e => {e.stopPropagation(); onClose('');}} style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;'>
            <div onclick=${e => e.stopPropagation()} style='background: white; padding: 20px; border-radius: 8px; text-align: center;'>
                <h3>Change Character</h3>
                <input ref=${inputRef} type='text' value=${newCharacter} oninput=${e => setNewCharacter(e.target.value)} onkeydown=${handleKeyDown} style='font-size: 1.5em; margin-bottom: 10px;' />
                <div style='margin-top: 10px;'>
                    <button onclick=${(e) => {e.stopPropagation(); onClose(newCharacter);}} disabled=${!newCharacter.trim()} style='margin-right: 10px; ${!newCharacter.trim() ? 'opacity: 0.5; cursor: not-allowed;' : ''}' >✅ OK</button>
                    <button onclick=${(e) => {e.stopPropagation(); onClose('');}}>❌ Cancel</button>
                </div>
            </div>
        </div>
    `
}
