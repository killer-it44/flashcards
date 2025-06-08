import { html, useState, useEffect } from '/preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ExpressionInfo from './expression-info.js'

const makeHash = (deck, hanzi, flipped = false) => `#flashcards/${deck}/${hanzi}${flipped ? '/flipped' : ''}`

const parseHash = () => {
    const match = window.location.hash.match(/^#flashcards\/([^/]+)(?:\/([^/]+))?(?:\/(flipped))?$/)
    return match
        ? { deck: decodeURIComponent(match[1]), hanzi: match[2] ? decodeURIComponent(match[2]) : '', flipped: !!match[3] }
        : { deck: '', hanzi: '', flipped: false }
}

const fetchNextHanziFromDeck = (deck) => fetch(`/api/flashcards/${deck}`).then(res => res.json())
const itemUrlPath = (hanzi) => (hanzi.length === 1) ? 'characters' : 'expressions'
const fetchItemDetails = (hanzi) => fetch(`/api/${itemUrlPath(hanzi)}/${hanzi}`).then(res => res.json())

// TODO make flipped a string
export default function Flashcard({ user }) {
    const [isFlipped, setFlipped] = useState(!!parseHash().flipped)
    const [selectedDeck, setSelectedDeck] = useState('')
    const [currentItem, setCurrentItem] = useState(null)
    const [decks, setDecks] = useState([])
    const [hanzi, setHanzi] = useState('')

    const setStateFromHash = async () => {
        const hash = parseHash()
        const deck = hash.deck || localStorage.getItem('selectedDeck') || (availableDecks || [])[0]?.name || ''
        const hanzi = hash.hanzi || (deck ? await fetchNextHanziFromDeck(deck) : '')
        localStorage.setItem('selectedDeck', deck)
        setSelectedDeck(deck)
        setHanzi(hanzi)
        setFlipped(!!hash.flipped)
        !!hash.flipped ? setCurrentItem(await fetchItemDetails(hanzi)) : setCurrentItem(null)
        history.replaceState(null, '', `#flashcards/${deck}/${hanzi}${hash.flipped ? '/flipped' : ''}`)
    }

    useEffect(async () => {
        const resp = await fetch('/api/decks')
        const availableDecks = await resp.json()
        setDecks(availableDecks)
        setStateFromHash()
    }, [])

    useEffect(() => {
        const onHashChange = () => window.location.hash.startsWith('#flashcards') ? setStateFromHash() : null
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const switchDeck = async (deck) => {
        localStorage.setItem('selectedDeck', deck)
        const hanzi = await fetchNextHanziFromDeck(deck)
        window.location.hash = makeHash(deck, hanzi, false)
    }
    
    const saveRelated = async (newRelated) => {
        if (!user.username) return alert('You must be logged in to make changes.')
            
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ ...currentItem, related: newRelated })
        await fetch(`/api/characters/${currentItem.hanzi}`, { method: 'PUT', headers, body })
        setCurrentItem(await fetchItemDetails(hanzi))
    }

    const submit = async (result) => {
        if (!user.username) return alert('You must be logged in to submit.')

        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ hanzi, result })
        const nextHanzi = await (await fetch(`/api/flashcards/${selectedDeck}`, { method: 'POST', headers, body })).json()
        window.location.hash = makeHash(selectedDeck, nextHanzi, false)
    }

    const flip = async () => {
        window.location.hash = makeHash(selectedDeck, hanzi, !isFlipped)
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
                color: white;
                width: 100%;
                height: 100%;
                position: absolute;
                backface-visibility: hidden;
            }

            .card-back .section-content {
                color: #FEFAEA;
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
            <select value=${selectedDeck} onInput=${e => switchDeck(e.target.value)}>
                ${decks.map(deck => html`<option value=${deck.name}>${deck.name}</option>`)}
            </select>
        </div>
        <div class='card ${isFlipped ? 'flipped' : ''}' onclick=${flip} style='display: flex; flex-direction: column; width: 100%; aspect-ratio: 2 / 3; border-radius: .4em; box-shadow: 0 25px 50px -12px rgb(0 0 0 / .25); background: linear-gradient(to bottom right, #7EA5C5 30%, #486A8D 100%);'>
            <div class='card-front' style='display: flex; align-items: center; justify-content: center; font-size: ${8 / hanzi.length}em;'>
                <div style='user-select: none; color: white;'><strong>${hanzi}</strong></div>
            </div>
            ${currentItem ? html`
            <div class='card-back' style='display: flex; flex-direction: column; height: 100%;'>
                ${(hanzi.length === 1)
                ? html`<${CharacterInfo} saveRelated=${saveRelated} currentCharacter=${currentItem} />`
                : html`<${ExpressionInfo} savePinyin=${() => null} expression=${currentItem} />
                `}
            </div>
            ` : ''}
        </div>
        <div style='font-size: 1.5em; display: flex; justify-content: space-evenly; width: 100%;'>
            <button onclick=${() => submit('forgot')}>🤯</button>
            <button onclick=${() => submit('struggled')}>🤔</button>
            <button onclick=${() => submit('remembered')}>🤓</button>
        </div>
    `
}
