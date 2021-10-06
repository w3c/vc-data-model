/**
 * Customized built-in element, extending the `<nav>` element, for the generation of a
 * table of content (ToC). The table of content is collected from `<section>` elements
 * that have a heading element (if there are several, the first one is taken).
 *
 * See the separate README.md for details.
 *
 */

/* eslint-env browser */

/**
 * Generate a ToC structure for the current document.
 *
 * @param {HTMLElement} target The element that will hold the TOC entries.
 * @param {Integer} max_depth The maximum depth of the hierarchy into the TOC. 0 or negative means no limit.
 * @param {String} id_prefix The string used to as a prefix for generated id values
 * @param {Boolean} generate_counter Whether the section header and the toc entries should be automatically numbered.
 * @param {Boolean} dynamic whether the ToC should be dynamic or not
 * @param {Boolean} use_section whether the ToC should be retrieved from the sections or directly from the headers
 */
function generateToC(target, max_depth, id_prefix, generate_counter, dynamic, use_sections) {
    /**
     * Event handler: switch between the 'tocvisible' and 'tochidden' classnames
     *
     * @param {Event} e
     */
    const change_visibility = (e) => {
        const className = e.target.className.split(' ');
        const newClassName = className.map((c) => {
            switch (c) {
                case 'tocvisible': return 'tochidden';
                case 'tochidden': return 'tocvisible';
                default: return c;
            }
        }).join(' ');
        // alert(newClassName);
        e.target.className = newClassName;
    };

    /**
     * Display the numbering values in the form of '1.2.3.4'
     *
     * @param {Array} prefix array of numbers representing the number values from the parent. Maybe empty.
     * @param {Number} last number of the last value
     */
    const getHeaderNumber = (prefix, last) => {
        if (prefix.length === 0) {
            return last.toString();
        } else {
            return `${prefix.map((n) => n.toString()).join('.')}.${last.toString()}`;
        }
    };

    /**
     * Create the data structure used for the creation of the TOC. This function extracts this structure
     * from `<h1>`, `<h2>`,…,`<h6>` elements
     *
     * The core of the procedure: goes through the immediate `<section>` children of the `current` layer
     * (i.e., the top level `<body>` or `<main>`), gets the header, gets or, possibly, sets the `id`
     * attribute, and generate data structure of the form:
     *
     * * `href`      : the `@id` value of the target, to be used for the link
     * * `name`      : the text of the header, to be used in as the link text in the toc
     * * `counter`   : the counter value for the TOC, to be used, if requested, in the TOC
     * * `tochidden` : whether the `@data-tochidden` attribute is set for the header
     * * `children`  : the possible children structures as an array. This is a recursive call.
     *
     * The `@id` attribute is added to the section element itself (if needed) and the text
     * is modified with the counter number, if requested.
     *
     * @param {HTMLElement} current where to look for suitable sections
     * @returns {Array} array of ToC structures
     */
    const getTocFromHeaders = (start) => {
        /**
         * This is where the real action happens, as described for `getTocFromHeaders`. The rest of the main
         * function is just to establish the list of headers.
         * @param {Array} heads Array of structures containing the header elements and their 'level'. Not that, for
         * convenience, this array is reversed, ie, consumed from the end backwards.
         * @param {Array} counters Array of upper level counters.
         */
        const one_level = (heads, counters) => {
            const toc = [];
            let current_header = heads.pop();
            // This is an anomaly in the input, but better be cautious
            if (current_header === undefined) return toc;

            /** 'num' is the number variable for the toc entries (on one level); added to the values in `current` */
            let num = 0;

            const level = current_header.level;
            for (; current_header !== undefined; current_header = heads.pop()) {
                // The current header structure should be expanded with the id value, to be set on the elements later...
                num += 1;
                const header_number = getHeaderNumber(counters, num);

                // Get the 'id' for the section
                let id = current_header.element.id;
                // if no id is set on the header, add one
                if (id === '') {
                    id = `${id_prefix}_${header_number}`;
                    current_header.element.id = id;
                }

                // Get the link text; possibly modify the original with the counter value (if requested)
                let text = current_header.element.textContent;
                if (generate_counter) {
                    current_header.element.textContent = `${header_number}. ${text}`;
                    text = ` ${text}`;
                }

                const toc_structure = {
                    href      : id,
                    name      : text,
                    counter   : header_number,
                    tochidden : current_header.element.hasAttribute('data-tochidden'),
                    children  : []
                };
                toc.push(toc_structure);

                if (heads.length === 0) break;

                // See what the next level is, ie, whether we need to switch in the hierarchy
                if (heads[heads.length - 1].level > level) {
                    // e.g., switching from h2 to h3: go 'down'
                    // the return should provide the children
                    toc_structure.children = one_level(heads, counters.concat([num]));
                }

                // The previous step may have changed the 'heads' array, i.e., this check must be
                // independent of the previous.
                // Check whether the current level's streak is at its end.
                if (heads.length === 0 || heads[heads.length - 1].level < level) break;
            }
            return toc;
        };

        const notoc = ':not([data-notoc])';
        const main_selector = `h1${notoc}, h2${notoc}, h3${notoc}, h4${notoc}, h5${notoc}, h6${notoc}`;
        // Note the 'reverse' at the end. This makes it possible to get to the successive header elements using 'pop'.
        const headers = Array.from(start.querySelectorAll(main_selector)).map((header) => ({
            element : header,
            level   : header.tagName[1] * 1
        })).reverse();
        return one_level(headers, []);
    };

    /**
     * Create the data structure used for the creation of the TOC. This function extracts this structure
     * from `<section>` elements with headers.
     *
     * The core of the procedure: goes through the immediate `<section>` children of the `current` layer
     * (i.e., the top level `<body>` or `<main>`), gets the header, gets or, possibly, sets the `id`
     * attribute, and generate data structure of the form:
     *
     * * `href`      : the `@id` value of the target, to be used for the link
     * * `name`      : the text of the header, to be used in as the link text in the toc
     * * `counter`   : the counter value for the TOC, to be used, if requested, in the TOC
     * * `tochidden` : whether the `@data-tochidden` attribute is set for the header
     * * `children`  : the possible children structures as an array. This is a recursive call.
     *
     * The `@id` attribute is added to the section element itself (if needed) and the text
     * is modified with the counter number, if requested.
     *
     * @param {HTMLElement} start where to look for suitable sections
     * @returns {Array} array of ToC structures
     */
    const getTocFromSections = (start) => {
        /**
         * This is where the real action happens, as described for `getTocFromSections`. The rest of the main
         * function is just to establish the list of headers.
         * @param {HTMLElement} current where to look for suitable sections
         * @param {Array} counters Array of upper level counters.
         */
        const one_level = (current, counters) => {
            // See if we have reached the maximum depth; if so, no more toc
            if (max_depth > 0 && counters.length + 1 > max_depth) return [];

            /** 'num' is the number variable for the toc entries (on one level); added to the values in `current` */
            let num = 0;

            /**
             * The array of structures for the TOC entries
             */
            const toc = [];

            // note the selector that takes care of the notoc attribute!
            current.querySelectorAll('section:not([data-notoc])').forEach((section) => {
                // Only a direct child counts...
                if (section.parentElement !== current) return;

                // getting the first header-like element in the section
                const header = section.querySelector('h1, h2, h3, h4, h5, h6');

                // if there is no such header, or it is not a direct child, then break the cycle,
                // i.e., this section is ignored for the ToC
                if (header === undefined || header.parentElement !== section) return;

                // Calculate the full counter value for numbering
                num += 1;
                const header_number = getHeaderNumber(counters, num);

                // Get the 'id' for the section
                let id = section.id;
                // if no id is set on the section, add one
                if (id === '') {
                    id = `${id_prefix}_${header_number}`;
                    section.id = id;
                }

                // Get the link text; possibly modify the original with the counter value (if requested)
                let text = header.textContent;
                if (generate_counter) {
                    header.textContent = `${header_number}. ${text}`;
                    text = ` ${text}`;
                }

                const toc_structure = {
                    href      : id,
                    name      : text,
                    counter   : header_number,
                    tochidden : section.hasAttribute('data-tochidden'),
                    children  : one_level(section, counters.concat([num]))
                };

                // Add the new entry to the list of ToC links.
                toc.push(toc_structure);
            });

            return toc;
        };
        return one_level(start, []);
    };

    /**
     * Generate the TOC, using the toc structure. It generates a hierarchy of `<ul>` elements, putting
     * the (possible) into a separate `<span>`. In case of a dynamic menu, the latter get specific
     * class names (see general description) and is target to a click even to change that class name.
     *
     * The function is recursive, insofar as the children ToC hierarchy leads to a recursive call to create
     * the corresponding embedded `<ul>`.
     *
     * @param {HTMLElement} toc_target where to put the generated TOC
     * @param {Array} array of ToC structures, to be converted into HTML
     * @param {Integer} level level in the hierarchy, used to set a class value
     */
    const generate_toc = (toc_target, toc_structure, level) => {
        if (toc_structure.length === 0) return;
        const ul = document.createElement('ul');
        ul.className = `toc toclevel${level}`;
        toc_target.append(ul);
        toc_structure.forEach((toc_entry) => {
            // This is the rough structure, to be greatly refined!!!!!
            const li = document.createElement('li');
            const a = document.createElement('a');
            const span = document.createElement('span');

            // If the counter option is set, the number is used for a 'span'
            if (generate_counter) {
                span.className = 'tocnumber';
                span.textContent = `${toc_entry.counter}.`;
                li.append(span);
            }

            a.setAttribute('href', `#${toc_entry.href}`);
            a.textContent = toc_entry.name;
            a.className = 'tocitem';
            li.append(a);

            // see if there are children; if so, a recursion takes place, but the dynamic
            // structure is also generated
            if (toc_entry.children.length > 0) {
                generate_toc(li, toc_entry.children, level + 1);
                if (dynamic) {
                    // note that if the dynamic flag is set, it implies the display of counters
                    span.className = toc_entry.tochidden ? 'tocnumber tochidden' : 'tocnumber tocvisible';
                    span.addEventListener('click', change_visibility);
                }
            }
            ul.append(li);
        });
    };

    // The top level to look for the headers is either the body element or, if it exists, the (first) main element.
    const body = document.querySelector('body');
    if (body === undefined) return;
    const start = body.querySelector('main') || body;
    const full_toc = (use_sections ? getTocFromSections : getTocFromHeaders)(start);
    // console.log(JSON.stringify(full_toc, null, 4));
    generate_toc(target, full_toc, 1);
}

