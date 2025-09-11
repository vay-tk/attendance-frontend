const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

const formatMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (args.length > 0) {
    console.log(prefix, message, ...args);
  } else {
    console.log(prefix, message);
  }
};

export const logger = {
  error: (message, ...args) => {
    if (currentLevel >= LOG_LEVELS.ERROR) {
      formatMessage('ERROR', message, ...args);
    }
  },

  warn: (message, ...args) => {
    if (currentLevel >= LOG_LEVELS.WARN) {
      formatMessage('WARN', message, ...args);
    }
  },

  info: (message, ...args) => {
    if (currentLevel >= LOG_LEVELS.INFO) {
      formatMessage('INFO', message, ...args);
    }
  },

  debug: (message, ...args) => {
    if (currentLevel >= LOG_LEVELS.DEBUG) {
      formatMessage('DEBUG', message, ...args);
    }
  },
};

export default logger;