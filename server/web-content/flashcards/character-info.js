import { html, useState } from '/preact-htm-standalone.js'
import AddExpressions from './add-expressions.js'
import EditRelated from './edit-related.js'
import ShortInfo from './short-info.js'

export default function CharacterInfo(props) {
    const [isAddingExpressions, setAddingExpressions] = useState(false)
    const [isEditingRelated, setEditingRelated] = useState(false)
    const [selectedShortInfo, setSelectedShortInfo] = useState(null)

    const closeEditRelated = async (newRelated) => {
        if (newRelated !== null) props.saveRelated(newRelated)
        setEditingRelated(false)
    }

    const saveExpressions = async (expressions) => {
        await props.saveExpressions(expressions)
        setAddingExpressions(false)
    }

    return html`
        <style>
            .section-title,
            .section-content {
                margin: 0 0.5em;
            }

            .section-title {
                margin-top: 0.4em;
                font-weight: bold;
                color: #333;
            }

            .section-content {
                color: #555;
            }

            .section-content.expandable {
                flex: 0 1 auto;
                overflow: auto;
                min-height: 1.4em;
            }
        </style>
        <div style='width: 100%; text-align: center; font-size: 1.5em;' onclick=${props.onChangeCharacter}>${props.currentCharacter.hanzi} ${props.currentCharacter.pinyin}</div>
        <div style='width: 100%; text-align: center;'>${props.currentCharacter.meaning}</div>
        <div class=section-title>Radical</div>
        <div class=section-content>${props.currentCharacter.radical.hanzi} (${props.currentCharacter.radical.meaning})</div>
        <div class=section-title>Expressions <button class=primary onclick=${(e) => { e.stopPropagation(); setAddingExpressions(true); }}>+</button></div>
        <div class='section-content expandable'>
        ${props.currentCharacter.expressions.length > 0 ? props.currentCharacter.expressions.map(e => html`
            <div>
                <a href='#' onclick=${ev => { ev.preventDefault(); setSelectedShortInfo(e); }}>${e.hanzi}</a>
                <span>(${e.pinyin})</span>
            </div>
        `) : '(none yet)'}
        </div>
        <div class=section-title>Don't confuse with ${!isEditingRelated ? html`<button class=primary onclick=${(e) => { e.stopPropagation(); setEditingRelated(true); }}>✎</button>` : ''}</div>
        <div class=section-content>
        ${props.currentCharacter.related.length > 0 ? props.currentCharacter.related.map(c => html`
            <a href='#' onclick=${ev => { ev.preventDefault(); setSelectedShortInfo(c); }}>${c.hanzi}</a>
        `) : '(none yet)'}
        </div>
        <div class=section-title>Memorization hints</div>
        <!-- TODO fill from AI -->
        <div class='section-content expandable' style='margin-bottom: 0.5em;'>
            (TODO fill from AI) Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        </div>
        ${selectedShortInfo ? html`<${ShortInfo} onClose=${() => setSelectedShortInfo(null)} info=${selectedShortInfo} />` : ''}
        ${isAddingExpressions ? html`<${AddExpressions} onClose=${() => setAddingExpressions(false)} onSave=${saveExpressions} />` : ''}
        ${isEditingRelated ? html`<${EditRelated} value=${props.currentCharacter.related} onClose=${closeEditRelated} />` : ''}
    `
}
