## About:

This action is used to update a dependent package.json.

It should only be used by `VisualPinball.*` projects in workflows and should not be deployed to the marketplace.

## Usage:

You should use this action in a separate workflow that is dependent on a `Publish` workflow. The following outputs will be set:

- `sourceName` - name in source package.json
- `sourceVersion` - version in source package.json
- `isBump` - true if dependent version differs from the source version, false otherwise

For inputs, the following options are required:

- `source` - path to source project
- `dependent` - path to dependent project

Example yml:

```yaml
name: Dependents
on:
  workflow_run:
    workflows: [ "Publish" ]
    branches: [ master ]
    types:
      - completed

jobs:
  VisualPinball-Unity-Hdrp:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'workflow_run' }}
    steps:
      - uses: actions/checkout@v2
        with:
          path: VisualPinball.Engine
      - name: Checkout VisualPinball.Unity.Hdrp
        uses: actions/checkout@v2
        with:
          repository: VisualPinball/VisualPinball.Unity.Hdrp
          path: VisualPinball.Unity.Hdrp
          token: ${{ secrets.GH_PAT }} 
      - name: Update Dependent
        id: updateDependent
        uses: VisualPinball/update-dependent-action@v0.1.0
        with:
          source: VisualPinball.Engine
          dependent: VisualPinball.Unity.Hdrp
      - name: Commit 
        if: ${{ steps.updateDependent.outputs.isBump == 'true' }} 
        run: |
          cd VisualPinball.Unity.Hdrp
          git config user.name "github-actions"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add package.json
          git commit -m "chore(deps): Update ${{ steps.updateDependent.outputs.sourceName }} to ${{ steps.updateDependent.outputs.sourceVersion }}."
          git push
```           

## Development:

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests
```bash
$ npm test

  PASS  __tests__/main.test.ts
  ✓ should bump source in dependent (8ms)
  ✓ should not bump source in dependent (2ms)
  ✓ should add source if not in dependent (2ms)
```
