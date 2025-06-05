import { html, useState, useEffect } from '/preact-htm-standalone.js'

const getUrl = (hanzi) => `/api/characters/${hanzi}`

export default function ShowCharacter({ hanzi, onClose }) {
    const [character, setCharacter] = useState({
        hanzi: hanzi,
        pinyin: '',
        meaning: '',
        radical: '',
        strokes: '',
        hskLevel: '',
        standardRank: '',
        frequencyRank: '',
        related: []
    })
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => fetch(getUrl(hanzi)).then(resp => resp.json()).then(setCharacter), [hanzi])

    return html`
        <div style='margin-top: 0.5em; font-size: 2em; text-align: center;'><b>${character.hanzi || hanzi}</b></div>
        <div style='margin-top: 0.5em;'><b>Pinyin:</b> <span>${character.pinyin}</span></div>
        <div style='margin-top: 0.5em;'><b>Meaning:</b> <span>${character.meaning}</span></div>
        <div style='margin-top: 0.5em;'><b>Radical:</b> <span>
            ${character.radical && typeof character.radical === 'object' && character.radical.hanzi
                ? html`<a href='#database/characters/${character.radical.hanzi}'>${character.radical.hanzi}</a> (${character.radical.meaning || ''})`
                : character.radical || '(none)'}
        </span></div>
        <div style='margin-top: 0.5em;'><b>Related:</b> <span>
            ${character.related.length > 0
                ? character.related.map(r => html`<a href='#database/characters/${r.hanzi}'>${r.hanzi}</a> `)
                : '(none)'}
        </span></div>
        <div style='margin-top: 1em;'>
            <button class=secondary onclick=${() => setShowDetails(true)}>More details</button>
        </div>
        <div style='margin-top: 1em; display: flex; width: 100%; justify-content: space-evenly;'>
            <button class=secondary onclick=${onClose}>Close</button>
        </div>
        ${showDetails && html`
            <div style='position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;' onclick=${() => setShowDetails(false)}>
                <div style='background: white; padding: 2em; border-radius: 8px; min-width: 300px; max-width: 90vw;' onclick=${e => e.stopPropagation()}>
                    <div style='margin-bottom: 1em; font-size: 1.2em;'><b>Character Details</b></div>
                    <div style='margin-top: 0.5em;'><b>Strokes:</b> <span>${character.strokes}</span></div>
                    <div style='margin-top: 0.5em;'><b>HSK Level:</b> <span>${character.hskLevel}</span></div>
                    <div style='margin-top: 0.5em;'><b>Standard Rank:</b> <span>${character.standardRank}</span></div>
                    <div style='margin-top: 0.5em;'><b>Frequency Rank:</b> <span>${character.frequencyRank}</span></div>
                    <div style='margin-top: 1em; text-align: right;'>
                        <button class=secondary onclick=${() => setShowDetails(false)}>Close</button>
                    </div>
                </div>
            </div>
        `}
    `
}
