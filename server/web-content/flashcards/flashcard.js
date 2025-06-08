import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import CharacterInfo from './character-info.js'
import ExpressionInfo from './expression-info.js'

const makeHash = (deck, hanzi, flipped = '') => `#flashcards/${deck}/${hanzi}${flipped}`

const parseHash = () => {
    const match = window.location.hash.match(/^#flashcards\/([^/]+)(?:\/([^/]+))?(?:\/(flipped))?$/)
    return match
        ? { deck: decodeURIComponent(match[1]), hanzi: match[2] ? decodeURIComponent(match[2]) : '', flipped: match[3] || '' }
        : { deck: '', hanzi: '', flipped: '' }
}

const fetchNextHanziFromDeck = (deck) => fetch(`/api/flashcards/${deck}`).then(res => res.json())
const itemUrlPath = (hanzi) => (hanzi.length === 1) ? 'characters' : 'expressions'
const fetchItemDetails = (hanzi) => fetch(`/api/${itemUrlPath(hanzi)}/${hanzi}`).then(res => res.json())

export default function Flashcard({ user }) {
    const [decks, setDecks] = useState([])
    const [selectedDeck, setSelectedDeck] = useState('')
    const [hanzi, setHanzi] = useState('')
    const [currentItem, setCurrentItem] = useState(null)
    const [flipped, setFlipped] = useState(parseHash().flipped)
    const [swipe, setSwipe] = useState({ x: 0, y: 0, animating: false })
    const [swipeEmoji, setSwipeEmoji] = useState('')

    const setStateFromHash = async (availableDecks) => {
        const hash = parseHash()
        const deck = hash.deck || localStorage.getItem('selectedDeck') || (availableDecks || [])[0]?.name || ''
        const hanzi = hash.hanzi || (deck ? await fetchNextHanziFromDeck(deck) : '')
        localStorage.setItem('selectedDeck', deck)
        setSelectedDeck(deck)
        setHanzi(hanzi)
        setFlipped(hash.flipped)
        hash.flipped ? setCurrentItem(await fetchItemDetails(hanzi)) : setCurrentItem(null)
        history.replaceState(null, '', `#flashcards/${deck}/${hanzi}${hash.flipped ? '/flipped' : ''}`)
    }

    useEffect(async () => {
        const resp = await fetch('/api/decks')
        const availableDecks = await resp.json()
        setDecks(availableDecks)
        setStateFromHash(availableDecks)

        const onHashChange = () => window.location.hash.startsWith('#flashcards') ? setStateFromHash() : null
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const switchDeck = (deck) => fetchNextHanziFromDeck(deck).then(hanzi => window.location.hash = makeHash(deck, hanzi))

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
        window.location.hash = makeHash(selectedDeck, nextHanzi)
    }

    const flipCard = () => {
        if (!pointerMoved.current) window.location.hash = makeHash(selectedDeck, hanzi, '/flipped')
    }

    const getSwipeEmoji = (dx, dy) => {
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        const threshold = 30 // show emoji before action threshold
        if (absDx > absDy && absDx > threshold) {
            return dx > 0 ? '🤓' : '🤯'
        } else if (absDy > absDx && absDy > threshold) {
            return dy > 0 ? '🤔' : ''
        }
        return ''
    }

    const pointerStart = useRef({ x: null, y: null, active: false })
    // Prevent click/flip when swiping
    const pointerMoved = useRef(false)
    const handlePointerDown = e => {
        // Suppress drag if on back and selecting text
        if (flipped && window.getSelection && window.getSelection().toString()) {
            pointerMoved.current = false;
            pointerStart.current.active = false;
            return;
        }
        pointerMoved.current = false
        pointerStart.current.x = e.clientX
        pointerStart.current.y = e.clientY
        pointerStart.current.active = true
        setSwipe({ x: 0, y: 0, animating: false })
        e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId)
    }
    const handlePointerMove = e => {
        if (!pointerStart.current.active) return
        const dx = e.clientX - pointerStart.current.x
        const dy = e.clientY - pointerStart.current.y
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) pointerMoved.current = true
        setSwipe({ x: dx, y: dy, animating: false })
        setSwipeEmoji(getSwipeEmoji(dx, dy))
    }
    const handlePointerUp = e => {
        if (!pointerStart.current.active) return
        const dx = e.clientX - pointerStart.current.x
        const dy = e.clientY - pointerStart.current.y
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        const threshold = 50
        let action = null
        if (absDx > absDy && absDx > threshold) {
            action = dx > 0 ? 'remembered' : 'forgot'
        } else if (absDy > absDx && absDy > threshold) {
            action = dy > 0 ? 'struggled' : null
        }
        if (action) {
            setSwipe({ x: dx * 4, y: dy * 4, animating: true })
            setTimeout(() => {
                setSwipe({ x: 0, y: 0, animating: false })
                setSwipeEmoji('')
                submit(action)
            }, 200)
        } else {
            setSwipe({ x: 0, y: 0, animating: true })
            setTimeout(() => {
                setSwipe({ x: 0, y: 0, animating: false })
                setSwipeEmoji('')
            }, 200)
        }
        pointerStart.current.active = false
        e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId)
    }

    const flipTransform = flipped ? 'rotateY(180deg)' : ''
    const swipeTransform = `translate(${swipe.x}px, ${swipe.y}px) rotate(${swipe.x / 20}deg)`
    const cardTransform = `${swipeTransform} ${flipTransform}`.trim()

    return html`
        <style>
            .card {
                transform-style: preserve-3d;
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
        <div class='card ${flipped}' onclick=${flipCard} onPointerDown=${handlePointerDown} onPointerMove=${handlePointerMove} onPointerUp=${handlePointerUp} style='display: flex; flex-direction: column; width: 100%; aspect-ratio: 2 / 3; border-radius: .4em; box-shadow: 0 25px 50px -12px rgb(0 0 0 / .25); background: linear-gradient(to bottom right, #7EA5C5 30%, #486A8D 100%); transform: ${cardTransform}; transition: ${swipe.animating ? 'transform 0.5s' : 'none'}; position: relative;'>
            ${swipeEmoji && html`
            <div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1.7); font-size: 3em; pointer-events: none; transition: transform 0.15s; z-index: 10; user-select: none;'>${swipeEmoji}</div>
            `}
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
