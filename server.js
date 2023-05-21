import express from 'express'

export default function Server(repo) {
    let httpServer
    const app = express()

    app.use('/', express.static('web-content'))
    
    app.post('/api/submission', express.json(), async (req, res) => {
        const user = '野色'
        repo.submissions.push({ user, character: req.body.character, remembered: req.body.remembered, timestamp: Date.now() })
        
        // process updated meaning, related characters or related words if provided
        const character = repo.characters.find(c => c.character === req.body.character)
        character.meaning = req.body.meaning
        character.related = req.body.related
        const relatedWords = req.body.words.split(',').map(w => w.trim()).filter(w => w)
        relatedWords.forEach(w => repo.words.includes(w) ? null : repo.words.push({ word: w, pinyin: '', meaning: '' }))
    
        res.status(201).end()
        repo.save()
    })
    
    app.get('/api/char', (req, res) => {
        const chars = repo.characters.filter(c => c.frequencyRank && c.frequencyRank < 1000)
        // const cEntry = chars.find(c => c.character === '你')
        const cEntry = chars[Math.floor(chars.length * Math.random())]
        const rEntry = repo.radicals.find(r => r.radical.includes(cEntry.radical.substring(0, 1)))
        const matchingWords = repo.words.filter(w => w.word.includes(cEntry.character)).map(w => w.word)
        res.json({ ...cEntry, radical: rEntry, words: matchingWords.join(', ') })
    })

    this.start = (port) => {
        return new Promise((resolve, reject) => {
            httpServer = app.listen(port, () => resolve(httpServer.address().port)).on('error', reject)
        })
    }

    this.stop = async () => {
        httpServer.close()
        await repo.save()
    }
}
