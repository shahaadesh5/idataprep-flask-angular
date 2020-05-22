import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-csv-file-upload',
  templateUrl: './csv-file-upload.component.html',
  styleUrls: ['./csv-file-upload.component.scss']
})
export class CsvFileUploadComponent implements OnInit {
  @Input() forClassification;
  @Output() forClassificationChanged = new EventEmitter<boolean>();
  @Output() completed = new EventEmitter<boolean>();
  hasHeader = true;
  filename = '';
  file;

  constructor(private dataservice: DataService) {}

  ngOnInit() {}

  onFileInput(event: any) {
    this.file = event.target.files[0];
    this.filename = 'Selected Filename: ' + this.file.name;
  }

  onSubmit(e) {
    if (this.dataservice.connectionReady) {
      e.preventDefault();
      const payload = {
        file: this.file,
        headerFlag: this.hasHeader,
        classificationFlag: this.forClassification
      };
      console.log('Sending File');
      this.dataservice.sendFilePayload(payload, this.completed);
    } else {
      alert('Valid Socket Connection Required. Please wait...');
    }
  }
}
