import fs from 'fs'
import path from 'path'

class DeckAlreadyExistsError extends Error {}
class DeckNotFoundError extends Error {}

export { DeckAlreadyExistsError, DeckNotFoundError }

export default function FsDeckRepository(dataDir) {
    const decksDir = path.join(dataDir, 'decks')
    if (!fs.existsSync(decksDir)) {
        fs.mkdirSync(decksDir, { recursive: true })
    }

    const deckFilePath = (deckName) => path.join(decksDir, `${deckName}.json`)

    this.get = async (deckName) => {
        const file = deckFilePath(deckName)
        try {
            const data = await fs.promises.readFile(file, 'utf-8')
            return JSON.parse(data)
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new DeckNotFoundError()
            } else {
                throw err
            }
        }
    }

    this.add = async (deckName, deckData) => {
        const file = deckFilePath(deckName)
        let handle
        try {
            handle = await fs.promises.open(file, 'wx')
            await handle.writeFile(JSON.stringify(deckData, null, '\t'))
        } catch (err) {
            if (err.code === 'EEXIST') 
                throw new DeckAlreadyExistsError()
            else {
                throw err
            }
        } finally {
            await handle?.close()
        }
    }

    const ensureCanAccess = async (deckFile) => {
        try {
            await fs.promises.access(deckFile)
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new DeckNotFoundError()
            } else {
                throw err
            }
        }
    }
    
    this.update = async (deckName, deckData) => {
        const oldFile = deckFilePath(deckName)
        const newFile = deckFilePath(deckData.name)
        const isRename = deckData.name && deckData.name !== deckName
        await ensureCanAccess(oldFile)
        let handle
        try {
            handle = await fs.promises.open(newFile, isRename ? 'wx' : 'w')
            await handle.writeFile(JSON.stringify(deckData, null, '\t'))
        } catch (err) {
            if (err.code === 'EEXIST') throw new DeckAlreadyExistsError()
            throw err
        } finally {
            await handle?.close()
        }
        if (isRename) {
            try {
                await fs.promises.unlink(oldFile)
            } catch (err) {
                console.error('Failed to delete old deck file during rename:', err)
                try {
                    await fs.promises.unlink(newFile)
                } catch (rollbackErr) {
                    console.error('Rollback failed (could not delete new deck file):', rollbackErr)
                    err.rollbackError = rollbackErr
                }
                throw err
            }
        }
    }

    this.delete = async (deckName) => {
        const file = deckFilePath(deckName)
        try {
            await fs.promises.unlink(file)
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new DeckNotFoundError()
            } else {
                throw err
            }
        }
    }

    this.list = async (filterRegExp) => {
        const files = await fs.promises.readdir(decksDir)
        const deckFiles = files.filter(f => f.endsWith('.json') && filterRegExp.test(f.replace(/\.json$/, '')))
        return Promise.all(deckFiles.map(async f => {
            const data = await fs.promises.readFile(path.join(decksDir, f), 'utf-8')
            const deck = JSON.parse(data)
            return { ...deck, name: f.replace(/\.json$/, '') }
        }))
    }
}
