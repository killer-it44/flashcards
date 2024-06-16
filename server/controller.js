import NotFound from './not-found.js'

export default function Controller(repo) {
    this.getCharacter = (hanzi) => {
        const character = repo.characters.find(c => c.hanzi === hanzi)
        if (!character) throw new NotFound()
        const radical = repo.radicals.find(r => r.hanzi.includes(character.radical.substring(0, 1)))
        const words = repo.words.filter(w => w.hanzi.includes(character.hanzi)).map(w => w.hanzi)
        return { ...character, radical, words }
    }

    this.getNextCharacter = () => {
        const defaultChars = repo.characters.filter(c => c.frequencyRank && c.frequencyRank < 1000).map(c => c.hanzi)
        const charsNotRemembered = repo.submissions.filter(s => s.character && !s.remembered).map(s => s.character)
        const chars = [...defaultChars, ...charsNotRemembered]
        const nextCharacter = chars[Math.floor(Math.random() * chars.length)]
        return this.getCharacter(nextCharacter)
    }

    this.getWord = (hanzi) => {
        const word = repo.words.find(w => w.hanzi === hanzi)
        if (!word) throw new NotFound()
        let pinyin = word.pinyin
        if (!word.pinyin) {
            for (let i = 0; i < word.hanzi.length; i++) {
                const char = repo.characters.find(c => c.hanzi == word.hanzi.charAt(i))
                pinyin += char ? char.pinyin : word.hanzi.charAt(i)
            }
        }

        const sentences = word.hanzi.includes('...')
            ? repo.sentences.filter(s => s.hanzi.match(word.hanzi.replace('...', '.+'))).map(s => s.hanzi)
            : repo.sentences.filter(s => s.hanzi.includes(hanzi)).map(s => s.hanzi)

        return { ...word, pinyin, sentences }
    }

    this.getNextWord = () => {
        const defaultWords = repo.words.map(w => w.hanzi)
        const wordsNotRemembered = repo.submissions.filter(s => s.word && !s.remembered).map(s => s.word)
        const words = [...defaultWords, ...wordsNotRemembered]
        const nextWord = words[Math.floor(Math.random() * words.length)]
        return this.getWord(nextWord)
    }

    // REVISE new submission structure should better contain a type field, so the entire structure should be
    // { user: string,  type: 'radical' | 'character' | 'word' | 'sentence', hanzi: string, remembered: boolean, timestamp: Date }
    this.submitCharacter = async (data) => {
        // TODO user handling
        const user = '野色'
        repo.submissions.push({ user, character: data.character, remembered: data.remembered, timestamp: Date.now() })
        await repo.save()
    }

    // TODO should we make it an "upsert"?
    this.updateCharacter = async (data) => {
        const character = repo.characters.find(c => c.hanzi === data.character)
        character.meaning = data.meaning
        character.related = data.related
        await repo.save()
    }

    this.addWord = async (word) => {
        if (!repo.words.find(w => w.hanzi === word.hanzi)) {
            repo.words.push(word)
        }
        await repo.save()
    }

    // REVISE new submission structure should better contain a type field, so the entire structure should be
    // { user: string,  type: 'radical' | 'character' | 'word' | 'sentence', hanzi: string, remembered: boolean, timestamp: Date }
    this.submitWord = async (data) => {
        // TODO user handling
        const user = '野色'
        repo.submissions.push({ user, word: data.word, remembered: data.remembered, timestamp: Date.now() })
        await repo.save()
    }

    this.updateWord = async (data) => {
        const word = repo.words.find(w => w.hanzi === data.word)
        word.pinyin = data.pinyin
        word.meaning = data.meaning
        await repo.save()
    }

    this.addSentence = async (sentence) => {
        if (!repo.sentences.find(s => s.hanzi === sentence.hanzi)) {
            repo.sentences.push(sentence)
        }
        await repo.save()
    }

    this.stop = () => repo.save()
}
