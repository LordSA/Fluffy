const moment = require('moment');

exports.log = (content, type = 'info') => {
    const timestamp = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
    switch (type) {
        case 'info': console.log(`${timestamp} [INFO] ${content}`); break;
        case 'warn': console.log(`${timestamp} [WARN] ${content}`); break;
        case 'error': console.error(`${timestamp} [ERROR] ${content}`); break;
        case 'cmd': console.log(`${timestamp} [CMD] ${content}`); break;
        case 'ready': console.log(`${timestamp} [READY] ${content}`); break;
    }
};