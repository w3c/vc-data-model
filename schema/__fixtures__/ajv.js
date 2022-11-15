const Ajv2020 = require("ajv/dist/2020");
const ajv = new Ajv2020({allErrors: true});
module.exports = ajv;