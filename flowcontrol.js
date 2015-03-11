/*
* yet another...
* Flow Control !
* made by @dantaex on March 2014
*
*
* Usage
*   var fc = require('flowcontrol');
*   var mylist = [{...},...,{...}];
*
*	var applyThisToEachElement = function(item,callback{
*		//do your stuff
*		...
*		//say i'm done
*		callback(err,newdata);	
*	};
*
*   fc.taskList( mylist, applyThisToEachElement, function(err,result){ console.log('Everything done, results in result var');  });
*   //or
*   fc.taskMap( mylist, applyThisToEachElement, function(err,result){ console.log('Everything done, results in result var');  });
*   //or
*   fc.taskChain( mylist, applyThisToEachElement, function(err,result){ console.log('Everything done, results in result var');  });
*	
*	
*/


/**
* @constructor
*/
function FlowControl(){}
/**
* Execute a function over an input list, no matter:
*  Order of execution
*  Order of output
*  {f} Concurrecny limit
*
* @param {items} Array[] : input list
* @param {f} Function : this is the functon to be applied to each item in the input list, 
*	called as f(current_item,callWhenDone,items.length)
* @param {callback} Function : called as callback(errorlist) or callback(null,resultList)
* @param {opts.mergeArrayResults} boolean : There are certain moments when you have
*	an array as a result of every f() execution, in this case you may end with
*	something like this as final result:
*    [   [{name:'a'},{name:'b'}], [{name:'c'}], [{name:'d'}], ...    ]
* 	but you may want all of those results in a single array like this 
*    [   [{name:'a'},{name:'b'},{name:'c'},{name:'d'} ... ]
* 	so you can say mergeArrayResults
*/
FlowControl.prototype.taskList = function(items,f,callback,opts){
	var notFinished = items.length,
		errors = [],
		results = [];

	opts = opts || { mergeArrayResults : false, transport: {} };

	function verifier(err,data){
		if(err)	errors.push(err);	
		else if(data){
			if(data instanceof Array && opts.mergeArrayResults){
				results = results.concat(data);
			}
			else
				results.push(data);
		} 
		
		if( --notFinished == 0 ){
			if(errors.length > 0) callback(errors);
			else callback(null,results);
		} 
	}

	if(items.length){
		for (var i = items.length - 1; i >= 0; i--)
			f(items[i],verifier,results.length,opts.transport);
	}
	else
	 callback(null,[]);
};


/**
* Execute a function over an input list, if you don't care about:
*  Order of execution
*  {f} Concurrecny limit
* 
* But you need each output value to be stored in the same index of its corresponding input
*
* @param {items} Array[] : input list
* @param {f} Function : called f(current_item,callWhenDone,items.length)
* @param {callback} Function : called as callback(errorlist) or callback(null,resultList)
*/
FlowControl.prototype.taskMap = function(items,f,callback,opts){
	var notFinished = items.length,
		errors = [],
		results = [];

	opts = opts || { transport: {} };

	function wrapper(i,item){
		f(item,function(err,data){
			if(err)	errors.push(err);	
			else results[i] = data;
			
			if( --notFinished == 0 ){
				if(errors.length > 0) callback(errors);
				else callback(null,results);
			} 
		},results.length,opts.transport);
	}

	if(items.length){
		for (var i = items.length - 1; i >= 0; i--)
			wrapper(i,items[i]);		
	}
	else
	 callback(null,[]);

};


/**
* Execute a function over an input list, if you care about:
*  Order of execution
*  {f} Concurrecny limit
* Each execution comes exactly after the last one finishes
*
* @param {items} Array[] : input list
* @param {f} Function : called f(current_item,callWhenDone,items.length)
* @param {callback} Function : called as callback(errorlist) or callback(null,resultList)
* @param {opts.acceptnull} boolean : Accept null results (default false)
* @param {opts.mergeArrayResults} boolean (default false) : There are certain moments when you have
*	an array as a result of every f() execution, in this case you may end with
*	something like this as final result:
*    [   [{name:'a'},{name:'b'}], [{name:'c'}], [{name:'d'}], ...    ]
* 	but you may want all of those results in a single array like this 
*    [   [{name:'a'},{name:'b'},{name:'c'},{name:'d'} ... ]
* 	so you can say mergeArrayResults
*/
// FlowControl.prototype.taskChain = function(items,f,callback,acceptnull,mergeArrayResults){
FlowControl.prototype.taskChain = function(items,f,callback,opts){
	if(items == undefined){
		return callback(null,[]);
	}
	opts = opts || { acceptnull : false, mergeArrayResults : false, transport : {} };

	var nitems = items.slice(),
		errors = [],
		results = [];

	function next(item){
		if( item == undefined ){
			if(errors.length > 0) callback( errors );
			else callback( null, results );
		} else {
			f(item,function(err,data){
				if(err) errors.push(err);
				else{
					if(opts.acceptnull || data != null)
						if(data instanceof Array && opts.mergeArrayResults){
							results = results.concat(data);
						}
						else
							results.push(data);
				} 
				next(nitems.shift());
			},results.length,opts.transport);
		}
	}
	next(nitems.shift());
};


if(typeof module != 'undefined')
	module.exports = new FlowControl();
