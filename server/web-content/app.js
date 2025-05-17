import { html, useState, useEffect } from './preact-htm-standalone.js'
import CharacterInfo from './character-info.js'

export default function App() {
    // TODO support for other languages
    const [isInfoVisible, setInfoVisible] = useState(false)
    const [currentCharacter, setCurrentCharacter] = useState({ pinyin: '', radical: { hanzi: '', meaning: '' }, meaning: '', expressions: [], related: [] })

    useEffect(() => getChar(''), [])

    const getSelectedChar = (e) => (e.key === 'Enter') ? getChar(e.target.value) : null

    const getChar = async (hanzi) => {
        const response = await fetch(`/api/characters/${hanzi}`)
        const json = await response.json()
        setCurrentCharacter(json)
    }

    const toggleInfo = () => setInfoVisible(!isInfoVisible)

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
        await getChar(props.currentCharacter.hanzi)
    }

    // const submit = async (remembered) => {
    //     const headers = { 'Content-Type': 'application/json' }
    //     const body = JSON.stringify({ character: currentCharacter.hanzi, remembered })
    //     await fetch('/api/submissions', { method: 'POST', headers, body })
    //     infoVisible = false
    //     await get('')
    //     history.pushState(currentCharacter.hanzi, '', `/#/${currentCharacter.hanzi}`)
    // }

    return html`
        <div style='display: flex; flex-direction: column; margin-top: 8px;'>
            <div style='display: flex; justify-content: center;'>
                <input value=${currentCharacter.hanzi} onkeypress=${getSelectedChar} style='font-size: 3.5em; width: 100%;'></input>
                <button onclick=${toggleInfo} style='font-size: 3.5em;'>👀</button>
            </div>
            ${isInfoVisible ? html`<${CharacterInfo} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentCharacter} />` : ''}
            <div style='display: flex; position: fixed; bottom: 0; left: 0; width: 100%;'>
                <button onclick='post(false)' style='width: 50%; border: none; background-color: red; font-size: 2.5em;'>👎🏻</button>
                <button onclick='post(true)' style='width: 50%; border: none; background-color: green; font-size: 2.5em;'>👍🏻</button>
            </div>
        </div>
    `
}
