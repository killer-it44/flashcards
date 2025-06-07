import { html, useState, useEffect } from '/preact-htm-standalone.js'

const getUrl = (hanzi) => `/api/expressions/${hanzi}`

export default function EditExpression({ user, hanzi, onClose }) {
    const [expression, setExpression] = useState({ meaning: '', pinyin: '' })

    useEffect(() => fetch(getUrl(hanzi)).then(resp => resp.json()).then(setExpression), [hanzi])

    const save = async () => {
        if (!user.username) return alert('You must be logged in to edit expressions.')

        await fetch(getUrl(hanzi), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expression)
        })
        onClose()
    }

    return html`
        <div class=section-title>Edit Expression: ${hanzi}</div>
        <label style='margin-top: 0.5em;'>Pinyin:<br/>
            <input style='width: calc(100% - 0.6em);' value=${expression.pinyin} placeholder='Pinyin (or leave empty)' oninput=${e => setExpression({...expression, pinyin: e.target.value})} />
        </label>
        <label style='margin-top: 0.5em;'>Meaning:<span style="color: red">*</span><br/>
            <input style='width: calc(100% - 0.6em);' value=${expression.meaning} placeholder='Meaning' oninput=${e => setExpression({...expression, meaning: e.target.value})} />
        </label>
        <div style='margin-top: 1em; display: flex; width: 100%; justify-content: space-evenly;'>
            <button class=primary disabled=${!expression.meaning.trim()} onclick=${save}>Save</button>
            <button class=secondary onclick=${onClose}>Cancel</button>
        </div>
    `
}
