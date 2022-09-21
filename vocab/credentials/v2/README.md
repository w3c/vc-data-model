# Generate RDFS vocabulary files

The script in the directory generates RDFS vocabulary files in JSON and Turtle formats, plus a human readable HTML file containing the vocabulary in RDFa, based on a simple vocabulary definition in a CSV file. Neither the script nor the CSV format is prepared for complex vocabularies; its primary goal is to simplify the generation of simple, straightforward RDFS vocabularies without, e.g., sophisticated OWL statements.

## Definition of the vocabulary in the CSV file

The vocabulary is defined in a CSV file, which contains the following columns: `category`, `id`, `property`, `value`, `label`, `upper value`, `domain`, `range`, `comment`, and `deprecated`. The `category` column defines the category of the row, and the interpretation of the row's content, i.e., of the other columns, depends on this category.

The available categories, and the corresponding interpretation of the columns, are:

- `vocab`: the prefix and the URL of the vocabulary that is being specified is provided in the `id` and `value` columns, respectively.
- `prefix`: definition of a prefix, and corresponding URL, for each external external vocabulary in use, defined by the `id` and `value` columns, respectively. Note that some prefix/value pairs are defined by default, and it is not necessary to define them here; these are: `dc`, `owl`, `rdf`, `rdfs`, and `xsd`.
- `ontology`: definition of an "ontology property", i.e., a statement made on the vocabulary itself. The (prefixed) property term is defined in the `property` column, and the value in the `value` column. If the value can be parsed as a URL, it is considered to be the URL of an external resource, otherwise the value is considered to be an (English) text.

    It is a good practice to provide, at least, `dc:description` as an ontology property with a short description of the vocabulary.

- `class`: definition of a class. The `id` column defines the class name (no prefix should be used); the possible superclasses are defined in the  `upper value` column as a single term, or a comma separated list of terms. There should be a label and a longer description in English text, provided by the `label` and `comment` columns, respectively.
 
    The class can be declared as deprecated by setting the `deprecated` column to "true".
- `property`: definition of a property. The `id` column defines the property name (no prefix should be used); the possible superproperties are defined in the column `upper value` as a single term, or a comma separated list of terms. The domain and range classes can also be provided as a single term, or a comma separated list thereof, in the `domain` and `range` columns. There should be a label and a longer description in English text, provided by the `label` and `comment` columns, respectively.
  
    The property can be declared as deprecated by setting the `deprecated` column to "yes".
- `individual`: definition of an individual, i.e., a single resource defined in the vocabulary. The `id` column defines the individual's name (no prefix should be used); the possible types are defined in the column `upper value` as a single term, or a comma separated list of terms. 

## Installation and running 

The script is in TypeScript (version 4.6 and beyond) running on top of node.js (version 16 and beyond). To install and run the script:

1. Install [node.js](https://nodejs.org/) on your local machine. Installation of node.js should also automatically install the [npm](https://www.npmjs.com) package manager.
2. In the directory of the script run `npm install` on the command line. This installs all the necessary packages in the `node_modules` subdirectory.
3. The script can be run through `npm run generate` on the command line.

The vocabulary specification in CSV is in the `vocabulary.csv` file. The script generates the files `vocabulary.ttl`, `vocabulary.jsonld` and `vocabulary.html` for, respectively, the Turtle, JSON-LD, and HTML representations.

## Content of the directory

- `Readme.md`: this file.
- `vocabulary.csv`: the vocabulary specification.
- `package.json`: configuration file for `npm`.
- `template.json`: an HTML template file used by the script; it is the skeleton of the final HTML format, also based on [respec](https://respec.org/docs/). Care should be taken, if the file is modified, not to change the core structure and the various, possibly empty, HTML elements with `@id` values. Those elements are filled with content by the script when generating the `vocabulary.html` file.
- `lib` directory: the TypeScript modules for the script.
- `main.ts`: the TypeScript entry point to the script.

The following files and directories are generated/modified by either the script or `npm`; better not to touch these directly:

- `package-lock.json`: used by `npm` as an internal file for the packages.
- `node_modules` directory: the various Javascript libraries used by the script. This directory should _not_ be uploaded to github, it is strictly for the local activation of the script.
- `vocabulary.ttl`, `vocabulary.jsonld`, `vocabulary.html`: the vocabulary representation in different format. These are the only files "visible", conceptually, to the outside.

## Acknowledgement

The original idea, structure, and script (in Ruby) was created by Gregg Kellogg for v1 of the Credentials Vocabulary. The CSV definitions have been slightly updated/changed, and the script itself has been completely re-written in TypeScript.
