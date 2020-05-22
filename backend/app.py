from flask import Flask, session
from flask_socketio import SocketIO, send
from pandas.api.types import is_numeric_dtype
import pandas as pd
import numpy as np
import matplotlib.pyplot as plot 
import re
import difflib 
import csv
import json
import base64
from sklearn.model_selection import train_test_split
from sklearn import preprocessing
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
socketio = SocketIO(app ,ping_interval=500, ping_timeout=55000,async_mode='threading') 
headers_flag  = False
task_flag = False
allow_negative_flag = False
allow_zero_flag = False
features_data = []
base64_string = ''
original_dataframe = pd.DataFrame()
targetName=''
task_flag  = False

@socketio.on('message')
def handleMessage(msg):
	print('Message: ' + msg)
	send(msg , broadcast=True)

@socketio.on('loaddata')
def handleData(data,h_flag,t_flag):
	headers_flag = h_flag
	global task_flag
	task_flag = t_flag
	read_the_csv(data,headers_flag)
	process_data(headers_flag)
	send_header()
	check_column_type()

@socketio.on('loadFeaturesPayload')
def parseDataOnPayload(json_data):
	global original_dataframe
	global targetName

	featureData = json_data['features']
	if(task_flag):
		targetIndex = json_data['targetFeatureIndex']
		targetName = featureData[targetIndex]['name']
		cleanData(featureData)
		original_dataframe.to_csv('dataset1_processed.csv' ,index=False,line_terminator='\n')
		with open("dataset1_processed.csv", "rb") as csvfile:
			base64_string = base64.b64encode(csvfile.read())
		csvfile.close()
		socketio.emit('cleaningStepComplete', 'Cleaning complete')
		socketio.emit('cleanedDatasetOutput',base64_string)
		normalizeNumericals(featureData)
		print("After Norm : \n",original_dataframe)
		oneHotEncoding(featureData)
		print("After One hot:\n",original_dataframe)
		call_machine_learning_models()


	else:

		cleanData(featureData)
		original_dataframe.to_csv('dataset1_processed.csv',index=False,line_terminator='\n')
		with open("dataset1_processed.csv", "rb") as csvfile:
			base64_string = base64.b64encode(csvfile.read())
		csvfile.close()
		socketio.emit('cleaningStepComplete', 'Cleaning complete')
		socketio.emit('cleanedDatasetOutput',base64_string)


# ####### ML part #########

def classifyDatasets(X_train, X_test, y_train, y_test,classifier,classifierName):

	classifierTrainset = classifier.fit(X_train, y_train)
	accTrain = classifierTrainset.score(X_train, y_train)

	accTest = classifierTrainset.score(X_test, y_test)
	print('\t \t Accuracy of '+ classifierName +' on Test set: ' + str(accTest),'\n')

	y_train_pred = classifierTrainset.predict(X_train)
	y_test_pred = classifierTrainset.predict(X_test)

	return accTest

