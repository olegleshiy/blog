const buildSort = (sort, order) => {
    const sortBy = {};
    sortBy[sort] = order;
    return sortBy;
}

const listInitOptions = async (req) => {
    return new Promise((resolve) => {
        const order = req.query.order || -1;
        const sort = req.query.sort || 'createdAt';
        const sortBy = buildSort(sort, order);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const options = {
            sort: sortBy,
            lean: true,
            page,
            limit
        }
        resolve(options);
    })
}

const cleanPaginationID = (result) => {
    result.docs.map((element) => delete element.id);
    return result;
}

module.exports = async (req, model, query, populate = '') => {
    try {
        const options = await listInitOptions(req);
        const result = await model.paginate(query, options);
        return await cleanPaginationID(result);
    } catch (e) {
        console.log(e);
    }
}
