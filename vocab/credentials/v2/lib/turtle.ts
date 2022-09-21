/**
 * Convert the internal representation of the vocabulary into turtle 
 * (see the 'Vocab' interface).
 * 
 * @packageDocumentation
 */
import { Vocab, global }  from './common';
import { promises as fs } from 'fs';

/**
 * Generate the Turtle representation of the vocabulary.
 * Nothing complex, just a straightforward conversion of the information into the turtle syntax.
 * 
 * @param fname File name for the generated turtle file
 * @param vocab The internal representation of the vocabulary
 * @returns 
 * @async
 */
export function to_turtle(fname: string, vocab: Vocab): Promise<void> {
    // Handling of the domain is a bit complicated due to the usage
    // of the owl:unionOf construct if there are several domains; factored it here to make the 
    // code more readable.
    const multi_domain = (value: string[]): string => {
        if (value.length === 1) {
            return value[0];
        } else {
            return `[ owl:unionOf (${value.join(" ")}) ]`;
        }
    }

    // This is just for symmetry v.a.v. the domain...
    const multi_range = (value: string[]): string => {
        if (value.length === 1) {
            return value[0];
        } else {
            return value.join(", ")
        }
    }

    // This will be the output...
    let turtle = "";

    // Here we go, category by category...
    {
        // Copy-paste (sort of...) the prefix definitions
        for (const prefix of vocab.prefixes) {
            turtle += `@prefix ${prefix.prefix}: <${prefix.url}> .\n`;
        }
        turtle += "\n";
    }

    {
        // Block for the top level ontology entries
        turtle += "# Ontology definition\n";
        turtle += "cred: a owl:Ontology\n";
        for (const ont of vocab.ontology_properties) {
            if (ont.property === 'dc:date') {
                turtle += `    dc:date "${ont.value}"^^xsd:date ;\n`
            } else {
                if (ont.url) {
                    turtle += `    ${ont.property} <${ont.value}> ;\n`;
                } else {
                    turtle += `    ${ont.property} """${ont.value}"""@en ;\n`;
                }
            }
        }
        turtle += ".\n\n"
    }

    if (vocab.classes.length > 0) {
        turtle += "# Class definitions\n"
        for (const cl of vocab.classes) {
            turtle += `${global.vocab_prefix}:${cl.id} a ${cl.type.join(", ")} ;\n`;
            if (cl.deprecated) {
                turtle += `    owl:deprecated true ;\n`;
            }
            if (cl.subClassOf) {
                turtle += `    rdfs:subClassOf ${cl.subClassOf.join(", ")} ;\n`;
            }
            turtle += `    rdfs:label "${cl.label}" ;\n`;
            turtle += `    rdfs:comment """${cl.comment}"""@en ;\n`;
            turtle += `    rdfs:isDefinedBy cred: ;\n`;
            turtle += ".\n\n"
        }
        turtle += "\n\n";    
    }

    if (vocab.properties.length > 0){
        turtle += "# Property definitions\n"
        for (const prop of vocab.properties) {
            turtle += `${global.vocab_prefix}:${prop.id} a ${prop.type.join(", ")} ;\n`;
            if (prop.deprecated) {
                turtle += `    owl:deprecated true ;\n`;
            }
            if (prop.subPropertyOf) {
                turtle += `    rdfs:subPropertyOf ${prop.subPropertyOf.join(", ")} ;\n`;
            }
            if (prop.domain) {
                turtle += `    rdfs:domain ${multi_domain(prop.domain)} ;\n`;
            }
            if (prop.range) {
                turtle += `    rdfs:range ${multi_range(prop.range)} ;\n`;
            }
            turtle += `    rdfs:label "${prop.label}" ;\n`;
            turtle += `    rdfs:comment """${prop.comment}"""@en ;\n`;
            turtle += `    rdfs:isDefinedBy cred: ;\n`;
            turtle += ".\n\n";
        }
    }

    if (vocab.individuals.length > 0) {
        turtle += "# Definitions of individuals\n"
        for (const ind of vocab.individuals) {
            turtle += `${global.vocab_prefix}:${ind.id} a ${ind.type.join(", ")} ;\n`;
            if (ind.deprecated) {
                turtle += `    owl:deprecated true ;\n`;
            }
            turtle += `    rdfs:label "${ind.label}" ;\n`;
            turtle += `    rdfs:comment """${ind.comment}"""@en ;\n`;
            turtle += `    rdfs:isDefinedBy cred: ;\n`;
            turtle += ".\n\n";
        }
    }

    return fs.writeFile(fname, turtle, 'utf-8');
}
