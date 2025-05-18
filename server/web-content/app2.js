import { html, useState, useEffect, useRef } from './preact-htm-standalone.js'
import CharacterInfo from './character-info2.js'
import SwitchChar from './switch-char.js'

export default function App() {
    // TODO support hash
    const [isInfoVisible, setInfoVisible] = useState(false)
    const [isDialogVisible, setDialogVisible] = useState(false)
    const [currentCharacter, setCurrentCharacter] = useState({ pinyin: '', radical: { hanzi: '', meaning: '' }, meaning: '', expressions: [], related: [] })
    const card = useRef()

    useEffect(() => getChar(''), [])

    const getSelectedChar = (e) => (e.key === 'Enter') ? getChar(e.target.value) : null

    const getChar = async (hanzi) => {
        const response = await fetch(`/api/characters/${hanzi}`)
        const json = await response.json()
        setCurrentCharacter(json)
    }

    const switchChar = () => setDialogVisible(true)

    const closeDialog = async (newCharacter) => {
        newCharacter ? await getChar(newCharacter) : null
        setDialogVisible(false)
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
        <div style='display: flex; flex-direction: column; margin-top: 8px; align-items: center; justify-content: center; height: calc(100vh - 4em);'>
            <div ref=${card} onclick=${() => setInfoVisible(true)} style='display: flex; flex-direction: column; justify-content: center; align-items: center; height: min(85vh, 85vw * 1.5); aspect-ratio: 2 / 3; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff;'>
                ${!isInfoVisible 
                ? html`
                    <div style='display: flex; justify-content: center; font-size: 3.5em; margin-bottom: 16px;'>
                        <div>${currentCharacter.hanzi}</div>
                        <button onclick=${(e) => {e.stopPropagation(); switchChar();}} style='margin-left: 10px;'>🔄</button>
                    </div>`
                : html`<${CharacterInfo} saveRelated=${saveRelated} saveExpressions=${saveExpressions} currentCharacter=${currentCharacter} />` }
                ${isDialogVisible ? html`<${SwitchChar} onClose=${closeDialog} />` : ''}
            </div>
            <div style='display: flex; position: fixed; bottom: 0; left: 0; width: 100%;'>
                <button style='width: 33%; border: none; background-color: red; font-size: 2.5em;'>🤯</button>
                <button style='width: 34%; border: none; background-color: orange; font-size: 2.5em;'>🤔</button>
                <button style='width: 33%; border: none; background-color: green; font-size: 2.5em;'>🤓</button>
            </div>
        </div>
    `
}
