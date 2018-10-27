import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErmComponent } from './erm.component';

describe('ErmComponent', () => {
  let component: ErmComponent;
  let fixture: ComponentFixture<ErmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
