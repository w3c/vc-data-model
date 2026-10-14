# Verifiable Credentials JSON Schema

This directory defines [JSON Schemas](https://json-schema.org/) for the Verifiable Credentials Data Model.

Currently, this implementation makes use of **JSON Schema version 2020-12**:
- [JSON Schema Core](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [JSON Schema Validation](https://json-schema.org/draft/2020-12/json-schema-validation.html)
- [Relative JSON Pointers](https://json-schema.org/draft/2020-12/relative-json-pointer.html)

String properties that hold URLs (such as `id`, `issuer`, and `verificationMethod`) carry `"format": "uri"`, and `validFrom`, `validUntil`, and `created` carry `"format": "date-time"`. JSON Schema treats `format` as an annotation by default, so validators only enforce these when format assertion is enabled (the tests here use [ajv-formats](https://github.com/ajv-validator/ajv-formats)). The date-time properties also keep a `pattern` so the shape is enforced even without format assertion.

# Schemas

There are two schemas provided, each with associated tests:

- [Verifiable Credential JSON Schema](verifiable-credential/verifiable-credential-schema.json)
- [Verifiable Presentation JSON Schema](verifiable-presentation/verifiable-presentation-schema.json)

# Tests

A limited set of tests against examples in the specification are included. To run these tests, you can use the following command, after `npm i`:

```bash
npm run test-schema
```

The tests rely on examples featured in the spec. Currently these examples have been copy-pasted, and there is no guarantee they are in sync with the spec. This should be improved!