const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const ajv = new Ajv2020({allErrors: true});
addFormats(ajv);
module.exports = ajv;
