import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetCleaningComponent } from './dataset-cleaning.component';

describe('DatasetCleaningComponent', () => {
  let component: DatasetCleaningComponent;
  let fixture: ComponentFixture<DatasetCleaningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetCleaningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetCleaningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
