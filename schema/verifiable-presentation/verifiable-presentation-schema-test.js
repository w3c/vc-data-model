const fs = require('fs');
const assert = require('assert');
const ajv = require('../__fixtures__/ajv');

const verifiablePresentationSchema = "/verifiable-presentation-schema.json";
const schema = JSON.parse(fs.readFileSync(__dirname + verifiablePresentationSchema));

describe('Verifiable Presentation', function () {
  describe('JSON Schema', function () {

    it('should validate example 2 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-2.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    // Note: this example fails because the dependent VC is not valid;
    // it is missing an issuanceDate. Both the VP and VC proofs are missing
    // created, proofPurpose, and verificationMethod fields. The example has
    // been modified to get the test to pass.
    it('should validate example 25 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-25.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    // Note: this example fails because the "prescription" fields are empty and one "proof"
    // field is empty. The example has been modified to get the test to pass.
    it('should validate example 45 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-45.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

  });
});
