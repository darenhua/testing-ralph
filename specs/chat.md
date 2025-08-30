chat screen page:

currently the assistant.tsx page is the main page and it's basically a chatgpt clone.
this should be repurposed as the chat screen page, where we no longer need any of the threads lists/app sidebar components and we only bascially need the thread chat.

- split screen ui with adjustable screensize for the split screen (with a min-width for both).
- left side is chatbot using assistants-ui thread component that chats with an ai agent equipped with two tools: answer_question and answer_all_questions.
    - use the makeAssistantTool, useAssistantTool, and makeAssistantToolUI and other assistant-ui messages for tools visualized in this chatbot.
    - the ideal usage is the user will prompt: "do my homework", and the answer_all_questions tool will be called with the file id passed in and other details.
- right side is latex viewer. when the agent ran the write_to_latex tool, which makes an edit to the server side file, the latex viewer should automatically update through streaming.
- top toolbar should be 32 px height, and have 2 text buttons, which allow download of the latex file as pdf and as .tex.


### agent spec
- the "agent" is to be implemented entirely in assistant-ui simply by defining tools that get used by the assistant-ui embedded components. do not worry about making any actual openai api calls, or writing any actual agent loops, simply use the assistant-ui makeAssistantTool, useAssistantTool, and makeAssistantToolUI functionality.

- answer_all_questions tool
    - NOTE that the format of the input .tex file that you will be given will look like this:
    ```
    \begin{problem}{1}
     Prove that a group $G$ of order $n$ cannot have a subgroup of order $n-1$.
    \end{problem}

    \begin{proof}

    \end{proof}


    \begin{problem}{2}
    Let $S$ be a nonempty subset of a group $G$ and define a relation $\sim$ on $G$ by $$a\sim b \text{ if and only if } a^{-1}b\in S.$$ Prove that $\sim$ is an equivalence relation if and only if $S$ is a subgroup of $G$.
    \end{problem}

    \begin{proof}


    % Insert your proof here
    \end{proof}

    \begin{problem}{3}
    Let $H$ be a subgroup of a group $G$. Define the \textbf{centralizer} of $H$ in $G$, $C_G(H)$, as the set $$C_G(H) = \{g\in G\mid g^{-1}hg = h \text{ for all } h\in H\}.$$ Prove that $C_G(H)$ is a subgroup of $G$.
    \end{problem}

    \begin{proof}

    \end{proof}
    ```
    Where the questions have numbers and you will be provided with the question description.

    This tool receives the following parameters:

    ```
    z.object({
        question_number: z.number(),
        question: z.object({
          description: z.string(),
        })
    ```

    and then it makes a request to the nextjs api folder route /answer-question
         - this is a route that initializes an openai responses api call -- where it has a system instructions setup that says "You are a world-class mathematician, answer the following modern algebra proof. ONLY return the latex proof output.".
         - example code, put this in a nextjs api route.
         ```
         from openai import OpenAI
         client = OpenAI()

         response = client.responses.create(
             model="gpt-5",
             instructions="You are a world-class mathematician, think deeply and then write the following modern algebra proof. ONLY return the latex proof output.",
             input="Let $H$ be a subgroup of a group $G$. Define the \textbf{centralizer} of $H$ in $G$, $C_G(H)$, as the set $$C_G(H) = \{g\in G\mid g^{-1}hg = h \text{ for all } h\in H\}.$$ Prove that $C_G(H)$ is a subgroup of $G$."
         )

         print(response.output_text)
         ```
    - upon receiving the /answer-question response, it uses that response to make a request to another nextjs api endpoint called /write-answer, which takes that latex response, the question number, and a selector which contains a substring of the file that ends at the first proof bracket that it needs to insert after,:

    ```
    z.object({
        file_id: z.string(),
        question_number: z.number(),
        selector: z.string(),
        question: z.object({
          answer: z.string(),
        })
    ```

    Heres an example of selector:

    ```
    selector: "\begin{problem}{3}
    Let $H$ be a subgroup of a group $G$. Define the \textbf{centralizer} of $H$ in $G$, $C_G(H)$, as the set $$C_G(H) = \{g\in G\mid g^{-1}hg = h \text{ for all } h\in H\}.$$ Prove that $C_G(H)$ is a subgroup of $G$.
    \end{problem}

    \begin{proof}"
    ```

    Where a new line may be deterministically inserted after the unique position in the file where this selector is found, make and then we have deterministic code to insert the proof inside the open/closed proof brackets of the "file_clone.tex"

    \begin{proof}
    ** THE LATEX RESPONSE GOES HERE**
    \end{proof}

    under the correct question number. Again, find the correct proof brackets to input the proof into by using the selector. Make sure to make the code robust against newline and other tricky cases where finding the seletor in a string representation of the .tex file may fail.
