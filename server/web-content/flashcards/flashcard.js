import { html, useState, useEffect } from '/preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ChangeCharacter from './change-character.js'
import ExpressionInfo from './expression-info.js'

export default function Flashcard() {
    const [isFlipped, setFlipped] = useState(false)
    const [selectedDeck, setSelectedDeck] = useState('')
    const [isChangingCharacter, setChangingCharacter] = useState(false)
    const [currentItem, setCurrentItem] = useState({ hanzi: '', pinyin: '', radical: { hanzi: '', meaning: '' }, meaning: '', expressions: [], related: '' })
    const [decks, setDecks] = useState([])

    useEffect(async () => {
        const resp = await fetch('/api/decks')
        const data = await resp.json()
        setDecks(data)
        setSelectedDeck(data[0].name)
        const hanzi = await fetchNextHanziFromDeck(data[0].name)
        setCurrentItem(await fetchItemDetails(hanzi))
    }, [])

    const fetchNextHanziFromDeck = (deck) => fetch(`/api/flashcards/${deck}`).then(res => res.json())

    const itemUrlPath = (hanzi) => (hanzi.length === 1) ? 'characters' : 'expressions'

    const fetchItemDetails = (hanzi) => fetch(`/api/${itemUrlPath(hanzi)}/${hanzi}`).then(res => res.json())

    const changeCharacter = async (newCharacter) => {
        newCharacter ? await getItem(newCharacter) : null
        setChangingCharacter(false)
    }

    const saveRelated = async (newRelated) => {
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ ...currentItem, related: newRelated })
        await fetch(`/api/characters/${currentItem.hanzi}`, { method: 'PUT', headers, body })
        await getItem(currentItem.hanzi)
    }

    const saveExpressions = async (newExpressions) => {
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify(newExpressions)
        await fetch(`/api/expressions`, { method: 'POST', headers, body })
        await getItem(currentItem.hanzi)
    }

    const submit = async (remembered) => {
        const nextHanzi = await fetchNextHanziFromDeck(selectedDeck)
        setFlipped(false)
        setCurrentItem(await fetchItemDetails(nextHanzi))
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

            .card-back > * {
                margin-left: 0.5em;
                margin-right: 0.5em;
            }
        </style>

        <div style='display: flex; align-items: center; gap: 0.5em; margin-bottom: 0.2em;'>
            <div>Deck:</div>
            <select value=${selectedDeck} onInput=${e => setSelectedDeck(e.target.value)}>
                ${decks.map(deck => html`<option value=${deck.name}>${deck.name}</option>`)}
            </select>
        </div>
        <div class='card ${isFlipped ? 'flipped' : ''}' onclick=${() => setFlipped(true)} style='display: flex; flex-direction: column; width: calc(100% - 2px); aspect-ratio: 2 / 3; border: 2px solid #ccc; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff;'>
            <div class='card-front' style='display: flex; align-items: center; justify-content: center; font-size: ${8 / currentItem.hanzi.length}em;'>
                <div onclick=${(e) => { e.stopPropagation(); setChangingCharacter(true); }}>${currentItem.hanzi}</div>
            </div>
            <div class='card-back' style='display: flex; flex-direction: column; height: 100%;'>
                ${currentItem.hanzi.length === 1
            ? html`<${CharacterInfo} onChangeCharacter=${(e) => { e.stopPropagation(); setChangingCharacter(true); }} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentItem} />`
            : html`<${ExpressionInfo} savePinyin=${() => null} expression=${currentItem} />`
        }
            </div>
        </div>
        <div style='font-size: 1.5em; display: flex; justify-content: space-evenly; width: 100%;'>
            <button onclick=${() => submit('forgot')}>🤯</button>
            <button onclick=${() => submit('unsure')}>🤔</button>
            <button onclick=${() => submit('remembered')}>🤓</button>
        </div>
        ${isChangingCharacter ? html`<${ChangeCharacter} onClose=${changeCharacter} />` : ''}
    `
}
