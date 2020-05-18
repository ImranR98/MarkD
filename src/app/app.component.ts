import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MarkD';
  test = '# Hello Markdown\n```csharp\npublic class Foo {}\n```'
}
