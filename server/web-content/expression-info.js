import { html } from './preact-htm-standalone.js'

export default function ExpressionInfo({ expression, onClose }) {
    return html`
        <div onclick=${(e) => { e.stopPropagation(); onClose(); }} style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;'>
            <div onclick=${(e) => e.stopPropagation()} style='background: white; padding: 2em; border-radius: 8px; min-width: 250px; max-width: 90vw;'>
                <h2>${expression.hanzi}</h2>
                <div><b>Pinyin:</b> ${expression.pinyin}</div>
                <div><b>Meaning:</b> ${expression.meaning || ''}</div>
                <div style='margin-top: 1em;'>
                    <button onclick=${(e) => { e.stopPropagation(); onClose(null); }}>❌ Close</button>
                </div>
            </div>
        </div>
    `
}
