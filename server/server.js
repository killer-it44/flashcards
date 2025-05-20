import express from 'express'
import NotFound from './not-found.js'
import Together from 'together-ai'

export default function Server(controller) {
    let httpServer
    const app = express()

    app.disable('x-powered-by')

    app.use('/', express.static('server/web-content'))

    // REVISE ought to be called submissions (plural)
    app.post('/api/submissions', express.json(), async (req, res) => {
        // REVISE weird and inconsistent API design (the GET APIs work differently)
        if (req.body.character) {
            await controller.submitCharacter(req.body)
        } else {
            await controller.submitExpression(req.body)
        }
        res.status(201).end()
    })

    app.get('/api/characters/:hanzi', (req, res) => {
        try {
            res.json(controller.getCharacter(req.params.hanzi))
        } catch (error) {
            if (error instanceof NotFound) {
                res.status(404).end()
            } else {
                throw error
            }
        }
    })

    app.put('/api/characters/:hanzi', express.json(), async (req, res) => {
        await controller.updateCharacter({ character: req.params.hanzi, ...req.body })
        res.status(200).end()
    })

    app.get('/api/decks/:deck', (req, res) => {
        res.json(controller.getNextCharacterForDeck('characters'))
    })

    app.get('/api/characters', (req, res) => {
        res.json(controller.getNextCharacter())
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

    app.get('/api/expressions', (req, res) => {
        res.json(controller.getNextExpression())
    })

    app.post('/api/expressions', express.json(), async (req, res) => {
        await controller.addExpressions(req.body)
        res.status(204).end()
    })

    this.start = (port) => {
        return new Promise((resolve, reject) => {
            httpServer = app.listen(port, '0.0.0.0', () => resolve(httpServer.address().port)).on('error', reject)
        })
    }

    this.stop = async () => {
        httpServer.close()
        controller.stop()
    }
}
