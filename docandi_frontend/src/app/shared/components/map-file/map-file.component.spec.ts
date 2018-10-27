import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFileComponent } from './map-file.component';

describe('MapFileComponent', () => {
  let component: MapFileComponent;
  let fixture: ComponentFixture<MapFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
