import fs from 'fs'
import FsUserRepository from './fs-user-repository.js'
import FsDeckRepository from './fs-deck-repository.js'

const loadOrInit = (f) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f).toString()) : []

export default function FsRepository(dataDir) {
    let savingInProgress = false, pendingSave = false

    this.radicals = loadOrInit(`${dataDir}/radicals.json`)
    this.characters = loadOrInit(`${dataDir}/characters.json`)
    this.expressions = loadOrInit(`${dataDir}/expressions.json`)
    this.submissions = loadOrInit(`${dataDir}/submissions.json`)
    this.users = new FsUserRepository(dataDir)
    this.decks = new FsDeckRepository(dataDir)

    this.save = async () => {
        pendingSave = savingInProgress
        if (pendingSave) return

        do {
            if (!savingInProgress) {
                savingInProgress = true
                pendingSave = false
                await doSave()
                savingInProgress = false
            }
        } while (pendingSave)
    }

    this.exportFiles = async () => {
        const allDecks = await this.decks.list(/.*/)
        return [
            { name: 'radicals.json', content: JSON.stringify(this.radicals, null, '\t') },
            { name: 'characters.json', content: JSON.stringify(this.characters, null, '\t') },
            { name: 'expressions.json', content: JSON.stringify(this.expressions, null, '\t') },
            { name: 'submissions.json', content: JSON.stringify(this.submissions, null, '\t') },
            ...allDecks.map(deck => ({ name: `decks/${deck.name}.json`, content: JSON.stringify(deck, null, '\t') }))
        ]
    }

    const doSave = async () => {
        await fs.promises.writeFile(`${dataDir}/radicals.json`, JSON.stringify(this.radicals, null, '\t'))
        await fs.promises.writeFile(`${dataDir}/characters.json`, JSON.stringify(this.characters, null, '\t'))
        await fs.promises.writeFile(`${dataDir}/expressions.json`, JSON.stringify(this.expressions, null, '\t'))
        // Decks are now stored in separate files, so skip decks.json
        await fs.promises.writeFile(`${dataDir}/submissions.json`, JSON.stringify(this.submissions, null, '\t'))
    }
}
