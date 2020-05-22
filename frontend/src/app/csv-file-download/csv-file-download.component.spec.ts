import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileDownloadComponent } from './csv-file-download.component';

describe('CsvFileDownloadComponent', () => {
  let component: CsvFileDownloadComponent;
  let fixture: ComponentFixture<CsvFileDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvFileDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvFileDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
