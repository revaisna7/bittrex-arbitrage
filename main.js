var Markets = require('./schema/Markets.js');
var Routes = require('./schema/Routes.js');
var Currencies = require('./schema/Currencies.js');
var Balances = require('./schema/Balances.js');
var View = require('./schema/View.js');

const fs = require('fs')
fs.truncate('tradelog', 0, function(){console.log('Cleared trade log...')});

console.log('Initiating...');
setTimeout(function(){
	console.log('Get currencies...');
	Currencies.get();
	setTimeout(function(){
		console.log('Get markets...');
		Markets.getSummaries();
		setTimeout(function(){
			console.log('Subscribe markets...');
			Markets.subscribe();
			setTimeout(function(){
				console.log('Get balances...');
				Balances.init();	
				setTimeout(function(){
					console.log('Get Order Books...');
					Markets.startOrderBooksUpdates();
					setTimeout(function(){
						console.log('Find routes...');
						Routes.find();
						setTimeout(function(){
							console.log('Init view...');
							View.start();
						},2000);
					},2000);
				},2000);
			},2000);
		},Markets.list.length*500);
	},2000);
},2000);