def call_machine_learning_models():

	global original_dataframe
	global targetName

	accuracy_list = []
	dict_keys = ['algo', 'efficiency']

	data = np.array(original_dataframe.drop([targetName], axis=1))
	target = np.array(original_dataframe[targetName])

	X_train, X_test, y_train, y_test = train_test_split(data, target, test_size=0.4)

	clf_rf = RandomForestClassifier(bootstrap = True,max_depth= 12, n_estimators= 100)
	acc_test_rf = classifyDatasets(X_train = X_train, X_test = X_test,y_train = y_train,y_test= y_test,classifier=clf_rf,
															classifierName="Random Forest Classifier ")
	
	dict_values = ['RFC', acc_test_rf]
	data = get_dic_from_two_lists(dict_keys, dict_values)
	accuracy_list.append(data)
	json.dumps(accuracy_list)
												
	clf_dt = DecisionTreeClassifier(max_depth=10)
	acc_test_dt = classifyDatasets(X_train = X_train, X_test = X_test,y_train = y_train,y_test= y_test,classifier=clf_dt,
															classifierName="Decision Tree Classifier ")
	dict_values = ['DTC', acc_test_dt]
	data = get_dic_from_two_lists(dict_keys, dict_values)
	accuracy_list.append(data)
	json.dumps(accuracy_list)

	clf_mlp = MLPClassifier()
	acc_test_mlp= classifyDatasets(X_train = X_train, X_test = X_test,y_train = y_train,y_test= y_test,classifier=clf_mlp,
															classifierName="Multilayer Perceptron Classifier ")
	dict_values = ['MLP', acc_test_mlp]
	data = get_dic_from_two_lists(dict_keys, dict_values)
	accuracy_list.append(data)
	json.dumps(accuracy_list)

	logistic_regression_clf = LogisticRegression(penalty='l2',dual=False,max_iter=100)
	acc_test_log= classifyDatasets(X_train = X_train, X_test = X_test,y_train = y_train,y_test= y_test,classifier=logistic_regression_clf,classifierName="Logistic Regression Classifier ")

	dict_values = ['LRC', acc_test_log]
	data = get_dic_from_two_lists(dict_keys, dict_values)
	accuracy_list.append(data)
	json.dumps(accuracy_list)

	clf_svc = SVC(C=1.0, kernel='linear')
	acc_test_svm = classifyDatasets(X_train = X_train, X_test = X_test,y_train = y_train,y_test= y_test,classifier=clf_svc,
															classifierName="Support Vector Machine Classifier ") 
	dict_values = ['SVC', acc_test_svm]
	data = get_dic_from_two_lists(dict_keys, dict_values)
	accuracy_list.append(data)
	json.dumps(accuracy_list)
  
	print(sorted(accuracy_list, key = lambda i: i['efficiency']))
	sorted_dict = sorted(accuracy_list, key = lambda i: i['efficiency'])
	socketio.emit('algorithmAccuracy',sorted_dict)

def read_the_csv(data,flag):
	csvList = data.split('\n')
	with open('uncleaned.csv', 'w', newline='') as myfile:
		for i in range(0,len(csvList)):
			wr = csv.writer(myfile)
			wr.writerow(csvList[i].split(','))

	myfile.close()

def get_dic_from_two_lists(keys, values):
	return { keys[i] : values[i] for i in range(len(keys)) }

def process_data(flag):

	global original_dataframe

	if(flag):
		original_dataframe = pd.read_csv('uncleaned.csv',header=0)

	else :
		names = []
		original_dataframe = pd.read_csv('uncleaned.csv')
		for i in range(len(original_dataframe.columns)):
			names.append(str(i))
		original_dataframe = pd.read_csv('uncleaned.csv', names=names)


def send_header():

	global original_dataframe

	headers = list(original_dataframe.columns.values)
	socketio.emit('headers',{'headers':headers})

def check_column_type():
	data_list = []
	featuresReceivedFromBackend = []

	global original_dataframe
	isCategorical = {}
	for var in original_dataframe.columns:
		isCategorical[var] = 1.*original_dataframe[var].nunique()/original_dataframe[var].count() < 0.08

	for columnName in isCategorical:

		if(isCategorical[columnName] == True):
			dict_keys = ['name', 'type','category']
			dictCategory=original_dataframe[columnName].astype(str).str.lower().unique().tolist()
			dict_values = [columnName, 'categorical',dictCategory]
			data = get_dic_from_two_lists(dict_keys, dict_values)
			data_list.append(data)
			featuresReceivedFromBackend = json.dumps(data_list)
		
		elif(is_numeric_dtype(original_dataframe[columnName])):
			dict_keys = ['name', 'type']
			dict_values = [columnName, 'numeric']
			data = get_dic_from_two_lists(dict_keys, dict_values)
			data_list.append(data)
			featuresReceivedFromBackend = json.dumps(data_list)
		else :
			dict_keys = ['name', 'type','category']
			dictCategory=original_dataframe[columnName].astype(str).str.lower().unique().tolist()
			dict_values = [columnName, 'categorical',dictCategory]
			data = get_dic_from_two_lists(dict_keys, dict_values)
			data_list.append(data)
			featuresReceivedFromBackend = json.dumps(data_list)
		
	socketio.emit('featuresReceivedFromBackend', featuresReceivedFromBackend)

