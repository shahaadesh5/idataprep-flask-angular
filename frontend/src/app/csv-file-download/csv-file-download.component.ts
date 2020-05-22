import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-csv-file-download',
  templateUrl: './csv-file-download.component.html',
  styleUrls: ['./csv-file-download.component.scss']
})
export class CsvFileDownloadComponent implements OnInit {

  @Output() completed = new EventEmitter<boolean>();
  ready = false;
  downloadFilename = 'IDataPrep_ProcessedDataset.csv';
  blobString;
  downloadURL: any;

  constructor(private dataservice: DataService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.dataservice.cleanedFileReady.subscribe(data => {
      // do awesome stuff with data
      const base64String = this.ab2str(data);
      this.downloadURL = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.dataURIToBlob(base64String)));
      this.ready = true;
      this.dataservice.setStatus('Ready', 'Ready');
    });
  }

  ab2str(buf) {
    let newBase64String = '';
    const buffer = new Uint8Array(buf);
    buffer.forEach(element => {
      newBase64String += String.fromCharCode(element);
    });
    return newBase64String;
  }

  dataURIToBlob(dataURI) {
    const binStr = atob(dataURI),
      len = binStr.length,
      arr = new Uint8Array(len),
      mimeString = 'application/octet-stream';

    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    return new Blob([arr], {type: mimeString});
  }

  downloadFile() {
    this.completed.emit(true);
  }
}
