require('dotenv').config();

module.exports = {
    TOKEN: process.env.TOKEN || "",
    PREFIX: process.env.PREFIX || "!",
    OWNER_ID: "YOUR_DISCORD_ID" // For admin commands
};