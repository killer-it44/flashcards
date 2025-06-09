import NotFound from './not-found.js'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import { UserNotFoundError } from './fs-user-repository.js'
import { DeckNotFoundError } from './fs-deck-repository.js'

class LoginError extends Error { }
class SignupRequirementsNotMetError extends Error { }

export { LoginError, SignupRequirementsNotMetError }

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

    // TODO should we make it an "upsert"?
    this.updateCharacter = async (data) => {
        const character = repo.characters.find(c => c.hanzi === data.character)
        character.meaning = data.meaning
        character.related = data.related
        await repo.save()
    }

    this.getExpression = (hanzi) => {
        const expression = repo.expressions.find(w => w.hanzi === hanzi) || { hanzi, pinyin: '', meaning: '' }
        return { ...expression, pinyin: expression.pinyin || getPinyinForExpression(expression) }
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

    const lastSubmission = (hanzi) => {
        const initial = { hanzi, timestamp: 0, result: 'forgot' }
        return repo.submissions.filter(s => s.hanzi === hanzi).reduce((max, s) => s.timestamp > max.timestamp ? s : max, initial)
    }

    this.getFlashcardItem = async (deckName) => {
        const r = Math.random()
        let categoryOrder = (r < 0.1) ? 'remembered' : (r < 0.3) ? 'struggled' : 'forgot'
        const categories = {
            remembered: ['remembered', 'struggled', 'forgot'],
            struggled: ['struggled', 'forgot', 'remembered'],
            forgot: ['forgot', 'struggled', 'remembered']
        }[categoryOrder]

        const deck = await repo.decks.get(deckName)
        const items = deck.items.map(hanzi => lastSubmission(hanzi))
        items.sort((a, b) => a.timestamp - b.timestamp)

        for (let category of categories) {
            const item = items.find(item => item.result === category)
            if (item) return item.hanzi
        }
    }

    this.saveSubmission = async ({ hanzi, result, deck }) => {
        repo.submissions.push({ timestamp: Date.now(), hanzi, result, deck })
        await repo.save()
    }

    this.updateExpression = async (expression) => {
        const expr = repo.expressions.find(e => e.hanzi === expression.hanzi)
        expr.pinyin = expression.pinyin
        expr.meaning = expression.meaning
        await repo.save()
    }

    this.getDeck = async (deckName) => {
        try {
            return await repo.decks.get(deckName)
        } catch (err) {
            if (err instanceof DeckNotFoundError) {
                throw new NotFound()
            } else {
                throw err
            }
        }
    }

    this.findDecks = async (filterRegExp, user) => {
        const decks = await repo.decks.list(filterRegExp)
        return decks
            .filter(deck => !deck.isPrivate || (deck.createdBy === user.username))
            .map(deck => {
                const { name, createdAt, createdBy, description, tags, items } = deck
                return { name, createdAt, createdBy, description, tags, size: items.length }
            })
    }

    this.addDeck = async (deck, user) => {
        await repo.decks.add(deck.name, { ...deck, createdAt: Date.now(), createdBy: user.username, description: '', isPrivate: false, tags: [] })
    }

    this.updateDeck = async (deckName, newData) => {
        const deck = await repo.decks.get(deckName)
        await repo.decks.update(deckName, { ...newData, createdAt: deck.createdAt, createdBy: deck.createdBy, description: '', isPrivate: false, tags: [] })
    }

    this.deleteDeck = async (deckName) => {
        await repo.decks.delete(deckName)
    }

    this.signupUser = async (username, password) => {
        if (!username || !password) {
            throw new SignupRequirementsNotMetError('Name and password are required')
        } else if (username.length < 3 || username.length > 20) {
            throw new SignupRequirementsNotMetError('Name must be between 3 and 20 characters')
        } else if (!/^[A-Za-z0-9_-]+$/.test(username)) {
            throw new SignupRequirementsNotMetError('Name can only contain letters, numbers, underscores, and hyphens')
        } else if (password.length < 6 || password.length > 16) {
            throw new SignupRequirementsNotMetError('Password must be between 6 and 16 characters')
        }

        const salt = randomBytes(16).toString('hex')
        const hash = scryptSync(password, salt, 64).toString('hex')
        await repo.users.add(username, { username, hash, salt, createdAt: Date.now(), role: 'regular' })
        return this.findUserForLogin(username, password)
    }

    this.findUserForLogin = async (username, password) => {
        try {
            const user = await repo.users.get(username)
            if (timingSafeEqual(Buffer.from(user.hash, 'hex'), scryptSync(password, user.salt, 64))) {
                return { username: user.username, role: user.role, createdAt: user.createdAt }
            } else {
                throw new LoginError('Invalid username or password')
            }
        } catch (err) {
            throw err instanceof UserNotFoundError ? new LoginError('Invalid username or password') : err
        }
    }

    this.getExportFiles = () => repo.exportFiles()

    this.stop = () => repo.save()
}
