const logError = ({
  type,
  controller,
  error,
}: {
  type: 'bad-request' | 'internal-server-error' | 'not-found' | 'unauthorized';
  controller: string;
  error: unknown;
}) => {
  console.error(`[${type}] --> ${controller}:`, error);
};

export default logError;