def cleanData(json_data):

	newHeaders = []
	global original_dataframe

	print(json_data)
	for i in range(len(json_data)):
		newHeaders.append(json_data[i]['name'])

	print('new',newHeaders)
	print('\n \n')
	print('origin',original_dataframe.columns)
	original_dataframe.columns  = newHeaders


	for json_itr in range(len(json_data)):	

		if(json_data[json_itr]['type']=='numeric'):

			numeric_json = json_data[json_itr]
			socketio.emit('cleaningStep', 'Cleaning numeric column ' + numeric_json['name'])
			clean_numeric_cols(numeric_json)
			
		else:

			categorical_json = json_data[json_itr]  
			socketio.emit('cleaningStep',  'Cleaning categorical column ' + categorical_json['name'])
			clean_categorical_cols(categorical_json)
		
	
def clean_numeric_cols(numeric_json):

	global original_dataframe

	countOfNegatives = 0
	countOfZeros = 0
	validCounts = 0
	totalCounts = 0    
	isZeroAllowed = numeric_json['preferences']['zeroAllowed']
	isNegativeAllowed = numeric_json['preferences']['negativeAllowed']
	numericColumnName = numeric_json['name']
	totalCounts = original_dataframe[numericColumnName].shape[0]
	countOfNumericNan = (original_dataframe[numericColumnName] == np.nan).astype(int).sum(axis=0)
	countOfZeros = (original_dataframe[numericColumnName] == 0).astype(int).sum(axis=0)
	countOfNegatives = (original_dataframe[numericColumnName] < 0).astype(int).sum(axis=0)
	print(f"total: {totalCounts}, nan:{countOfNumericNan}, zero: {countOfZeros}, neg:{countOfNegatives}")
	original_dataframe.dropna(inplace=True)
	original_dataframe.reset_index(drop=True,inplace=True)

	if(isNegativeAllowed == False and isZeroAllowed==True): 

		original_dataframe[numericColumnName][original_dataframe[numericColumnName] < 0] = np.nan
		original_dataframe.dropna(inplace=True)
		original_dataframe.reset_index(drop=True,inplace=True)
		validCounts  = totalCounts - (countOfNumericNan + countOfNegatives)
		socketio.emit('cleaningStepDataUpdate', {'name': numericColumnName, 'type': 'numeric',
			'validCount' : int(validCounts), 'dirtyStats' : {'nan': int(countOfNumericNan), 'neg': int(countOfNegatives)}})

	elif(isZeroAllowed == False and isNegativeAllowed == True):
		
		median = original_dataframe[numericColumnName].median(skipna=True)
		original_dataframe[numericColumnName][original_dataframe[numericColumnName] == 0] = median
		validCounts  = totalCounts - (countOfNumericNan + countOfZeros)
		socketio.emit('cleaningStepDataUpdate', {'name': numericColumnName, 'type': 'numeric',
			'validCount' : int(validCounts), 'dirtyStats' : {'nan': int(countOfNumericNan), 'zero': int(countOfZeros)}})

	elif(isZeroAllowed == False and isNegativeAllowed == False):

		median = original_dataframe[numericColumnName].median(skipna=True)
		original_dataframe[numericColumnName][original_dataframe[numericColumnName] == 0] = median
		original_dataframe[numericColumnName][original_dataframe[numericColumnName] < 0] = np.nan
		original_dataframe.dropna(inplace=True)
		original_dataframe.reset_index(drop=True,inplace=True)
		validCounts  = totalCounts - (countOfNumericNan + countOfZeros + countOfNegatives)
		print('cleaningStepDataUpdate', {'name': numericColumnName, 'type': 'numeric', 
		'validCount' : int(validCounts), 'dirtyStats' : {'nan': int(countOfNumericNan), 'zero': int(countOfZeros),
			'neg': int(countOfNegatives)}})
		socketio.emit('cleaningStepDataUpdate', {'name': numericColumnName, 'type': 'numeric', 
		'validCount' : int(validCounts), 'dirtyStats' : {'nan': int(countOfNumericNan), 'zero': int(countOfZeros),
			'neg': int(countOfNegatives)}})

	else:
		validCounts  = totalCounts - countOfNumericNan 
		socketio.emit('cleaningStepDataUpdate', {'name': numericColumnName, 'type': 'numeric', 'validCount' : int(validCounts), 'dirtyStats' : {'nan': int(countOfNumericNan)}})


