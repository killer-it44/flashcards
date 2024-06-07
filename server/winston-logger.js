import { createLogger, transports, format } from 'winston'

export default function WinstonLogger() {
    const logger = createLogger({
        transports: [new transports.Console()],
        format: format.combine(format.splat(), format.simple())
    })

    this.info = (...args) => logger.info(...args)
    this.warn = (...args) => logger.warn(...args)
    this.error = (...args) => logger.error(...args)
}
