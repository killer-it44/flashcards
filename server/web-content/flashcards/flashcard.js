import { html, useState, useEffect } from '/preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ExpressionInfo from './expression-info.js'

const updateHash = (deck, hanzi) => window.location.hash = `#flashcards/${deck}/${hanzi}`

const parseHash = () => {
    const match = window.location.hash.match(/^#flashcards\/([^/]+)(?:\/(.+))?$/)
    return match ? { deck: decodeURIComponent(match[1]), hanzi: match[2] ? decodeURIComponent(match[2]) : undefined } : {}
}

export default function Flashcard({ user }) {
    const [isFlipped, setFlipped] = useState(false)
    const [selectedDeck, setSelectedDeck] = useState('')
    const [currentItem, setCurrentItem] = useState(null)
    const [decks, setDecks] = useState([])
    const [hanzi, setHanzi] = useState('')

    const fetchNextHanziFromDeck = (deck) => fetch(`/api/flashcards/${deck}`).then(res => res.json())
    const itemUrlPath = (hanzi) => (hanzi.length === 1) ? 'characters' : 'expressions'
    const fetchItemDetails = (hanzi) => fetch(`/api/${itemUrlPath(hanzi)}/${hanzi}`).then(res => res.json())

    useEffect(async () => {
        const resp = await fetch('/api/decks')
        const availableDecks = await resp.json()
        const hash = parseHash()
        const deck = hash.deck || localStorage.getItem('selectedDeck') || availableDecks[0]?.name
        const hanzi = hash.hanzi || await fetchNextHanziFromDeck(deck)
        setDecks(availableDecks)
        setSelectedDeck(deck)
        setHanzi(hanzi)
        updateHash(deck, hanzi)
    }, [])

    useEffect(() => {
        const onHashChange = async () => {
            const hash = parseHash()
            const deck = hash.deck || localStorage.getItem('selectedDeck') || availableDecks[0]?.name
            const hanzi = hash.hanzi || await fetchNextHanziFromDeck(deck)
            setSelectedDeck(deck)
            setHanzi(hanzi)
            setCurrentItem(null)
            setFlipped(false)
        }
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const switchDeck = async (deck) => {
        localStorage.setItem('selectedDeck', deck)
        const hanzi = await fetchNextHanziFromDeck(deck)
        setSelectedDeck(deck)
        setHanzi(hanzi)
        setFlipped(false)
        updateHash(deck, hanzi)
    }

    const getItem = async (hanzi) => {
        setCurrentItem(await fetchItemDetails(hanzi))
        setFlipped(false)
        updateHash(selectedDeck, hanzi)
    }

    const saveRelated = async (newRelated) => {
        if (!user.username) return alert('You must be logged in to make changes.')

        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ ...currentItem, related: newRelated })
        await fetch(`/api/characters/${currentItem.hanzi}`, { method: 'PUT', headers, body })
        await getItem(currentItem.hanzi)
    }

    const submit = async (result) => {
        if (!user.username) return alert('You must be logged in to submit.')

        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify({ hanzi, result })
        const nextHanzi = await (await fetch(`/api/flashcards/${selectedDeck}`, { method: 'POST', headers, body })).json()
        updateHash(selectedDeck, nextHanzi)
    }

    const flip = async () => {
        if (!isFlipped && !currentItem) {
            setCurrentItem(await fetchItemDetails(hanzi))
        }
        setFlipped(!isFlipped)
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
                color: #FEE2E2;
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
                ${(hanzi.length === 1) ? html`
                <${CharacterInfo} saveRelated=${saveRelated} currentCharacter=${currentItem} />` : html`
                <${ExpressionInfo} savePinyin=${() => null} expression=${currentItem} />
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
