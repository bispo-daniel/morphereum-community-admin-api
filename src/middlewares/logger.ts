import { IncomingMessage, ServerResponse } from 'http';
import morgan from 'morgan';

const logger = () => {
  morgan.token('timestamp', () => {
    const date = new Date();
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    });
  });

  morgan.token('statusColor', (_req: IncomingMessage, res: ServerResponse) => {
    const status = res.headersSent ? res.statusCode : undefined;

    const color =
      status !== undefined
        ? status >= 500
          ? 31 // red
          : status >= 400
            ? 33 // yellow
            : status >= 300
              ? 36 // cyan
              : status >= 200
                ? 32 // green
                : 0 // no color
        : 0;

    return `\x1b[${color}m${status}\x1b[0m`;
  });

  const morganFormat =
    ':timestamp - :method :url :statusColor :response-time ms - :res[content-length]';

  return morgan(morganFormat);
};

export default logger;
