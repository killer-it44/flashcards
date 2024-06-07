import fs from 'fs'

export default function FsRepository(dataDir) {
    let savingInProgress = false

    const init = () => {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir)
            fs.copyFileSync('server/init/radicals.json', `${dataDir}/radicals.json`)
            fs.copyFileSync('server/init/characters.json', `${dataDir}/characters.json`)
            fs.copyFileSync('server/init/words.json', `${dataDir}/words.json`)
            fs.copyFileSync('server/init/sentences.json', `${dataDir}/sentences.json`)
            fs.copyFileSync('server/init/submissions.json', `${dataDir}/submissions.json`)
        }
        this.radicals = JSON.parse(fs.readFileSync(`${dataDir}/radicals.json`).toString())
        this.characters = JSON.parse(fs.readFileSync(`${dataDir}/characters.json`).toString())
        this.words = JSON.parse(fs.readFileSync(`${dataDir}/words.json`).toString())
        this.sentences = JSON.parse(fs.readFileSync(`${dataDir}/sentences.json`).toString())
        this.submissions = JSON.parse(fs.readFileSync(`${dataDir}/submissions.json`).toString())
    }

    this.save = async () => {
        if (!savingInProgress) {
            savingInProgress = true
            await fs.promises.writeFile(`${dataDir}/radicals.json`, JSON.stringify(this.radicals, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/characters.json`, JSON.stringify(this.characters, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/words.json`, JSON.stringify(this.words, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/sentences.json`, JSON.stringify(this.sentences, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/submissions.json`, JSON.stringify(this.submissions, null, '\t'))
            savingInProgress = false
        }
    }

    init()
}
