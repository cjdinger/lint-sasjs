import { Diagnostic } from '../types/Diagnostic'
import { FileLintRule } from '../types/LintRule'
import { LintRuleType } from '../types/LintRuleType'
import { Severity } from '../types/Severity'
import { trimComments } from '../utils/trimComments'
import { getLineNumber } from '../utils/getLineNumber'
import { getColumnNumber } from '../utils/getColumnNumber'

const name = 'hasMacroParentheses'
const description = 'Enforces the presence of parantheses in macro definitions.'
const message = 'Macro definition missing parentheses'
const test = (value: string) => {
  const diagnostics: Diagnostic[] = []

  const lines: string[] = value ? value.split('\n') : []
  let isCommentStarted = false
  lines.forEach((line, index) => {
    const { statement: trimmedLine, commentStarted } = trimComments(
      line,
      isCommentStarted
    )
    isCommentStarted = commentStarted
    const statements: string[] = trimmedLine ? trimmedLine.split(';') : []

    statements.forEach((statement) => {
      const { statement: trimmedStatement, commentStarted } = trimComments(
        statement,
        isCommentStarted
      )
      isCommentStarted = commentStarted

      if (trimmedStatement.startsWith('%macro')) {
        const macroNameDefinition = trimmedStatement
          .slice(7, trimmedStatement.length)
          .trim()

        const macroNameDefinitionParts = macroNameDefinition.split('(')
        const macroName = macroNameDefinitionParts[0]

        if (!macroName)
          diagnostics.push({
            message: 'Macro definition contains space(s)',
            lineNumber: getLineNumber(lines, index + 1),
            startColumnNumber: getColumnNumber(line, '%macro'),
            endColumnNumber:
              getColumnNumber(line, '%macro') + trimmedStatement.length,
            severity: Severity.Warning
          })
        else if (macroNameDefinitionParts.length === 1)
          diagnostics.push({
            message,
            lineNumber: getLineNumber(lines, index + 1),
            startColumnNumber: getColumnNumber(line, macroNameDefinition),
            endColumnNumber:
              getColumnNumber(line, macroNameDefinition) +
              macroNameDefinition.length -
              1,
            severity: Severity.Warning
          })
        else if (macroName !== macroName.trim())
          diagnostics.push({
            message: 'Macro definition contains space(s)',
            lineNumber: getLineNumber(lines, index + 1),
            startColumnNumber: getColumnNumber(line, macroNameDefinition),
            endColumnNumber:
              getColumnNumber(line, macroNameDefinition) +
              macroNameDefinition.length -
              1,
            severity: Severity.Warning
          })
      }
    })
  })
  return diagnostics
}

/**
 * Lint rule that enforces the presence of parantheses in macro definitions..
 */
export const hasMacroParentheses: FileLintRule = {
  type: LintRuleType.File,
  name,
  description,
  message,
  test
}
