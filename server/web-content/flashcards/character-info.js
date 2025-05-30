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
        <div class=character-info>
            <style>
                .character-info {
                    margin: 1em 1em;
                    display: flex;
                    flex-direction: column;
                    gap: .4em;
                }

                .character-info .section-title {
                    font-weight: bold;
                    color: #333;
                }

                .character-info .section-content {
                    color: #555;
                }
            </style>
            <div style='font-size: 1.5em;' onclick=${props.onChangeCharacter}>${props.currentCharacter.hanzi} ${props.currentCharacter.pinyin}</div>
            <div>${props.currentCharacter.meaning}</div>
            <section>
                <div class=section-title>Radical</div>
                <div class=section-content>${props.currentCharacter.radical.hanzi} (${props.currentCharacter.radical.meaning})</div>
            </section>
            <section>
                <div class=section-title>Expressions <button class=primary onclick=${(e) => { e.stopPropagation(); setAddingExpressions(true); }}>+</button></div>
                <div class=section-content style='max-height: 4.3em; overflow: auto;'>
                ${props.currentCharacter.expressions.length > 0 ? props.currentCharacter.expressions.map(e => html`
                    <div>
                        <a href="#" onclick=${ev => { ev.preventDefault(); setSelectedShortInfo(e); }}>${e.hanzi}</a>
                        <span>(${e.pinyin})</span>
                    </div>
                `) : '(none yet)'}
                </div>
            </section>
            <section>
                <div class=section-title>Don't confuse with ${!isEditingRelated ? html`<button class=primary onclick=${(e) => { e.stopPropagation(); setEditingRelated(true); }}>✎</button>` : ''}</div>
                <div class=section-content>
                ${props.currentCharacter.related.length > 0 ? props.currentCharacter.related.map(c => html`
                    <a href="#" onclick=${ev => { ev.preventDefault(); setSelectedShortInfo(c); }}>${c.hanzi}</a>
                `) : '(none yet)'}
                </div>
            </section>
            <section>
                <div class=section-title>Memorization hints</div>
                <!-- TODO fill from AI -->
                <div class=section-content style='max-height: 5em; overflow: auto;'>(TODO fill from AI) Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut</div>
            </section>
            ${selectedShortInfo ? html`<${ShortInfo} onClose=${() => setSelectedShortInfo(null)} info=${selectedShortInfo} />` : ''}
            ${isAddingExpressions ? html`<${AddExpressions} onClose=${() => setAddingExpressions(false)} onSave=${saveExpressions} />` : ''}
            ${isEditingRelated ? html`<${EditRelated} value=${props.currentCharacter.related} onClose=${closeEditRelated} />` : ''}
        </div>
    `
}
