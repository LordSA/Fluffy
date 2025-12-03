module.exports = (io, client) => {
    io.on("connection", (socket) => {
        client.logger.info(`[Socket] New Web Connection: ${socket.id}`);

        // You can add listeners here if the website sends data back
        socket.on("disconnect", () => {
            client.logger.info(`[Socket] Disconnected: ${socket.id}`);
        });
    });
};