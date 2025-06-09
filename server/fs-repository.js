import fs from 'fs'
import FsUserRepository from './fs-user-repository.js'

const loadOrInit = (f) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f).toString()) : []

export default function FsRepository(dataDir) {
    let savingInProgress = false, pendingSave = false

    this.radicals = loadOrInit(`${dataDir}/radicals.json`)
    this.characters = loadOrInit(`${dataDir}/characters.json`)
    this.expressions = loadOrInit(`${dataDir}/expressions.json`)
    this.decks = loadOrInit(`${dataDir}/decks.json`)
    this.submissions = loadOrInit(`${dataDir}/submissions.json`)
    this.users = new FsUserRepository(dataDir)

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

    this.exportFiles = () => [
        { name: 'radicals.json', content: JSON.stringify(this.radicals, null, '\t') },
        { name: 'characters.json', content: JSON.stringify(this.characters, null, '\t') },
        { name: 'expressions.json', content: JSON.stringify(this.expressions, null, '\t') },
        { name: 'decks.json', content: JSON.stringify(this.decks, null, '\t') },
        { name: 'submissions.json', content: JSON.stringify(this.submissions, null, '\t') },
    ]

    const doSave = async () => {
        await fs.promises.writeFile(`${dataDir}/radicals.json`, JSON.stringify(this.radicals, null, '\t'))
        await fs.promises.writeFile(`${dataDir}/characters.json`, JSON.stringify(this.characters, null, '\t'))
        await fs.promises.writeFile(`${dataDir}/expressions.json`, JSON.stringify(this.expressions, null, '\t'))
        await fs.promises.writeFile(`${dataDir}/decks.json`, JSON.stringify(this.decks, null, '\t'))
        await fs.promises.writeFile(`${dataDir}/submissions.json`, JSON.stringify(this.submissions, null, '\t'))
    }
}
