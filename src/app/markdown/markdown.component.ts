// Derived from https://github.com/tkp1n/md2html

import { Component, Input, SimpleChange } from '@angular/core'
import marked, { Renderer } from 'marked'
import highlightjs from 'highlight.js'
import DOMPurify from 'dompurify'
import {
  DomSanitizer, SafeHtml
} from '@angular/platform-browser'

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent {

  @Input() data: string
  html: SafeHtml
  md: any

  static highlightCode(code: string, language: string): string {
    if (!(language && highlightjs.getLanguage(language))) {
      // use 'markdown' as default language
      language = 'markdown'
    }

    const result = highlightjs.highlight(language, code).value
    return `<code class="hljs ${language}">${result}</code>`
  }

  constructor(private sanitizer: DomSanitizer) {
    const renderer = new Renderer()
    renderer.code = MarkdownComponent.highlightCode
    this.md = marked.setOptions({ renderer })
  }

  markdownToSafeHtml(value: string): SafeHtml {
    const html = this.md(value)
    const safeHtml = DOMPurify.sanitize(html)
    return this.sanitizer.bypassSecurityTrustHtml(safeHtml)
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      if (propName === 'data') {
        const value = changes[propName].currentValue
        this.html = this.markdownToSafeHtml(value)
      }
    }
  }

}
