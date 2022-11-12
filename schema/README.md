# Verifiable Credentials JSON Schema

This directory defines [JSON Schemas](https://json-schema.org/) for the Verifiable Credentials Data Model.

Currently, this implementation makes use of **JSON Schema version 2020-12**:
- [JSON Schema Core](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [JSON Schema Validation](https://json-schema.org/draft/2020-12/json-schema-validation.html)
- [Relative JSON Pointers](https://json-schema.org/draft/2020-12/relative-json-pointer.html)


# Tests

A limited set of tests are included against examples in the specification. To run these tests you can use the following command, after `npm i`:

```bash
npm run test-schemas
```