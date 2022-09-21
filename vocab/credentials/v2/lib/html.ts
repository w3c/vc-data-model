/**
 * Convert the internal representation of the vocabulary into HTML 
 * (see the 'Vocab' interface).
 * 
 * @packageDocumentation
 */
import { Vocab, global }  from './common';
import { JSDOM }          from 'jsdom';
import { promises as fs } from 'fs';

/* ---------------- Utility functions ------------------------- */
/**
 * Add a new HTML Element to a parent, and return the new element
 * 
 * @param parent The parent HTML Element
 * @param element The new element's name
 * @param content The new element's (HTML) content
 * @returns the new element
 * 
 * @internal
 */
 const add_child = (parent: HTMLElement, element: string, content: string|undefined = undefined): HTMLElement => {
    const new_element = parent.ownerDocument.createElement(element);
    parent.appendChild(new_element);
    if (content !== undefined) new_element.innerHTML = content;
    return new_element;
}

/**
 * Add some text to an element, including the obligatory checks that Typescript imposes
 * 
 * @param content text to add
 * @param element HTML Element to add it to
 * @returns 
 */
const add_text = (content: string, element: HTMLElement|null): HTMLElement|null => {
    if (element) {
        element.textContent = content
    }
    return element;
}

/**
 * Generate a new bnode id for the "union of" constructs...
 */
let idnum = 0;
const bnode = (): string => {
    const retval = `_:a${idnum}`;
    idnum++;
    return retval
}


/**
 * Generate the HTML representation of the vocabulary, based on an HTML template file. The
 * template file is parsed to create a DOM, which is manipulated using the standard
 * DOM calls before stored.
 * 
 * The template files have element with a predefined `@id` value at all points where some
 * content must be added. Ie, the usual model in the code below is:
 * 
 * const some_element = document.getElementById('namespaces');
 * manipulate the subtree at 'some_element' to add content
 * 
 * The current version adds a bunch of properties to the HTML to make it also RDFa, ie,
 * that the vocabulary can be extracted by an RDFa distiller. I am not sure it is all
 * that useful and it complicates the code; at some point we may decide to remove this.
 * 
 * @param fname File name for the generated HTML file 
 * @param template File name of the template file 
 * @param vocab The internal representation of the vocabulary
 * @returns
 * @async 
 */
