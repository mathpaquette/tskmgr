import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'camelCaseToWords',
})
export class CamelCaseToWordsPipe implements PipeTransform {
  transform(str: string): string {
    return str
      .replace(/^[a-z]/g, (char) => ` ${char.toUpperCase()}`)
      .replace(/[A-Z]|[0-9]+/g, ' $&')
      .replace(/(?:\s+)/, (char) => '');
  }
}
