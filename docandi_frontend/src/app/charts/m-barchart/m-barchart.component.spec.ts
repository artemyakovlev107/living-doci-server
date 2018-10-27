import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MBarchartComponent } from './m-barchart.component';

describe('MBarchartComponent', () => {
  let component: MBarchartComponent;
  let fixture: ComponentFixture<MBarchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MBarchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MBarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
