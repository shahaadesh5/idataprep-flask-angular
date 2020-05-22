# idataprep-flask-angular

INTERACTIVE DATASET PREPROCESSING APPLICATION built using Python Flask as backend and Angular as frontend along with D3.js to render visualiztions

The idea behind the application is that it allows user to 
- upload CSV's containing categorical and numerical values
- Provide preliminary statistics about datasets.
- Visualize the data at each step of data processing.

To Run the Frontend Application,
Please make sure you have node.js installed on your machine

Run the 'npm install' command inside frontend folder. It should install all the required dependencies. Once, all the dependencies are installed, run the frontend app on development server with 'ng serve' command.

The application should run on http://localhost:4200/

To run the backend server for processing data, redirect to backend folder and run 'python3 app.py' command.

There's a test dataset available, user can upload their own dataset only if it has categorical data.

## Screenshots:

### Visualization at the time of pre-processing:

![alt text](https://raw.githubusercontent.com/shahaadesh5/idataprep-flask-angular/master/screenshots/viz1.png)

### Visualization to compare acuracy of various algorithms:

![alt text](https://raw.githubusercontent.com/shahaadesh5/idataprep-flask-angular/master/screenshots/viz2.png)
