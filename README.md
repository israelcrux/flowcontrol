flowcontrol
===========

# Tiny flow control Library for NodeJS

Just 3 useful functions:

  - taskList( items, func, callback, opts)
  - taskMap( items, func, callback, opts)
  - taskChain( items, func, callback, opts)

### How to use

All of them execute a function `func` on an array of elements `items` and 
call `callback(results)` when they finish:

```javascript
var items = [obj1,obj2,obj3,objn];
function func(obj,done){ //some long async task
    
    //do something on obj
    
    done(null,obj); //when the procedure is completed with no error
    //or done(null,obj); //when the procedure is completed with an error
}
function callback(errors,unordered_items){ /* ... */ }
taskList(items,func,callback);
```

 The differences are:

### - tasklist
Execute a function on an array of items regardless of
  - order of execution
  - order of resulting array
  - concurrency limit
  
### - taskmap
Execute a function on an array of items regardless of
  - order of execution
  - concurrency limit
 
but keeping 
 - order of resulting array

### - taschain
Execute a function on an array of items; each execution comes exactly after the last one. So use it if you care about concurrency limit and order of execution.





