import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {

  transform(val: any): string {
    // Format the output to display any way you want here.
    // For instance:
  
    val = Number(val)
    if (val !== undefined && val !== null) {
      return val.toLocaleString('en-us');
    } else {
      return '';
    }
  }

}
