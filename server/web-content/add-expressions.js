import { html, useState, useEffect } from './preact-htm-standalone.js'

export default function AddExpressions(props) {
    const [expressions, setExpressions] = useState([{ hanzi: '', meaning: '' }])

    useEffect(() => {
        const firstInput = document.querySelector('.modal-content input[type="text"]')
        if (firstInput) firstInput.focus()
    }, [])

    const handleInputChange = (index, field, value) => {
        const updatedExpressions = [...expressions]
        updatedExpressions[index][field] = value
        setExpressions(updatedExpressions)

        // Add a new row if the current row is fully filled
        if (field === 'meaning' && value && updatedExpressions[index].hanzi) {
            const hasEmptyRow = updatedExpressions.some(e => !e.hanzi && !e.meaning)
            if (!hasEmptyRow) {
                setExpressions([...updatedExpressions, { hanzi: '', meaning: '' }])
            }
        }
    }

    return html`
        <div class='modal-overlay' onclick=${(e) => {e.stopPropagation(); props.onClose();}}>
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                }

                .modal-content button {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .modal-content button:hover {
                    background: #45a049;
                }
            </style>
            <div class='modal-content' onclick=${(e) => e.stopPropagation()}>
                <h3>Add Expressions</h3>
                <table>
                    ${expressions.map((entry, index) => html`
                    <tr>
                        <td><input type='text' placeholder='Hanzi' value=${entry.hanzi || ''} oninput=${(e) => handleInputChange(index, 'hanzi', e.target.value)} /></td>
                        <td><input type='text' placeholder='Meaning' value=${entry.meaning || ''} oninput=${(e) => handleInputChange(index, 'meaning', e.target.value)} /></td>
                    </tr>
                    `)}
                </table>
                <button onclick=${(e) => {e.stopPropagation(); props.onSave(expressions.filter(e => e.hanzi && e.meaning))}}>Save</button>
            </div>
        </div>
    `
}
