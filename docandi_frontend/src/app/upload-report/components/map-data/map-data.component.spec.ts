import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDataComponent } from './map-data.component';

describe('MapDataComponent', () => {
  let component: MapDataComponent;
  let fixture: ComponentFixture<MapDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
