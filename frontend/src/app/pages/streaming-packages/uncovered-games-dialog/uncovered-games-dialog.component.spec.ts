import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncoveredGamesDialogComponent } from './uncovered-games-dialog.component';

describe('UncoveredGamesDialogComponent', () => {
  let component: UncoveredGamesDialogComponent;
  let fixture: ComponentFixture<UncoveredGamesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UncoveredGamesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UncoveredGamesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
