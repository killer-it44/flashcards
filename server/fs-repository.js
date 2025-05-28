import fs from 'fs'

export default function FsRepository(dataDir) {
    let savingInProgress = false, pendingSave = false

    this.radicals = JSON.parse(fs.readFileSync(`${dataDir}/radicals.json`).toString())
    this.characters = JSON.parse(fs.readFileSync(`${dataDir}/characters.json`).toString())
    this.expressions = JSON.parse(fs.readFileSync(`${dataDir}/expressions.json`).toString())
    this.submissions = JSON.parse(fs.readFileSync(`${dataDir}/submissions.json`).toString())
    this.decks = JSON.parse(fs.readFileSync(`${dataDir}/decks.json`).toString())

    this.save = async () => {
        if (savingInProgress) {
            pendingSave = true
            return
        }
        savingInProgress = true
        do {
            pendingSave = false
            await doSave()
        } while (pendingSave)
        savingInProgress = false
    }

    this.exportFiles = () => [
        { name: 'characters.json', content: JSON.stringify(this.characters, null, '\t') },
        { name: 'expressions.json', content: JSON.stringify(this.expressions, null, '\t') },
        { name: 'decks.json', content: JSON.stringify(this.decks, null, '\t') },
        { name: 'radicals.json', content: JSON.stringify(this.radicals, null, '\t') },
        { name: 'submissions.json', content: JSON.stringify(this.submissions, null, '\t') }
    ]

    const doSave = async () => {
        if (!savingInProgress) {
            savingInProgress = true
            await fs.promises.writeFile(`${dataDir}/radicals.json`, JSON.stringify(this.radicals, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/characters.json`, JSON.stringify(this.characters, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/expressions.json`, JSON.stringify(this.expressions, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/submissions.json`, JSON.stringify(this.submissions, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/decks.json`, JSON.stringify(this.decks, null, '\t'))
            savingInProgress = false
        }
    }
}
