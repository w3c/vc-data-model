import { Vocab }     from './lib/common';
import { get_data }  from "./lib/convert";
import { to_turtle } from "./lib/turtle";
import { to_jsonld } from './lib/jsonld';
import { to_html }   from './lib/html';

/**
 * Entry point for the script: 
 * 
 * 1. Read the CSV file
 * 2. Transform the content into an internal representation of the vocabulary
 * 3. Use the internal representation to generate a Turtle, JSON-LD, and HTML versions.
 * 
 * At the moment, the names of the files ('vocabulary.ttl', 'vocabulary.jsonld', and 'vocabulary.html' for
 * the output, and 'vocabulary.csv' for the CSV file itself) are baked into the code. At some point
 * an external config file may become a good idea. 
 * 
 */
async function main() {
    const vocab: Vocab = await get_data('vocabulary.csv');
    await Promise.all([
        to_turtle("vocabulary.ttl", vocab),
        to_jsonld("vocabulary.jsonld", vocab),
        to_html("vocabulary.html", "template.html", vocab)
    ])    
}

// At some point, node.js will allow to have async calls at the top level, and this extra function will
// become unnecessary. Until then…
main();