export async function to_html(fname: string, template: string, vocab: Vocab): Promise<void> {
    // Get the DOM of the template
    const template_text = await fs.readFile(template, 'utf-8');
    const document = (new JSDOM(template_text)).window.document;

    // The prefix and the URL for the vocabulary itself
    // I am just lazy to type things that are too long... :-)
    const vocab_prefix = global.vocab_prefix;
    const vocab_url    = global.vocab_url;

    {
        // RDFa preamble. If, at some point, we decide that the RDFa part is superfluous, this block can be removed.
        const body = document.getElementsByTagName('body')[0];
        if (body) {
            body.setAttribute('resource',vocab_url);
            body.setAttribute('prefix',  vocab.prefixes.map( (value): string => `${value.prefix}: ${value.url}`).join(' ')  )    
        }    
    }    

    {
        // Get some generic metadata for the vocabulary that are part of the template text
        // These come from the ontology properties of the vocabulary.
        try {
            const title = vocab.ontology_properties.filter((property): boolean => property.property === 'dc:title')[0].value;
            add_text(title, document.getElementsByTagName('title')[0]);
            add_text(title, document.getElementById('title'));    
        } catch(e) {
            console.log("Vocabulary warning: title is not provided.")
        }

        const date = vocab.ontology_properties.filter((property): boolean => property.property === 'dc:date')[0].value;
        add_text(date, document.getElementById('time'));

        try {
            const description = vocab.ontology_properties.filter((property): boolean => property.property === 'dc:description')[0].value;
            add_text(description, document.getElementById('description'));    
        } catch(e) {
            console.log("Vocabulary warning: description is not provided.")
        }

        try {
            const see_also = vocab.ontology_properties.filter((property): boolean => property.property === 'rdfs:seeAlso')[0].value;
            const target = document.getElementById('see_also');
            if (target) {
                const a = add_child(target, 'a', see_also)
                a.setAttribute('href', see_also);
                a.setAttribute('property', 'rdfs:seeAlso')
            }
        } catch(e) {
            console.log("Vocabulary warning: no reference to specification provided.")
        }
    }

    {
        // There is a separate list in the template for all the namespaces used by the vocabulary
        // The prefix part of the vocabulary is just for that.
        const ns_dl = document.getElementById('namespaces');
        if (ns_dl) {
            for (const ns of vocab.prefixes) {
                const dt = add_child(ns_dl, 'dt');
                add_child(dt, 'code', ns.prefix);
                const dd = add_child(ns_dl, 'dd');
                add_child(dd, 'code', ns.url);
            }
        }
    }

    {
        // Generation of the section content for classes: a big table, with a row per class
        // There is a check for a possible template error and also whether there are class
        // definitions in the first place.
        //
        // The generated DOM nodes get a bunch of RDFa properties (typeof, resource, property,...)
        // that makes things fairly confusing :-(
        const section = document.getElementById('class_definitions');
        if (section) {
            if (vocab.classes.length > 0) {
                add_child(section, 'p', `The following are class definitions in the <code>${vocab_prefix}</code> namespace:`)
                const table = add_child(section, 'table');
                table.className = 'rdfs-definition simple';

                for (const item of vocab.classes) {
                    // Each item has its own row in the table
                    const tr = add_child(table, 'tr');
                    const td1 = add_child(tr, 'td', item.id);
                    td1.className = 'bold';
                    td1.id = item.id

                    const td2 = add_child(tr, 'td');
                    td2.setAttribute('typeof', item.deprecated ? 'rdfs:Class owl:DeprecatedClass' : 'rdfs:Class');
                    td2.setAttribute('resource',`${vocab_prefix}:${item.id}`);
                    const em = add_child(td2, 'em',item.label);
                    em.setAttribute('property', 'rdfs:label');
                    if (item.deprecated) {
                        const dspan = add_child(td2, 'span');
                        dspan.className = 'bold';
                        add_child(dspan, 'em', ' (deprecated)');
                    }
                    const p = add_child(td2, 'p', item.comment);
                    p.setAttribute('property', 'rdfs:comment');

                    const span = add_child(td2, 'span');
                    span.setAttribute('property', 'rdfs:isDefinedBy');
                    span.setAttribute('resource', `${vocab_prefix}:`);

                    if (item.deprecated) {
                        const dspan = add_child(td2, 'span');
                        dspan.setAttribute('property', 'owl:deprecated');
                        dspan.setAttribute('datatype', 'xsd:boolean');
                        dspan.style.display = 'none';
                        add_text('true', dspan);
                    }
                    
                    // Extra list of superclasses, if applicable
                    if (item.subClassOf && item.subClassOf.length > 0) {
                        const dl = add_child(td2, 'dl');
                        dl.className = 'terms'
                        add_child(dl, 'dt', 'subClassOf')
                        const dd = add_child(dl, 'dd');
                        for (const superclass of item.subClassOf) {
                            const code = add_child(dd, 'code', superclass)
                            code.setAttribute('property', 'rdfs:subClassOf');
                            code.setAttribute('resource', superclass);
                            add_child(dd, 'br')
                        }
                    }
                }
            } else {
                // Remove section from the DOM
                if (section.parentElement) section.parentElement.removeChild(section);
            }
        }  else {
            console.log("Template error: no section prepared for classes!")
        }
    }

    {
        // Generation of the section content for properties: a big table, with a row per property
        // There is a check for a possible template error and also whether there are properties
        // definitions in the first place.
        //
        // The generated DOM nodes get a bunch of RDFa properties (typeof, resource, property,...)
        // that makes things fairly confusing :-(
            const section = document.getElementById('property_definitions');
        if (section) {
            if (vocab.properties.length > 0) {
                add_child(section, 'p', `The following are property definitions in the <code>${vocab_prefix}</code> namespace:`)
                const table = add_child(section, 'table');
                table.className = 'rdfs-definition simple';

                for (const item of vocab.properties) {
                    // Each item has its own row in the table
                    const tr = add_child(table, 'tr');
                    const td1 = add_child(tr, 'td', item.id);
                    td1.className = 'bold';
                    td1.id = item.id

                    const td2 = add_child(tr, 'td');
                    td2.setAttribute('typeof', item.deprecated ? 'rdf:Property owl:DeprecatedProperty' : 'rdfs:Class');
                    td2.setAttribute('typeof', 'rdf:Property');
                    td2.setAttribute('resource',`${vocab_prefix}:${item.id}`);
                    const em = add_child(td2, 'em',item.label);
                    em.setAttribute('property', 'rdfs:label');
                    if (item.deprecated) {
                        const dspan = add_child(td2, 'span');
                        dspan.className = 'bold';
                        add_child(dspan, 'em', ' (deprecated)');
                    }
                    const p = add_child(td2, 'p', item.comment);
                    p.setAttribute('property', 'rdfs:comment');

                    const span = add_child(td2, 'span');
                    span.setAttribute('property', 'rdfs:isDefinedBy');
                    span.setAttribute('resource', `${vocab_prefix}:`);

                    if (item.deprecated) {
                        const dspan = add_child(td2, 'span');
                        dspan.setAttribute('property', 'owl:deprecated');
                        dspan.setAttribute('datatype', 'xsd:boolean');
                        dspan.style.display = 'none';
                        add_text('true', dspan);
                    }

                    // Extra list of superproperties, if applicable
                    if (item.subPropertyOf && item.subPropertyOf.length > 0) {
                        const dl = add_child(td2, 'dl');
                        dl.className = 'terms'
                        add_child(dl, 'dt', 'subPropertyOf')
                        const dd = add_child(dl, 'dd');
                        for (const superproperty of item.subPropertyOf) {
                            const code = add_child(dd, 'code', superproperty)
                            code.setAttribute('property', 'rdfs:subPropertyOf');
                            code.setAttribute('resource', superproperty);
                            add_child(dd, 'br');
                        }
                    }

                    // Again an extra list for range/domain definitions, if applicable
                    if ((item.range && item.range.length > 0) || (item.domain && item.domain.length > 0)) {
                        const dl = add_child(td2, 'dl');
                        dl.className = 'terms';

                        if (item.range && item.range.length > 0) {
                            add_child(dl, 'dt', 'rdfs:range');
                            const dd = add_child(dl, 'dd');
                            if (item.range.length === 1) {
                                dd.setAttribute('resource',item.range[0])
                                add_child(dd, 'code', item.range[0]);
                            } else {
                                add_text('Intersection of:', dd)
                                add_child(dd, 'br')
                                for (const entry of item.range) {
                                    const r_span = add_child(dd, 'span')
                                    r_span.setAttribute('resource', entry);
                                    add_child(r_span, 'code', ` ${entry}`);
                                    add_child(dd, 'br')
                                }
                            }
                        }
                        if (item.domain && item.domain.length > 0) {
                            add_child(dl, 'dt', 'rdfs:domain');
                            const dd = add_child(dl, 'dd');
                            dd.setAttribute('property', 'rdfs:domain')
                            if (item.domain.length === 1) {
                                dd.setAttribute('resource',item.domain[0])
                                add_child(dd, 'code', item.domain[0]);
                            } else {
                                // The union-of list is to be enclosed in a bnode in RDF
                                // this has to be added to the RDFa manually...
                                const u_bnode = bnode();
                                dd.setAttribute('resource', u_bnode)
                                add_text('Union of: ', dd);
                                add_child(dd, 'br')
                                for (const entry of item.domain) {
                                    const sp = add_child(dd, 'span');
                                    sp.setAttribute('about', u_bnode);
                                    sp.setAttribute('inlist', 'true');
                                    sp.setAttribute('property', 'owl:unionOf');
                                    sp.setAttribute('resource', entry);
                                    add_child(sp, 'code', ` ${entry}`);
                                    add_child(dd, 'br')
                                }
                            }
                        }
                    }
                }
            } else {
                if (section.parentElement) section.parentElement.removeChild(section);
            }
        } else {
            console.log("Template error: no section prepared for properties!")
        }
    }

    {
        // Generation of the section content for individuals: a big table, with a row per individual
        // There is a check for a possible template error and also whether there are individual
        // definitions in the first place.
        //
        // The generated DOM nodes get a bunch of RDFa properties (typeof, resource, property,...)
        // that makes things fairly confusing :-(
        const section = document.getElementById('individual_definitions');
        if (section) {
            if (vocab.individuals.length > 0) {
                add_child(section, 'p', `The following are definitions for individuals in the <code>${vocab_prefix}</code> namespace:`)
                const table = add_child(section, 'table');
                table.className = 'rdfs-definition simple';
                for (const item of vocab.individuals) {
                    const tr = add_child(table, 'tr');
                    const td1 = add_child(tr, 'td', item.id);
                    td1.className = 'bold';
                    td1.id = item.id

                    const td2 = add_child(tr, 'td');
                    td2.setAttribute('typeof', `${item.type}`);
                    td2.setAttribute('resource',`${vocab_prefix}:${item.id}`);
                    const em = add_child(td2, 'em',item.label);
                    em.setAttribute('property', 'rdfs:label');
                    if (item.deprecated) {
                        const dspan = add_child(td2, 'span');
                        dspan.className = 'bold';
                        add_child(dspan, 'em', ' (deprecated)');
                    }
                    const p = add_child(td2, 'p', item.comment);
                    p.setAttribute('property', 'rdfs:comment');

                    const span = add_child(td2, 'span');
                    span.setAttribute('property', 'rdfs:isDefinedBy');
                    span.setAttribute('resource', `${vocab_prefix}:`);

                    const dl = add_child(td2, 'dl');
                    dl.className = 'terms';
                    if (item.type.length > 0) {
                        add_child(dl, 'dt', 'Type')
                        const dd = add_child(dl, 'dd');
                        for (const itype of item.type) {
                            add_child(dd, 'code', itype);
                            add_child(dd, 'br')    
                        }
                    }
                }
            } else {
                // removing the section from the DOM
                if (section.parentElement) section.parentElement.removeChild(section);
            }
        } else {
            console.log("Template error: no section prepared for individuals!")
        }
    }

    // That is it... generate the output
    // I wish it was possible to generate a properly formatted HTML source, but I am not sure how to do that
    const output = `<!DOCTYPE html>\n<html>${document.documentElement.innerHTML}</html>`
    return fs.writeFile(fname, output, 'utf-8')
}



