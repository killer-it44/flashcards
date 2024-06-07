import fs from 'fs/promises'

const dir = process.env.DATA_DIR || 'init'

const content = (await fs.readFile('init/new-items.txt')).toString()

const words = JSON.parse((await fs.readFile(`${dir}/words.json`)).toString())
const characters = JSON.parse((await fs.readFile(`${dir}/characters.json`)).toString())

let newWords = 0, updatedMeanings = 0, ignored = 0

content.split('\n').forEach((line, i) => {
    const segments = line.split(' ')
    if (segments.length <= 1) {
        throw new Error(`line ${i + 1}: only 1 or less segments in ${line}`)
    }
    
    const meanings = segments.slice(1).join(' ').split(';').map(m => m.trim())

    if (segments[0].length === 1) {
        const existingCharEntry = characters.find(c => c.character === segments[0])
        if (existingCharEntry) {            
            const newMeanings = meanings.filter(m => existingCharEntry.meaning.indexOf(m) === -1)
            if (newMeanings.length === 0) {
                console.log(`line ${i + 1}: meanings of character ${segments[0]} already existed, ignoring`)
                ignored++
            } else {
                console.log(`line ${i + 1}: added meanings ${newMeanings.join('; ')}`)
                existingCharEntry.meaning += `; ${newMeanings.join('; ')}`
                updatedMeanings++
            }
        } else {
            throw new Error(`line ${i + 1}: character ${segments[0]} not found`)
        }
    } else {
        const existingWordEntry = words.find(w => w.word === segments[0])
        if (existingWordEntry) {            
            const newMeanings = meanings.filter(m => existingWordEntry.meaning.indexOf(m) === -1)
            if (newMeanings.length === 0) {
                console.log(`line ${i + 1}: meanings of word ${segments[0]} already existed, ignoring`)
                ignored++
            } else {
                console.log(`line ${i + 1}: added meanings ${newMeanings.join('; ')}`)
                existingWordEntry.meaning += `; ${newMeanings.join('; ')}`
                updatedMeanings++
            }
        } else {
            words.push({
                word: segments[0],
                meaning: segments.slice(1).join(' '),
                pinyin: ''
            })
            newWords++
        }
    }
})

await fs.writeFile(`${dir}/characters.json`, JSON.stringify(characters, null, '\t'))
await fs.writeFile(`${dir}/words.json`, JSON.stringify(words, null, '\t'))

console.log(`${newWords} new words`)
console.log(`${updatedMeanings} updated meanings`)
console.log(`${ignored} duplicates ignored`)
