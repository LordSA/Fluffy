const winston = require("winston");
const colors = require("colors");
const fs = require("fs");
const path = require("path");

class Logger {
  constructor(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.logger = winston.createLogger({
      transports: [new winston.transports.File({ filename: filePath })],
    });
  }

  log(Text) {
    let d = new Date();
    this.logger.log({
      level: "info",
      message: `${d.getHours()}:${d.getMinutes()} - ${d.getDate()}:${d.getMonth() + 1}:${d.getFullYear()} | Info: ` + Text,
    });
    console.log(
      colors.green(`${d.getDate()}:${d.getMonth() + 1}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}`) +
      colors.yellow(" | Info: " + Text)
    );
  }

  error(Text) {
    this.logger.log({ level: "error", message: Text });
    console.log(colors.red(`[ERROR] ${Text}`));
  }
  
  info(Text) { this.log(Text); }
  warn(Text) { console.log(colors.magenta(`[WARN] ${Text}`)); }
}

module.exports = new Logger(path.join(__dirname, "..", "logs", "Bot.log"));