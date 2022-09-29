/**
 * Common types and variables.
 * 
 * @packageDocumentation
 */


/**
 * Placeholder for global data. At the moment, the only thing
 * it holds is the prefix and the URL of the URL that is being 
 * handled/
 */
export interface Global {
    vocab_prefix : string;
    vocab_url    : string;
}

export const global = {
    vocab_prefix : "",
    vocab_url    : ""
} 

export interface Link {
    label : string;
    url   : string;
}

/**
 * Top level class for a term in general. Pretty much self-explanatory...
 */
export interface RDFTerm {
    id          : string;
    type        : string[];
    label       : string;
    comment     : string;
    see_also   ?: Link[];
    deprecated ?: boolean;
}

/**
 * Extra information necessary for a class: its superclasses.
 * None is required.
 */
export interface RDFClass extends RDFTerm {
    subClassOf ?: string[];
}

/**
 * Extra information necessary for a property: its superproperties, range, and domain.
 * None of these are required.
 */
export interface RDFProperty extends RDFTerm {
    subPropertyOf ?: string[];
    domain        ?: string[];
    range         ?: string[];
}

/**
 * No extra information is necessary for an individual, but it makes the code
 * more readable if there is a separate interface for it.
 */
export interface RDFIndividual extends RDFTerm {
}

/**
 * Information for a prefix (to be used either as a prefix in Turtle or in the context of a JSON-LD).
 */
export interface RDFPrefix {
    prefix : string;
    url    : string;
}

/**
 * Information for the ontology properties, i.e., properties that are defined on the top level. 
 * 
 * The third value (url) indicates whether the property is a URL value. For values extracted from the CSV
 * this is decided by checking whether the string can be considered to be a valid URL or not.
 */
export interface OntologyProperty {
    property : string;
    value    : string;
    url      : boolean;
}

/**
 * A vocabulary consists of prefixes, top level (ontology) properties, classes, properties and,
 * possibly, individuals…
 */
export interface Vocab {
    prefixes            : RDFPrefix[],
    ontology_properties : OntologyProperty[]
    classes             : RDFClass[],
    properties          : RDFProperty[],
    individuals         : RDFIndividual[],
}


/* ------------------------ Utility functions used by the various serializers... ------------------- */
import { JSDOM } from 'jsdom';

/**
 * Turn a text field with HTML tags and line breaks into a single text.
 * 
 * @param text 
 * @returns transformed text
 */
export function text_comment(text: string): string {
    /** Remove the HTML tags */
    const de_html  = (txt: string): string => {
        const dom = new JSDOM(`<!DOCTYPE html><section>${txt}</section>`);
        if (dom) {
            const p = dom.window.document.querySelector("section");
            const retval = p?.textContent;
            return (retval) ? retval : ""; 
        } else {
            return ""
        }    
    };
    /** Turn the line feed characters into spaces */
    const de_break = (txt: string): string => {
        const regex = /\\n/g;
        return txt.replace(regex, ' ');
    };

    const pure_txt = de_html(text);
    return de_break(pure_txt);
}

