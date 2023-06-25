export default function Controller(repo) {

    this.get = (char) => {
        const cEntry = repo.characters.find(c => c.character === char)
        const rEntry = repo.radicals.find(r => r.radical.includes(cEntry.radical.substring(0, 1)))
        const matchingWords = repo.words.filter(w => w.word.includes(cEntry.character)).map(w => w.word)
        return { ...cEntry, radical: rEntry, words: matchingWords.join(', ') }
    }

    this.getNext = () => {
        let chars = repo.characters.filter(c => c.frequencyRank && c.frequencyRank < 1000)

        chars = chars.map(c => {
            const cSubmissions = repo.submissions.filter(s => s.character === c.character)
            const correctSubmissions = cSubmissions.filter(s => s.remembered).length
            const incorrectSubmissions = cSubmissions.filter(s => !s.remembered).length
            const score = (correctSubmissions + incorrectSubmissions === 0)
                ? 0
                : (correctSubmissions - incorrectSubmissions) / (correctSubmissions + incorrectSubmissions)
            return { ...c, score }
        })

        chars.sort((a, b) => a.score - b.score)

        const indexScore = chars[0].score
        chars = chars.filter(c => c.score === indexScore)

        const cEntry = chars[Math.floor(chars.length * Math.random())]
        const rEntry = repo.radicals.find(r => r.radical.includes(cEntry.radical.substring(0, 1)))
        const matchingWords = repo.words.filter(w => w.word.includes(cEntry.character)).map(w => w.word)
        return { ...cEntry, radical: rEntry, words: matchingWords.join(', ') }
    }

    this.getWord = (word) => {
        const wEntry = repo.words.find(w => w.word === word)
        let pinyin = wEntry.pinyin
        if (!wEntry.pinyin) {
            for (let i = 0; i < wEntry.word.length; i++) {
                const char = repo.characters.find(c => c.character == wEntry.word.charAt(i))
                pinyin += char ? char.pinyin : wEntry.word.charAt(i)
            }
        }
        const sentences = repo.sentences.filter(s => s.hanzi.includes(word)).map(s => s.hanzi).join(';')
        return { ...wEntry, pinyin, sentences }
    }

    this.getNextWord = () => {
        let words = repo.words.map(w => {
            const wSubmissions = repo.submissions.filter(s => s.word === w.word)
            const correctSubmissions = wSubmissions.filter(s => s.remembered).length
            const incorrectSubmissions = wSubmissions.filter(s => !s.remembered).length
            const score = (correctSubmissions + incorrectSubmissions === 0)
                ? 0
                : (correctSubmissions - incorrectSubmissions) / (correctSubmissions + incorrectSubmissions)
            return { ...w, score }
        })

        words.sort((a, b) => a.score - b.score)

        const indexScore = words[0].score
        words = words.filter(w => w.score === indexScore)

        const wEntry = words[Math.floor(words.length * Math.random())]
        return this.getWord(wEntry.word)
    }

    this.submit = async (data) => {
        const user = '野色'
        repo.submissions.push({ user, character: data.character, remembered: data.remembered, timestamp: Date.now() })

        // process updated meaning, related characters or related words
        const character = repo.characters.find(c => c.character === data.character)
        character.meaning = data.meaning
        character.related = data.related
        const relatedWords = data.words.split(',').map(w => w.trim()).filter(w => w)
        const alreadyExists = word => repo.words.find(w => w.word === word)
        relatedWords.forEach(w => alreadyExists(w) ? null : repo.words.push({ word: w, pinyin: '', meaning: '' }))

        await repo.save()
    }

    this.submitWord = async (data) => {
        const user = '野色'
        repo.submissions.push({ user, word: data.word, remembered: data.remembered, timestamp: Date.now() })

        // process updated meaning or pinyin
        const word = repo.words.find(w => w.word === data.word)
        word.pinyin = data.pinyin
        word.meaning = data.meaning

        await repo.save()
    }

    this.stop = () => repo.save()
}
