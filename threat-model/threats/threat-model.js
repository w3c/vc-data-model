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
  // (threat categories, element labels, and the list of threat files),
  // then each threat file the outline lists. The outline location can be
  // overridden with the threatModelOutline configuration option; threat
  // files are resolved relative to the outline's directory.
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

    const texts = await Promise.all(
      outline.files.map(name => fetchText(baseDir + name)));
    for (const text of texts) {
      register(jsyaml.load(text));
    }
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

    var threatCount = 1;
    let tocHtml = threatCategories.map(category => {
      return `
        <p class="threatCategory">${category.name}</p>
        <ol class="threat-toc">
          ${category.threats.map((threatId) => {
        threatCount++;
        return renderTocEntry(threatId);
      }).join("")}
        </ol>
        `;
    }).join("");

    tocElement.innerHTML = `
      <h2 id="threat-list">Threat List</h2>
        ${tocHtml}
      `;
    return;

    function renderTocEntry(threatId) {
      console.log("renderTocEntry", threatId);
      let threatValue = threatId.substring(1);

      let threat = getThreat(threatId);
      if (!threat) {
        return `<li value="${threatValue}">Threat ${threatId} not found</li>`;
      }

      let id = makeId(threat);

      return `<li value="${threatValue}"><a href="#${id}">${threat.name}</a> ${renderTags(threat)}
    </li>`;
    }

    return;
  }

  function getThreat(threatId) {
    console.log("getThreat", threatId);
    let threat = threats.find(threat => threat.id === threatId);
    return threat;
  }

  function makeId(threat) {
    var id = `${threat.id}-${threat.name}`;
    id = id.toLowerCase();
    id = id.replace(/ /g, "-");
    return id;
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
          ${category.threats.map((threatId) => {
            return renderThreat(threatId, tocElement);
      }).join("")}`;
    }).join("");

    detailsElement.innerHTML = `
      <h2>Threat Details</h2>
        ${threatsHtml}
      `;
    return;

    function renderThreat(threatId, tocElement) {
      console.log("renderThreat", threatId);
      let threat = getThreat(threatId);

      if (!threat)
        return `<p>Threat ${threatId} not found.</p>`;

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
                <h5 id="${threat.id}.inner">${threat.id}. ${threat.name}
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

    detailsElement.innerHTML = `
    <h2>Threat Details</h2>
    ${threatHtml}
    `;
    console.log(detailsElement.innerHTML);
    return;
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
    renderToc,
    renderThreats,
    register,
    registerCategories,
    registerElements,
    validate
  }

  window.ThreatModel = ThreatModel;

})();
