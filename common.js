/* globals omitTerms, respecConfig, $, require */
/* exported linkCrossReferences, restrictReferences, fixIncludes */

var vcwg = {
  // Add as the respecConfig localBiblio variable
  // Extend or override global respec references
  localBiblio: {
    "VC-SPECS": {
      title: "Verifiable Credential Specifications Directory",
      href: "https://w3c.github.io/vc-specs-dir/",
      authors: [
        "Manu Sporny"
      ],
      status: "ED",
      publisher: "W3C Verifiable Credentials Working Group"
    },
    "STRING-META": {
      title: "Strings on the Web: Language and Direction Metadata",
      href: "https://www.w3.org/TR/string-meta/",
      authors: [
        "Addison Phillips",
        "Richard Ishida"
      ],
      status: "WD",
      publisher: "Internationalization Working Group"
    },
    "VC-DATA-INTEGRITY": {
      title: "Verifiable Credential Data Integrity",
      href: "https://www.w3.org/TR/vc-data-integrity/",
      authors: [
        "Manu Sporny",
        "Dave Longley",
        "Mike Prorock"
      ],
      status: "WD",
      publisher: "Verifiable Credentials Working Group"
    },
    'RDF-NORMALIZATION': {
      title: 'RDF Dataset Normalization',
      href: 'http://json-ld.github.io/normalization/spec/',
      authors: ['Dave Longley', 'Manu Sporny'],
      status:   'CG-DRAFT',
      publisher:  'Credentials W3C Community Group'
    },
    'DEMOGRAPHICS': {
      title: 'Simple Demographics Often Identify People Uniquely',
      href: 'https://dataprivacylab.org/projects/identifiability/paper1.pdf',
      authors: ['Latanya Sweeney'],
      publisher: 'Data Privacy Lab'
    },
    "NIST-SP-800-57-Part-1": {
      title: "Recommendation for Key Management: Part 1 – General",
      authors: ["Elaine Barker"],
      date: "May 2020",
      publisher: "National Institute of Standards and Technology",
      href: "https://doi.org/10.6028/NIST.SP.800-57pt1r5"
    },
    'VC-IMP-GUIDE': {
      title: 'Verifiable Credentials Implementation Guidelines 1.0',
      href: 'https://w3c.github.io/vc-imp-guide/',
      authors: ['Andrei Sambra', 'Manu Sporny'],
      status: 'ED',
      publisher: 'Credentials Community Group'
    },
    'VC-JSON-SCHEMA': {
      title: 'Verifiable Credentials JSON Schema Specification',
      href: 'https://www.w3.org/TR/vc-json-schema/',
      authors: ['Gabe Cohen', 'Orie Steele'],
      status: 'FPWD',
      publisher: 'W3C Verifiable Credentials Working Group'
    },
    'JSON-LD': {
      title: 'JSON-LD 1.1: A JSON-based Serialization for Linked Data',
      href: 'https://www.w3.org/TR/json-ld11/',
      authors: ['Gregg Kellogg', 'Manu Sporny', 'Dave Longley', 'Markus Lanthaler', 'Pierre-Antoine Champin', 'Niklas Lindström'],
      status: 'WD',
      publisher: 'W3C JSON-LD 1.1 Working Group'
    },
    'VC-SPECS': {
      title: 'Verifiable Credentials Specifications Directory',
      href: 'https://w3c.github.io/vc-specs-dir/',
      authors: ['Manu Sporny'],
      status: 'ED',
      publisher: 'W3C Verifiable Credentials Working Group'
    },
    'PRES-EX': {
      title: 'Presentation Exchange 2.0.0',
      href: 'https://identity.foundation/presentation-exchange/spec/v2.0.0/',
      authors: ['Daniel Buchner', 'Brent Zundel', 'Martin Riedel', 'Kim Hamilton Duffy'],
      status: 'DIF Ratified Specification',
      publisher: 'Decentralized Identity Foundation'
    },
    'OHTTP': {
      title: 'Oblivious HTTP ',
      href: 'https://datatracker.ietf.org/doc/html/draft-ietf-ohai-ohttp',
      authors: ['Martin Thomson', 'Christopher A. Wood'],
      status: 'Working Group Draft',
      publisher: 'IETF Oblivious HTTP Application Intermediation'
    }
  }
};
require(["core/pubsubhub"], (respecEvents) => {
  "use strict";

  respecEvents.sub('end-all', (message) => {
    console.log("END EVENT", message);
    // remove data-cite on where the citation is to ourselves.
    const selfDfns = document.querySelectorAll("dfn[data-cite^='" + respecConfig.shortName.toUpperCase() + "#']");
    for (const dfn of selfDfns) {
      delete dfn.dataset.cite;
    }

    // Update data-cite references to ourselves.
    const selfRefs = document.querySelectorAll("a[data-cite^='" + respecConfig.shortName.toUpperCase() + "#']");
    for (const anchor of selfRefs) {
      anchor.href= anchor.dataset.cite.replace(/^.*#/,"#");
      delete anchor.dataset.cite;
    }

  });

});

// Removes dfns that aren't referenced anywhere in the spec.
// To ensure a definition appears in the Terminology section, use
//  and link to it!
// This is triggered by postProcess in the respec config.
function restrictRefs(config, document){

  // Get set of ids internal dfns referenced in the spec body
  const internalDfnLinks = document.querySelectorAll("a.internalDFN");
  let internalDfnIds = new Set();
  for (const dfnLink of internalDfnLinks) {
    const dfnHref = dfnLink.href.split("#")[1];
    internalDfnIds.add(dfnHref);
  }

  // Remove unused dfns from the termlist
  const termlist = document.querySelector(".termlist");
  const linkIdsInDfns = [];
  for (const child of termlist.querySelectorAll("dfn")){
    if (!internalDfnIds.has(child.id)){
      let dt = child.closest("dt");
      let dd = dt.nextElementSibling;

      // Get internal links from dfns we're going to remove
      //  because these show up in the dfn-panels later and then
      //  trigger the local-refs-exist linter (see below)
      const linksInDfn = dd.querySelectorAll("a.internalDFN");
      for (link of linksInDfn) {
        linkIdsInDfns.push(link.id);
      }

      termlist.removeChild(dt);
      termlist.removeChild(dd);
    }
  }

  // Remove unused dfns from the dfn-panels
  //  (these are hidden, but still trigger the local-refs-exist linter)
  //  (this seems like a hack, there's probably a better way to hook into respec
  //   before it gets to this point)
  const dfnPanels = document.querySelectorAll(".dfn-panel");
  for (const panel of dfnPanels) {
    if (!internalDfnIds.has(panel.querySelector(".self-link").href.split("#")[1])){
      panel.parentNode.removeChild(panel);
    }

    // Remove references to dfns we removed which link to other dfns
    const panelLinks = panel.querySelectorAll("li a");
    for (const link of panelLinks) {
      if (linkIdsInDfns.includes(link.href.split("#")[1])) {
        link.parentNode.removeChild(link);
      }
    }
  }

}

function _esc(s) {
  return s.replace(/&/g,'&amp;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;');
}

function reindent(text) {
  // TODO: use trimEnd when Edge supports it
  const lines = text.trimRight().split("\n");
  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  const indents = lines.filter(s => s.trim()).map(s => s.search(/[^\s]/));
  const leastIndent = Math.min(...indents);
  return lines.map(s => s.slice(leastIndent)).join("\n");
}

function updateExample(doc, content) {
  // perform transformations to make it render and prettier
  return _esc(reindent(unComment(doc, content)));
}

function unComment(doc, content) {
  // perform transformations to make it render and prettier
  return content
    .replace(/<!--/, '')
    .replace(/-->/, '')
    .replace(/< !\s*-\s*-/g, '<!--')
    .replace(/-\s*- >/g, '-->')
    .replace(/-\s*-\s*&gt;/g, '--&gt;');
}
