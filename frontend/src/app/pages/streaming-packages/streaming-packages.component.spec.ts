import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamingPackagesComponent } from './streaming-packages.component';

describe('StreamingPackagesComponent', () => {
  let component: StreamingPackagesComponent;
  let fixture: ComponentFixture<StreamingPackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingPackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StreamingPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
