import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ChangeCharacter from './change-character.js'

export default function Flashcard() {
    const [isFlipped, setFlipped] = useState(false)
    const [isChangingCharacter, setChangingCharacter] = useState(false)
    const [currentCharacter, setCurrentCharacter] = useState({ pinyin: '', radical: { hanzi: '', meaning: '' }, meaning: '', expressions: [], related: '' })
    const card = useRef()

    useEffect(() => { getRandomChar() }, [])

    const getRandomChar = async () => {
        const response = await fetch('/api/flashcards/characters')
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
        <style>
            .card {
                transform-style: preserve-3d;
                transition: transform 0.5s;
            }

            .card.flipped {
                transform: rotateY(180deg);
            }

            .card-front, .card-back {
                width: 100%;
                height: 100%;
                position: absolute;
                backface-visibility: hidden;
            }

            .card-back {
                transform: rotateY(180deg);
            }
        </style>
        <div style='display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;'>
            <div class='card ${isFlipped ? 'flipped' : ''}' ref=${card} onclick=${() => setFlipped(true)} style='display: flex; flex-direction: column; align-items: center; height: min(100%, 100vw * 3 / 2); aspect-ratio: 2 / 3; border: 2px solid #ccc; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff;'>
                <div class='card-front' style='display: flex; align-items: center; justify-content: center; font-size: 8em;'>
                    <div onclick=${(e) => { e.stopPropagation(); setChangingCharacter(true); }}>${currentCharacter.hanzi}</div>
                </div>
                <div class='card-back' style='display: flex; align-items: center; justify-content: center;'>
                    <${CharacterInfo} onChangeCharacter=${(e) => { e.stopPropagation(); setChangingCharacter(true); }} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentCharacter} />
                </div>
            </div>
            <div style='font-size: 2em; display: flex; justify-content: center; gap: 1.5em;'>
                <button onclick=${() => submit('forgot')}>🤯</button>
                <button onclick=${() => submit('unsure')}>🤔</button>
                <button onclick=${() => submit('remembered')}>🤓</button>
            </div>
            ${isChangingCharacter ? html`<${ChangeCharacter} onClose=${changeCharacter} />` : ''}
        </div>
    `
}
