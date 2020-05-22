import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmsSuggestionComponent } from './algorithms-suggestion.component';

describe('AlgorithmsSuggestionComponent', () => {
  let component: AlgorithmsSuggestionComponent;
  let fixture: ComponentFixture<AlgorithmsSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmsSuggestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmsSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
