file upload page:

this is the first screen, there is NO authentication or memory stored on the browser
so when the page is refreshed, it is fine if the page is always back to the file upload page

react dropzone should be used and there should be interactions when a file is drag dropped, when a file is uploaded and is processing on the server.

When a file is uploaded and sent to the backend python endpoint, the backend endpoint should create a random id, persist it in the local file system (a folder src/backend/storage/{random_id} is good) and then return the id to the frontend. Then, a clone of this file should also be persisted as "file_clone.tex", in the same folder under {random_id}.

When the frontend receives an id, it should store it as react context/memory, and then render the chat screen. it should just use conditional rendering, there is no need to have seperate nextjs pages.

The dropzone should most of the screen, and it should contain text that says, "Upload your math homework" with description that says "Accepted file types: .tex"

See react dropzone docs if you need it.
