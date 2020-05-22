import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'IDataPrep';

  constructor(private dataservice: DataService) {}

  ngOnInit() {
    this.dataservice.init();
  }
}
