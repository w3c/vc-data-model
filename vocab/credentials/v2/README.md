# Generate RDFS vocabulary files

The script in the directory generates RDFS vocabulary files in JSON and Turtle formats, plus a human readable HTML file containing the vocabulary in RDFa, based on a simple vocabulary definition in a YAML file. This is done using the [yml2vocab](https://github.com/w3c/yml2vocab); more details about the script can also be found in the [yml2vocab readme file](https://github.com/w3c/yml2vocab).

The generation of the final files is done via a github action (see `/.github/workflows/generate-vocab-files.yml`).


## Content of the directory

- `Readme.md`: this file.
- `vocabulary.yml`: the core vocabulary specification. _Any change on the vocabulary must be made by modifying this file;_ see the separate [description](https://github.com/w3c/yml2vocab) of the underlying YAML format.
- `template.json`: an HTML template file used by the script; it is the skeleton of the final HTML format based on [ReSpec](https://respec.org/docs/). If the file is modified, care should be taken not to change the core structure and the various, possibly empty, HTML elements with `@id` values. The script fills those elements with content when generating the `vocabulary.html` file.

