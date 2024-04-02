// Vite:
import exampletasks from './exampletasks?raw'

/* 
// Node in general, but this cannot be used in clientside code
const fs = require('fs')
const tasks = fs.readFileSync('./exampletasks').toString()
*/

/** Load & parse tasks
 * @param tasks (optional) Raw text to parse tasks from. If left empty, example tasks from ./exampletasks will be used.
 * @returns The parsed list of tasks as a JS array.
 */
const loadTasks = (tasks = undefined) => {
  if (!tasks) {
    console.log('Parameter tasks was not defined. Using example tasks.')
    tasks = exampletasks
  }

  try {

    // Identify steps (#)
    const rawSteps = tasks.split('#').slice(1)

    // Parse steps
    const steps = rawSteps.map((rs) => {
      
      // Parse step title
      const stepTitle = rs.split('>')[0].trim()

      // Parse step contents (>)
      let stepContent = ''
      // First, separate into paragraphs (incl. questions) (>)
      const rawQuestions = rs.split('>').slice(1)

      // Parse question contents ($)
      const questions = rawQuestions.map((rq) => {
        // Parse images in questionnaires
        if (rq.trim().startsWith('!')) {
          return { url: String(rq.split('(')[1].split(')')[0].trim()), type: 'image'}
        }

        // Parse paragraphs in questionnaires
        if (rq.split('$').length === 1) {
          return { text: String(rq.trim()), type: 'paragraph'}
        }

        const questionText = rq.split('$')[0].trim()
        const questionType = rq.split('$')[1].trim().split(';')[0].trim()

        // Parse additional options if present (,)
        if (questionType === 'likert' || questionType === 'slider') {
          const params = rq.split('$')[1].trim().split(';').slice(1)

          return {
            question: questionText,
            type: questionType,
            min: parseInt(params[0].trim()),
            max: parseInt(params[1].trim()),
            minLabel: params[2].trim(),
            maxLabel: params[3].trim()
          }
        } else if (questionType === 'option') {
          return {
            question: questionText,
            type: questionType,
            options: rq.split('$')[1].trim().split(';').slice(1).map((o) => o.trim())
          }
        }

        return { question: questionText, type: questionType }
      })

      stepContent = questions
      

      return {
        title: stepTitle,
        content: stepContent
      }
    })

    // Convert to JSON and back as a final "validation" step
    const stepsAsJSON = JSON.stringify(steps)
    return JSON.parse(stepsAsJSON)

  } catch (e) {
    console.log(e)
    return undefined
  }
}

export default loadTasks