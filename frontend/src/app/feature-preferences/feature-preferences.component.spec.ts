import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturePreferencesComponent } from './feature-preferences.component';

describe('FeaturePreferencesComponent', () => {
  let component: FeaturePreferencesComponent;
  let fixture: ComponentFixture<FeaturePreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturePreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturePreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
