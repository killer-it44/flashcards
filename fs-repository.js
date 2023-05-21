import fs from 'fs'

export default function FsRepository(dataDir) {
    let savingInProgress = false

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

    if (!fs.existsSync(`${dataDir}/characters.json`)) {
        logger.info('First time start, initializing data')
        const t0 = Date.now()
        fs.copyFileSync('init/radicals.json', `${dataDir}/radicals.json`)
        fs.copyFileSync('init/characters.json', `${dataDir}/characters.json`)
        fs.copyFileSync('init/words.json', `${dataDir}/words.json`)
        fs.writeFileSync(`${dataDir}/submissions.json`, '[]')
        logger.info(`Data initialized in ${Date.now() - t0} ms`)
    }

    logger.info('Loading data...')
    const t0 = Date.now()
    this.radicals = JSON.parse(fs.readFileSync(`${dataDir}/radicals.json`).toString())
    this.characters = JSON.parse(fs.readFileSync(`${dataDir}/characters.json`).toString())
    this.words = JSON.parse(fs.readFileSync(`${dataDir}/words.json`).toString())
    this.submissions = JSON.parse(fs.readFileSync(`${dataDir}/submissions.json`).toString())
    logger.info(`Loaded ${this.characters.length} characters, ${this.radicals.length} radicals, ${this.words.length} words and ${this.submissions.length} submissions in ${Date.now() - t0} ms`)

    this.save = async () => {
        if (!savingInProgress) {
            savingInProgress = true
            logger.info('Saving data...')
            const t0 = Date.now()
            await fs.promises.writeFile(`${dataDir}/radicals.json`, JSON.stringify(this.radicals, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/characters.json`, JSON.stringify(this.characters, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/words.json`, JSON.stringify(this.words, null, '\t'))
            await fs.promises.writeFile(`${dataDir}/submissions.json`, JSON.stringify(this.submissions, null, '\t'))
            logger.info(`Data saved in ${Date.now() - t0} ms`)
            savingInProgress = false
        }
    }
}
