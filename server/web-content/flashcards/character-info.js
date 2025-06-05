import { html, useState } from '/preact-htm-standalone.js'
import EditRelated from './edit-related.js'
import ShortInfo from './short-info.js'

export default function CharacterInfo(props) {
    const [isEditingRelated, setEditingRelated] = useState(false)
    const [selectedShortInfo, setSelectedShortInfo] = useState(null)

    const closeEditRelated = async (newRelated) => {
        if (newRelated !== null) props.saveRelated(newRelated)
        setEditingRelated(false)
    }

    return html`
        <style>
            .section-content.expandable {
                flex: 0 1 auto;
                overflow: auto;
                min-height: 1.4em;
            }
        </style>
        <div style='text-align: center; font-size: 1.5em;'>${props.currentCharacter.hanzi} ${props.currentCharacter.pinyin}</div>
        <div style='text-align: center;'>${props.currentCharacter.meaning}</div>
        <div class=section-title>Radical</div>
        <div class=section-content>${props.currentCharacter.radical.hanzi} (${props.currentCharacter.radical.meaning})</div>
        <div class=section-title><a href='#database/expressions/?${props.currentCharacter.hanzi}'>Expressions</a></div>
        <ul style='padding: 0; margin-top: 0; margin-bottom: 0;' class='section-content expandable'>
            ${props.currentCharacter.expressions.length > 0 ? props.currentCharacter.expressions.map(e => html`
            <li style='display: flex; gap: 0.2em; margin: 0; padding: 0;'>
                <!-- <a style='white-space: nowrap;' href='#database/expressions/edit/${e.hanzi}'>${e.hanzi}</a> -->
                <a style='white-space: nowrap;' href='#' onclick=${ev => { ev.preventDefault(); setSelectedShortInfo(e); }}>${e.hanzi}</a>
                <span class='elipsible'>(${e.pinyin})</span>
            </li>
            `) : '(none yet)'}
        </ul>
        <div class=section-title>Don't confuse with ${!isEditingRelated ? html`<button class=primary onclick=${(e) => { e.stopPropagation(); setEditingRelated(true); }}>✎</button>` : ''}</div>
        <div class=section-content>
            ${props.currentCharacter.related.length > 0 ? props.currentCharacter.related.map(c => html`
            <a href='#' onclick=${ev => { ev.preventDefault(); setSelectedShortInfo(c); }}>${c.hanzi}</a>
            `) : '(none yet)'}
        </div>
        <div class=section-title>Memorization hints</div>
        <!-- TODO fill from AI -->
        <div class='section-content expandable' style='margin-bottom: 0.5em;'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        </div>
        ${selectedShortInfo ? html`<${ShortInfo} onClose=${() => setSelectedShortInfo(null)} info=${selectedShortInfo} />` : ''}
        ${isEditingRelated ? html`<${EditRelated} value=${props.currentCharacter.related} onClose=${closeEditRelated} />` : ''}
    `
}
