const Buffer = require('buffer').Buffer;
const path = require('path');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * @param  {string} filename
 */
async function encode_base64(filename) {
    try {
        const data = await readFile(filename);
        let buf = await Buffer.from(data).toString('base64');

        return await `data:${filename};base64,${buf}`;
    } catch (e) {
        console.log(e);
    }
}

/**
 * @param  {string} base64str
 * @param  {string} filename
 */
async function decode_base64(base64str, filename) {
    try {
        let buf = await Buffer.from(base64str, 'base64');
        const data = await writeFile(path.join('images/', filename), buf);

        return await filename;
    } catch (e) {
        console.log(e);
    }
}
//encode_base64('ddr.jpg');
//decode_base64('any_base64_string_goes_here', 'rane.jpg');

function removeImg(pathImg) {
    fs.unlink(path.join('public', pathImg), (err) => {
        if (err) throw err;
        console.log(`${pathImg} was deleted`);
    })
}

module.exports = {
    encode_base64,
    decode_base64,
    removeImg
}