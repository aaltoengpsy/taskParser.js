# taskParser.js

Parsing questionnaires to JS objects from human-readable markdown-like text files.

Intended for when you need to integrate questionnaires into a web application. ***Just use Qualtrics / MS forms / Google forms unless you really need something custom!***

## Source File Format

You can find an example task/questionnaire file [here](./exampletasks).

- `#` Marks the beginning of a **step**. Everything between this and the next `#` or `>` is considered the step title. The step title should include the string `task` or `questionnaire`. Note that how you render these is up to you.

```md
# Task 1

# Questionnaire 1

# Task 2: Instructions
```

- `>` Marks a **paragraph** (`task` step) or a **question** (`questionnaire` step)

```md
# Task 1

> This is the first paragraph of your task instructions.

> This is the second paragraph of your task instructions.

# Questionnaire 1

> Were the instructions easy to understand?

...

> How many times did you re-read the instructions?

...

> Indicate your agreement with the following statement: I would like to try again in the future.

...

> (Optional) Provide general thoughts about the task.

...

```

- `$` is used to indicate question parameters in **question**s. This can currently be `text`, `number`, `option` or `likert`.
    - **Question**s of `option` and `likert` type should include additional parameters separated by commas (`,`).
        - There can be as many options to an `option` question as you'd like.
        - `likert` parameters are: `minimum value, maximum value, minimum label, maximum label`

```md
# Questionnaire 1

> Were the instructions easy to understand?

$option, Yes, No

> How many times did you re-read the instructions?

$number

> Indicate your agreement with the following statement: I would like to try again in the future.

$likert, 1, 7, Strongly Disagree, Strongly Agree

> (Optional) Provide general thoughts about the task.

$text
```

Note that you can add line breaks, tabs and spaces as you see fit to make the file more readable to you. These are trimmed out when parsing the file.

## Usage

```js
import loadTasks from './taskParser.js'

const tasks = loadTasks()

console.log(tasks)
```

It's that easy!

Now you just need to code the part where everything is rendered ...and the data is collected ...and saved 😄

### Output

```js
[
    {
        title: "Task 1",
        type: "task",
        content: [
            "This is a paragraph.",
            "This is another paragraph"
        ]
    },
    {
        title: "Questionnaire 1",
        type: "questionnaire",
        content: [
            {
                question: "What did you think of the task?",
                type: "text"
            },
            {
                question: "How many times did you try the task?",
                type: "number"
            },
            {
                question: "This task made me feel ___",
                type: "likert",
                min: 1,
                max: 7,
                minLabel: "Unpleasant",
                maxLabel: "Pleasant"
            },
            {
                question: "Were the instructions clear?",
                type: "option",
                options: ["Yes", "No", "Maybe"]
            }
        ]
    }
]
```