/**
 * Main handler to generate the ToC. Looks for a `<nav>` element where the ToC should go, extracts
 * the options from the `data-options` attributes, and calls out to the main entry point above,
 * i.e., `generateToC`.
 */
function handleDocToc() {
    const nav = document.querySelector('nav[role *= "doc-toc"]');

    if (nav !== undefined) {
        let use_sections = false;
        let dynamic = false;
        let generate_counters = true;
        let max_depth = 0;
        let prefix = 'section';

        const dataset = nav.dataset;
        const options = dataset.options ? dataset.options.split(' ') : [];
        options.forEach((option) => {
            if (option === 'use_sections') {
                use_sections = true;
            } else if (option === 'dynamic') {
                dynamic = true;
            } else if (option === 'suppress_counters') {
                generate_counters = false;
            } else if (option.startsWith('max_depth')) {
                try {
                    max_depth = option.split('=')[1] * 1;
                } catch (error) {
                    ;
                }
            } else if (option.startsWith('prefix')) {
                try {
                    prefix = option.split('=')[1];
                } catch (error) {
                    ;
                }
            }
        });
        generateToC(nav, max_depth, prefix, generate_counters, dynamic, use_sections);
    }
}
// window.addEventListener('load', handleDocToc);

/* -------------------------- This has been added to the original code to be used in a backward compatible way with existing errata deployments */

/**
 * Main handler to generate the ToC. Looks for a `<nav>` element where the ToC should go, extracts
 * the options from the `data-options` attributes, and calls out to the main entry point above,
 * i.e., `generateToC`.
 */
function simplifiedHandleDocToc() {
    const nav = document.querySelector('div#toc');
    if (nav !== undefined) {
        let use_sections = true;
        let dynamic = false;
        let generate_counters = true;
        let max_depth = 0;
        let prefix = 'section';
        generateToC(nav, max_depth, prefix, generate_counters, dynamic, use_sections);
    }
}

window.addEventListener('load', simplifiedHandleDocToc);
