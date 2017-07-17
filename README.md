# TimedQ.js

Javascript timed processing queue (and queue manager). Useful as a non render blocking processing queue in the browser. 

A simple queue manager to call batches of functions and data in timed blocks. The amount of data to be processed is self adjusted based on the function call time. The primary goal is to provide an easy to use, non render blocking processing queues so the browser does not lock up during large tasks with very little overhead. There is certainly a better way to explain this...

# Assumptions / Requirements

* ES6
* Your processing function doesn't take longer than the `runtime`

# TODO

* Unit testing
* API Documentation
* Benchmarking
* Investigate web workers
  * Is it superior to TimedQ.js, or is TimedQ.js redundant?
  * Can we make TimeQ.js better by using web workers?

# Download source

```bash
git clone https://github.com/dafky2000/TimedQ.js
```

# Include in your project

Add to the head tag in your project

```html
<script src="TimedQ.js" async></script>
```

# Initialize & start TimedQ

Initializes and starts the queue manager, checks every 100ms (configurable with idletime) until items are `enqueued`.

Using (optional) options ('sane' defaults shown below)

```javascript
const Q = new TimedQ({
  runtime: 40,    // How long to process items before taking a break
  breaktime: 1,   // How long to break between processing blocks
  idletime: 100,  // How long to wait between processing blocks if there was nothing to process
});
```

# TimedQ.prototype.enqueue(**signature**, **data**, **options**)

(required) **signature**: Typically a function which is used as the identifier for the queue group as well as the function to call on the dataset. Otherwise it could be another string, int, float, object reference... whatever can be used as a `Map()` key but you will need to define a callback in the options if not a function.

(required) **data**: 2-dimensional array of parameters to supply to function.

(optional) **optional**: {
  callback: function(param1, param2...) {},
} 

# Queue items to be run

Queue an inline function to run on a set of data

```javascript
Q.enqueue(function(param1, param2) { console.log(param1 + param2); }, [
  ['data for param1','data for param2'],
  ['more data for param1','more data for param2'],
  ['even more data for param1','even more data for param2'],
]);
```

Queue a defined function

```javascript
function fun(param1, param2) {
  console.log(param1 + param2);
}

Q.enqueue(fun, [
  ['data for param1','data for param2'],
  ['more data for param1','more data for param2'],
  ['even more data for param1','even more data for param2'],
]);
```

Queueing data to a specific queue name

```javascript
Q.enqueue('my_queue1', [
  ['data for param1','data for param2'],
  ['more data for param1','more data for param2'],
  ['even more data for param1','even more data for param2'],
], {
  callback: function(param1, param2) {
    console.log(param1 + param2);
  },
});
```
