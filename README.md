# Dependencies
RealityboxCollab depends on [h5p-realitybox](https://github.com/rwth-acis/h5p-realitybox) by Johannes Ballman and therefore needs the following H5P modules to work:
- [h5p-realitybox](https://github.com/rwth-acis/h5p-realitybox) Other link! (Modified version to work with RealityboxCollab)
- [h5p-babylonbox](https://github.com/rwth-acis/h5p-babylonbox)
- [h5p-kewar-code-1.0.0](https://github.com/otacke/h5p-kewar-code/releases/tag/1.0.0)
- [h5p-editor-3d-model-loader](https://github.com/rwth-acis/h5p-editor-3d-model-loader)
- [H5P.DragNBar 1.5](https://github.com/h5p/h5p-drag-n-bar)
- [H5P.Column 1.13](https://github.com/h5p/h5p-column)
- [H5PEditor.Wizard 1.2](https://github.com/h5p/h5p-editor-wizard)
- [FontAwesome 4.5](https://github.com/h5p/font-awesome)

# Building
- Run `npm install` to get the dependencies after cloning the source files
- Run `npm run build` to build into the `dist` folder
- Run `npm run build:watch` to automatically build when the source code gets modified

# Debugging environment

## Signaling Server
Run `npm run server` to start a debugging signaling server locally on port `1234`
