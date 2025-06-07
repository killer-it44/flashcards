import { html, useState } from '/preact-htm-standalone.js'
import EditPinyin from './edit-pinyin.js'

export default function ExpressionInfo({expression, savePinyin}) {
    const [isEditingPinyin, setEditingPinyin] = useState(false)

    const closeEditPinyin = async (newPinyin) => {
        if (newPinyin !== null) savePinyin(newPinyin)
        setEditingPinyin(false)
    }

    return html`
        <div style='text-align: center; font-size: 1.5em;'>${expression.hanzi}</div>
        <div style='text-align: center;'>${expression.meaning}</div>

        <div class=section-title>Pinyin ${!isEditingPinyin ? html`<button onclick=${(e) => { e.stopPropagation(); setEditingPinyin(true); }}>✎</button>` : ''}</div>
        <div class=section-content>${expression.pinyin}</div>

        <div class=section-title>Memorization hints</div>
        <!-- TODO fill from AI -->
        <div class='section-content expandable' style='margin-bottom: 0.5em;'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        </div>
        ${isEditingPinyin ? html`<${EditPinyin} value=${expression.pinyin} onClose=${closeEditPinyin} />` : ''}
    `
}
