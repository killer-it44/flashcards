import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ChangeCharacter from './change-character.js'

export default function Flashcard() {
    const [isFlipped, setFlipped] = useState(false)
    const [isChangingCharacter, setChangingCharacter] = useState(false)
    const [currentCharacter, setCurrentCharacter] = useState({ pinyin: '', radical: { hanzi: '', meaning: '' }, meaning: '', expressions: [], related: '' })
    const [decks, setDecks] = useState([])
    const [selectedDeck, setSelectedDeck] = useState('')

    useEffect(async () => {
        const decksResp = await (await fetch('/api/decks')).json()
        setDecks(decksResp)
        setSelectedDeck(decksResp[0].name)
    }, [])

    useEffect(() => getNext(), [selectedDeck])

    const getNext = async () => {
        const response = await fetch(`/api/flashcards/characters`)
        // const response = await fetch(`/api/flashcards/${encodeURIComponent(selectedDeck)}`)
        const json = await response.json()
        setCurrentCharacter(json)
    }

    // TODO need to be able to deal with characters and expressions
    // TODO need to be able to handle items that are not in the deck
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
        await getNext()
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

            .card-front,
            .card-back {
                width: 100%;
                height: 100%;
                position: absolute;
                backface-visibility: hidden;
            }

            .card-back {
                transform: rotateY(180deg);
            }

            .card-back div {
                margin-left: 0.5em;
                margin-right: 0.5em;
            }
        </style>
        <div style='display: flex; align-items: center; gap: 1em; margin-bottom: 0.2em;'>
            <label><b>Deck:</b></label>
            <select value=${selectedDeck} onInput=${e => setSelectedDeck(e.target.value)}>
                ${decks.map(deck => html`<option value=${deck.name}>${deck.name}</option>`)}
            </select>
        </div>
        <div class='card ${isFlipped ? 'flipped' : ''}' onclick=${() => setFlipped(true)} style='display: flex; flex-direction: column; width: calc(100% - 2px); aspect-ratio: 2 / 3; border: 2px solid #ccc; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff;'>
            <div class='card-front' style='display: flex; align-items: center; justify-content: center; font-size: 8em;'>
                <div onclick=${(e) => { e.stopPropagation(); setChangingCharacter(true); }}>${currentCharacter.hanzi}</div>
            </div>
            <div class='card-back' style='display: flex; flex-direction: column; height: 100%;'>
                <${CharacterInfo} onChangeCharacter=${(e) => { e.stopPropagation(); setChangingCharacter(true); }} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentCharacter} />
            </div>
        </div>
        <div style='font-size: 2em; display: flex; justify-content: space-evenly; width: 100%;'>
            <button onclick=${() => submit('forgot')}>🤯</button>
            <button onclick=${() => submit('unsure')}>🤔</button>
            <button onclick=${() => submit('remembered')}>🤓</button>
        </div>
        ${isChangingCharacter ? html`<${ChangeCharacter} onClose=${changeCharacter} />` : ''}
    `
}
