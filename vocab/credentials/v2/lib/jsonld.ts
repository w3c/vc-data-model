/**
 * Convert the internal representation of the vocabulary into JSON-LD 
 * (see the 'Vocab' interface).
 * 
 * @packageDocumentation
 */

import { Vocab, global, text_comment, RDFTerm, Link } from './common';
import { promises as fs }                             from 'fs';

// Generic context. All items may not be used in a specific vocabulary, but it
// is not harmful to have them here.
const generic_context = {
    "dc:title":                 { "@container": "@language" },
    "dc:description":           { "@container": "@language" },
    "dc:date":                  { "@type": "xsd:date" },
    "rdfs:comment":             { "@container": "@language" },
    "rdfs:domain":              { "@type": "@id" },
    "rdfs:label":               { "@container": "@language" },
    "rdfs:range":               { "@type": "@id" },
    "rdfs:seeAlso":             { "@type": "@id" },
    "rdfs:subClassOf":          { "@type": "@id" },
    "rdfs:subPropertyOf":       { "@type": "@id" },
    "owl:equivalentClass":      { "@type": "@vocab" },
    "owl:equivalentProperty":   { "@type": "@vocab" },
    "owl:oneOf":                { "@container": "@list", "@type": "@vocab" },
    "owl:deprecated":           { "@type": "xsd:boolean" },
    "owl:imports":              { "@type": "@id" },
    "owl:versionInfo":          { "@type": "@id" },
    "owl:inverseOf":            { "@type": "@vocab" },
    "owl:unionOf":              { "@type": "@vocab", "@container": "@list" },
    "rdfs_classes":             { "@reverse": "rdfs:isDefinedBy", "@type": "@id" },
    "rdfs_properties":          { "@reverse": "rdfs:isDefinedBy", "@type": "@id" },
    "rdfs_instances":           { "@reverse": "rdfs:isDefinedBy", "@type": "@id" },
}

/**
 * Generate the JSON-LD representation of the vocabulary.
 * 
 * The function does not generate JSON-LD directly; instead, a standard JS object
 * is generated and the built-in JSON serializer takes care of the idiosyncrasies of 
 * the JSON syntax.
 * 
 * There is one neat trick in the generated code: the JSON-LD code, usually, 
 * becomes very complicated if the structure is not a tree. This problem is handled here 
 * by the repeated usage of reverse properties that put, in the JSON sense, 
 * the vocabulary itself on the top, linked to the individual terms via a 
 * (reversed) rdfs:isDefinedBy. (See the definition of the 'rdfs_classes', 
 * 'rdfs_properties', and 'rdfs_instances'). Thanks to Gregg Kellogg for that trick...
 * 
 * 
 * @param fname File name for the generated JSON-LD file
 * @param vocab The internal representation of the vocabulary
 * @returns
 * @async 
 */
export function to_jsonld(fname: string, vocab: Vocab): Promise<void> {
    // Handling of the domain is a bit complicated due to the usage
    // of the owl:unionOf construct; factored it here to make the 
    // code more readable.
    const multi_domain = (value: string[]): any => {
        if (value.length === 1) {
            return value[0];
        } else {
            return {
                "owl:unionOf": value
            };
        }
    }

    // This is just for symmetry v.a.v. the domain...
    const multi_range = (value: string[]): any => {
        if (value.length === 1) {
            return value[0];
        } else {
            return value;
        }
    }
 
    // This is the target object
    const jsonld: any = {}

    // Factoring out the common fields
    const common_fields = (target: any, entry: RDFTerm): void => {
        target["rdfs:label"] = {
            "en" : entry.label
        }
        target["rdfs:comment"] = {
            "en" : text_comment(entry.comment),
        }
        if (entry.see_also && entry.see_also.length > 0) {
            const urls = entry.see_also.map( (link: Link): string => link.url);
            target["rdfs:seeAlso"] = urls;
        }
    }

    // Creation of the context: take the prefixes from the vocabulary definition
    // and add the generic context
    {
        let context: any = {};
        for (const prefix of vocab.prefixes) {
            context[prefix.prefix] = prefix.url
        }
        context = {...context, ...generic_context};
        jsonld["@context"] = context;
    }

    // That is the core: the ID of the ontology itself!
    jsonld["@id"] = global.vocab_url;
    
    // Here we go, category by category...
    {
        // The Ontology properties are all top level...
        jsonld["@type"] = "owl:Ontology";
        for (const ont of vocab.ontology_properties) {
            if (ont.property === 'dc:date' || ont.url) {
                jsonld[ont.property] = ont.value;
            } else {
                jsonld[ont.property] = {
                    en : ont.value
                }
            }
        }
    }

    {
        // Get the classes
        const classes: any[] = [];
        for (const cl of vocab.classes) {
            const cl_object: any = {};
            cl_object["@id"]   = `${global.vocab_prefix}:${cl.id}`;
            if (cl.type.length === 1) {
                cl_object["@type"] = cl.type[0]
            } else {
                cl_object["@type"] = cl.type;
            }
            if (cl.deprecated) {
                cl_object["owl:deprecated"] = true
            }
            if (cl.subClassOf) {
                cl_object["rdfs:subClassOf"] = cl.subClassOf;
            }
            common_fields(cl_object,cl);
            classes.push(cl_object)
        }
        if (classes.length > 0) jsonld.rdfs_classes = classes;
    }

    {

        // Get the properties
        const properties: any[] = [];
        for (const prop of vocab.properties) {
            const pr_object: any = {}
            pr_object["@id"]   = `${global.vocab_prefix}:${prop.id}`;
            if (prop.type.length === 1) {
                pr_object["@type"] = prop.type[0]
            } else {
                pr_object["@type"] = prop.type;
            }
            if (prop.deprecated) {
                pr_object["owl:deprecated"] = true
            }
            if (prop.subPropertyOf) {
                pr_object["rdfs:subPropertyOf"] = prop.subPropertyOf;
            }
            if (prop.domain) {
                pr_object["rdfs:domain"] = multi_domain(prop.domain);
            }
            if (prop.range) {
                pr_object["rdfs:range"] = multi_range(prop.range);
            }
            common_fields(pr_object,prop);
            properties.push(pr_object);
        }
        if (properties.length > 0) jsonld.rdfs_properties = properties;
    }

    {
        // Get the individuals
        const individuals: any[] = [];
        for (const ind of vocab.individuals) {
            const ind_object: any = {}
            ind_object["@id"]   = `${global.vocab_prefix}:${ind.id}`;
            if (ind.type.length === 1) {
                ind_object["@type"] = ind.type[0]
            } else {
                ind_object["@type"] = ind.type;
            }
            if (ind.deprecated) {
                ind_object["owl:deprecated"] = true
            }
            common_fields(ind_object,ind);
            individuals.push(ind_object);
        }
        if (individuals.length > 0) jsonld.rdfs_individuals = individuals;
    }

    return fs.writeFile(fname, JSON.stringify(jsonld, null, 4),'utf-8');
}
