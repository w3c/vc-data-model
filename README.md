## Verifiable Credentials Data Model and Representations

Credentials are a part of our daily lives; driver's licenses are used to assert
that we are capable of operating a motor vehicle, university degrees can be used
to assert our level of education, and government-issued passports enable us to
travel between countries. This specification provides a mechanism to express
these sorts of credentials on the Web in a way that is cryptographically secure,
privacy respecting, and machine-verifiable.

We encourage contributions meeting the [Contribution
Guidelines](CONTRIBUTING.md). While we prefer the creation of issues
and Pull Requests in the GitHub repository, discussions also occur
on the
[public-vc-wg](http://lists.w3.org/Archives/Public/public-vc-wg/)
mailing list.

## Verifiable Credentials Working Group
* Group page: [https://www.w3.org/2017/vc/WG/](https://www.w3.org/2017/vc/WG/)
* Charter: [https://www.w3.org/2022/06/verifiable-credentials-wg-charter.html](https://www.w3.org/2022/06/verifiable-credentials-wg-charter.html)
* Chairs
  * Brent Zundel - @brentzundel

### Verifiable Credentials github repos
* [Use Cases](https://github.com/w3c/vc-use-cases)
* [Data Model](https://github.com/w3c/vc-data-model)
* [Implementation Guide](https://github.com/w3c/vc-imp-guide/)
* [Data Model Test Cases](https://github.com/w3c/vc-test-suite)

### Discussion Forums
* [W3C Credentials Community Group Mailing List (Incubation)](https://lists.w3.org/Archives/Public/public-credentials/)
* [W3C Verifiable Credentials WG Mailing List (Standardization)](https://lists.w3.org/Archives/Public/public-vc-wg/)

## Process Overview for VC Data Model Pull Requests
1. Anyone can open a PR on the repository. Note that for the PR to be merged,
   the individual must agree to the
   [W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy/).
2. Once a PR is opened on the `v2.0` branch, chairs and editors make judgement
   call on whether changes are substantive or editorial.
   <dl>
     <dt>Editorial</dt>
     <dd>Mark with "editorial" tag</dd>
     <dt>Substantive</dt>
     <dd>Mark with "substantive" tag.</dd>
   </dl>
3. W3C CCG is automatically notified of PRs as they are raised and discussed.
4. PRs are usually merged in 7 days if there is adequate review and consensus,
   as determined by the Chairs and Editors.

### Roadmap for 2022-2024

The VCWG has a set of
[deliverables](https://www.w3.org/2022/06/verifiable-credentials-wg-charter.html#deliverables)
and a
[timeline](https://www.w3.org/2022/06/verifiable-credentials-wg-charter.html#timeline)
listed in the most recent
[VCWG charter](https://www.w3.org/2022/06/verifiable-credentials-wg-charter.html)

### Debugging Github Pages Build Errors

There are times where Github Pages will fail to build with nondescript errors
such as "Page build error." or "Symlink does not exist within your site's
repository". You will need to run github-pages locally to debug such errors.
To run github-pages, which uses Ruby and Jekyll locally, you will need to
[set up a working Ruby and Bundle environment](https://help.dreamhost.com/hc/en-us/articles/115001070131-Using-Bundler-to-install-Ruby-gems).

After you have installed Ruby and Bundle, you will need to do the following:

```
gem install jekyll github-pages
```

Then create a `Gemfile` file in the top level directory with the following
contents:

```
source 'https://rubygems.org'
gem 'github-pages'
```

Then run the following command:

```
bundle exec jekyll serve --watch --force_polling
```

You should be able to see the page build errors in detail upon running the
command above.

### Local Development

This spec is built with [`respec`](https://respec.org/).

To develop locally, first install `respec`; then, you 
can build the spec locally using the following command, run from the project's root:

```sh
respec --localhost index.html out.html --verbose -e
```

Next open up `out.html` in a web browser and review the document.
