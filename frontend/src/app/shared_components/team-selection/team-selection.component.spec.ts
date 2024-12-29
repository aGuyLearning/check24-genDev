import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSelectionComponent } from './team-selection.component';

describe('TeamSeletionComponent', () => {
  let component: TeamSelectionComponent;
  let fixture: ComponentFixture<TeamSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeamSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
