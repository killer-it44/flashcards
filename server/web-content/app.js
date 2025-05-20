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
        <div style='display: flex; flex-direction: column; margin-top: 8px; align-items: center; justify-content: center; height: calc(100vh - 4em);'>
            <div class='card ${isFlipped ? 'flipped' : ''}' ref=${card} onclick=${() => setFlipped(true)} style='display: flex; flex-direction: column; justify-content: center; align-items: center; height: min(75vh, 75vw * 1.5); aspect-ratio: 2 / 3; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff;'>
                <div class='card-front' style='display: flex; align-items: center; justify-content: center; font-size: 8em; margin-bottom: 16px;'>
                    <div>${currentCharacter.hanzi}</div>
                </div>
                <div class='card-back' style='display: flex; align-items: center; justify-content: center; margin-bottom: 16px;'>
                    <${CharacterInfo} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentCharacter} />
                </div>
            </div>
            <div style='display: flex; position: fixed; bottom: 0; left: 0; width: 100%;'>
                <button onclick=${submit} style='width: 33%; border: none; background-color: red; font-size: 2.5em;'>🤯</button>
                <button onclick=${submit} style='width: 34%; border: none; background-color: orange; font-size: 2.5em;'>🤔</button>
                <button onclick=${submit} style='width: 33%; border: none; background-color: green; font-size: 2.5em;'>🤓</button>
            </div>
            <button onclick=${(e) => {e.stopPropagation(); setChangingCharacter(true);}} style='font-size: 3.5em; position: absolute; right: 0; top: 0; margin: 10px;'>🔄</button>
            ${isChangingCharacter ? html`<${ChangeCharacter} onClose=${changeCharacter} />` : ''}
        </div>
    `
}
