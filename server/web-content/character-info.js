import { html, useState, useRef } from './preact-htm-standalone.js'
import AddExpressions from './add-expressions.js'
import EditRelated from './edit-related.js'
import ExpressionInfo from './expression-info.js'

export default function CharacterInfo(props) {
    const [isAddingExpressions, setAddingExpressions] = useState(false)
    const [isEditingRelated, setEditingRelated] = useState(false)
    const [selectedExpression, setSelectedExpression] = useState(false)

    // const expressionsLinksList = props.currentCharacter.expressions.length > 0
    //     ? props.currentCharacter.expressions.map(e => html`
    //         <div>
    //             <a href="#" onclick=${ev => { ev.preventDefault(); setSelectedExpression(e);}}>${e.hanzi}</a>
    //             <span>(${e.pinyin})</span>
    //         </div>
    //     `)
    //     : html``
    // const expressionsLinks = props.currentCharacter.expressions.map(e => html`<a href=/expressions/#/${encodeURIComponent(e.hanzi)}>${e.hanzi}</a> <span>(${e.pinyin})</span>`)
    // const expressionsLinksList = expressionsLinks.length > 0 ? expressionsLinks.map(link => html`<div>${link}</div>`) : html``;

    const closeEditRelated = async (newRelated) => {
        if (newRelated !== null) props.saveRelated(newRelated)
        setEditingRelated(false)
    }

    const saveExpressions = async (expressions) => {
        await props.saveExpressions(expressions)
        setAddingExpressions(false)
    }

    return html`
        <div class='character-info' style='font-size: 1em;'>
            <style>
                .character-info {
                    padding: 16px;
                    margin: 1em 1em;
                    display: flex;
                    flex-direction: column;
                    gap: .4em;
                }

                .character-info .section {
                    display: flex;
                    flex-direction: column;
                }

                .character-info .section-title {
                    font-weight: bold;
                    color: #333;
                }

                .character-info .section-content {
                    color: #555;
                }

                .character-info .highlighted-button {
                    margin-left: 8px;
                    padding: 4px 8px;
                    border: none;
                    border-radius: 4px;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                }

                .character-info .highlighted-button:hover {
                    background-color: #0056b3;
                }
            </style>
            <div style='display: flex; justify-content: center; font-size: 2.5em; margin-bottom: 8px;'>
                <div>${props.currentCharacter.hanzi}</div>
            </div>
            <section class=character-section>
                <div class=section-title>Pinyin</div>
                <div class=section-content>${props.currentCharacter.pinyin}</div>
            </section>
            <section class=character-section>
                <div class=section-title>Radical</div>
                <div class=section-content>${props.currentCharacter.radical.hanzi} (${props.currentCharacter.radical.meaning})</div>
            </section>
            <section class=character-section>
                <div class=section-title>Meaning</div>
                <div class=section-content>${props.currentCharacter.meaning}</div>
            </section>
            <section class=character-section>
                <div class=section-title>Expressions<button class=highlighted-button onclick=${(e) => {e.stopPropagation(); setAddingExpressions(true);}}>+</button></div>
                <div class=section-content style='max-height: 4em; overflow: auto;'>
                ${props.currentCharacter.expressions.map(e => html`
                    <div>
                        <a href="#" onclick=${ev => { ev.preventDefault(); setSelectedExpression(e);}}>${e.hanzi}</a>
                        <span>(${e.pinyin})</span>
                    </div>
                `)}
                </div>
            </section>
            <section class=character-section>
                <div class=section-title>Related${!isEditingRelated ?  html`<button class=highlighted-button onclick=${(e) => {e.stopPropagation(); setEditingRelated(true);}}>✎</button>` : ''}</div>
                <div class=section-content>${props.currentCharacter.related.split(' ').map(w => html`<a href=/#/${encodeURIComponent(w)}>${w}</a>`)}</div>
            </section>
            ${selectedExpression ? html`<${ExpressionInfo} expression=${selectedExpression} onClose=${() => setSelectedExpression(null)} />` : ''}
            ${isAddingExpressions ? html`<${AddExpressions} onClose=${() => setAddingExpressions(false)} onSave=${saveExpressions} />` : ''}
            ${isEditingRelated ? html`<${EditRelated} value=${props.currentCharacter.related} onClose=${closeEditRelated} />` : ''}
        </div>
    `
}
