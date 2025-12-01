require('dotenv').config();

module.exports = {
    TOKEN: process.env.TOKEN,
    PREFIX: process.env.PREFIX || ".",
    OWNER_ID: process.env.OWNER_ID,
    GEMINI_KEY: process.env.GEMINI_KEY,
    MONGO_URL: process.env.MONGO_URL,
    LOG_CHANNEL: process.env.LOG_CHANNEL
};