export default function Controller(repo) {

    this.getCharacter = (char) => {
        const cEntry = repo.characters.find(c => c.hanzi === char)
        const rEntry = repo.radicals.find(r => r.hanzi.includes(cEntry.radical.substring(0, 1)))
        const matchingWords = repo.words.filter(w => w.hanzi.includes(cEntry.hanzi)).map(w => w.hanzi)
        return { ...cEntry, radical: rEntry, words: matchingWords.join(', ') }
    }

    this.getNextCharacter = () => {
        const defaultChars = repo.characters.filter(c => c.frequencyRank && c.frequencyRank < 1000).map(c => c.hanzi)
        const charsNotRemembered = repo.submissions.filter(s => s.character && !s.remembered).map(s => s.character)
        const chars = [...defaultChars, ...charsNotRemembered]
        const nextCharacter = chars[Math.floor(Math.random() * chars.length)]
        return this.getCharacter(nextCharacter)
    }

    this.getWord = (word) => {
        const wEntry = repo.words.find(w => w.hanzi === word)
        let pinyin = wEntry.pinyin
        if (!wEntry.pinyin) {
            for (let i = 0; i < wEntry.hanzi.length; i++) {
                const char = repo.characters.find(c => c.hanzi == wEntry.hanzi.charAt(i))
                pinyin += char ? char.pinyin : wEntry.hanzi.charAt(i)
            }
        }

        const sentences = wEntry.hanzi.includes('...')
            ? repo.sentences.filter(s => s.hanzi.match(wEntry.hanzi.replace('...', '.+'))).map(s => s.hanzi).join('; ')
            : repo.sentences.filter(s => s.hanzi.includes(word)).map(s => s.hanzi).join('; ')

        return { ...wEntry, pinyin, sentences }
    }

    this.getNextWord = () => {
        const defaultWords = repo.words.map(w => w.hanzi)
        const wordsNotRemembered = repo.submissions.filter(s => s.word && !s.remembered).map(s => s.word)
        const words = [...defaultWords, ...wordsNotRemembered]
        const nextWord = words[Math.floor(Math.random() * words.length)]
        return this.getWord(nextWord)
    }

    this.submitCharacter = async (data) => {
        const user = '野色'
        repo.submissions.push({ user, character: data.character, remembered: data.remembered, timestamp: Date.now() })

        // process updated meaning, related characters or related words
        const character = repo.characters.find(c => c.hanzi === data.character)
        character.meaning = data.meaning
        character.related = data.related

        // REVISE find a better way, also the UX is not great
        const relatedWords = data.words.split(',').map(w => w.trim()).filter(w => w)
        const alreadyExists = word => repo.words.find(w => w.hanzi === word)
        relatedWords.forEach(w => alreadyExists(w) ? null : repo.words.push({ hanzi: w, pinyin: '', meaning: '' }))

        await repo.save()
    }

    // REVISE new submission structure should better contain a type field, so the entire structure should be
    // { user: string,  type: 'radical' | 'character' | 'word' | 'sentence', hanzi: string, remembered: boolean, timestamp: Date }
    this.submitWord = async (data) => {
        const user = '野色'
        repo.submissions.push({ user, word: data.word, remembered: data.remembered, timestamp: Date.now() })

        // process updated meaning or pinyin
        const word = repo.words.find(w => w.hanzi === data.word)
        word.pinyin = data.pinyin
        word.meaning = data.meaning

        const relatedSentences = data.sentences.split(';').map(s => s.trim()).filter(s => s)
        const alreadyExists = sentence => repo.sentences.find(s => {
            return s.hanzi === sentence
        })
        relatedSentences.forEach(s => alreadyExists(s) ? null : repo.sentences.push({ hanzi: s }))

        await repo.save()
    }

    this.stop = () => repo.save()
}
