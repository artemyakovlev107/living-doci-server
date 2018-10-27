import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CommonDataService {
  public loading = new BehaviorSubject<boolean>(false);
  public quotes: {
    content: any,
    author: any,
    last_used: any
  };
  constructor() {
    this.quotes = {
      content: '...',
      author: '...',
      last_used: null,
    }
  }
  toggleLoading(status: boolean) {
    this.loading.next(status);
  }
  setQuotes(data: any) {
    this.quotes = data;
  }
  getQoutes() {
    return this.quotes;
  }
}
