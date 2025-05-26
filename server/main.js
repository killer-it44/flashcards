import FsRepository from './fs-repository.js'
import Controller from './controller.js'
import Server from './server.js'
import WinstonLogger from './winston-logger.js'

global.logger = new WinstonLogger()
const server = new Server(new Controller(new FsRepository(process.env.DATA_DIR || 'data')))
const port = await server.start(process.env.PORT || 3000)
logger.info(`Server listens on ${port}`)

process.on('SIGTERM', () => server.stop())
