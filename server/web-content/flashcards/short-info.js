import { html } from '/preact-htm-standalone.js'

export default function ShortInfo({ onClose, info }) {
    return html`
        <div onclick=${(e) => { e.stopPropagation(); onClose(); }} class=modal-overlay>
            <div onclick=${(e) => e.stopPropagation()} class=modal-content>
                <h2>${info.hanzi}</h2>
                <div><b>Pinyin:</b> ${info.pinyin}</div>
                <div><b>Meaning:</b> ${info.meaning}</div>
                <div>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(); }}>❌ Close</button>
                </div>
            </div>
        </div>
    `
}
