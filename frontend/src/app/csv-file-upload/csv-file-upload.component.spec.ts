import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileUploadComponent } from './csv-file-upload.component';

describe('CsvFileUploadComponent', () => {
  let component: CsvFileUploadComponent;
  let fixture: ComponentFixture<CsvFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
