import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAchievementsComponent } from './home-achievements.component';

describe('HomeAchievementsComponent', () => {
  let component: HomeAchievementsComponent;
  let fixture: ComponentFixture<HomeAchievementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeAchievementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeAchievementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
