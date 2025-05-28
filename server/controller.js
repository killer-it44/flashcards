import NotFound from './not-found.js'

export default function Controller(repo) {
    this.getCharacter = (hanzi) => {
        const character = repo.characters.find(c => c.hanzi === hanzi)
        if (!character) throw new NotFound()
        const radical = repo.radicals.find(r => r.hanzi.includes(character.radical.substring(0, 1)))
        const expressions = repo.expressions.filter(w => w.hanzi.includes(character.hanzi)).map(e => ({ ...e, pinyin: getPinyinForExpression(e) }))
        return { ...character, radical, expressions }
    }

    this.getNextCharacterForDeck = () => {
        const nextItem = repo.decks.characters[Math.floor(Math.random() * repo.decks.characters.length)]
        return this.getCharacter(nextItem)
    }

    this.getNextCharacter = () => {
        // TODO new algorithm: hard, medium, easy - with weights, new cards should be in medium category
        // category_probabilities = {
        //     1: 0.6,  # 60% chance for Category 1
        //     2: 0.3,  # 30% chance for Category 2
        //     3: 0.1   # 10% chance for Category 3
        // }
        // this could be called a "strategy" - other strategies could be based on "due date", "last seen", "how often forgotten", "number of strokes", "frequency rank", etc.

        // TODO introduce a concept of named decks

        const defaultChars = repo.characters.filter(c => c.frequencyRank && c.frequencyRank < 1000).map(c => c.hanzi)
        const charsNotRemembered = repo.submissions.filter(s => s.character && !s.remembered).map(s => s.character)
        const chars = [...defaultChars, ...charsNotRemembered]
        const nextCharacter = chars[Math.floor(Math.random() * chars.length)]
        return this.getCharacter(nextCharacter)
    }

    this.getExpression = (hanzi) => {
        const expression = repo.expressions.find(w => w.hanzi === hanzi)
        if (!expression) throw new NotFound()
        return { ...expression, pinyin: getPinyinForExpression(expression) }
    }

    this.getExpressions = () => {
        return repo.expressions
    }

    const getPinyinForExpression = (expression) => {
        let pinyin = expression.pinyin
        if (!expression.pinyin) {
            for (let i = 0; i < expression.hanzi.length; i++) {
                const char = repo.characters.find(c => c.hanzi == expression.hanzi.charAt(i))
                pinyin += char ? char.pinyin : expression.hanzi.charAt(i)
            }
        }
        return pinyin
    }

    this.getNextExpression = () => {
        const defaultExpressions = repo.expressions.map(w => w.hanzi)
        const expressionsNotRemembered = repo.submissions.filter(s => s.expression && !s.remembered).map(s => s.expression)
        const expressions = [...defaultExpressions, ...expressionsNotRemembered]
        const nextExpression = expressions[Math.floor(Math.random() * expressions.length)]
        return this.getExpression(nextExpression)
    }

    // REVISE new submission structure should better contain a type field, so the entire structure should be
    // { user: string,  type: 'radical' | 'character' | 'expression', hanzi: string, remembered: boolean, timestamp: Date }
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

    this.addExpressions = async (expressions) => {
        repo.expressions.push(...expressions.filter(expression => !repo.expressions.find(e => e.hanzi === expression.hanzi)))
        await repo.save()
    }

    // REVISE new submission structure should better contain a type field, so the entire structure should be
    // { user: string,  type: 'radical' | 'character' | 'expression', hanzi: string, remembered: boolean, timestamp: Date }
    this.submitExpression = async (data) => {
        // TODO user handling
        const user = '野色'
        repo.submissions.push({ user, expression: data.expression, remembered: data.remembered, timestamp: Date.now() })
        await repo.save()
    }

    this.updateExpression = async (data) => {
        const expression = repo.expressions.find(e => e.hanzi === data.expression)
        expression.pinyin = data.pinyin
        expression.meaning = data.meaning
        await repo.save()
    }

    this.addDeck = async (deck) => {
        if (!deck.name) throw new Error('Deck must have a name')
        repo.decks[deck.name] = []
        await repo.save()
    }

    this.updateDeck = async (deckName, deckData) => {
        if (!repo.decks[deckName]) throw new NotFound()
        if (deckData.name && deckData.name !== deckName) {
            if (repo.decks[deckData.name]) throw new Error('A deck with the new name already exists')
            delete repo.decks[deckName]
        }
        repo.decks[deckData.name] = deckData.items || repo.decks[deckName]
        await repo.save()
    }

    this.getExportFiles = () => repo.exportFiles()

    this.stop = () => repo.save()
}
