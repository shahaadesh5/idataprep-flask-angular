import { Injectable, EventEmitter } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  applicationStatus = '';
  connectionReady: boolean;
  statusColor = { ready: 'green', busy: '#ff8f00', error: 'red' };
  statusCode = { ready: 1, busy: 2, error: 0 };
  applicationStatusColor;
  applicationStatusCode;

  fileLoaded: EventEmitter<any> = new EventEmitter();
  featuresReady: EventEmitter<any> = new EventEmitter();
  nextCleaningStep: EventEmitter<any> = new EventEmitter();
  cleaningStepDataUpdate: EventEmitter<any> = new EventEmitter();
  cleaningStepComplete: EventEmitter<any> = new EventEmitter();
  cleanedFileReady: EventEmitter<any> = new EventEmitter();
  algorithmAccuracy: EventEmitter<any> = new EventEmitter();

  private socket;

  constructor() {}

  init() {
    this.applicationStatus = 'Not Connected';
    this.connectionReady = false;
    this.applicationStatusColor = this.statusColor.busy;
    this.applicationStatusCode = this.statusCode.busy;
    this.connect();
  }

  sendFilePayload(payload, completedEmmiter: EventEmitter<any>) {
    this.checkConnection();
    this.setStatus('Busy', 'Sending Dataset Payload...');
    this.fileLoaded.subscribe(async file => {
      console.log('Sending File Payload to Backend');
      this.socket.emit(
        'loaddata',
        file,
        payload.headerFlag,
        payload.classificationFlag
      );
      completedEmmiter.emit(true);
      this.setStatus('Busy', 'Waiting on Features Payload...');
      this.checkConnection();
    });
    this.parseFile(payload.file, this.fileLoaded);
  }

  sendFeaturesPayload(payload, completedEmmiter: EventEmitter<any>) {
    this.checkConnection();
    this.setStatus('Busy', 'Sending Features Payload...');
    console.log('Sending File Payload to Backend');
    this.socket.emit('loadFeaturesPayload', payload);
    completedEmmiter.emit(true);
    this.setStatus('Busy', 'Starting Preprocessing Setup...');
    this.checkConnection();
  }

  parseFile(file, fileLoaded) {
    const reader = new FileReader();
    reader.onload = function(data) {
      fileLoaded.emit(data.target['result']);
    };
    reader.readAsText(file);
  }

  setStatus(state, message) {
    switch (state) {
      case 'Ready':
        this.applicationStatusCode = this.statusCode.ready;
        this.applicationStatusColor = this.statusColor.ready;
        break;

      case 'Busy':
        this.applicationStatusCode = this.statusCode.busy;
        this.applicationStatusColor = this.statusColor.busy;
        break;

      case 'Error':
        this.applicationStatusCode = this.statusCode.error;
        this.applicationStatusColor = this.statusColor.error;
        break;
    }
    this.applicationStatus = message;
  }

  checkConnection() {
    if (this.socket.connected) {
      // do nothing
    } else {
      this.setStatus('Error', 'Disconnected');
      console.log('Now Disonnected');
      this.connectionReady = false;
    }
  }

  connect() {
    const _this = this;
    this.setStatus('Busy', 'Attempting to Connect to Preprocessing Server...');
    this.socket = io(environment.ws_url);

    this.socket.on('connect', data => {
      _this.setStatus('Ready', 'Ready');
      _this.socket.send('User Connected');
      _this.connectionReady = true;
      console.log('User Connected');
    });

    this.socket.on('disconnect', data => {
      _this.setStatus('Error', 'User Disconnected. Attempting to Reconnect...');
      _this.socket.send('User Disconnected. Attempting to Reconnect...');
      _this.connectionReady = false;
    });

    this.socket.on('reconnect', data => {
      _this.socket.send('User Reconnected');
      _this.connectionReady = true;
    });

    this.socket.on('statusUpdate', update => {
      _this.socket.send('Received Status Update');
      _this.setStatus('Busy', update);
      _this.connectionReady = true;
    });

    this.socket.on('cleaningStep', step => {
      _this.socket.send('Received Cleaning Step');
      _this.setStatus('Busy', step + ' in progress...');
      _this.nextCleaningStep.emit(step + '...');
    });


    this.socket.on('cleaningStepDataUpdate', data => {
      _this.socket.send('Received Cleaning Step Data Update');
      _this.cleaningStepDataUpdate.emit(data);
    });

    this.socket.on('cleaningStepComplete', () => {
      _this.setStatus('Busy', 'Consolidating Cleaned Dataset...');
      _this.cleaningStepComplete.emit();
    });

    this.socket.on('cleanedDatasetOutput', (data) => {
      _this.setStatus('Busy', 'Preparing Cleaned Dataset for download...');
      _this.cleanedFileReady.emit(data);
    });

    this.socket.on('algorithmAccuracy', (data) => {
      console.log("HHHHHHHHHHHH");
      _this.socket.send('Received Algorithm accuracy');
      console.log(data);
      _this.algorithmAccuracy.emit(data);
    });

    // this.socket.on('cleaningStepVisualisationData', function(step) {
    // _this.socket.send('Received Visualization Data');
    //   _this.nextCleaningStepViz.emit(step);
    // });

    this.socket.on('featuresReceivedFromBackend', function(data) {
      _this.socket.send('Received Features From Backend');
      data = JSON.parse(data);
      _this.setStatus('Busy', 'Receiving Features From Backend...');
      _this.featuresReady.emit(data);
      _this.setStatus('Ready', 'Ready to clean...');
    });
  }
}
