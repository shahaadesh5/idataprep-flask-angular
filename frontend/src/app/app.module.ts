import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { MainContentComponent } from './main-content/main-content.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

import { CsvFileUploadComponent } from './csv-file-upload/csv-file-upload.component';
import { FeaturePreferencesComponent } from './feature-preferences/feature-preferences.component';
import { DatasetCleaningComponent } from './dataset-cleaning/dataset-cleaning.component';
import { CsvFileDownloadComponent } from './csv-file-download/csv-file-download.component';
import { AlgorithmsSuggestionComponent } from './algorithms-suggestion/algorithms-suggestion.component';
import { CleaningVisualizationComponent } from './cleaning-visualization/cleaning-visualization.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    StatusBarComponent,
    MainContentComponent,
    CsvFileUploadComponent,
    FeaturePreferencesComponent,
    DatasetCleaningComponent,
    CsvFileDownloadComponent,
    AlgorithmsSuggestionComponent,
    CleaningVisualizationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    FormsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
