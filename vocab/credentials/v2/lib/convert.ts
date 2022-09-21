/**
 * Convert the raw CSV description of the vocabulary into an internal representation 
 * (see the 'Vocab' interface).
 * 
 * @packageDocumentation
 */
import { parse }          from 'csv-parse/sync';
import { promises as fs } from 'fs';
import { RDFClass, RDFProperty, RDFIndividual, RDFPrefix, OntologyProperty, Vocab, global } from './common';

const today = new Date();

/**
 * Just a shorthand to make the code more readable... Checking whether a string can be considered as a URL
 * 
 * @param value 
 * @returns 
 */
const isURL = (value:string): boolean => {
    try {
        new URL(value);
        return true;
    } catch(e) {
        return false;
    }
}

/** 
* One row of the CSV entries. Look at the Readme.md file for what they are meant for.
*/
interface RawVocabEntry {
    category    : string;
    id          : string;
    property    : string;
    value       : string;
    label       : string;
    upper_value : string[];
    domain      : string[];
    range       : string[];
    comment     : string;
    deprecated  : boolean;
}

/**
 * Parse and interpret the CSV file's raw content. This is, essentially, just translation of the 
 * CSV file structure into the its internal equivalent representation with only a very few changes:
 * comma separated structures are converted into arrays when applicable, and the  
 * value for 'deprecated' is converted into boolean. See the interface definition of 'RawVocabEntry' for the details.
 * 
 * The result is ephemeral, in the sense that it is then immediately transformed into a proper internal 
 * representation of the vocabulary using the `Vocab` interface. This is done 
 * in a separate function for a better readability of the code.
 * 
 * @param fname File name of the csv file
 * @returns The collection of the row values
 * @async
 */
async function get_vocab(fname: string): Promise<RawVocabEntry[]> {
    const vocab_source = await fs.readFile(fname);
    const vocab = parse(vocab_source, {delimiter: ',', columns: true})

    return vocab.map((entry: Record<string, unknown>): RawVocabEntry => {
         return {
            category    : entry["category"] as string,
            id          : entry["id"] as string,
            property    : entry["property"] as string,
            value       : entry["value"] as string,
            label       : entry["label"] as string,
            domain      : (entry["domain"] as string).split(','),
            upper_value : (entry["upper value"] as string).split(','),
            range       : (entry["range"] as string).split(','),
            comment     : entry["comment"] as string,
            deprecated  : (entry["deprecated"] as string) === "yes",
        };
    });
}

/**
 * The Raw representation is transformed into separate arrays of classes, individuals, prefixes, etc.
 * The column for "category" is the main switch for the interpretation of the individual rows.
 * See the definition of the 'Vocab' interface for more details, as well as the Readme.md for more.
 * 
 * 
 * @param raw_vocab The set of raw vocabulary entries, i.e., the individual rows within the CSV file
 * @returns A properly categorized set of terms and values
 */
function categorize_vocabulary(raw_vocab: RawVocabEntry[]): Vocab {

    // These prefixes are added no matter what; they are not vocabulary specific
    const default_prefixes: RDFPrefix[] = [
        {
            prefix : "dc",
            url    : "http://purl.org/dc/terms/",
        },
        {
            prefix : "owl",
            url    : "http://www.w3.org/2002/07/owl#",
        },
        {
            prefix : "rdf",
            url    : "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        },
        {
            prefix : "rdfs",
            url    : "http://www.w3.org/2000/01/rdf-schema#"
        },
        {
            prefix : "xsd",
            url    : "http://www.w3.org/2001/XMLSchema#"
        }
    ];
    // These ontology properties are added no matter what; they are not vocabulary specific
    const default_ontology_properties: OntologyProperty[] = [
        {
            property : "dc:date",
            value    :  today.toISOString().split('T')[0],
            url      : false
        }
    ]

    // Get the extra prefixes and combine them with the defaults. Note that the 'vocab' category
    // should be added to the list, too, but it needs a special treatment (eg, it is
    // explicitly displayed in the HTML output), hence these
    // values are also stored globally.
    const prefixes: RDFPrefix[] = [
        ...(raw_vocab.filter((entry: RawVocabEntry): boolean => entry.category === "vocab"))
            .map( (entry: RawVocabEntry): RDFPrefix => {
                global.vocab_prefix = entry.id;
                global.vocab_url = entry.value
                return {
                    prefix : entry.id,
                    url    : entry.value,
                }
            }),
        ...(raw_vocab.filter((entry: RawVocabEntry): boolean => entry.category === "prefix"))
            .map( (entry: RawVocabEntry): RDFPrefix => {
                return {
                    prefix : entry.id,
                    url    : entry.value,
                }
            }),
        ...default_prefixes
    ];

    // Get the classes. Note the special treatment for deprecated classes...
    const classes: RDFClass[] = (raw_vocab.filter((entry: RawVocabEntry): boolean => entry.category === "class"))
    .map((entry:RawVocabEntry): RDFClass => {
        return {
            id         : entry.id,
            type       : (entry.deprecated) ? ["rdfs:Class", "owl:DeprecatedClass"] : ["rdfs:Class"],
            subClassOf : entry.upper_value.length === 1 && entry.upper_value[0] === "" ? undefined : entry.upper_value,
            label      : entry.label,
            comment    : entry.comment,
            deprecated : entry.deprecated
        }
    });

    // Get the classes. Note the special treatment for deprecated properties...
    const properties: RDFProperty[] = (raw_vocab.filter((entry: RawVocabEntry): boolean => entry.category === "property"))
    .map((entry:RawVocabEntry): RDFProperty => {
        return {
            id            : entry.id,
            type          : (entry.deprecated) ? ["rdf:Property", "owl:DeprecatedProperty"] : ["rdf:Property"],
            subPropertyOf : entry.upper_value.length === 1 && entry.upper_value[0] === "" ? undefined : entry.upper_value,
            range         : entry.range.length === 1 && entry.range[0] === "" ? undefined : entry.range,
            domain        : entry.domain.length === 1 && entry.domain[0] === "" ? undefined : entry.domain,
            label         : entry.label,
            comment       : entry.comment,
            deprecated    : entry.deprecated
        }
    });

    // Get the individuals. Note that, in this case, the 'type' value may be a full array of types provided in the csv file
    const individuals: RDFIndividual[] = (raw_vocab.filter((entry: RawVocabEntry): boolean => entry.category === "individual"))
    .map((entry: RawVocabEntry): RDFIndividual => {
        return {
            id            : entry.id,
            type          : entry.upper_value.length === 1 && entry.upper_value[0] === "" ? [] : entry.upper_value,
            label         : entry.label,
            comment       : entry.comment,
            deprecated    : entry.deprecated
        }
    });

    // Get the ontology properties
    const ontology_properties: OntologyProperty[] = [
        ...(raw_vocab.filter((entry:RawVocabEntry): boolean => entry.category === "ontology"))
            .map( (entry: RawVocabEntry): OntologyProperty => {
                return {
                    property : entry.property,
                    value    : entry.value,
                    url      : isURL(entry.value)
                }
            }),
        ...default_ontology_properties,
    ];
    return {prefixes, ontology_properties, classes, properties, individuals}
}


/**
 * Conversion of the CSV file into the internal representation of the vocabulary. 
 * This function is just the externally visible shell for the two functions above.
 * 
 * @param filename File name for the CSV file
 * @returns 
 * @async
 */
export async function get_data(filename: string): Promise<Vocab> {
    const raw_vocab: RawVocabEntry[] = await get_vocab(filename);
    return categorize_vocabulary(raw_vocab);    
}
