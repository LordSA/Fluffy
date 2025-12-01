function log(level, ...args) {
  const time = new Date().toISOString();
  console.log(`[${time}] [${level}]`, ...args);
}

export const logger = {
  info: (...args) => log("INFO", ...args),
  warn: (...args) => log("WARN", ...args),
  error: (...args) => log("ERROR", ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV === "development") {
      log("DEBUG", ...args);
    }
  }
};
