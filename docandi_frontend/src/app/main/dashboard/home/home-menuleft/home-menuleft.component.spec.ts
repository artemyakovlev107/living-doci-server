import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMenuleftComponent } from './home-menuleft.component';

describe('HomeMenuleftComponent', () => {
  let component: HomeMenuleftComponent;
  let fixture: ComponentFixture<HomeMenuleftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeMenuleftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeMenuleftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
