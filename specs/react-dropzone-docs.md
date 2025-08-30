### react dropzone docs

You can either use the hook:

import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {
  const onDrop \= useCallback(acceptedFiles \=> {
    // Do something with the files
  }, \[\])
  const {getRootProps, getInputProps, isDragActive} \= useDropzone({onDrop})

  return (
    <div {...getRootProps()}\>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p\>Drop the files here ...</p\> :
          <p\>Drag 'n' drop some files here, or click to select files</p\>
      }
    </div\>
  )
}

Or the wrapper component for the hook:

import React from 'react'
import Dropzone from 'react-dropzone'

<Dropzone onDrop\={acceptedFiles \=> console.log(acceptedFiles)}\>
  {({getRootProps, getInputProps}) \=> (
    <section\>
      <div {...getRootProps()}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
    </section\>
  )}
</Dropzone\>

If you want to access file contents you have to use the [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader):

import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {
  const onDrop \= useCallback((acceptedFiles) \=> {
    acceptedFiles.forEach((file) \=> {
      const reader \= new FileReader()

      reader.onabort \= () \=> console.log('file reading was aborted')
      reader.onerror \= () \=> console.log('file reading has failed')
      reader.onload \= () \=> {
      // Do whatever you want with the file contents
        const binaryStr \= reader.result
        console.log(binaryStr)
      }
      reader.readAsArrayBuffer(file)
    })

  }, \[\])
  const {getRootProps, getInputProps} \= useDropzone({onDrop})

  return (
    <div {...getRootProps()}\>
      <input {...getInputProps()} />
      <p\>Drag 'n' drop some files here, or click to select files</p\>
    </div\>
  )
}

Dropzone Props Getters
----------------------

The dropzone property getters are just two functions that return objects with properties which you need to use to create the drag 'n' drop zone. The root properties can be applied to whatever element you want, whereas the input properties must be applied to an `<input>`:

import React from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {
  const {getRootProps, getInputProps} \= useDropzone()

  return (
    <div {...getRootProps()}\>
      <input {...getInputProps()} />
      <p\>Drag 'n' drop some files here, or click to select files</p\>
    </div\>
  )
}

Note that whatever other props you want to add to the element where the props from `getRootProps()` are set, you should always pass them through that function rather than applying them on the element itself. This is in order to avoid your props being overridden (or overriding the props returned by `getRootProps()`):

<div
  {...getRootProps({
    onClick: event \=\> console.log(event),
    role: 'button',
    'aria-label': 'drag and drop area',
    ...
  })}
/>

