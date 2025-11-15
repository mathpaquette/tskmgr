import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'urlify',
})
export class UrlifyPipe implements PipeTransform {
  transform(value: string): string {
    if (this.isValidURL(value)) {
      return `<a target="_blank" href="${value}">${value}</a>`;
    }

    return value;
  }

  isValidURL(value: string) {
    try {
      new URL(value);
    } catch (_) {
      return false;
    }
    return true;
  }
}
