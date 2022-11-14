const fs = require('fs');
const assert = require('assert');
const Ajv2020 = require("ajv/dist/2020");
const ajv = new Ajv2020();

const verifiableCredentialSchema = "/../verifiable-credential-schema.json";
const schema = JSON.parse(fs.readFileSync(__dirname + verifiableCredentialSchema));

describe('Verifiable Credential', function () {
  describe('JSON Schema', function () {

    it('should validate example 1 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-1.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 4 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-4.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 11 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-11.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 12 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-12.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 13 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-13.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 18 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-18.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 20 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-20.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 21 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-21.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });

    it('should validate example 23 using JSON Schema 2020-12 ', function () {
      const data = JSON.parse(fs.readFileSync(__dirname + '/example-23.json'));
      const validate = ajv.compile(schema);
      const valid = validate(data);

      assert.equal(null, validate.errors);
      assert.equal(true, valid);
    });
  });
});