def normalizeNumericals(json_data):

	global original_dataframe
	global targetName

	for json_itr in range(len(json_data)):	

		if(json_data[json_itr]['type']=='numeric' and json_data[json_itr]['name'] != targetName):

			columnName = json_data[json_itr]['name']
			original_dataframe[columnName] = original_dataframe[columnName].astype(float)
			scale = preprocessing.MinMaxScaler(feature_range=(0, 1))
			columnScaled = scale.fit_transform(original_dataframe[columnName].values.reshape(-1, 1))
			original_dataframe[columnName] = pd.DataFrame(columnScaled)

def oneHotEncoding(json_data):

	global original_dataframe
	global targetName

	for json_itr in range(len(json_data)):	

		if(json_data[json_itr]['type']=='categorical' and json_data[json_itr]['name'] != targetName):
			columnName = json_data[json_itr]['name']
			original_dataframe = pd.concat([original_dataframe, pd.get_dummies(original_dataframe[columnName],prefix=columnName,prefix_sep='_')], axis=1)
			original_dataframe.drop(columnName,axis=1,inplace=True)

def remove_chars(col):
	if (re.search(r'\d', col)):
		return col
	if(re.match(r'[^A-Za-z]+',col)):
		return '?'
	else:
		return col

def modify_categories(col):
	modifiedRowValue = re.sub(r'\W+', '', col)
	modifiedRowValue=modifiedRowValue.lower()
	col = modifiedRowValue
	return col

def check_valid_categories(col, validCategories):
	if(col not in validCategories):
		col = '?'
	return col

def clean_categorical_cols(categorical_json):

	global original_dataframe
	dirtyCount = 0
	modifiedList =list()
	print(categorical_json)
	validCategories = (categorical_json['preferences']['categories'])[0].split(',')
	catColumnName = categorical_json['name']
	original_dataframe[catColumnName] = original_dataframe[catColumnName].astype(str).apply(remove_chars)

	dirtyCount = (original_dataframe[catColumnName] == '?').astype(int).sum(axis=0)			
	dirtyCount = dirtyCount + original_dataframe[catColumnName].isna().sum()

	original_dataframe[catColumnName].replace({'?':np.nan},inplace=True)
	original_dataframe.dropna(inplace=True)
	original_dataframe.reset_index(drop=True, inplace=True)
		
	# for j in range(len(validCategories)):
	# 	modifiedstr = re.sub(r'\W+', '', validCategories[j].lower())
	# 	modifiedList.append(modifiedstr)

	# original_dataframe[catColumnName] = original_dataframe[catColumnName].apply(modify_categories)
	modifiedList = validCategories

	for i in range(len(original_dataframe[catColumnName])):

		for j in range(len(validCategories)):

			if(original_dataframe[catColumnName][i] == modifiedList[j]):
				original_dataframe[catColumnName].replace({original_dataframe[catColumnName][i]:validCategories[j]},inplace=True)
				break
			elif((difflib.SequenceMatcher(None,original_dataframe[catColumnName][i],modifiedList[j]).ratio()) >= 0.87):
				original_dataframe[catColumnName].replace({original_dataframe[catColumnName][i]:validCategories[j]},inplace=True)
				dirtyCount = dirtyCount + 1
				break

	original_dataframe[catColumnName] = original_dataframe[catColumnName].apply(lambda col: check_valid_categories(col,validCategories))	
	dirtyCount = dirtyCount + (original_dataframe[catColumnName] == '?').astype(int).sum(axis=0)			
	original_dataframe[catColumnName].replace({'?':np.nan},inplace=True)
	original_dataframe.dropna(inplace=True)
	original_dataframe.reset_index(drop=True, inplace=True)

	
	dict1={}
	values = original_dataframe[catColumnName].value_counts().index.tolist()
	for i in range(len(values)):
		dict1[values[i]]=int(original_dataframe[catColumnName].value_counts()[i])
	
	print(dict1)
	print({'name': catColumnName, 'type': 'categorical', 'dirtyCount' : dirtyCount, 'categoryStats' : dict1})
	socketio.emit('cleaningStepDataUpdate',	{'name': catColumnName, 'type': 'categorical', 'dirtyCount' : int(dirtyCount), 'categoryStats' : dict1})


if __name__ == '__main__':
	socketio.run(app) 