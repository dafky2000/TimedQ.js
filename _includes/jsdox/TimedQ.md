# Global





* * *

## Class: TimedQ


### TimedQ.qgroup(signature, index, options) 

Create a new TimeQ.qgroup, a queue group is used for separating different queues of functions. Every unique enqueue signature has it's own `qgroup`

**Parameters**

**signature**: `Reference`, Signature used to identify qgroup, this could be a `String`, `Object`, `Integer`, `Function`, whatever a `Map()` supports as a key

**index**: `Integer`, The array index of this `qgroup`, usually equal to the number of qgroups currently created.

**options**: `Object`, (optional) `qgroup` options

**Returns**: `TimedQ.qgroup`, TimedQ qgroup reference

### TimedQ.get(signature, callback) 

Gets a qgroup by it's signature. If the qgroup doesn't exist than it is created on the automatically

**Parameters**

**signature**: `Reference`, Signature to get

**callback**: `function`, (optional) If the qgroup doesn't exist and we are creating one, what is the callback function (if not the same as the signature)

**Returns**: `TimedQ.qgroup`, TimedQ.group reference

### TimedQ.enqueue(signature, data, options) 

Enqueue/Add data to be run in a queue.

**Parameters**

**signature**: `Reference`, qgroup signature (Function) to assign the data to

**data**: `Array`, 2-dimensional array of data, first level is for each function call, second level is for each parameter. For example: [ ['firstcall-param1','firstcall-param2'], ['secondcall-param1','secondcall-param2'], ... ]

**options**: `Object`, (optional) Options to configure the queue such as a callback Function if the signature is not the Function itself

**Returns**: `TimedQ.qgroup`, TimedQ.group reference

### TimedQ.dequeue(signature) 

Dequeue/remove and return one parameter set from a specific queue

**Parameters**

**signature**: `Reference`, qgroup signature idententifier

**Returns**: `Array`, - Set of parameters

### TimedQ.start() 

Starts the queue manager monitoring of the qgroups


### TimedQ.stop() 

Stops the queue manager monitoring of the qgroups


### TimedQ.process() 

The main processing function. Manages how many queue items to process, runs them and tracks timing data against each qgroup.




* * *










