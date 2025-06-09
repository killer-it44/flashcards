import express from 'express'
import NotFound from './not-found.js'
import Together from 'together-ai'
import archiver from 'archiver'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import fs from 'fs'
import { LoginError, SignupRequirementsNotMetError } from './controller.js'
import { UserAlreadyExistsError } from './fs-user-repository.js'

export default function Server(controller, sessionSecret) {
    let httpServer
    const app = express()

    const FileStore = sessionFileStore(session)

    app.use(session({
        store: new FileStore({
            path: `${process.env.FLASHCARDS_DATA_DIR}/sessions`,
            logFn: (msg) => msg?.includes('ENOENT') ? logger.warn(msg) : logger.error(msg)
        }),
        secret: fs.readFileSync(`${process.env.FLASHCARDS_DATA_DIR}/sessions/secret`),
        resave: false,
        saveUninitialized: false
    }))

    app.use(express.static('server/web-content'))

    app.post('/api/login', express.json(), async (req, res) => {
        try {
            req.session.user = await controller.findUserForLogin(req.body.username, req.body.password)
            res.status(200).json(req.session.user)
        } catch (error) {
            if (error instanceof LoginError) {
                res.status(401).send(error.message)
            } else {
                throw error
            }
        }
    })

    app.post('/api/signup', express.json(), async (req, res) => {
        try {
            req.session.user = await controller.signupUser(req.body.username, req.body.password)
            res.status(201).json(req.session.user)
        } catch (error) {
            if (error instanceof SignupRequirementsNotMetError) {
                res.status(400).send(error.message)
            } else if (error instanceof UserAlreadyExistsError) {
                res.status(409).send(error.message)
            } else {
                throw error
            }
        }
    })

    app.post('/api/logout', (req, res) => req.session.destroy(() => res.clearCookie('connect.sid').status(200).end()))

    app.get('/api/user', (req, res) => res.json(req.session.user || {}))

    app.use((req, res, next) => (req.method === 'GET' || req.session.user) ? next() : res.status(401).end())

    app.get('/api/list-characters', (req, res) => {
        const page = parseInt(req.query.page) || 1
        const pageSize = parseInt(req.query.pageSize) || 20
        const search = req.query.search ? req.query.search.trim() : ''
        const searchField = req.query.searchField || ''

        const allCharacters = controller.findCharacters({ search, searchField })
        const total = allCharacters.length
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const characters = allCharacters.slice(start, end)

        res.json({ characters, page, pageSize, total })
    })

    app.get('/api/characters/:hanzi', (req, res) => {
        res.json(controller.getCharacter(req.params.hanzi))
    })

    app.put('/api/characters/:hanzi', express.json(), async (req, res) => {
        await controller.updateCharacter({ character: req.params.hanzi, ...req.body })
        res.status(200).end()
    })

    app.get('/api/expressions', (req, res) => {
        res.json(controller.findExpressions(req.query.search || ''))
    })

    app.get('/api/expressions/:expression', (req, res) => {
        try {
            res.json(controller.getExpression(req.params.expression))
        } catch (error) {
            if (error instanceof NotFound) {
                res.status(404).end()
            } else {
                throw error
            }
        }
    })

    app.post('/api/expressions', express.json(), async (req, res) => {
        await controller.addExpressions(req.body)
        res.status(204).end()
    })

    app.put('/api/expressions/:expression', express.json(), async (req, res) => {
        await controller.updateExpression(req.body)
        res.status(204).end()
    })

    app.get('/api/decks', async (req, res) => {
        const decks = await controller.findDecks(new RegExp(req.query.search || '', 'i'), req.session.user || {})
        res.json(decks)
    })

    app.post('/api/decks', express.json(), async (req, res) => {
        await controller.addDeck(req.body, req.session.user)
        res.status(201).end()
    })

    app.get('/api/decks/:deck', async (req, res) => {
        res.json(await controller.getDeck(req.params.deck))
    })

    app.put('/api/decks/:deck', express.json(), async (req, res) => {
        await controller.updateDeck(req.params.deck, req.body)
        res.status(200).end()
    })

    app.delete('/api/decks/:deck', async (req, res) => {
        await controller.deleteDeck(req.params.deck)
        res.status(200).end()
    })

    app.get('/api/flashcards/:deck', async (req, res) => {
        res.json(await controller.getFlashcardItem(req.params.deck))
    })

    app.post('/api/flashcards/:deck', express.json(), async (req, res) => {
        await controller.saveSubmission({ hanzi: req.body.hanzi, result: req.body.result, deck: req.params.deck })
        res.json(await controller.getFlashcardItem(req.params.deck))
    })

    app.get('/api/hint/:hanzi', async (req, res) => {
        const together = new Together({ apiKey: process.env.TOGETHER_API_KEY })

        const response = await together.chat.completions.create({
            messages: [{
                role: 'system',
                content: 'You are an assistant for a Chinese learning app. You will be given one Chinese character, and you should reply with a json containing the following information:\n```json\n{ "radicals": "<the radicals used in this character, comma-separated, without any further explanation>", "memorization-hints": "<hints to memorize the character better, such as how the character evolved, or how it is used in common expressions, or how it is distinguished from other characters>" }\n```\n'
            }, {
                role: "user",
                content: req.params.hanzi
            }],
            model: "deepseek-ai/DeepSeek-V3",
            response_format: {
                type: "json_schema",
                schema: {
                    type: "object",
                    properties: {
                        radicals: { type: "string", required: ["radicals"], additionalProperties: false },
                        hints: { type: "string", required: ["hints"], additionalProperties: false }
                    },
                    required: ["radicals", "hints"],
                    additionalProperties: false
                }
            }
        })

        console.log(response.choices[0].message.content)
        res.json(JSON.parse(response.choices[0].message.content))
    })

    // REVISE streaming might be better here
    app.get('/api/export', async (req, res) => {
        if (!req.session.user || req.session.user.roles !== 'admin') {
            return res.status(403).send('Forbidden')
        }
        const COMPRESSION_LEVEL_HIGHEST = 9
        const archive = archiver('zip', { zlib: { level: COMPRESSION_LEVEL_HIGHEST } })
        const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d+Z$/, '').replace('T', '-')
        res.attachment(`flashcards-export-${timestamp}.zip`)
        archive.pipe(res)

        const exportFiles = await controller.getExportFiles()
        exportFiles.forEach(f => archive.append(f.content, { name: f.name }))
        await archive.finalize()
    })

    app.use((err, req, res, next) => {
        if (err instanceof NotFound) {
            return res.status(404).end()
        } else {
            console.error('Unhandled error: ', err)
            next(err)
        }
    })

    this.start = (port) => {
        return new Promise((resolve, reject) => {
            httpServer = app.listen(port, '0.0.0.0', (err) => {
                return err ? reject(err) : resolve(httpServer.address().port)
            })
        })
    }

    this.stop = async () => {
        httpServer.close()
        controller.stop()
    }
}
