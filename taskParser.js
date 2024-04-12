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
    // Identify sections (%%)
    const rawSections = tasks.split('%%').filter((rs) => rs.length !== 0)

    const sections = []
    let pagesSoFar = 0 // Keep track of pages added so far (used to calculate source-based page index below)
    
    for (const section of rawSections) {
      const isRandom = section.split('#')[0].includes('RANDOMIZE')

      // Identify pages (#)
      const rawPages = section.split('#').slice(1)
      
      // Parse pages
      const pages = rawPages.map((rs, pi) => {
        /** pageIndex represents the index of the page within the context of the source file.
        * Weed to use this because of randomized sections where page order may differ from the source,
        * which could mean that different viewers get different page orders. If questions are involved,
        * this would then mean that questionnaire responses get mixed up in logging. 
        * 
        * pi = page index within this section
        * pagesSoFar = number of pages in all previous sections */
        const pageIndex = pi + pagesSoFar
        
        // Parse page title
        const pageTitle = rs.split('>')[0].trim()

        // Then, begin parsing page contents
        let pageContent = ''
        // First, separate the paragraphs & questions (>)
        const rawQuestions = rs.split('>').slice(1)

        // Parse paragraph contents
        const questions = rawQuestions.map((rq) => {
          // Parse images
          if (rq.trim().startsWith('!')) {
            return { url: String(rq.split('(')[1].split(')')[0].trim()), type: 'image'}
          }

          // Parse paragraphs (no $ parameters present)
          if (rq.split('$').length === 1) {
            return { text: String(rq.trim()), type: 'paragraph'}
          }

          // Parse questions 
          const questionText = rq.split('$')[0].trim()
          const questionType = rq.split('$')[1].trim().split(';')[0].trim()

          // Parse additional question options if present (separated by ;)
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

        pageContent = questions

        return {
          sourceIndex: pageIndex,
          title: pageTitle,
          content: pageContent
        }
      })

      pagesSoFar += pages.length // Add the number of pages parsed to the count

      if (isRandom) {
        // Shuffle page order if the section has been designated as randomized
        const shuffledPages = []
        while (pages.length > 0) {
          // Take a random element from the page array and add it to the shuffled array, repeat until no pages are left
          shuffledPages.push(pages.splice(Math.floor(Math.random() * (pages.length)), 1)[0])
        }
        sections.push(shuffledPages)
      } else {
        // Otherwise just return the standard page order
        sections.push(pages)
      }
    }

    // Convert to JSON and back as a final "validation" step
    // sections is an array of arrays of objects so we'll use flat() to reduce the hierarchy into an array of objects
    const pagesAsJSON = JSON.stringify(sections.flat())
    return JSON.parse(pagesAsJSON)

  } catch (e) {
    console.log(e)
    return undefined
  }
}

export default loadTasks