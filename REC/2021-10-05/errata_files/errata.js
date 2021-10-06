/*
Script to create errata report pages based on github issues used to raise an errata.

The workflow on github is as follows:

- An issue is raised. Additionally, a label is added to designate a specific label defined by for the
repository (typically a reference to a specific document). A specific label may be assigned by the specific group for the repo to
differentiate the raised errata from the other issues.
- The community discusses the issue. If it is accepted as a genuine erratum, the label "Errata" is added to the entry. Additionally,
a new comment on the issue may be added beginning with the word "Summary".
- If the community rejects the issue as an erratum, the issue is closed.

As for the report, the structure of the HTML file can be seen in the index.html file. The net result is
that the active issues are displayed in different sections, depending on the presence of specific labels. The relevant values are set
through some data-* attributes on the elements.
*/

/**
 * Fetch a JSON file.
 * 
 * @async
 * @param {string} resource_url 
 */
async function fetch_json(resource_url) {
    return fetch(resource_url).then((response) => response.json());
}


/**
 * Display a single issue with all its comments. The array of comments is used to look for a 'Summary' note; if found, added to the issue display.
 * 
 * @param {HTMLElement} node - place to place all the issue description, usually a section element
 * @param {object} issue - issue object as return by the Github API
 * @param {object[]} comments - array of comments as returned by the Github API 
 * @param {string[]} labels - labels assigned to the issue 
 */
function display_issue(node, issue, comments, labels) {
    const display_labels = labels.filter((label) => label !== 'Errata').join(', ');
    const div = document.createElement('div');
    div.className = 'issue';
    node.append(div);
    div.innerHTML = `<h3>"${issue.title}"</h3>`;

    let state = 'Open';
    let state_class = 'state_open';
    if (issue.state !== 'open') {
        state = 'Closed';
        state_class = 'state_closed';
    }

    const pull_request = (issue.pull_request === undefined) ? "No" : "Yes";
    const p1 = document.createElement('p');
    p1.innerHTML = `<span class='what'>Issue number:</span> <a href='${issue.html_url}'>#${issue.number}</a><br>`  +
                    `<span class='what'>Raised by:</span> <a href='${issue.user.url}'>@${issue.user.login}</a><br>` +
                    `<span class='what'>Extra labels:</span> ${display_labels}<br>`                                 +
                    `<span class='what'>Pull request? </span> ${pull_request}<br>`                                  +
                    `<span class='what'>Status:</span> <span class="${state_class}">${state}</span><br> `           ;
    div.append(p1);

    const p2 = document.createElement('p');
    p2.innerHTML = `<span class='what'><a href='${issue.html_url}'>Initial description:</a></span> ${issue.body}`;
    div.append(p2);

    // See if a summary has been added to the comment.
    let summary = undefined;
    comments.forEach((comment) => {
        if (comment.body.search('^Summary:') !== -1 ) {
            summary = comment;
        }
    });

    if (summary) {
        // @ts-ignore
        const summary_text = summary.body.substr('Summary:'.length)
        // @ts-ignore
        const p3 = document.createElement('p');
        p3.innerHTML = `<span class='what'><a href='${summary.html_url}'>Erratum summary:</a></span> ${summary_text}`;
        div.append(p3);
    }
}

/**
 * Find the right section in the HTML content to display an issue. This involves
 * 
 * - Find the section corresponding to a document via a match of a label in the HTML section element; if not found, display the issue in the 'nolabel' section
 * - Find, within the target, the subsection corresponding to an Editorial issue (if so marked) or the substantial one.
 * 
 * @param {object} issue - the issue structure as returned by the Github API
 * @param {object[]} comments - array of comment objects, as returned by the Github API
 */
function render_issue(issue, comments) {
    // Get the labels as an array of strings
    const labels = issue.labels.map((obj) => obj.name);
    const get_subsection = (node, lbls) => lbls.includes('Editorial') ? node.querySelector('section:last-of-type') : node.querySelector('section:first-of-type');

    let displayed = false;
    const sections = document.querySelectorAll('main > section');

    // first looking for sections corresponding to the main errata labels
    sections.forEach((section) => {
        if (labels.includes(section.dataset.erratalabel)) {
            const subsection = get_subsection(section, labels);
            display_issue(subsection, issue, comments, labels)
            displayed = true;
        }
    });

    // As a fallback, look for the section marked for 'nolabel' entries.
    if (!displayed) {
        // looking for the 'nolabel' data attribute
        sections.forEach((section) => {
            if (section.dataset.nolabel !== undefined) {
                const subsection = get_subsection(section, labels);
                display_issue(subsection, issue, comments, labels)
                displayed = true;
            }
        });
    }
}

/**
 * Process all the issues:
 * 
 * - extract the errata issues from the github repo
 * - extract the number of issues as well as the newest date (to be displayed in the document)
 * - get the comments for each issue (to be used to look for a possible summary)
 * - render each issue individually (see `render_issue` above)
 * 
 * @async
 */
async function process_issues() {
    const dataset = document.getElementsByTagName('head')[0].dataset;
    if (dataset.githubrepo !== undefined) {
        const url_api    = `https://api.github.com/repos/${dataset.githubrepo}/issues?state=all&labels=Errata`;
        const url_issues = `https://github.com/${dataset.githubrepo}/issues?q=label%3AErrata`;

        const all_issues = await fetch_json(url_api);        
        const date_element = document.querySelector('span#date');
        if (all_issues.length > 0) {
            const all_dates = all_issues.map((item) => new Date(item.updated_at));
            const latest_change = all_dates.reduce((acc,current) => acc < current ? current:acc);
            date_element.textContent = latest_change.toDateString();
        } else {
            date_element.textContent = 'n/a';
        }
        document.querySelector('span#number').textContent = all_issues.length;
        document.querySelector('span#errata_link').innerHTML = `<a href='${url_issues}'>${url_issues}</a>`;

        const comments_promises = all_issues.map((issue) => fetch_json(issue.comments_url));
        const all_comments = await Promise.all(comments_promises);
        let i = 0;
        for (; i < all_issues.length; i++) {
            render_issue(all_issues[i], all_comments[i])
        }
    }
}

window.addEventListener('load', process_issues);
