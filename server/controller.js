import NotFound from './not-found.js'

export default function Controller(repo) {
    const stripDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    this.findCharacters = ({ search, searchField }) => {
        let allCharacters = repo.characters
        if (!search) return allCharacters
        const searchLower = search.toLowerCase()
        if (searchField === 'hanzi') {
            return allCharacters.filter(c => c.hanzi.includes(search))
        } else if (searchField === 'pinyin') {
            const searchNoDiacritics = stripDiacritics(searchLower)
            // Rank: 2 = exact match, 1 = diacritic-insensitive match, 0 = no match
            return allCharacters
                .map(c => {
                    if (!c.pinyin) return { c, rank: 0 }
                    const pinyinLower = c.pinyin.toLowerCase()
                    if (pinyinLower.includes(searchLower)) return { c, rank: 2 }
                    if (stripDiacritics(pinyinLower).includes(searchNoDiacritics)) return { c, rank: 1 }
                    return { c, rank: 0 }
                })
                .filter(x => x.rank > 0)
                .sort((a, b) => b.rank - a.rank)
                .map(x => x.c)
        } else if (searchField === 'meaning') {
            return allCharacters.filter(c => c.meaning && c.meaning.toLowerCase().includes(searchLower))
        } else {
            const searchNoDiacritics = stripDiacritics(searchLower)
            // Rank: 2 = hanzi or exact pinyin or meaning, 1 = diacritic-insensitive pinyin, 0 = no match
            return allCharacters
                .map(c => {
                    if (c.hanzi.includes(search)) return { c, rank: 2 }
                    if (c.pinyin && c.pinyin.toLowerCase().includes(searchLower)) return { c, rank: 2 }
                    if (c.meaning && c.meaning.toLowerCase().includes(searchLower)) return { c, rank: 2 }
                    if (c.pinyin && stripDiacritics(c.pinyin.toLowerCase()).includes(searchNoDiacritics)) return { c, rank: 1 }
                    return { c, rank: 0 }
                })
                .filter(x => x.rank > 0)
                .sort((a, b) => b.rank - a.rank)
                .map(x => x.c)
        }
    }

    this.getCharacter = (hanzi) => {
        const character = repo.characters.find(c => c.hanzi === hanzi)
        if (!character) throw new NotFound()
        const radical = repo.radicals.find(r => r.hanzi.includes(character.radical.substring(0, 1)))
        const expressions = repo.expressions.filter(w => w.hanzi.includes(character.hanzi)).map(e => ({ ...e, pinyin: getPinyinForExpression(e) }))
        const related = character.related ? character.related.split('').map(relatedChar => repo.characters.find(c => c.hanzi === relatedChar)) : []
        return { ...character, radical, expressions, related }
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

    this.getExpression = (hanzi) => {
        const expression = repo.expressions.find(w => w.hanzi === hanzi)
        if (!expression) throw new NotFound()
        return { ...expression, pinyin: getPinyinForExpression(expression) }
    }

    this.findExpressions = (searchString) => {
        // REVISE store the search-friendly pinyin on save
        const normalizedSearch = removePinyinTones(searchString.toLowerCase())
        return this.getExpressions().filter(e =>
            e.hanzi.includes(searchString) || removePinyinTones(e.pinyin.toLowerCase()).includes(normalizedSearch)
        )
    }

    this.getExpressions = () => {
        return [...repo.expressions].map(e => ({ ...e, pinyin: getPinyinForExpression(e) }))
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

    const removePinyinTones = (pinyin) => pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[1-5]/g, '')

    this.addExpressions = async (expressions) => {
        repo.expressions.push(...expressions.filter(expression => !repo.expressions.find(e => e.hanzi === expression.hanzi)))
        await repo.save()
    }

    this.getFlashcardItem = (deckName) => {
        const deck = repo.decks[deckName]
        return deck[Math.floor(Math.random() * deck.length)]
        // const defaultExpressions = repo.expressions.map(w => w.hanzi)
        // const expressionsNotRemembered = repo.submissions.filter(s => s.expression && !s.remembered).map(s => s.expression)
        // const expressions = [...defaultExpressions, ...expressionsNotRemembered]
        // const nextExpression = expressions[Math.floor(Math.random() * expressions.length)]
        // return this.getExpression(nextExpression)
    }

    this.getNextCharacterForDeck = () => {
        const nextItem = repo.decks.characters[Math.floor(Math.random() * repo.decks.characters.length)]
        return this.getCharacter(nextItem)
    }

    // REVISE new submission structure should better contain a type field, so the entire structure should be
    // { user: string,  type: 'radical' | 'character' | 'expression', hanzi: string, remembered: boolean, timestamp: Date }
    this.submitExpression = async (data) => {
        // TODO user handling
        const user = '野色'
        repo.submissions.push({ user, expression: data.expression, remembered: data.remembered, timestamp: Date.now() })
        await repo.save()
    }

    this.updateExpression = async (expression) => {
        const expr = repo.expressions.find(e => e.hanzi === expression.hanzi)
        expr.pinyin = expression.pinyin
        expr.meaning = expression.meaning
        await repo.save()
    }

    this.getDeck = (deckName) => {
        return repo.decks[deckName]
    }

    this.findDecks = (filterRegExp) => {
        const decks = Object.entries(repo.decks).filter(([name]) => filterRegExp.test(name))
        return decks.map(([name, items]) => ({ name, size: items.length }))
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

    this.deleteDeck = async (deckName) => {
        if (!repo.decks[deckName]) throw new NotFound()
        delete repo.decks[deckName]
        await repo.save()
    }

    this.getExportFiles = () => repo.exportFiles()

    this.stop = () => repo.save()
}
