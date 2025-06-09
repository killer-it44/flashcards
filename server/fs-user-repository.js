import fs from 'fs'
import path from 'path'

class UserAlreadyExistsError extends Error { }
class UserNotFoundError extends Error { }

export { UserAlreadyExistsError, UserNotFoundError }

export default function FsUserRepository(dataDir) {
    const usersDir = path.join(dataDir, 'users')
    if (!fs.existsSync(usersDir)) {
        fs.mkdirSync(usersDir, { recursive: true })
    }

    const userFilePath = (username) => {
        return path.join(usersDir, `${username}.json`)
    }

    this.get = async (username) => {
        const file = userFilePath(username)
        try {
            const data = await fs.promises.readFile(file, 'utf-8')
            return JSON.parse(data)
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new UserNotFoundError()
             } else {
                throw err
             }
        }
    }

    this.add = async (username, data) => {
        const file = userFilePath(username)
        let handle
        try {
            handle = await fs.promises.open(file, 'wx')
            await handle.writeFile(JSON.stringify(data, null, '\t'))
        } catch (err) {
            if (err.code === 'EEXIST') {
                throw new UserAlreadyExistsError()
            } else {
                throw err
            }
        } finally {
            await handle?.close()
        }
    }
}
