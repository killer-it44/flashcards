import { html, useState, useRef } from './preact-htm-standalone.js'
import AddExpressionsModal from './add-expressions-modal.js'
 
export default function CharacterInfo(props) {
    const [isAddingExpressions, setAddingExpressions] = useState(false)
    const [isEditingRelated, setEditingRelated] = useState(false)
    const relatedInput = useRef()

    const expressionsLinks = props.currentCharacter.expressions.map(w => html`<a href=/expressions/#/${encodeURIComponent(w)}>${w}</a>`)
    const expressionsLinksList = expressionsLinks.length > 0 ? expressionsLinks.reduce((prev, curr) => html`${prev}, ${curr}`) : html``

    const relatedLinks = props.currentCharacter.related.split(' ').map(w => html`<a href=/#/${encodeURIComponent(w)}>${w}</a>`)
    const relatedLinksList = relatedLinks.length > 0 ? relatedLinks.reduce((prev, curr) => html`${prev}, ${curr}`) : html``

    const saveRelated = async () => {
        await props.saveRelated(relatedInput.current.value)
        setEditingRelated(false)
    }

    const saveExpressions = async (expressions) => {
        await props.saveExpressions(expressions)
        setAddingExpressions(false)
    }

    return html`
        <table style='width: calc(100% - 8px);'>
            <tr><td>Pinyin</td><td>${props.currentCharacter.pinyin}</td></tr>
            <tr><td>Radical</td><td>${props.currentCharacter.radical.hanzi} (${props.currentCharacter.radical.meaning})</td></tr>
            <tr><td>Meaning</td><td>${props.currentCharacter.meaning}</td></tr>
            <tr><td>Expressions</td><td>${expressionsLinksList}<button onclick=${() => setAddingExpressions(true)}>＋</button></td></tr>
            ${isEditingRelated
            ? html`<tr><td>Related</td><td><input ref=${relatedInput} value=${props.currentCharacter.related} /><button onclick=${saveRelated}>💾</button><button onclick=${() => setEditingRelated(false)}>❌</button></td></tr>`
            : html`<tr><td>Related</td><td>${relatedLinksList}<button onclick=${() => setEditingRelated(true)}>✎</button></td></tr>`
            }
            ${isAddingExpressions ? html`<${AddExpressionsModal} onClose=${() => setAddingExpressions(false)} onSave=${saveExpressions} />` : ''}
        </table>
    `
}
