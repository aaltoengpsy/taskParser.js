// Vite:
import tasks from './exampletasks?raw'

/* 
// Node in general, but this cannot be used in clientside code
const fs = require('fs')
const tasks = fs.readFileSync('./exampletasks').toString()
*/

const loadTasks = () => {
  try {

    // Identify steps (#)
    const rawSteps = tasks.split('#').slice(1)

    // Parse steps
    const steps = rawSteps.map((rs) => {
      
      // Parse step title
      const stepTitle = rs.split('>')[0].trim()
      const stepType = stepTitle.toLowerCase().includes('task') ? 'task' : 'questionnaire'

      // Parse step contents (>)
      let stepContent = ''
      if (stepType === 'task') {
        // For tasks, split into paragraphs
        const paragraphs = rs.split('>').slice(1).map((p) => p.trim())

        stepContent = paragraphs.map((p) => {
          if (p.substring(0, 1) === '!') {
            return {
              type: 'image',
              url: String(p.split('(')[1].split(')')[0].trim())
            }
          } else {
            return {
              type: 'text',
              text: p
            }
          }
        })

      } else {
        // For questions steps, separate the questions (>)
        const rawQuestions = rs.split('>').slice(1)

        // Parse question contents ($)
        const questions = rawQuestions.map((rq) => {
          const questionText = rq.split('$')[0].trim()
          const questionType = rq.split('$')[1].trim().split(',')[0].trim()

          // Parse additional options if present (,)
          if (questionType === 'likert') {
            const params = rq.split('$')[1].trim().split(',').slice(1)

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
              options: rq.split('$')[1].trim().split(',').slice(1).map((o) => o.trim())
            }
          }

          return { question: questionText, type: questionType }
        })

        stepContent = questions
      }

      return {
        title: stepTitle,
        type: stepType,
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