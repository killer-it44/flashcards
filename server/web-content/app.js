import { html, useState, useEffect, useRef } from './preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ChangeCharacter from './change-character.js'

export default function App() {
    // TODO support hash
    const [isFlipped, setFlipped] = useState(false)
    const [isChangingCharacter, setChangingCharacter] = useState(false)
    const [currentCharacter, setCurrentCharacter] = useState({ pinyin: '', radical: { hanzi: '', meaning: '' }, meaning: '', expressions: [], related: '' })
    const card = useRef()

    useEffect(() => getRandomChar(), [])

    const getRandomChar = async () => {
        const response = await fetch('/api/decks/characters')
        const json = await response.json()
        setCurrentCharacter(json)
    }

    const getChar = async (hanzi) => {
        const response = await fetch(`/api/characters/${hanzi}`)
        const json = await response.json()
        setCurrentCharacter(json)
    }

    const changeCharacter = async (newCharacter) => {
        newCharacter ? await getChar(newCharacter) : null
        setChangingCharacter(false)
    }

    const saveRelated = async (newRelated) => {
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ ...currentCharacter, related: newRelated })
        await fetch(`/api/characters/${currentCharacter.hanzi}`, { method: 'PUT', headers, body })
        await getChar(currentCharacter.hanzi)
    }

    const saveExpressions = async (newExpressions) => {
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify(newExpressions)
        await fetch(`/api/expressions`, { method: 'POST', headers, body })
        await getChar(currentCharacter.hanzi)
    }

    const submit = async (remembered) => {
        // const headers = { 'Content-Type': 'application/json' }
        // const body = JSON.stringify({ character: currentCharacter.hanzi, remembered })
        // await fetch('/api/submissions', { method: 'POST', headers, body })
        // history.pushState(currentCharacter.hanzi, '', `/#/${currentCharacter.hanzi}`)
        await getRandomChar()
        setFlipped(false)
    }

    return html`
        <nav style='font-size: 2em; display: flex; justify-content: center; gap: .7em;'>
            <button title='Flashcards'>⚡️</button>
            <button title='Stories'>📖</button>
            <button title='Database'>🗃️</button>
            <button title='Statistics'>📈</button>
            <button title='Profile'>👤</button>
        </nav>
        <div style='display: flex; flex-direction: column; align-items: center; justify-content: center;'>
            <div class='card ${isFlipped ? 'flipped' : ''}' ref=${card} onclick=${() => setFlipped(true)} style='display: flex; flex-direction: column; align-items: center; height: min(80vh, 80vw * 1.5); aspect-ratio: 2 / 3; border: 2px solid #ccc; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff;'>
                <div class='card-front' style='display: flex; align-items: center; justify-content: center; font-size: 8em;'>
                    <div onclick=${(e) => { e.stopPropagation(); setChangingCharacter(true); }}>${currentCharacter.hanzi}</div>
                </div>
                <div class='card-back' style='display: flex; align-items: center; justify-content: center;'>
                    <${CharacterInfo} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentCharacter} />
                </div>
            </div>
            <div style='font-size: 2em; display: flex; justify-content: center; gap: 1.5em;'>
                <!-- TODO implement actions -->
                <button onclick=${submit} style='border: none;'>🤯</button>
                <button onclick=${submit} style='border: none;'>🤔</button>
                <button onclick=${submit} style='border: none;'>🤓</button>
            </div>
            <button onclick=${(e) => { e.stopPropagation(); setChangingCharacter(true); }} style='font-size: 2em; position: absolute; right: 0; top: 0; margin: 6px;'>🔄</button>
            ${isChangingCharacter ? html`<${ChangeCharacter} onClose=${changeCharacter} />` : ''}
        </div>
    `
}