In the example above, the provided `{onClick}` handler will be invoked before the internal one, therefore, internal callbacks can be prevented by simply using [stopPropagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation). See [Events](https://react-dropzone.js.org#events) for more examples.

_Important_: if you omit rendering an `<input>` and/or binding the props from `getInputProps()`, opening a file dialog will not be possible.

Refs
----

Both `getRootProps` and `getInputProps` accept a custom `refKey` (defaults to `ref`) as one of the attributes passed down in the parameter.

This can be useful when the element you're trying to apply the props from either one of those fns does not expose a reference to the element, e.g:

import React from 'react'
import {useDropzone} from 'react-dropzone'
// NOTE: After v4.0.0, styled components exposes a ref using forwardRef,
// therefore, no need for using innerRef as refKey
import styled from 'styled-components'

const StyledDiv \= styled.div\`
  // Some styling here
\`
function Example() {
  const {getRootProps, getInputProps} \= useDropzone()
  <StyledDiv {...getRootProps({ refKey: 'innerRef' })}\>
    <input {...getInputProps()} />
    <p\>Drag 'n' drop some files here, or click to select files</p\>
  </StyledDiv\>
}

If you're working with [Material UI v4](https://v4.mui.com/) and would like to apply the root props on some component that does not expose a ref, use [RootRef](https://v4.mui.com/api/root-ref/):

import React from 'react'
import {useDropzone} from 'react-dropzone'
import RootRef from '@material-ui/core/RootRef'

function PaperDropzone() {
  const {getRootProps, getInputProps} \= useDropzone()
  const {ref, ...rootProps} \= getRootProps()

  <RootRef rootRef\={ref}\>
    <Paper {...rootProps}\>
      <input {...getInputProps()} />
      <p\>Drag 'n' drop some files here, or click to select files</p\>
    </Paper\>
  </RootRef\>
}

**IMPORTANT**: do not set the `ref` prop on the elements where `getRootProps()`/`getInputProps()` props are set, instead, get the refs from the hook itself:

import React from 'react'
import {useDropzone} from 'react-dropzone'

function Refs() {
  const {
    getRootProps,
    getInputProps,
    rootRef, // Ref to the \`<div>\`
    inputRef // Ref to the \`<input>\`
  } \= useDropzone()
  <div {...getRootProps()}\>
    <input {...getInputProps()} />
    <p\>Drag 'n' drop some files here, or click to select files</p\>
  </div\>
}

If you're using the `<Dropzone>` component, though, you can set the `ref` prop on the component itself which will expose the `{open}` prop that can be used to open the file dialog programmatically:

import React, {createRef} from 'react'
import Dropzone from 'react-dropzone'

const dropzoneRef \= createRef()

<Dropzone ref\={dropzoneRef}\>
  {({getRootProps, getInputProps}) \=> (
    <div {...getRootProps()}\>
      <input {...getInputProps()} />
      <p\>Drag 'n' drop some files here, or click to select files</p\>
    </div\>
  )}
</Dropzone\>

dropzoneRef.open()

Testing
-------

`react-dropzone` makes some of its drag 'n' drop callbacks asynchronous to enable promise based `getFilesFromEvent()` functions. In order to test components that use this library, you need to use the [react-testing-library](https://github.com/testing-library/react-testing-library):

import React from 'react'
import Dropzone from 'react-dropzone'
import {act, fireEvent, render} from '@testing-library/react'

test('invoke onDragEnter when dragenter event occurs', async () \=> {
  const file \= new File(\[
    JSON.stringify({ping: true})
  \], 'ping.json', { type: 'application/json' })
  const data \= mockData(\[file\])
  const onDragEnter \= jest.fn()

  const ui \= (
    <Dropzone onDragEnter\={onDragEnter}\>
      {({ getRootProps, getInputProps }) \=> (
        <div {...getRootProps()}\>
          <input {...getInputProps()} /\>
        </div\>
      )}
    </Dropzone\>
  )
  const { container } \= render(ui)

  await act(
    () \=> fireEvent.dragEnter(
      container.querySelector('div'),
      data,
    )
  );
  expect(onDragEnter).toHaveBeenCalled()
})

function mockData(files) {
  return {
    dataTransfer: {
      files,
      items: files.map(file \=> ({
        kind: 'file',
        type: file.type,
        getAsFile: () \=> file
      })),
      types: \['Files'\]
    }
  }
}

**NOTE**: using [Enzyme](https://airbnb.io/enzyme) for testing is not supported at the moment, see [#2011](https://github.com/airbnb/enzyme/issues/2011).

More examples for this can be found in `react-dropzone`'s own [test suites](https://github.com/react-dropzone/react-dropzone/blob/master/src/index.spec.js).

Caveats
-------

### Required React Version

React [16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html) or above is required because we use [hooks](https://reactjs.org/docs/hooks-intro.html) (the lib itself is a hook).

### File Paths

Files returned by the hook or passed as arg to the `onDrop` cb won't have the properties `path` or `fullPath`. For more inf check [this SO question](https://stackoverflow.com/a/23005925/2275818) and [this issue](https://github.com/react-dropzone/react-dropzone/issues/477).

### Not a File Uploader

This lib is not a file uploader; as such, it does not process files or provide any way to make HTTP requests to some server; if you're looking for that, checkout [filepond](https://pqina.nl/filepond) or [uppy.io](https://uppy.io/).

### Using <label> as Root

If you use [<label>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) as the root element, the file dialog will be opened twice; see [#1107](https://github.com/react-dropzone/react-dropzone/issues/1107) why. To avoid this, use `noClick`:

import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {
  const {getRootProps, getInputProps} \= useDropzone({noClick: true})

  return (
    <label {...getRootProps()}\>
      <input {...getInputProps()} />
    </label\>
  )
}

### Using open() on Click

If you bind a click event on an inner element and use `open()`, it will trigger a click on the root element too, resulting in the file dialog opening twice. To prevent this, use the `noClick` on the root:

import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {
  const {getRootProps, getInputProps, open} \= useDropzone({noClick: true})

  return (
    <div {...getRootProps()}\>
      <input {...getInputProps()} />
      <button type\="button" onClick\={open}\>
        Open
      </button\>
    </div\>
  )
}

### File Dialog Cancel Callback

The `onFileDialogCancel()` cb is unstable in most browsers, meaning, there's a good chance of it being triggered even though you have selected files.

We rely on using a timeout of `300ms` after the window is focused (the window `onfocus` event is triggered when the file select dialog is closed) to check if any files were selected and trigger `onFileDialogCancel` if none were selected.

As one can imagine, this doesn't really work if there's a lot of files or large files as by the time we trigger the check, the browser is still processing the files and no `onchange` events are triggered yet on the input. Check [#1031](https://github.com/react-dropzone/react-dropzone/issues/1031) for more info.

Fortunately, there's the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), which is currently a working draft and some browsers support it (see [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker#browser_compatibility)), that provides a reliable way to prompt the user for file selection and capture cancellation.

Also keep in mind that the FS access API can only be used in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).

**NOTE** You can enable using the FS access API with the `useFsAccessApi` property: `useDropzone({useFsAccessApi: true})`.

### File System Access API

When setting `useFsAccessApi` to `true`, you're switching to the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) (see the [file system access](https://wicg.github.io/file-system-access/) RFC).

What this essentially does is that it will use the [showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker) method to open the file picker window so that the user can select files.

In contrast, the traditional way (when the `useFsAccessApi` is not set to `true` or not specified) uses an `<input type="file">` (see [docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)) on which a click event is triggered.

With the use of the file system access API enabled, there's a couple of caveats to keep in mind:

1.  The users will not be able to select directories
2.  It requires the app to run in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
3.  In [Electron](https://www.electronjs.org/), the path may not be set (see [#1249](https://github.com/react-dropzone/react-dropzone/issues/1249))

Supported Browsers
------------------

We use [browserslist](https://github.com/browserslist/browserslist) config to state the browser support for this lib, so check it out on [browserslist.dev](https://browserslist.dev/?q=ZGVmYXVsdHM%3D).

Need image editing?
-------------------

React Dropzone integrates perfectly with [Pintura Image Editor](https://pqina.nl/pintura/?ref=react-dropzone), creating a modern image editing experience. Pintura supports crop aspect ratios, resizing, rotating, cropping, annotating, filtering, and much more.

Checkout the [Pintura integration example](https://codesandbox.io/s/react-dropzone-pintura-40xh4?file=/src/App.js).

Support
-------

### Backers

Support us with a monthly donation and help us continue our activities. \[[Become a backer](https://opencollective.com/react-dropzone#backer)\]

[![](https://opencollective.com/react-dropzone/backer/0/avatar.svg)](https://opencollective.com/react-dropzone/backer/0/website)[![](https://opencollective.com/react-dropzone/backer/1/avatar.svg)](https://opencollective.com/react-dropzone/backer/1/website)[![](https://opencollective.com/react-dropzone/backer/2/avatar.svg)](https://opencollective.com/react-dropzone/backer/2/website)[![](https://opencollective.com/react-dropzone/backer/3/avatar.svg)](https://opencollective.com/react-dropzone/backer/3/website)[![](https://opencollective.com/react-dropzone/backer/4/avatar.svg)](https://opencollective.com/react-dropzone/backer/4/website)[![](https://opencollective.com/react-dropzone/backer/5/avatar.svg)](https://opencollective.com/react-dropzone/backer/5/website)[![](https://opencollective.com/react-dropzone/backer/6/avatar.svg)](https://opencollective.com/react-dropzone/backer/6/website)[![](https://opencollective.com/react-dropzone/backer/7/avatar.svg)](https://opencollective.com/react-dropzone/backer/7/website)[![](https://opencollective.com/react-dropzone/backer/8/avatar.svg)](https://opencollective.com/react-dropzone/backer/8/website)[![](https://opencollective.com/react-dropzone/backer/9/avatar.svg)](https://opencollective.com/react-dropzone/backer/9/website)[![](https://opencollective.com/react-dropzone/backer/10/avatar.svg)](https://opencollective.com/react-dropzone/backer/10/website)[![](https://opencollective.com/react-dropzone/backer/11/avatar.svg)](https://opencollective.com/react-dropzone/backer/11/website)[![](https://opencollective.com/react-dropzone/backer/12/avatar.svg)](https://opencollective.com/react-dropzone/backer/12/website)[![](https://opencollective.com/react-dropzone/backer/13/avatar.svg)](https://opencollective.com/react-dropzone/backer/13/website)[![](https://opencollective.com/react-dropzone/backer/14/avatar.svg)](https://opencollective.com/react-dropzone/backer/14/website)[![](https://opencollective.com/react-dropzone/backer/15/avatar.svg)](https://opencollective.com/react-dropzone/backer/15/website)[![](https://opencollective.com/react-dropzone/backer/16/avatar.svg)](https://opencollective.com/react-dropzone/backer/16/website)[![](https://opencollective.com/react-dropzone/backer/17/avatar.svg)](https://opencollective.com/react-dropzone/backer/17/website)[![](https://opencollective.com/react-dropzone/backer/18/avatar.svg)](https://opencollective.com/react-dropzone/backer/18/website)[![](https://opencollective.com/react-dropzone/backer/19/avatar.svg)](https://opencollective.com/react-dropzone/backer/19/website)[![](https://opencollective.com/react-dropzone/backer/20/avatar.svg)](https://opencollective.com/react-dropzone/backer/20/website)[![](https://opencollective.com/react-dropzone/backer/21/avatar.svg)](https://opencollective.com/react-dropzone/backer/21/website)[![](https://opencollective.com/react-dropzone/backer/22/avatar.svg)](https://opencollective.com/react-dropzone/backer/22/website)[![](https://opencollective.com/react-dropzone/backer/23/avatar.svg)](https://opencollective.com/react-dropzone/backer/23/website)[![](https://opencollective.com/react-dropzone/backer/24/avatar.svg)](https://opencollective.com/react-dropzone/backer/24/website)[![](https://opencollective.com/react-dropzone/backer/25/avatar.svg)](https://opencollective.com/react-dropzone/backer/25/website)[![](https://opencollective.com/react-dropzone/backer/26/avatar.svg)](https://opencollective.com/react-dropzone/backer/26/website)[![](https://opencollective.com/react-dropzone/backer/27/avatar.svg)](https://opencollective.com/react-dropzone/backer/27/website)[![](https://opencollective.com/react-dropzone/backer/28/avatar.svg)](https://opencollective.com/react-dropzone/backer/28/website)[![](https://opencollective.com/react-dropzone/backer/29/avatar.svg)](https://opencollective.com/react-dropzone/backer/29/website)

### Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site. \[[Become a sponsor](https://opencollective.com/react-dropzone#sponsor)\]

[![](https://opencollective.com/react-dropzone/sponsor/0/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/0/website)[![](https://opencollective.com/react-dropzone/sponsor/1/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/1/website)[![](https://opencollective.com/react-dropzone/sponsor/2/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/2/website)[![](https://opencollective.com/react-dropzone/sponsor/3/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/3/website)[![](https://opencollective.com/react-dropzone/sponsor/4/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/4/website)[![](https://opencollective.com/react-dropzone/sponsor/5/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/5/website)[![](https://opencollective.com/react-dropzone/sponsor/6/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/6/website)[![](https://opencollective.com/react-dropzone/sponsor/7/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/7/website)[![](https://opencollective.com/react-dropzone/sponsor/8/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/8/website)[![](https://opencollective.com/react-dropzone/sponsor/9/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/9/website)[![](https://opencollective.com/react-dropzone/sponsor/10/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/10/website)[![](https://opencollective.com/react-dropzone/sponsor/11/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/11/website)[![](https://opencollective.com/react-dropzone/sponsor/12/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/12/website)[![](https://opencollective.com/react-dropzone/sponsor/13/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/13/website)[![](https://opencollective.com/react-dropzone/sponsor/14/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/14/website)[![](https://opencollective.com/react-dropzone/sponsor/15/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/15/website)[![](https://opencollective.com/react-dropzone/sponsor/16/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/16/website)[![](https://opencollective.com/react-dropzone/sponsor/17/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/17/website)[![](https://opencollective.com/react-dropzone/sponsor/18/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/18/website)[![](https://opencollective.com/react-dropzone/sponsor/19/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/19/website)[![](https://opencollective.com/react-dropzone/sponsor/20/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/20/website)[![](https://opencollective.com/react-dropzone/sponsor/21/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/21/website)[![](https://opencollective.com/react-dropzone/sponsor/22/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/22/website)[![](https://opencollective.com/react-dropzone/sponsor/23/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/23/website)[![](https://opencollective.com/react-dropzone/sponsor/24/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/24/website)[![](https://opencollective.com/react-dropzone/sponsor/25/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/25/website)[![](https://opencollective.com/react-dropzone/sponsor/26/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/26/website)[![](https://opencollective.com/react-dropzone/sponsor/27/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/27/website)[![](https://opencollective.com/react-dropzone/sponsor/28/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/28/website)[![](https://opencollective.com/react-dropzone/sponsor/29/avatar.svg)](https://opencollective.com/react-dropzone/sponsor/29/website)

### Hosting

[react-dropzone.js.org](https://react-dropzone.js.org/) hosting provided by [netlify](https://www.netlify.com/).

Contribute
----------

Checkout the organization [CONTRIBUTING.md](https://github.com/react-dropzone/.github/blob/main/CONTRIBUTING.md).

License
-------

MIT

Components
==========

[](/#!/Components "Open isolated")

[Dropzone](/#src)
-----------------

[](/#!/Dropzone "Open isolated")

src/index.js

Convenience wrapper component for the `useDropzone` hook

<Dropzone\>
  {({getRootProps, getInputProps}) \=> (
    <div {...getRootProps()}\>
      <input {...getInputProps()} />
      <p\>Drag 'n' drop some files here, or click to select files</p\>
    </div\>
  )}
</Dropzone\>

Props & methods

Prop name

Type

Default

Description

`accept`

{string\[\]}

Set accepted file types. Checkout [https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker) types option for more information. Keep in mind that mime type determination is not reliable across platforms. CSV files, for example, are reported as text/plain under macOS but as application/vnd.ms-excel under Windows. In some cases there might not be a mime type set at all ([https://github.com/react-dropzone/react-dropzone/issues/276](https://github.com/react-dropzone/react-dropzone/issues/276)).

`autoFocus`

bool

`false`

Set to true to focus the root element on render

`children`

func

Render function that exposes the dropzone state and prop getter fns

##### Arguments

`params`: object`params.getRootProps`: Function — Returns the props you should apply to the root drop container you render`params.getInputProps`: Function — Returns the props you should apply to hidden file input you render`params.open`: Function — Open the native file selection dialog`params.isFocused`: boolean — Dropzone area is in focus`params.isFileDialogActive`: boolean — File dialog is opened`params.isDragActive`: boolean — Active drag is in progress`params.isDragAccept`: boolean — Dragged files are accepted`params.isDragReject`: boolean — Some dragged files are rejected`params.acceptedFiles`: Array.<File> — Accepted files`params.fileRejections`: Array.<FileRejection> — Rejected files and why they were rejected

`disabled`

bool

`false`

Enable/disable the dropzone

`getFilesFromEvent`

func

Function

Use this to provide a custom file aggregator

##### Arguments

`event`: (DragEvent | Event | Array.<FileSystemFileHandle>) — A drag event or input change event (if files were selected via the file dialog)

`maxFiles`

number

`0`

Maximum accepted number of files The default value is 0 which means there is no limitation to how many files are accepted.

`maxSize`

number

`Infinity`

Maximum file size (in bytes)

`minSize`

number

`0`

Minimum file size (in bytes)

`multiple`

bool

`true`

Allow drag 'n' drop (or selection from the file dialog) of multiple files

`noClick`

bool

`false`

If true, disables click to open the native file selection dialog

`noDrag`

bool

`false`

If true, disables drag 'n' drop

`noDragEventsBubbling`

bool

`false`

If true, stops drag event propagation to parents

`noKeyboard`

bool

`false`

If true, disables SPACE/ENTER to open the native file selection dialog. Note that it also stops tracking the focus state.

`onDragEnter`

func

Cb for when the `dragenter` event occurs.

##### Arguments

`event`: DragEvent

`onDragLeave`

func

Cb for when the `dragleave` event occurs

##### Arguments

`event`: DragEvent

`onDragOver`

func

Cb for when the `dragover` event occurs

##### Arguments

`event`: DragEvent

`onDrop`

func

Cb for when the `drop` event occurs. Note that this callback is invoked after the `getFilesFromEvent` callback is done.

Files are accepted or rejected based on the `accept`, `multiple`, `minSize` and `maxSize` props. `accept` must be a valid [MIME type](http://www.iana.org/assignments/media-types/media-types.xhtml) according to [input element specification](https://www.w3.org/wiki/HTML/Elements/input/file) or a valid file extension. If `multiple` is set to false and additional files are dropped, all files besides the first will be rejected. Any file which does not have a size in the \[`minSize`, `maxSize`\] range, will be rejected as well.

Note that the `onDrop` callback will always be invoked regardless if the dropped files were accepted or rejected. If you'd like to react to a specific scenario, use the `onDropAccepted`/`onDropRejected` props.

`onDrop` will provide you with an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File) objects which you can then process and send to a server. For example, with [SuperAgent](https://github.com/visionmedia/superagent) as a http/ajax library:

function onDrop(acceptedFiles) {
  const req = request.post('/upload')
  acceptedFiles.forEach(file => {
    req.attach(file.name, file)
  })
  req.end(callback)
}

##### Arguments

`acceptedFiles`: Array.<File>`fileRejections`: Array.<FileRejection>`event`: (DragEvent | Event) — A drag event or input change event (if files were selected via the file dialog)

`onDropAccepted`

func

Cb for when the `drop` event occurs. Note that if no files are accepted, this callback is not invoked.

##### Arguments

`files`: Array.<File>`event`: (DragEvent | Event)

`onDropRejected`

func

Cb for when the `drop` event occurs. Note that if no files are rejected, this callback is not invoked.

##### Arguments

`fileRejections`: Array.<FileRejection>`event`: (DragEvent | Event)

`onError`

func

Cb for when there's some error from any of the promises.

##### Arguments

`error`: Error

`onFileDialogCancel`

func

Cb for when closing the file dialog with no selection

`onFileDialogOpen`

func

Cb for when opening the file dialog

`preventDropOnDocument`

bool

`true`

If false, allow dropped items to take over the current browser window

`useFsAccessApi`

bool

`false`

Set to true to use the [https://developer.mozilla.org/en-US/docs/Web/API/File\_System\_Access\_API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) to open the file picker instead of using an `<input type="file">` click event.

`validator`

func

`null`

Custom validation function. It must return null if there's no errors.

##### Arguments

`file`: File

Returns (FileError | Array.<FileError> | null)

Examples
========

[](/#!/Examples "Open isolated")

Basic example
-------------

[](/#!/Basic%20example "Open isolated")

The `useDropzone` hook just binds the necessary handlers to create a drag 'n' drop zone. Use the `getRootProps()` fn to get the props required for drag 'n' drop and use them on any element. For click and keydown behavior, use the `getInputProps()` fn and use the returned props on an `<input>`.

Furthermore, the hook supports folder drag 'n' drop by default. See [file-selector](https://github.com/react-dropzone/file-selector) for more info about supported browsers.

Drag 'n' drop some files here, or click to select files

#### Files

View Code

[](/#!/Basic%20example/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Basic(props) { const {acceptedFiles, getRootProps, getInputProps} = useDropzone(); const files = acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> )); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } <Basic />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Basic(props) {
  const {acceptedFiles, getRootProps, getInputProps} \= useDropzone();

  const files \= acceptedFiles.map(file \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
    </li\>
  ));

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

<Basic />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Dropzone with `disabled` property:

Drag 'n' drop some files here, or click to select files

#### Files

View Code

[](/#!/Basic%20example/3 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Basic(props) { const {acceptedFiles, getRootProps, getInputProps} = useDropzone({ disabled: true }); const files = acceptedFiles.map(file => ( <li key={file.name}> {file.name} - {file.size} bytes </li> )); return ( <section className="container"> <div {...getRootProps({className: 'dropzone disabled'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } <Basic />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Basic(props) {
  const {acceptedFiles, getRootProps, getInputProps} \= useDropzone({
    disabled: true
  });

  const files \= acceptedFiles.map(file \=> (
    <li key\={file.name}\>
      {file.name} - {file.size} bytes
    </li\>
  ));

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone disabled'})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

<Basic />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Event Propagation
-----------------

[](/#!/Event%20Propagation "Open isolated")

If you'd like to prevent drag events propagation from the child to parent, you can use the `{noDragEventsBubbling}` property on the child:

Inner dropzone

Outer dropzone

View Code

[](/#!/Event%20Propagation/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function OuterDropzone(props) { const {getRootProps} = useDropzone({ // Note how this callback is never invoked if drop occurs on the inner dropzone onDrop: files => console.log(files) }); return ( <div className="container"> <div {...getRootProps({className: 'dropzone'})}> <InnerDropzone /> <p>Outer dropzone</p> </div> </div> ); } function InnerDropzone(props) { const {getRootProps} = useDropzone({noDragEventsBubbling: true}); return ( <div {...getRootProps({className: 'dropzone'})}> <p>Inner dropzone</p> </div> ); } <OuterDropzone />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function OuterDropzone(props) {
  const {getRootProps} \= useDropzone({
    // Note how this callback is never invoked if drop occurs on the inner dropzone
    onDrop: files \=> console.log(files)
  });

  return (
    <div className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <InnerDropzone />
        <p\>Outer dropzone</p\>
      </div\>
    </div\>
  );
}

function InnerDropzone(props) {
  const {getRootProps} \= useDropzone({noDragEventsBubbling: true});
  return (
    <div {...getRootProps({className: 'dropzone'})}\>
      <p\>Inner dropzone</p\>
    </div\>
  );
}

<OuterDropzone />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Note that internally we use `event.stopPropagation()` to achieve the behavior illustrated above, but this comes with its own [drawbacks](https://javascript.info/bubbling-and-capturing#stopping-bubbling).

If you'd like to selectively turn off the default dropzone behavior for `onClick`, use the `{noClick}` property:

Dropzone without click events

#### Files

View Code

[](/#!/Event%20Propagation/3 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function DropzoneWithoutClick(props) { const {getRootProps, getInputProps, acceptedFiles} = useDropzone({noClick: true}); const files = acceptedFiles.map(file => <li key={file.path}>{file.path}</li>); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Dropzone without click events</p> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } <DropzoneWithoutClick />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function DropzoneWithoutClick(props) {
  const {getRootProps, getInputProps, acceptedFiles} \= useDropzone({noClick: true});
  const files \= acceptedFiles.map(file \=> <li key\={file.path}\>{file.path}</li\>);

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Dropzone without click events</p\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

<DropzoneWithoutClick />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

If you'd like to selectively turn off the default dropzone behavior for `onKeyDown`, `onFocus` and `onBlur`, use the `{noKeyboard}` property:

Dropzone without keyboard events

_(SPACE/ENTER and focus events are disabled)_

#### Files

View Code

[](/#!/Event%20Propagation/5 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function DropzoneWithoutKeyboard(props) { const {getRootProps, getInputProps, acceptedFiles} = useDropzone({noKeyboard: true}); const files = acceptedFiles.map(file => <li key={file.path}>{file.path}</li>); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Dropzone without keyboard events</p> <em>(SPACE/ENTER and focus events are disabled)</em> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } <DropzoneWithoutKeyboard />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function DropzoneWithoutKeyboard(props) {
  const {getRootProps, getInputProps, acceptedFiles} \= useDropzone({noKeyboard: true});
  const files \= acceptedFiles.map(file \=> <li key\={file.path}\>{file.path}</li\>);

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Dropzone without keyboard events</p\>
        <em\>(SPACE/ENTER and focus events are disabled)</em\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

<DropzoneWithoutKeyboard />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Or you can prevent the default behavior for both click and keyboard events if you omit the input:

Dropzone without click events

#### Files

View Code

[](/#!/Event%20Propagation/7 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function DropzoneWithoutClick(props) { const {getRootProps, acceptedFiles} = useDropzone(); const files = acceptedFiles.map(file => <li key={file.path}>{file.path}</li>); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <p>Dropzone without click events</p> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } <DropzoneWithoutClick />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function DropzoneWithoutClick(props) {
  const {getRootProps, acceptedFiles} \= useDropzone();
  const files \= acceptedFiles.map(file \=> <li key\={file.path}\>{file.path}</li\>);

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <p\>Dropzone without click events</p\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

<DropzoneWithoutClick />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

**NOTE** If the browser supports the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) and you've set the `useFsAccessApi` to true, removing the `<input>` has no effect.

If you'd like to selectively turn off the default dropzone behavior for drag events, use the `{noDrag}` property:

Dropzone with no drag events

_(Drag 'n' drop is disabled)_

#### Files

View Code

[](/#!/Event%20Propagation/9 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function DropzoneWithoutDrag(props) { const {getRootProps, getInputProps, acceptedFiles} = useDropzone({noDrag: true}); const files = acceptedFiles.map(file => <li key={file.path}>{file.path}</li>); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Dropzone with no drag events</p> <em>(Drag 'n' drop is disabled)</em> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } <DropzoneWithoutDrag />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function DropzoneWithoutDrag(props) {
  const {getRootProps, getInputProps, acceptedFiles} \= useDropzone({noDrag: true});
  const files \= acceptedFiles.map(file \=> <li key\={file.path}\>{file.path}</li\>);

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Dropzone with no drag events</p\>
        <em\>(Drag 'n' drop is disabled)</em\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

<DropzoneWithoutDrag />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Keep in mind that if you provide your own callback handlers as well and use `event.stopPropagation()`, it will prevent the default dropzone behavior:

Drag 'n' drop some files here, or click to select files

View Code

[](/#!/Event%20Propagation/11 "Open isolated")

import React from 'react'; import Dropzone from 'react-dropzone'; // Note that there will be nothing logged when files are dropped <Dropzone onDrop={files => console.log(files)}> {({getRootProps, getInputProps}) => ( <div className="container"> <div {...getRootProps({ className: 'dropzone', onDrop: event => event.stopPropagation() })} > <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> </div> )} </Dropzone>

import React from 'react';
import Dropzone from 'react-dropzone';

// Note that there will be nothing logged when files are dropped
<Dropzone onDrop\={files \=> console.log(files)}\>
  {({getRootProps, getInputProps}) \=> (
    <div className\="container"\>
      <div
        {...getRootProps({
          className: 'dropzone',
          onDrop: event \=\> event.stopPropagation()
        })}
      \>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
    </div\>
  )}
</Dropzone\>

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Forms
-----

[](/#!/Forms "Open isolated")

React-dropzone does not submit the files in form submissions by default.

If you need this behavior, you can add a hidden file input, and set the files into it.

Drag 'n' drop some files here

Open File Dialog

#### Files

Submit

View Code

[](/#!/Forms/1 "Open isolated")

import React, {useRef} from 'react'; import {useDropzone} from 'react-dropzone'; function Dropzone(props) { const {required, name} = props; const hiddenInputRef = useRef(null); const {getRootProps, getInputProps, open, acceptedFiles} = useDropzone({ onDrop: (incomingFiles) => { if (hiddenInputRef.current) { // Note the specific way we need to munge the file into the hidden input // https://stackoverflow.com/a/68182158/1068446 const dataTransfer = new DataTransfer(); incomingFiles.forEach((v) => { dataTransfer.items.add(v); }); hiddenInputRef.current.files = dataTransfer.files; } } }); const files = acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> )); return ( <div className="container"> <div {...getRootProps({className: 'dropzone'})}> {/\* Add a hidden file input Best to use opacity 0, so that the required validation message will appear on form submission \*/} <input type ="file" name={name} required={required} style ={{opacity: 0}} ref={hiddenInputRef}/> <input {...getInputProps()} /> <p>Drag 'n' drop some files here</p> <button type="button" onClick={open}> Open File Dialog </button> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </div> ); } <form onSubmit={(e) => { e.preventDefault(); // Now get the form data as you regularly would const formData = new FormData(e.currentTarget); const file = formData.get("my-file"); alert(file.name); }}> <Dropzone name ="my-file" required/> <button type="submit">Submit</button> </form>

import React, {useRef} from 'react';
import {useDropzone} from 'react-dropzone';

function Dropzone(props) {
  const {required, name} \= props;

  const hiddenInputRef \= useRef(null);

  const {getRootProps, getInputProps, open, acceptedFiles} \= useDropzone({
    onDrop: (incomingFiles) \=> {
      if (hiddenInputRef.current) {
        // Note the specific way we need to munge the file into the hidden input
        // https://stackoverflow.com/a/68182158/1068446
        const dataTransfer \= new DataTransfer();
        incomingFiles.forEach((v) \=> {
          dataTransfer.items.add(v);
        });
        hiddenInputRef.current.files \= dataTransfer.files;
      }
    }
  });

  const files \= acceptedFiles.map(file \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
    </li\>
  ));

  return (
    <div className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        {/\*
          Add a hidden file input
          Best to use opacity 0, so that the required validation message will appear on form submission
        \*/}
        <input type ="file" name={name} required={required} style ={{opacity: 0}} ref={hiddenInputRef}/>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here</p\>
        <button type\="button" onClick\={open}\>
          Open File Dialog
        </button\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </div\>
  );
}

<form onSubmit\={(e) \=> {
  e.preventDefault();

  // Now get the form data as you regularly would
  const formData \= new FormData(e.currentTarget);
  const file \=  formData.get("my-file");
  alert(file.name);
}}\>
  <Dropzone name ="my-file" required/>
  <button type\="submit"\>Submit</button\>
</form\>

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Styling Dropzone
----------------

[](/#!/Styling%20Dropzone "Open isolated")

The hook fn doesn't set any styles on either of the prop fns (`getRootProps()`/`getInputProps()`).

### Using inline styles

Drag 'n' drop some files here, or click to select files

View Code

[](/#!/Styling%20Dropzone/1 "Open isolated")

import React, {useMemo} from 'react'; import {useDropzone} from 'react-dropzone'; const baseStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderWidth: 2, borderRadius: 2, borderColor: '#eeeeee', borderStyle: 'dashed', backgroundColor: '#fafafa', color: '#bdbdbd', outline: 'none', transition: 'border .24s ease-in-out' }; const focusedStyle = { borderColor: '#2196f3' }; const acceptStyle = { borderColor: '#00e676' }; const rejectStyle = { borderColor: '#ff1744' }; function StyledDropzone(props) { const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({accept: {'image/\*': \[\]}}); const style = useMemo(() => ({ ...baseStyle, ...(isFocused ? focusedStyle : {}), ...(isDragAccept ? acceptStyle : {}), ...(isDragReject ? rejectStyle : {}) }), \[ isFocused, isDragAccept, isDragReject \]); return ( <div className="container"> <div {...getRootProps({style})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> </div> ); } <StyledDropzone />

import React, {useMemo} from 'react';
import {useDropzone} from 'react-dropzone';

const baseStyle \= {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle \= {
  borderColor: '#2196f3'
};

const acceptStyle \= {
  borderColor: '#00e676'
};

const rejectStyle \= {
  borderColor: '#ff1744'
};

function StyledDropzone(props) {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } \= useDropzone({accept: {'image/\*': \[\]}});

  const style \= useMemo(() \=> ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), \[
    isFocused,
    isDragAccept,
    isDragReject
  \]);

  return (
    <div className\="container"\>
      <div {...getRootProps({style})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
    </div\>
  );
}

<StyledDropzone />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

### Using styled-components

Drag 'n' drop some files here, or click to select files

View Code

[](/#!/Styling%20Dropzone/3 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; import styled from 'styled-components'; const getColor = (props) => { if (props.isDragAccept) { return '#00e676'; } if (props.isDragReject) { return '#ff1744'; } if (props.isFocused) { return '#2196f3'; } return '#eeeeee'; } const Container = styled.div\` flex: 1; display: flex; flex-direction: column; align-items: center; padding: 20px; border-width: 2px; border-radius: 2px; border-color: ${props => getColor(props)}; border-style: dashed; background-color: #fafafa; color: #bdbdbd; outline: none; transition: border .24s ease-in-out; \`; function StyledDropzone(props) { const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({accept: {'image/\*': \[\]}}); return ( <div className="container"> <Container {...getRootProps({isFocused, isDragAccept, isDragReject})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </Container> </div> ); } <StyledDropzone />

import React from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';

const getColor \= (props) \=> {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isFocused) {
      return '#2196f3';
  }
  return '#eeeeee';
}

const Container \= styled.div\`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props \=> getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
\`;

function StyledDropzone(props) {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } \= useDropzone({accept: {'image/\*': \[\]}});

  return (
    <div className\="container"\>
      <Container {...getRootProps({isFocused, isDragAccept, isDragReject})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </Container\>
    </div\>
  );
}

<StyledDropzone />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Accepting specific file types
-----------------------------

[](/#!/Accepting%20specific%20file%20types "Open isolated")

By providing `accept` prop you can make the dropzone accept specific file types and reject the others.

The value must be an object with a common [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) as keys and an array of file extensions as values (similar to [showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker)'s types `accept` option).

useDropzone({
  accept: {
    'image/png': \['.png'\],
    'text/html': \['.html', '.htm'\],
  }
})

For more information see [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input).

Drag 'n' drop some files here, or click to select files

_(Only \*.jpeg and \*.png images will be accepted)_

#### Accepted files

#### Rejected files

View Code

[](/#!/Accepting%20specific%20file%20types/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Accept(props) { const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({ accept: { 'image/jpeg': \[\], 'image/png': \[\] } }); const acceptedFileItems = acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> )); const fileRejectionItems = fileRejections.map(({ file, errors }) => ( <li key={file.path}> {file.path} - {file.size} bytes <ul> {errors.map(e => ( <li key={e.code}>{e.message}</li> ))} </ul> </li> )); return ( <section className="container"> <div {...getRootProps({ className: 'dropzone' })}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> <em>(Only \*.jpeg and \*.png images will be accepted)</em> </div> <aside> <h4>Accepted files</h4> <ul>{acceptedFileItems}</ul> <h4>Rejected files</h4> <ul>{fileRejectionItems}</ul> </aside> </section> ); } <Accept />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Accept(props) {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } \= useDropzone({
    accept: {
      'image/jpeg': \[\],
      'image/png': \[\]
    }
  });

  const acceptedFileItems \= acceptedFiles.map(file \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
    </li\>
  ));

  const fileRejectionItems \= fileRejections.map(({ file, errors }) \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
      <ul\>
        {errors.map(e \=> (
          <li key\={e.code}\>{e.message}</li\>
        ))}
      </ul\>
    </li\>
  ));

  return (
    <section className\="container"\>
      <div {...getRootProps({ className: 'dropzone' })}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
        <em\>(Only \*.jpeg and \*.png images will be accepted)</em\>
      </div\>
      <aside\>
        <h4\>Accepted files</h4\>
        <ul\>{acceptedFileItems}</ul\>
        <h4\>Rejected files</h4\>
        <ul\>{fileRejectionItems}</ul\>
      </aside\>
    </section\>
  );
}

<Accept />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

### Browser limitations

Because of HTML5 File API differences across different browsers during the drag, Dropzone might not be able to detect whether the files are accepted or rejected in Safari nor IE.

Furthermore, at this moment it's not possible to read file names (and thus, file extensions) during the drag operation. For that reason, if you want to react on different file types _during_ the drag operation, _you have to use_ mime types and not extensions! For example, the following example won't work even in Chrome:

Drop some files here ...

View Code

[](/#!/Accepting%20specific%20file%20types/3 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Accept(props) { const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ accept: { 'image/jpeg': \['.jpeg', '.png'\] } }); return ( <div className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> {isDragAccept && (<p>All files will be accepted</p>)} {isDragReject && (<p>Some files will be rejected</p>)} {!isDragActive && (<p>Drop some files here ...</p>)} </div> </div> ); } <Accept />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Accept(props) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } \= useDropzone({
    accept: {
      'image/jpeg': \['.jpeg', '.png'\]
    }
  });

  return (
    <div className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        {isDragAccept && (<p\>All files will be accepted</p\>)}
        {isDragReject && (<p\>Some files will be rejected</p\>)}
        {!isDragActive && (<p\>Drop some files here ...</p\>)}
      </div\>
    </div\>
  );
}

<Accept />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

but this one will:

Drop some files here ...

View Code

[](/#!/Accepting%20specific%20file%20types/5 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Accept(props) { const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ accept: { 'image/\*': \['.jpeg', '.png'\] } }); return ( <div className="container"> <div {...getRootProps({className: "dropzone"})}> <input {...getInputProps()} /> {isDragAccept && (<p>All files will be accepted</p>)} {isDragReject && (<p>Some files will be rejected</p>)} {!isDragActive && (<p>Drop some files here ...</p>)} </div> </div> ); } <Accept />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Accept(props) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } \= useDropzone({
    accept: {
      'image/\*': \['.jpeg', '.png'\]
    }
  });

  return (
    <div className\="container"\>
      <div {...getRootProps({className: "dropzone"})}\>
        <input {...getInputProps()} />
        {isDragAccept && (<p\>All files will be accepted</p\>)}
          {isDragReject && (<p\>Some files will be rejected</p\>)}
          {!isDragActive && (<p\>Drop some files here ...</p\>)}
      </div\>
    </div\>
  );
}

<Accept />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

### Notes

Mime type determination is not reliable across platforms. CSV files, for example, are reported as text/plain under macOS but as application/vnd.ms-excel under Windows. In some cases there might not be a mime type set at all.

Accepting specific number of files
----------------------------------

[](/#!/Accepting%20specific%20number%20of%20files "Open isolated")

By providing `maxFiles` prop you can limit how many files the dropzone accepts.

**Note** that this prop is enabled when the `multiple` prop is enabled. The default value for this prop is 0, which means there's no limitation to how many files are accepted.

Drag 'n' drop some files here, or click to select files

_(2 files are the maximum number of files you can drop here)_

#### Accepted files

#### Rejected files

View Code

[](/#!/Accepting%20specific%20number%20of%20files/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function AcceptMaxFiles(props) { const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({ maxFiles:2 }); const acceptedFileItems = acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> )); const fileRejectionItems = fileRejections.map(({ file, errors }) => { return ( <li key={file.path}> {file.path} - {file.size} bytes <ul> {errors.map(e => <li key={e.code}>{e.message}</li>)} </ul> </li> ) }); return ( <section className="container"> <div {...getRootProps({ className: 'dropzone' })}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> <em>(2 files are the maximum number of files you can drop here)</em> </div> <aside> <h4>Accepted files</h4> <ul>{acceptedFileItems}</ul> <h4>Rejected files</h4> <ul>{fileRejectionItems}</ul> </aside> </section> ); } <AcceptMaxFiles />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function AcceptMaxFiles(props) {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } \= useDropzone({
    maxFiles:2
  });

  const acceptedFileItems \= acceptedFiles.map(file \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
    </li\>
  ));

  const fileRejectionItems \= fileRejections.map(({ file, errors  }) \=> {
   return (
     <li key\={file.path}\>
          {file.path} - {file.size} bytes
          <ul\>
            {errors.map(e \=> <li key\={e.code}\>{e.message}</li\>)}
         </ul\>

     </li\>
   )
  });


  return (
    <section className\="container"\>
      <div {...getRootProps({ className: 'dropzone' })}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
        <em\>(2 files are the maximum number of files you can drop here)</em\>
      </div\>
      <aside\>
        <h4\>Accepted files</h4\>
        <ul\>{acceptedFileItems}</ul\>
        <h4\>Rejected files</h4\>
        <ul\>{fileRejectionItems}</ul\>
      </aside\>
    </section\>
  );
}

<AcceptMaxFiles />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Custom validation
-----------------

[](/#!/Custom%20validation "Open isolated")

By providing `validator` prop you can specify custom validation for files.

The value must be a function that accepts File object and returns null if file should be accepted or error object/array of error objects if file should be rejected.

Drag 'n' drop some files here, or click to select files

_(Only files with name less than 20 characters will be accepted)_

#### Accepted files

#### Rejected files

View Code

[](/#!/Custom%20validation/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; const maxLength = 20; function nameLengthValidator(file) { if (file.name.length > maxLength) { return { code: "name-too-large", message: \`Name is larger than ${maxLength} characters\` }; } return null } function CustomValidation(props) { const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({ validator: nameLengthValidator }); const acceptedFileItems = acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> )); const fileRejectionItems = fileRejections.map(({ file, errors }) => ( <li key={file.path}> {file.path} - {file.size} bytes <ul> {errors.map(e => ( <li key={e.code}>{e.message}</li> ))} </ul> </li> )); return ( <section className="container"> <div {...getRootProps({ className: 'dropzone' })}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> <em>(Only files with name less than 20 characters will be accepted)</em> </div> <aside> <h4>Accepted files</h4> <ul>{acceptedFileItems}</ul> <h4>Rejected files</h4> <ul>{fileRejectionItems}</ul> </aside> </section> ); } <CustomValidation />

import React from 'react';
import {useDropzone} from 'react-dropzone';

const maxLength \= 20;

function nameLengthValidator(file) {
  if (file.name.length \> maxLength) {
    return {
      code: "name-too-large",
      message: \`Name is larger than ${maxLength} characters\`
    };
  }

  return null
}

function CustomValidation(props) {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } \= useDropzone({
    validator: nameLengthValidator
  });

  const acceptedFileItems \= acceptedFiles.map(file \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
    </li\>
  ));

  const fileRejectionItems \= fileRejections.map(({ file, errors }) \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
      <ul\>
        {errors.map(e \=> (
          <li key\={e.code}\>{e.message}</li\>
        ))}
      </ul\>
    </li\>
  ));

  return (
    <section className\="container"\>
      <div {...getRootProps({ className: 'dropzone' })}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
        <em\>(Only files with name less than 20 characters will be accepted)</em\>
      </div\>
      <aside\>
        <h4\>Accepted files</h4\>
        <ul\>{acceptedFileItems}</ul\>
        <h4\>Rejected files</h4\>
        <ul\>{fileRejectionItems}</ul\>
      </aside\>
    </section\>
  );
}

<CustomValidation />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Opening File Dialog Programmatically
------------------------------------

[](/#!/Opening%20File%20Dialog%20Programmatically "Open isolated")

You can programmatically invoke the default OS file prompt; just use the `open` method returned by the hook.

**Note** that for security reasons most browsers require popups and dialogues to originate from a direct user interaction (i.e. click).

If you are calling `open()` asynchronously, there’s a good chance it’s going to be blocked by the browser. So if you are calling `open()` asynchronously, be sure there is no more than _1000ms_ delay between user interaction and `open()` call.

Due to the lack of official docs on this (at least we haven’t found any. If you know one, feel free to open PR), there is no guarantee that **allowed delay duration** will not be changed in later browser versions. Since implementations may differ between different browsers, avoid calling open asynchronously if possible.

Drag 'n' drop some files here

Open File Dialog

#### Files

View Code

[](/#!/Opening%20File%20Dialog%20Programmatically/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Dropzone(props) { const {getRootProps, getInputProps, open, acceptedFiles} = useDropzone({ // Disable click and keydown behavior noClick: true, noKeyboard: true }); const files = acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> )); return ( <div className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here</p> <button type="button" onClick={open}> Open File Dialog </button> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </div> ); } <Dropzone />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Dropzone(props) {
  const {getRootProps, getInputProps, open, acceptedFiles} \= useDropzone({
    // Disable click and keydown behavior
    noClick: true,
    noKeyboard: true
  });

  const files \= acceptedFiles.map(file \=> (
    <li key\={file.path}\>
      {file.path} - {file.size} bytes
    </li\>
  ));

  return (
    <div className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here</p\>
        <button type\="button" onClick\={open}\>
          Open File Dialog
        </button\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </div\>
  );
}

<Dropzone />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Or use the `ref` exposed by the `<Dropzone>` component:

Drag 'n' drop some files here

Open File Dialog

#### Files

View Code

[](/#!/Opening%20File%20Dialog%20Programmatically/3 "Open isolated")

import React, {createRef} from 'react'; import Dropzone from 'react-dropzone'; const dropzoneRef = createRef(); const openDialog = () => { // Note that the ref is set async, // so it might be null at some point if (dropzoneRef.current) { dropzoneRef.current.open() } }; // Disable click and keydown behavior on the <Dropzone> <Dropzone ref={dropzoneRef} noClick noKeyboard> {({getRootProps, getInputProps, acceptedFiles}) => { return ( <div className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here</p> <button type="button" onClick={openDialog} > Open File Dialog </button> </div> <aside> <h4>Files</h4> <ul> {acceptedFiles.map(file => ( <li key={file.path}> {file.path} - {file.size} bytes </li> ))} </ul> </aside> </div> ); }} </Dropzone>

import React, {createRef} from 'react';
import Dropzone from 'react-dropzone';

const dropzoneRef \= createRef();
const openDialog \= () \=> {
  // Note that the ref is set async,
  // so it might be null at some point
  if (dropzoneRef.current) {
    dropzoneRef.current.open()
  }
};

// Disable click and keydown behavior on the <Dropzone>
<Dropzone ref\={dropzoneRef} noClick noKeyboard\>
  {({getRootProps, getInputProps, acceptedFiles}) \=> {
    return (
      <div className\="container"\>
        <div {...getRootProps({className: 'dropzone'})}\>
          <input {...getInputProps()} />
          <p\>Drag 'n' drop some files here</p\>
          <button
            type\="button"
            onClick\={openDialog}
          \>
            Open File Dialog
          </button\>
        </div\>
        <aside\>
          <h4\>Files</h4\>
          <ul\>
            {acceptedFiles.map(file \=> (
              <li key\={file.path}\>
                {file.path} - {file.size} bytes
              </li\>
            ))}
          </ul\>
        </aside\>
      </div\>
    );
  }}
</Dropzone\>

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Previews
--------

[](/#!/Previews "Open isolated")

Starting with version 7.0.0, the `{preview}` property generation on the [File](https://developer.mozilla.org/en-US/docs/Web/API/File) objects and the `{disablePreview}` property on the `<Dropzone>` have been removed.

If you need the `{preview}`, it can be easily achieved in the `onDrop()` callback:

Drag 'n' drop some files here, or click to select files

View Code

[](/#!/Previews/1 "Open isolated")

import React, {useEffect, useState} from 'react'; import {useDropzone} from 'react-dropzone'; const thumbsContainer = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }; const thumb = { display: 'inline-flex', borderRadius: 2, border: '1px solid #eaeaea', marginBottom: 8, marginRight: 8, width: 100, height: 100, padding: 4, boxSizing: 'border-box' }; const thumbInner = { display: 'flex', minWidth: 0, overflow: 'hidden' }; const img = { display: 'block', width: 'auto', height: '100%' }; function Previews(props) { const \[files, setFiles\] = useState(\[\]); const {getRootProps, getInputProps} = useDropzone({ accept: { 'image/\*': \[\] }, onDrop: acceptedFiles => { setFiles(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))); } }); const thumbs = files.map(file => ( <div style={thumb} key={file.name}> <div style={thumbInner}> <img src={file.preview} style={img} // Revoke data uri after image is loaded onLoad={() => { URL.revokeObjectURL(file.preview) }} /> </div> </div> )); useEffect(() => { // Make sure to revoke the data uris to avoid memory leaks, will run on unmount return () => files.forEach(file => URL.revokeObjectURL(file.preview)); }, \[files\]); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> <aside style={thumbsContainer}> {thumbs} </aside> </section> ); } <Previews />

import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';

const thumbsContainer \= {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb \= {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner \= {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img \= {
  display: 'block',
  width: 'auto',
  height: '100%'
};

function Previews(props) {
  const \[files, setFiles\] \= useState(\[\]);
  const {getRootProps, getInputProps} \= useDropzone({
    accept: {
      'image/\*': \[\]
    },
    onDrop: acceptedFiles \=> {
      setFiles(acceptedFiles.map(file \=> Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  const thumbs \= files.map(file \=> (
    <div style\={thumb} key\={file.name}\>
      <div style\={thumbInner}\>
        <img
          src\={file.preview}
          style\={img}
          // Revoke data uri after image is loaded
          onLoad\={() \=> { URL.revokeObjectURL(file.preview) }}
        />
      </div\>
    </div\>
  ));

  useEffect(() \=> {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () \=> files.forEach(file \=> URL.revokeObjectURL(file.preview));
  }, \[files\]);

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
      <aside style\={thumbsContainer}\>
        {thumbs}
      </aside\>
    </section\>
  );
}

<Previews />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Class Components
----------------

[](/#!/Class%20Components "Open isolated")

If you're still using class components, you can use the [`<Dropzone>`](https://react-dropzone.js.org/#components) component provided by the lib:

Drag 'n' drop some files here, or click to select files

#### Files

View Code

[](/#!/Class%20Components/1 "Open isolated")

import React, {Component} from 'react'; import Dropzone from 'react-dropzone'; class Basic extends Component { constructor() { super(); this.onDrop = (files) => { this.setState({files}) }; this.state = { files: \[\] }; } render() { const files = this.state.files.map(file => ( <li key={file.name}> {file.name} - {file.size} bytes </li> )); return ( <Dropzone onDrop={this.onDrop}> {({getRootProps, getInputProps}) => ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> )} </Dropzone> ); } } <Basic />

import React, {Component} from 'react';
import Dropzone from 'react-dropzone';

class Basic extends Component {
  constructor() {
    super();
    this.onDrop \= (files) \=> {
      this.setState({files})
    };
    this.state \= {
      files: \[\]
    };
  }

  render() {
    const files \= this.state.files.map(file \=> (
      <li key\={file.name}\>
        {file.name} - {file.size} bytes
      </li\>
    ));

    return (
      <Dropzone onDrop\={this.onDrop}\>
        {({getRootProps, getInputProps}) \=> (
          <section className\="container"\>
            <div {...getRootProps({className: 'dropzone'})}\>
              <input {...getInputProps()} />
              <p\>Drag 'n' drop some files here, or click to select files</p\>
            </div\>
            <aside\>
              <h4\>Files</h4\>
              <ul\>{files}</ul\>
            </aside\>
          </section\>
        )}
      </Dropzone\>
    );
  }
}

<Basic />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

No JSX
------

[](/#!/No%20JSX "Open isolated")

If you'd like to use [react without JSX](https://reactjs.org/docs/react-without-jsx.html) you can:

Drag 'n' drop some files here, or click to select files

#### Files

View Code

[](/#!/No%20JSX/1 "Open isolated")

import React, {useCallback, useState} from 'react'; import {useDropzone} from 'react-dropzone'; const e = React.createElement function Basic () { const \[files, setFiles\] = useState(\[\]); const onDrop = useCallback(files => setFiles(files), \[setFiles\]); const {getRootProps, getInputProps} = useDropzone({onDrop}); const fileList = files.map( file => React.createElement('li', {key: file.name}, \`${file.name} - ${file.size} bytes\`) ); return e('section', {className: 'container'}, \[ e('div', getRootProps({className: 'dropzone', key: 'dropzone'}), \[ e('input', getInputProps({key: 'input'})), e('p', {key: 'desc'}, "Drag 'n' drop some files here, or click to select files") \]), e('aside', {key: 'filesContainer'}, \[ e('h4', {key: 'title'}, 'Files'), e('ul', {key: 'fileList'}, fileList) \]) \]); } Basic()

import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';

const e \= React.createElement

function Basic () {
  const \[files, setFiles\] \= useState(\[\]);
  const onDrop \= useCallback(files \=> setFiles(files), \[setFiles\]);

  const {getRootProps, getInputProps} \= useDropzone({onDrop});

  const fileList \= files.map(
    file \=> React.createElement('li', {key: file.name}, \`${file.name} - ${file.size} bytes\`)
  );

  return e('section', {className: 'container'}, \[
    e('div', getRootProps({className: 'dropzone', key: 'dropzone'}), \[
      e('input', getInputProps({key: 'input'})),
      e('p', {key: 'desc'}, "Drag 'n' drop some files here, or click to select files")
    \]),
    e('aside', {key: 'filesContainer'}, \[
      e('h4', {key: 'title'}, 'Files'),
      e('ul', {key: 'fileList'}, fileList)
    \])
  \]);
}

Basic()

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Extending Dropzone
------------------

[](/#!/Extending%20Dropzone "Open isolated")

The hook accepts a `getFilesFromEvent` prop that enhances the handling of dropped file system objects and allows more flexible use of them e.g. passing a function that accepts drop event of a folder and resolves it to an array of files adds plug-in functionality of folders drag-and-drop.

Though, note that the provided `getFilesFromEvent` fn must return a `Promise` with a list of `File` objects (or `DataTransferItem` of `{kind: 'file'}` when data cannot be accessed). Otherwise, the results will be discarded and none of the drag events callbacks will be invoked.

In case you need to extend the `File` with some additional properties, you should use [Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) so that the result will still pass through our filter:

Drag 'n' drop some files here, or click to select files

#### Files

View Code

[](/#!/Extending%20Dropzone/1 "Open isolated")

import React from 'react'; import {useDropzone} from 'react-dropzone'; function Plugin(props) { const {acceptedFiles, getRootProps, getInputProps} = useDropzone({ getFilesFromEvent: event => myCustomFileGetter(event) }); const files = acceptedFiles.map(f => ( <li key={f.name}> {f.name} has <strong>myProps</strong>: {f.myProp === true ? 'YES' : ''} </li> )); return ( <section className="container"> <div {...getRootProps({className: 'dropzone'})}> <input {...getInputProps()} /> <p>Drag 'n' drop some files here, or click to select files</p> </div> <aside> <h4>Files</h4> <ul>{files}</ul> </aside> </section> ); } async function myCustomFileGetter(event) { const files = \[\]; const fileList = event.dataTransfer ? event.dataTransfer.files : event.target.files; for (var i = 0; i < fileList.length; i++) { const file = fileList.item(i); Object.defineProperty(file, 'myProp', { value: true }); files.push(file); } return files; } <Plugin />

import React from 'react';
import {useDropzone} from 'react-dropzone';

function Plugin(props) {
  const {acceptedFiles, getRootProps, getInputProps} \= useDropzone({
    getFilesFromEvent: event \=> myCustomFileGetter(event)
  });

  const files \= acceptedFiles.map(f \=> (
    <li key\={f.name}\>
      {f.name} has <strong\>myProps</strong\>: {f.myProp \=== true ? 'YES' : ''}
    </li\>
  ));

  return (
    <section className\="container"\>
      <div {...getRootProps({className: 'dropzone'})}\>
        <input {...getInputProps()} />
        <p\>Drag 'n' drop some files here, or click to select files</p\>
      </div\>
      <aside\>
        <h4\>Files</h4\>
        <ul\>{files}</ul\>
      </aside\>
    </section\>
  );
}

async function myCustomFileGetter(event) {
  const files \= \[\];
  const fileList \= event.dataTransfer ? event.dataTransfer.files : event.target.files;

  for (var i \= 0; i < fileList.length; i++) {
    const file \= fileList.item(i);

    Object.defineProperty(file, 'myProp', {
      value: true
    });

    files.push(file);
  }

  return files;
}

<Plugin />

/\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Integrations
============

[](/#!/Integrations "Open isolated")

Pintura
-------

[](/#!/Pintura "Open isolated")

If you'd like to integrate the dropzone with the [Pintura](https://pqina.nl/pintura/?ref=react-dropzone) image editor, you just need to pass either of the selected images to the `openDefaultEditor()` method exported by Pintura:

import React, { useState, useEffect } from 'react';

// React Dropzone
import { useDropzone } from 'react-dropzone';

// Pintura Image Editor
import 'pintura/pintura.css';
import { openDefaultEditor } from 'pintura';

// Based on the default React Dropzone image thumbnail example
// The \`thumbButton\` style positions the edit button in the bottom right corner of the thumbnail
const thumbsContainer \= {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    padding: 20,
};

const thumb \= {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box',
};

const thumbInner \= {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden',
};

const img \= {
    display: 'block',
    width: 'auto',
    height: '100%',
};

const thumbButton \= {
    position: 'absolute',
    right: 10,
    bottom: 10,
};

// This function is called when the user taps the edit button.
// It opens the editor and returns the modified file when done
const editImage \= (image, done) \=> {
    const imageFile \= image.pintura ? image.pintura.file : image;
    const imageState \= image.pintura ? image.pintura.data : {};

    const editor \= openDefaultEditor({
        src: imageFile,
        imageState,
    });

    editor.on('close', () \=> {
        // the user cancelled editing the image
    });

    editor.on('process', ({ dest, imageState }) \=> {
        Object.assign(dest, {
            pintura: { file: imageFile, data: imageState },
        });
        done(dest);
    });
};

function App() {
    const \[files, setFiles\] \= useState(\[\]);
    const { getRootProps, getInputProps } \= useDropzone({
        accept: {
          'image/\*': \[\],
        },
        onDrop: (acceptedFiles) \=> {
            setFiles(
                acceptedFiles.map((file) \=>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );
        },
    });

    const thumbs \= files.map((file, index) \=> (
        <div style\={thumb} key\={file.name}\>
            <div style\={thumbInner}\>
                <img src\={file.preview} style\={img} alt\="" />
            </div\>
            <button
                style\={thumbButton}
                onClick\={() \=>
                    editImage(file, (output) \=> {
                        const updatedFiles \= \[...files\];

                        // replace original image with new image
                        updatedFiles\[index\] \= output;

                        // revoke preview URL for old image
                        if (file.preview) URL.revokeObjectURL(file.preview);

                        // set new preview URL
                        Object.assign(output, {
                            preview: URL.createObjectURL(output),
                        });

                        // update view
                        setFiles(updatedFiles);
                    })
                }
            \>
                Edit
            </button\>
        </div\>
    ));

    useEffect(
        () \=> () \=> {
            // Make sure to revoke the Object URL to avoid memory leaks
            files.forEach((file) \=> URL.revokeObjectURL(file.preview));
        },
        \[files\]
    );

    return (
        <section className\="container"\>
            <div {...getRootProps({ className: 'dropzone' })}\>
                <input {...getInputProps()} />
                <p\>Drag 'n' drop some files here, or click to select files</p\>
            </div\>
            <aside style\={thumbsContainer}\>{thumbs}</aside\>
        </section\>
    );
}

export default App;
