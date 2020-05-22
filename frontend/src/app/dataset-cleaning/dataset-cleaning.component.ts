import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-dataset-cleaning',
  templateUrl: './dataset-cleaning.component.html',
  styleUrls: ['./dataset-cleaning.component.scss']
})
export class DatasetCleaningComponent implements OnInit {

  @Output() completed = new EventEmitter<boolean>();
  done = false;
  cleaningSteps = [];

  constructor(private dataservice: DataService) { }

  ngOnInit() {
    this.dataservice.nextCleaningStep.subscribe(step => {
      this.cleaningSteps.push(step);
    });

    this.dataservice.cleaningStepComplete.subscribe(() => {
      this.done = true;
      this.completed.emit(true);
    });
  }

}
