const moment = require('moment');

module.exports = {
    ifeq(a, b, options) {
        if (String(a) === String(b)) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    getTime(timeStamp) { return moment(timeStamp).format('DD-MMM-YYYY') },
    getTimeAdmin(timeStamp) { return moment(timeStamp).format('DD/MM/YYYY, HH:mm:ss') },
    getDescription(string) { return string.substring(0, 120) + '...' },
    pagination(currentPage, totalPage, size, options) {
        let startPage, endPage, context;

        if (arguments.length === 3) {
            options = size;
            size = 5;
        }

        startPage = currentPage - Math.floor(size / 2);
        endPage = currentPage + Math.floor(size / 2);

        if (startPage <= 0) {
            endPage -= (startPage - 1);
            startPage = 1;
        }

        if (endPage > totalPage) {
            endPage = totalPage;
            if (endPage - size + 1 > 0) {
                startPage = endPage - size + 1;
            } else {
                startPage = 1;
            }
        }

        context = {
            startFromFirstPage: false,
            pages: [],
            endAtLastPage: false,
        };
        if (startPage === 1) {
            context.startFromFirstPage = true;
        }
        for (let i = startPage; i <= endPage; i++) {
            context.pages.push({
                page: i,
                isCurrent: i === currentPage,
            });
        }
        if (endPage === totalPage) {
            context.endAtLastPage = true;
        }

        return options.fn(context);
    },

    limit(arr, limit) {
        if (!Array.isArray(arr)) { return []; }
        return arr.slice(0, limit);
    }
};