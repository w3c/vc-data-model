/*
Copyright 2026 Legendary Requirements

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
(function () {

  // set up debugger output
  // you can toggle different debugging namespaces by adjusting the
  // value passed via a debug query parameter.
  // e.g., ?debug=* will turn on all debugging output
  // while ?debug=render will turn on just the render debugging output
  // the value is a regex against debugging namespaces
  ///////////////////////////////////////////////////////////////////////
  if (typeof debug === "undefined") {
    var debug = function () { };
  } else {
    const params = new URLSearchParams(window.location.search);
    const debug_param = params.get('debug');
    if (debug_param) {
      localStorage.debug = debug_param;
      console.log(`Debugging ${debug_param} enabled`);
    }
  }

  // Set up globals
  ///////////////////////////////////////////////////////////////////////
  var threats = [];           // Populated by calling RegisterThreats
  var threatCategories = [];  // Populated by calling RegisterCategories
  var elementLabels = {};     // Populated by calling registerElements


  // loadDefinitions(config)
  // Loads the threat model definitions from YAML files: first the outline
  // (threat categories and element labels), then each threat file the
  // outline's categories list. The outline location can be overridden with
  // the threatModelOutline configuration option; threat files are resolved
  // relative to the outline's directory.
  //
  // Threat IDs are not stored in the threat files. Each threat is numbered
  // T1, T2, ... by its position when the categories are walked in order, so
  // moving a threat between categories or reordering it within one is the
  // only edit needed to renumber the model.
  ///////////////////////////////////////////////////////////////////////
  async function loadDefinitions(config) {
    if (typeof jsyaml === "undefined") {
      throw new Error("js-yaml is not loaded; add a <script> tag for " +
        "threats/js-yaml.min.js before threats/threat-model.js");
    }

    const outlinePath = config.threatModelOutline || "threats/outline.yaml";
    const baseDir = outlinePath.slice(0, outlinePath.lastIndexOf("/") + 1);

    const outline = jsyaml.load(await fetchText(outlinePath));
    registerCategories(outline.categories);
    registerElements(outline.elements);

    // The categories, walked in order, are the list of threat files.
    const files = [];
    for (const category of outline.categories) {
      for (const entry of category.threats || []) {
        files.push(entry);
      }
    }

    const texts = await Promise.all(
      files.map(name => fetchText(baseDir + name)));
    texts.forEach((text, index) => {
      const threat = jsyaml.load(text);
      threat.file = files[index];
      threat.id = `T${index + 1}`;
      threat.number = index + 1;
      register(threat);
    });
  }

  async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`failed to fetch ${url}: ` +
        `${response.status} ${response.statusText}`);
    }
    return response.text();
  }

  // render(config, document)
  // Loads the YAML threat definitions, then renders all the threats,
  // creating both a Table of Contents and Threat Details sections. The
  // returned promise is awaited by ReSpec's preProcess hook.
  ///////////////////////////////////////////////////////////////////////
  async function render(config, document) {
    var renderLog = debug("render");
    console.log("Starting render");

    tocElement = document.querySelector(".tm-toc");
    detailsElement = document.querySelector(".tm-details");

    try {
      await loadDefinitions(config);
    } catch (error) {
      console.error("Failed to load threat model definitions.", error);
      if (tocElement) {
        tocElement.innerHTML = `<p class="issue">Failed to load the threat
          model definitions (${error.message}). If you are viewing this
          document from a <code>file://</code> URL, serve the directory over
          HTTP instead (for example, <code>npx http-server</code>) so that
          the YAML files can be fetched.</p>`;
      }
      return;
    }

    if (!tocElement) {
      console.warn("No Threat Toc found. Selector: .tm-toc");
    } else {
      renderToc(threats, tocElement);
    }

    if (!detailsElement) {
      console.warn("No Threat Section found. Selector: .tm-details");
    } else {
      renderThreats(threats, detailsElement, tocElement);
    }
  }

  function areRenderTocInputsGood(threats, tocElement) {
    console.log("areRenderTocInputsGood", threats, tocElement);
    if (!threats || !threats.length) {
      console.warn("No threats to render in renderToc");
      return false;
    }

    if (!threatCategories || !threatCategories.length) {
      console.warn("No threat categories to render in renderToc");
      return false;
    }

    if (!tocElement) {
      console.error(`Target table of contents element must be passed to renderToc, but tocElement is ${tocElement}.`);
      return false;
    }

    return true;
  }

  function renderToc(threats, tocElement) {
    console.log("renderToc", threats);

    if (!areRenderTocInputsGood(threats, tocElement)) {
      return;
    }

    let tocHtml = threatCategories.map(category => {
      return `
        <p class="threatCategory">${category.name}</p>
        <ol class="threat-toc">
          ${(category.threats || []).map(renderTocEntry).join("")}
        </ol>
        `;
    }).join("");

    tocElement.innerHTML = `
      <h2 id="threat-list">Threat List</h2>
        ${tocHtml}
      `;
    return;

    function renderTocEntry(entry) {
      console.log("renderTocEntry", entry);

      let threat = getThreat(entry);
      if (!threat) {
        return `<li>Threat ${entry} not found</li>`;
      }

      let id = makeId(threat);

      // the `value` attribute drives the "T<n>." prefix the threat-toc CSS
      // renders; the number comes from the threat's position in the outline.
      return `<li value="${threat.number}"><a href="#${id}">${threat.name}</a> ${renderTags(threat)}
    </li>`;
    }
  }

  // getThreat(file)
  // Looks up a loaded threat by the filename the outline listed it under.
  ///////////////////////////////////////////////////////////////////////
  function getThreat(file) {
    console.log("getThreat", file);
    return threats.find(threat => threat.file === file);
  }

  // makeId(threat)
  // Builds the anchor for a threat from its name alone. The T<n> number is
  // assigned at render time and would change whenever a threat moves, so it
  // is deliberately kept out of the anchor: links into the threat model stay
  // valid across renumbering.
  ///////////////////////////////////////////////////////////////////////
  function makeId(threat) {
    return threat.name
      .toLowerCase()
      .replace(/[(),]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/ /g, "-");
  }

  function areRenderThreatInputsGood(threats, detailsElement) {

    if (!threats || !threats.length) {
      console.warn("No threats to render in renderThreats");
      return false;
    }

    if (!detailsElement) {
      console.error(`Target Threat Details element must be passed to renderThreats but detailsElement is ${detailsElement}.`);
      return false;
    }
    return true;
  }

  function renderThreats(threats, detailsElement, tocElement) {
    console.log("renderThreats", threats);

    // note that tocElement is optional
    // if not present, the threat will not have a link to the TOC
    if (!areRenderThreatInputsGood(threats, detailsElement)) {
      return;
    }

    let threatsHtml = threatCategories.map(category => {
      return `
        <p class="threatCategory">${category.name}</p>
          ${(category.threats || []).map((entry) => {
            return renderThreat(entry, tocElement);
      }).join("")}`;
    }).join("");

    detailsElement.innerHTML = `
      <h2>Threat Details</h2>
        ${threatsHtml}
      `;
    return;

    function renderThreat(entry, tocElement) {
      console.log("renderThreat", entry);
      let threat = getThreat(entry);

      if (!threat)
        return `<p>Threat ${entry} not found.</p>`;

      let id = makeId(threat);
      return `
      <section class="threatDetail">
        <h5 id="${id}">${threat.id}. ${threat.name}</h5>
      </section>
        <table class="threat">
          ${renderName(threat, tocElement)}
          ${renderDescription(threat)}
          ${renderImage(threat)}
          ${renderResponses(threat)}
          ${renderComponents(threat)}
          ${renderTaxonomy(threat)}
        </table>`;

      // now define support functions

      function renderName(threat, tocElement) {  // tocElement to render link
        console.log("renderName", threat);
        if (!threat.name || threat.name == "")
          return "";

        return `
          <tr>
            <td class="threat-name">
              <section>
                <h5 id="${makeId(threat)}-inner">${threat.id}. ${threat.name}
                  ${renderTags(threat)}
                </h5>
                ${renderTocLink(tocElement)}
              </section>
            </td>
          </tr>`;
      }

      function renderDescription(threat) {
        if (!threat.description || threat.description == "")
          return "";

        return `
        <tr>
          <td class="threat-description">
            ${threat.description}
          </td>
        </tr>
        `
      }

      function renderComponents(threat) {
        if (!threat.elements || !threat.elements.length)
          return "";

        return `<tr>
          <td class="affected-component">Affected Components: ${threat.elements.map(element => `[=${element}|${elementLabels[element] || element}=]`).join(", ")}</td>
        </tr>`;
      }

      function renderTocLink(tocElement) {
        if (!tocElement)
          return "";

        return `<span class="index-link">[<a href="#threat-list">Threat List</a>]</span>`;
      }

      function renderImage(threat) {
        let image = threat.image;

        console.log("renderImage", threat);
        if (!threat || !image || !image.src)
          return ''

        let id = makeId(threat);
        return `
          <tr>
            <td class="threat-image">
            <figure id="threat-image-${id}">
              <img src="${image.src}" alt="${image.alt}" />
              <figcaption>${image.caption}</figcaption>
            </figure>
            </td>
          </tr>`;
      }

      function renderTaxonomy(threat) {
        let taxonomyName = threat?.taxonomyName;
        let taxonomyClass = threat?.taxonomyClass;

        console.log("renderTaxonomy", taxonomyName);
        if (!taxonomyName)
          return '';

        return `
          <tr>
            <td class="taxonomy">Threat Taxonomy: ${taxonomyName} (${taxonomyClass})</td>
          </tr>`;
      }
      function renderResponses(threat) {
        let responses = threat.response;
        console.log("renderResponses", responses);
        if (!responses || !responses.length)
          return "No responses.";

        let responseHtml = responses.map(response => `
          <tr>
        <td class="response-name">${response.id}. ${response.name}${response.type ? ` (${response.type})` : ""}</td>
          </tr>
          <tr>
        <td class="response-desc">
          ${response.description}
        </td>
          </tr>
          `).join("")

        return responseHtml;
      };
    };
  }

  function renderTags(threat) {
    console.log("renderTags", threat);
    let tags = threat?.tags;
    if (!tags || !tags.length)
      return '';

    let tagsHtml = tags.map(tag => `
          <span class="threat-tag threat-tag-${tag}">${tag}</span>
        `).join("");

    return tagsHtml;
  }

  // renderConsiderations(config, document)
  // Fills in the Security and Privacy Considerations summaries in a document
  // that embeds them, such as the Verifiable Credentials Data Model
  // specification. Each summary is a placeholder element of the form
  //
  //   <section class="threat" data-threat="<threat-file-basename>"></section>
  //
  // which is replaced with the threat's name and its `summary` from the
  // threat's YAML file, followed by a link into the threat model for the full
  // analysis. Keeping the summaries in the YAML means a threat's name and
  // summary are written once and stay consistent between the two documents.
  //
  // This is the entry point for the embedding document's ReSpec preProcess
  // hook; the threat model's own document calls render() instead.
  ///////////////////////////////////////////////////////////////////////
  async function renderConsiderations(config, document) {
    console.log("Starting renderConsiderations");

    const placeholders =
      Array.from(document.querySelectorAll("section.threat[data-threat]"));
    if (!placeholders.length) {
      console.warn("No threat placeholders found. Selector: " +
        "section.threat[data-threat]");
      return;
    }

    try {
      await loadDefinitions(config);
    } catch (error) {
      console.error("Failed to load threat model definitions.", error);
      for (const placeholder of placeholders) {
        placeholder.innerHTML = `<p class="issue">Failed to load the threat
          model definitions (${error.message}). If you are viewing this
          document from a <code>file://</code> URL, serve the directory over
          HTTP instead (for example, <code>npx http-server</code>) so that
          the YAML files can be fetched.</p>`;
      }
      return;
    }

    for (const placeholder of placeholders) {
      placeholder.innerHTML =
        renderConsideration(placeholder.dataset.threat, config);
    }
  }

  // renderConsideration(name, config)
  // Renders one threat summary. `name` is the threat's filename in
  // threats/outline.yaml, with or without the .yaml extension.
  ///////////////////////////////////////////////////////////////////////
  function renderConsideration(name, config) {
    const file = name.endsWith(".yaml") ? name : `${name}.yaml`;
    const threat = getThreat(file);

    if (!threat) {
      console.error(`No threat definition found for "${name}".`);
      return `<p class="issue">No threat definition found for
        <code>${name}</code>. Check that a threat file of that name is listed
        in a category in <code>threats/outline.yaml</code>.</p>`;
    }

    if (!threat.summary) {
      console.error(`Threat "${name}" has no summary.`);
      return `<p class="issue">The threat definition in
        <code>${file}</code> has no <code>summary</code> entry.</p>`;
    }

    const base = config.threatModelURI ||
      "https://www.w3.org/TR/vc-data-model-threat-model/";

    return `
          <h4>${threat.name}</h4>
          <p>
${threat.summary}
See
<a href="${base}#${makeId(threat)}">${threat.name}</a>
in the [[[VC-DATA-MODEL-THREAT-MODEL]]] for the full analysis of this threat and
the responses to it.
          </p>`;
  }

  function register(threat) {
    console.log("register", threat);

    if (!validate(threat)) {
      console.log("Registration failed. Invalid criteria.", threat);
      return;
    }

    threats.push(threat);
  }

  function registerCategories(categories) {
    console.log("registerCategories", categories);
    threatCategories = categories;
  }

  function registerElements(labels) {
    console.log("registerElements", labels);
    elementLabels = labels;
  }


  function validate(threat) {
    console.log("validate", threat);
    return true;
  }

  function validateThreat(threat) {
    console.log("validateThreat", threat);
    return true;
  }

  var ThreatModel = {
    render,
    renderConsiderations,
    renderToc,
    renderThreats,
    register,
    registerCategories,
    registerElements,
    validate
  }

  window.ThreatModel = ThreatModel;

})();
