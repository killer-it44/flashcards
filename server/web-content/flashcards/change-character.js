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
        <div onclick=${e => {e.stopPropagation(); onClose('');}} class=modal-overlay>
            <div onclick=${e => e.stopPropagation()} class=modal-content>
                <h3>Change Character</h3>
                <input ref=${inputRef} type='text' value=${newCharacter} oninput=${e => setNewCharacter(e.target.value)} onkeydown=${handleKeyDown} />
                <div>
                    <button onclick=${(e) => {e.stopPropagation(); onClose(newCharacter);}} disabled=${!newCharacter.trim()}>✅ OK</button>
                    <button onclick=${(e) => {e.stopPropagation(); onClose('');}}>❌ Cancel</button>
                </div>
            </div>
        </div>
    `
}
