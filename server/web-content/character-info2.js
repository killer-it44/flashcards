import { html, useState, useRef } from './preact-htm-standalone.js'
import AddExpressions from './add-expressions.js'

export default function CharacterInfo(props) {
    const [isAddingExpressions, setAddingExpressions] = useState(false)
    const [isEditingRelated, setEditingRelated] = useState(false)
    const relatedInput = useRef()

    const expressionsLinks = props.currentCharacter.expressions.map(w => html`<a href=/expressions/#/${encodeURIComponent(w)}>${w}</a>`)
    // const expressionsLinksList = expressionsLinks.length > 0 ? expressionsLinks.reduce((prev, curr) => html`${prev}, ${curr}`) : html``
    const expressionsLinksList = expressionsLinks.length > 0 
    ? expressionsLinks.map(link => html`<div>${link}</div>`) 
    : html``;

    const saveRelated = async () => {
        await props.saveRelated(relatedInput.current.value)
        setEditingRelated(false)
    }

    const saveExpressions = async (expressions) => {
        await props.saveExpressions(expressions)
        setAddingExpressions(false)
    }

    return html`
        <div class="character-card">
            <style>
                .character-card {
                    padding: 16px;
                    margin: 16px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    box-sizing: border-box;
                }

                .character-section {
                    display: flex;
                    flex-direction: column;
                }

                .section-title {
                    font-weight: bold;
                    margin-bottom: 4px;
                    color: #333;
                }

                .section-content {
                    color: #555;
                }

                button {
                    margin-left: 8px;
                    padding: 4px 8px;
                    border: none;
                    border-radius: 4px;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <div style='display: flex; justify-content: center; font-size: 3.5em; margin-bottom: 16px;'>
                <div>${props.currentCharacter.hanzi}</div>
                <button onclick=${(e) => {e.stopPropagation(); switchChar()}} style='margin-left: 10px;'>🔄</button>
            </div>
            <section class='character-section'>
                <div class="section-title">Pinyin</div>
                <div class="section-content">${props.currentCharacter.pinyin}</div>
            </section>
            <section class='character-section'>
                <div class="section-title">Radical</div>
                <div class="section-content">${props.currentCharacter.radical.hanzi} (${props.currentCharacter.radical.meaning})</div>
            </section>
            <section class='character-section'>
                <div class="section-title">Meaning</div>
                <div class="section-content">${props.currentCharacter.meaning}</div>
            </section>
            <section class='character-section'>
                <div class="section-title">Expressions<button onclick=${(e) => {e.stopPropagation(); setAddingExpressions(true);}}>＋</button></div>
                <div class="section-content">${expressionsLinksList}</div>
            </section>
            <section class='character-section'>
                <div class="section-title">Related${!isEditingRelated ?  html`<button onclick=${(e) => {e.stopPropagation(); setEditingRelated(true);}}>✎</button>` : ''}</div>
                <div class="section-content">
                    ${isEditingRelated
                    ? html`<input ref=${relatedInput} value=${props.currentCharacter.related} />
                            <button onclick=${(e) => {e.stopPropagation(); saveRelated();}}>💾</button>
                            <button onclick=${(e) => {e.stopPropagation(); setEditingRelated(false);}}>❌</button>`
                    : props.currentCharacter.related.split(' ').map(w => html`<a href=/#/${encodeURIComponent(w)}>${w}</a>`)}
                </div>
            </section>
            ${isAddingExpressions ? html`<${AddExpressions} onClose=${() => setAddingExpressions(false)} onSave=${saveExpressions} />` : ''}
        </div>
    `
}
