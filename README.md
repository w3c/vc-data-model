## Verifiable Credentials Data Model and Representations

Credentials are a part of our daily lives; driver's licenses are 
used to assert that we are capable of operating a motor vehicle, 
university degrees can be used to assert our level of education, 
and government-issued passports enable us to travel between countries. 
This specification provides a mechanism to express these sorts of 
credentials on the Web in a way that is cryptographically secure, 
privacy respecting, and machine-verifiable.

We encourage contributions meeting the [Contribution
Guidelines](CONTRIBUTING.md).  While we prefer the creation of issues
and Pull Requests in the GitHub repository, discussions often occur
on the
[public-vc-wg](http://lists.w3.org/Archives/Public/public-vc-wg/)
mailing list as well.

## Verifiable Credentials Working Group
* Group page: [https://www.w3.org/2017/vc/WG/](https://www.w3.org/2017/vc/WG/)
* charter: [https://www.w3.org/2017/vc/WG/charter.html](https://www.w3.org/2017/vc/WG/charter.html)
* Chairs
  * Brent Zundel - @brentzundel
  * Wayne Chang - @wyc

### Verifiable Credentials github repos
* [Data Model](https://github.com/w3c/vc-data-model)
* [Use Cases](https://github.com/w3c/vc-use-cases)
* [Data Model Test Cases](https://github.com/w3c/vc-test-suite)

### Other useful links
* [Public group email archive](https://lists.w3.org/Archives/Public/public-vc-wg/)

## Process Overview for VC Data Model Pull Requests
1. For now, we will focus only on merging new errata PRs into this repository,
but encourage activity related to new features.
2. Once a PR is opened, chairs and editors make judgement call on whether
changes are substantive or editorial.
<dl>
  <dt>Editorial</dt>
  <dd>Mark with "editorial" tag, merge into branch "v1.1"</dd>
  <dt>Substantive</dt>
  <dd>Mark with "substantial" tag. Bugfixes are merged into separate branch "v1.2". New Features stay around as an open PR.</dd>
</dl>
3. W3C CCG is notified of PRs that will be merged in the next 14 days if there
are no objections.
4. When it's determined a new reccomendation should go out, the W3C Verifiable
Credentials Working Group members meet, review all the PRs that have been
merged, and make a formal recommendation if agreement is reached.

### Roadmap for 2021
- one editorial update (v1.1?)
- one substantive update (v1.2?)
- VC Test Suite Refactoring
- Start planning VC v2 Work, request a rechartering 3-6 months before end of
  year to keep VC WG functioning.

### Focus areas
- [v1] Fixing a specific bug
- [v1] Update examples in the spec to make them modern
- [v2] VC `@context` needs updating, possibly with security vocab modularized
  into smaller components instead of all included into a large context file.
