import fs from 'fs'

export default function FsRepository(dataDir) {
    let savingInProgress = false

    const init = () => {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir)
            fs.copyFileSync('server/init/radicals.json', `${dataDir}/radicals.json`)
            fs.copyFileSync('server/init/characters.json', `${dataDir}/characters.json`)
            fs.copyFileSync('server/init/expressions.json', `${dataDir}/expressions.json`)
            fs.copyFileSync('server/init/submissions.json', `${dataDir}/submissions.json`)
            fs.copyFileSync('server/init/decks.json', `${dataDir}/decks.json`)
        }
        this.radicals = JSON.parse(fs.readFileSync(`${dataDir}/radicals.json`).toString())
        this.characters = JSON.parse(fs.readFileSync(`${dataDir}/characters.json`).toString())
        this.expressions = JSON.parse(fs.readFileSync(`${dataDir}/expressions.json`).toString())
        this.submissions = JSON.parse(fs.readFileSync(`${dataDir}/submissions.json`).toString())
        this.decks = JSON.parse(fs.readFileSync(`${dataDir}/decks.json`).toString())
    }

    this.save = async () => {
        if (!savingInProgress) {
            savingInProgress = true
            await fs.promises.writeFile(`${dataDir}/radicals.json`, JSON.stringify(this.radicals, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/characters.json`, JSON.stringify(this.characters, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/expressions.json`, JSON.stringify(this.expressions, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/submissions.json`, JSON.stringify(this.submissions, null, '\t'))
            savingInProgress = false
        }
    }

    init()
}
