import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'
import { transformerNotationHighlight } from '@shikijs/transformers'
import shiki from 'comark/plugins/shiki'

export const plugins = [
  shiki({
    themes: { light: githubLight, dark: githubDark },
    transformers: [transformerNotationHighlight()]
  })
]
