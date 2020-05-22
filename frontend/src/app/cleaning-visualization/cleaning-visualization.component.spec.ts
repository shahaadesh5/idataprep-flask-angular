import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CleaningVisualizationComponent } from './cleaning-visualization.component';

describe('CleaningVisualizationComponent', () => {
  let component: CleaningVisualizationComponent;
  let fixture: ComponentFixture<CleaningVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CleaningVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CleaningVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
