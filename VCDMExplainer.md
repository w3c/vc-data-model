# Verfiable Credentials Data-Model Explainer

***by Tzviya Siegman, Wiley; Manu Sporny, Digital Bazaar; Ken Ebert, Sovrin; Brent Zundel, Evernym***

***NOTE***: "Verifiable Claims" are now known as "Verifiable Credentials".
The W3C Verifiable Claims Working Group's experience with using the term
"Verifiable Claims" demonstrated that it led to confusion in the marketplace.
The group has since found consensus in shifting to use the term
"Verifiable Credentials", which contain "Claims".

## Introduction

It is currently difficult to transmit credentials such as driver's licenses,
proofs of age, education qualifications, and healthcare data, via the
Internet in a way that is verifiable yet protects individual privacy.

Starting in 2013, the [W3C Credentials Community Group](https://w3c-ccg.github.io/) started to
work in earnest on solutions in this space followed shortly thereafter by the
[Rebooting Web of Trust Community](http://www.weboftrust.info/)
and [W3C Verifiable Claims Working Group](https://www.w3.org/2017/vc/).
These groups, composed of 150+ individuals and organizations, are currently
focused on the creation, storage, transmission, and verification of digital
credentials via the Internet.

## Goals

The mission of the Verifiable Claims Working Group is to make expressing,
exchanging, and verifying claims easier and more secure on the Web. The
data-model outlines core data model concepts, such as claims, credentials,
and presentations, that form the foundation of this specification.

## Non-goals

The VCWG is not defining protocols or APIs. The model is identifier agnostic.

## Getting Started

The Verifiable Credentials ecosystem is composed of four primary roles:

* ***issuer*** - A role an entity might perform by creating a verifiable
  credential, associating it with a specific ***subject***, and transmitting
  it to a ***holder***. Example issuers include corporations, non-profit
  organizations, trade associations, governments, and individuals.

* ***holder*** - A role an entity might perform by possessing one or more
  verifiable credentials about a ***subject*** and generating presentations
  from them. Example ***holders*** include students, employees, and customers.

* ***verifier*** - A role an entity might perform by requesting and receiving a
  verifiable presentation that proves the ***holder*** possesses the required
  verifiable credentials. Example ***verifiers*** include employers, security
  personnel, and websites.

* ***verifiable data registry*** - A role a system might perform by mediating
  the creation and verification of ***issuer*** identifiers, keys, and other
  relevant data, such as verifiable credential schemas and revocation
  registries, which might be required to use verifiable credentials. Some
  configurations might require correlatable identifiers for ***subjects***.
  Example verifiable data registries include trusted databases, decentralized
  databases, government ID databases, and distributed ledgers.

A visual depiction of the ecosystem above is shown below:

<a href="https://w3c.github.io/vc-data-model/">
  <img src="diagrams/ecosystem.svg" width="100%" height="400">
</a>

### Claims, Credentials, and Presentations

The ecosystem roles exchange data that enables the realization of the use
cases below. The data that is exchanged differs based on the roles
participating, but is fundamentally composed of claims, credentials, and
presentations.

A claim is statement about a subject, expressed as a subject-property-value
relationship:

<a href="https://w3c.github.io/vc-data-model/">
  <img src="diagrams/claim.svg" width="50%">
</a>

### Proofs

The cryptographic mechanism used to prove that the information in a
verifiable credential or a verifiable presentation has not been tampered
with is called a proof. There are many types of cryptographic proofs
including, but not limited to, digital signatures, zero-knowledge proofs,
proofs of work, and proofs of stake.

The data model does not detail proof mechanisms.

#### Zero-Knowledge Proofs
The verifiable credentials data model supports the use of zero-knowledge proof
technology. This allows credentials with zkp-compatible elements to support
presentations that enable:

* selective disclosure of each credential attribute
* predicate proofs of numeric values (e.g. integers, dates, enumerations)
  * greater-than
  * less-than
  * range (e.g. 5 < x < 100)
* set-membership proofs

## Use Cases
The VCWG has created an [Use Case](https://w3c.github.io/vc-use-cases/)
Document, including focal use cases that demonstrate complicated scenarios
and the full encoding.

Some simple use cases:
* A student presents a government-issued identity to verify who she is when
  presenting herself for a standardized test.
* An airline offers loyal customers upgrades to first-class via digital coupons.
  Coupons are issued as verifiable credentials.
* The Board of Physicians maintains its list of board-certified physicians in
  a credentials repository, enabling them to assert that a physician is
  certified or revoke certification as needed. This information can be
  verified as physicians apply for positions or by patients as they seek
  information about the doctors they are considering. This may be done as a
  zero-knowledge proof of set membership.
* A loan applicant presents proof of sufficient income, derived from a
  credential issued by her employer. This may be done without revealing her
  exact income by using a zero-knowledge predicate proof.

## Code Samples

What does a Verifiable Credential look like?

There are many pieces of information that MAY be included in a Verifiable
Credential. There are numerous examples of credentials in the spec.

Here is an example of usage of the ID property in a credential, using the
DID scheme:

```
{
  "@context": [
    "https://w3.org/2018/credentials/v1",
    "https://example.com/examples/v1"
  ],
  "id": "http://example.edu/credentials/1872",
  "type": ["VerifiableCredential", "AlumniCredential"],
  "issuer": "https://example.edu/issuers/565049",,
  "issuanceDate": "2010-01-01T19:73:24Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "alumniOf": "Example University"
  },
  "proof": {
    "type": "RsaSignature2018",
    "created": "2017-06-18T21:19:10Z",
    "verificationMethod": "https://example.com/jdoe/keys/1",
    "jws": "BavEll0/I1zpYw8XNi1bgVg/sCneO4Jugez8RwDg/+
      MCRVpjOboDoe4SxxKjkCOvKiCHGDvc4krqi6Z1n0UfqzxGfmatCuFibcC1wps
      PRdW+gGsutPTLzvueMWmFhwYmfIFpbBu95t501+rSLHIEuujM/+PXr9Cky6Ed
      +W3JT24="
  }
}
```

Here is an example verifiable credential that supports zero-knowledge proofs:
```
{
  "@context": [
    "https://w3.org/2018/credentials/v1",
    "ctx:sov:anoncred:v1",
    "ctx:sov:GppHbMLLeKNYRhcQiXh3GjP2Yh",
  ],
  "@type": [
    "VerifiableCredential",
    "AnonCred",
    "ExampleNameDOB"
  ],
  "issuer": "did:sov:4t1FPo72LzDMwpqtTVGVjysD6GUqS",
  "issuanceDate": "2018-11-27T12:37:15Z",
  "credentialSubject": {
    "name": "John Doe",
    "birthDate": "1969-02-14",
  },
  "proof": {
    "m_2": "0x375A05242CF33E9AE2E527DB6D6D5A2FA78A3042EF25D21013F82D5C642E98FA",
    "attributes": [
      "0x6998340478030A68F6DB6A3D4CB94304C4C60576E0992CBE81C4D32764876AD4",
      "0x5BFD3A7B",
      "0x3C414697B170EB2691A2AE126DD07F936005C478FFAEDB3B67255DA017C64A4B",
      "0x629E",
    ],
    "cred_def": "cdf:sov:Q6kuSqnxE57waPFs2xAs7q:3:CL:12:CDL1",
    "signature": {
      "A": "0x2B048AFC2099E78A4F11C75FE913ECDAFDE07911D1D54F439ECC5CDB1AC952E95309DB6D809F31E1A0C2326E3603A21DD7F29E11AA2ABA9D5B077A53EF49C45EF9FA757508708B5FBE26EB4D21CC63C40BDC785E758A106FFB9654D8E8B9B1A34A7DA26E8BF6174DF6C735D909EE32B44200E36616C31EA6DDBFC252004F68A30BEE16A714C75DB60D920DB3E6B18622C6944C75337FB1CB8E3AC928CB182ABE49AD76EBE19063D1353D159341DEB76B9D6732A77B45BC5EBD35A6B7AC4C39CCDCDF846281B130D5A5E22CA6F8479F8CDBE3293E317AE4EC5A0716EE1B6348B6D6C196FCE1A594F57FF8999E57AAC8EC54C99296E9D35EE3FEDFB20ACBE97533C"
      "e": "0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006887BBE4F8F22F6FF0EE2863E42615"
      "v": "0x8639169982733C9D95BC8782C3566E1774BAAFA4B048648BFEF3ACB588A0488982E123B69B09FD03DF501824895FD670F77CB6B832F97FAA85F746B0869EAFB4A358214103B4AB00A4993A1AD9EB1DE0A980818D7C6C085112713989444EEC04D07E99D5C827A76DA4E24BC2F445CB82658F6A079AB03C002E8812C79E1E155CFAEAA12046BAD5C51DE2292DEA64AFB61387813DEC96B2485E84D2039E571ACAF3BA9A820918EE9616300D8D970C1211C7F71966C008FC56D0D8136A1B43074C2AAF3C39E4E59ED4A5C3EB355352083497332B1B37C591DC7786C4A000C6D087C9C7C039CFCB137EAE7B905D5881E94AC626F1B0945D7FDC74CDFADE02D67449706146FE43A32AF560E84CCA7A0FF351F5FD266C3D7D0C1EB1A056BC257392CE170D25CC24918FDA1DBFE4F9BEE702410276C115BE3E0680445429DFAA2B07F2C51296DD3508C796B90A7EB1D301E8079D6CC8099"
    },
    "signature_correctness_proof": {
      "se": "0x2CEF1A529FC0C64EC2D14BF7555E726F99061CBD6C41365401203FE81139496EDB4763FDEFF85124C8CC8DA0C60E16E3B68E57B9A1014B2CA99656AAF69BF7C1B1FA298C16FC6A7FB16E009B5CF03568113BCACBDAF927E04808F5032476274B4302EBDA632B721A3C0899B82762AC436564770E5B34EE85AEEDA43E87A1BBB82FCB2BAA179EA1FE9046CE43FCB5FF589650578518867E40DA438C5DA01B2CB7166650B7546F451A11652EBB80A3FA7193092233533A42BFA19897D6C17964E19826E0F50FA81CEFDB91DC954DFCFE0029463A224CA8DE2AA6A16D64EBCE4208350130E3CC560048863B424CBD9D6FADD780B40B4DD8D3BC1501B2E5FBFCBA8C",
      "c": "0xD074B91DC755D75F56BA00F0B650190CF7035BFBE65678A290A511DFEF554521"
    }
  }
}
```

## Important Design Choices

This section summarizes a number of design choices that the Working Group spent
a considerable amount of time debating.

### Focusing on Privacy-Enhancing Architectures

The group spent a considerable amount of time exploring various
privacy concerns including, but not limited to, multiple
zero-knowledge proof systems, selective disclosure schemes,
avoiding cryptographic fingerprinting, and intersection of tracking technologies
and Verifiable Credentials. The outcome is a specification that attempts to
strike the right balance between what is currently achievable while ensuring
that future privacy-enhancing systems are able to use the same architecture
to protect individual and organizational privacy.

### Support for JSON-LD

While the document outlines a data model that is expressible in a number of
different syntaxes, there was considerable thought exertedto the question of
representation syntaxes that the specification would highlight. JSON-LD, which
is a fully compatible subset of JSON, was suggested as the primary format. There
were concerns that a JSON-LD processor would be required to process Verifiable
Credentials. After more than a year of technical work and collaboration with
the JSON-LD 1.1 WG, the group has been able to demonstrate that a JSON-LD
processor is not necessary to conform to the specification. The vast majority
of developers will be able to work with Verifiable Credentials as if it is
just another JSON object.

### Authorization

The group debated the usage of Verifiable Credentials as an authorization
mechanism. The result of the debate was the notion that Verifiable Credentials
could be used in authorization systems, but did not constitute an authorization
system by themselves and that great thought should be put into any system that
attempts to use Verifiable Credentials in an authorization framework.

### Terms of Use

There were multiple discussions related to how a Verifiable Credential
should be used. For example, issuers may want to place restrictions on
how a Verifiable Credential should be used. Holders may want to also place
restrictions on how a Verifier may use their information. While there was
consensus that these restrictions should be able to be expressed in the
data model, there was no consensus on what sorts of restrictions should be
suggested by the specification. The result is an open mechanism for expressing
the terms of use for Verifiable Credentials and Verifiable Presentations.

### Support for Multiple Proof Formats

There are currently at least four different proof formats that are being
actively used by participants in the Working Group: JSON Web Signatures,
Zero-Knowledge Proofs, Common Binary Object Representation Object Signing and
Encryption, and Linked Data Proofs. It was challenging for the
Working Group to select one format as there were a number of benefits and
drawbacks provided by each approach. The result of this challenge was to
ensure that the Verifiable Credentials Data Model was flexible enough to
be compatible with each signature format with no changes needed to the
core data model.

### Support for JWT

JSON Web Token (JWT) is still a widely used means to express claims to be
transferred between two parties. Providing a representation of the Verifiable
Credentials Data Model for JWT allows existing systems and libraries to
participate in the ecosystem.

This specification defines the encoding rules of the Verifiable Credential Data Model onto JWT and JWS. It further
defines processing rules how and when to make use of specific JWT registered claim names and specific JWS registered
header parameter names to allow systems based on JWT to comply with this specification while avoiding duplicate
representation of specific information contained in the enclosed JSON or JSON-LD object.

### Selective disclosure as a requirement see [Issue 224](https://github.com/w3c/vc-data-model/issues/224) for example

(what else should go here?)

## Features at Risk

The current features are waiting on multiple interoperable implementations:

* JSON Web Token
* Terms of Use
* Data Schemas
* SubjectOnly Property

## Implementations and Reviews

The VCWG has begun the process of horizontal review. Feedbeck from APA and
PING has been or is in the process of being incorporated.

This data model has numerous successful implementations, including goverments,
universities, major technology organizations, and not for profits.

## References and Acknowledgements
Thanks to Manu Sporny for writing most of this in previous formats. Much of
the text came from [Motivation for Verifiable Claims Working Group Charter](http://w3c.github.io/webpayments-ig/VCTF/charter/charter-motivation.html), [Verifiable Claims Working Group Primer](http://w3c.github.io/webpayments-ig/VCTF/primer/), and [A Verifiable Credentials Primer](https://github.com/WebOfTrustInfo/rwot7/blob/master/topics-and-advance-readings/verifiable-credentials-primer.md).
