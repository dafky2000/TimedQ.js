function TimedQ(options = {}) {
	this.options = {
		runtime: options.runtime || 40,
		breaktime: options.breaktime || 1,
		idletime: options.idletime || 100,
	};
	this.timer = null;
	this.queues = new Map(); // Maps signature to qgroup
	this.queues_array = []; // Array of added Queues

	this.start();
}

TimedQ.prototype.qgroup = function(signature, index, options={}) {
	this.index = index;
	this.signature = signature;
	this.fnc = options.callback || (typeof(signature) === 'function' ? signature : false) || undefined;
	this.items = [];
	this.totaldequeued = 0;
	this.totalenqueued = 0;
	this.finishcount = 0;
	this.timing = {
		created: new Date().getTime(),
		start: 0,
		finish: 0,
		avg: 0,
		min: 0,
		max: 0,
	};
};

TimedQ.prototype.get = function(sig, callback) {
	// Get the existing queue
	let q = this.queues.get(sig);

	// If this queue doesn't already exist, create it and return it
	if(!q) {
		q = this.queues.set(sig, new this.qgroup(sig, this.queues_array.length, {
											callback: callback,
										}))
									 .get(sig);
		this.queues_array.push(q);
	}

	return q;
};

/*
	data should always be an array of an array of parameters passed to the function. (2 dimensional array for adding batches of data to be processed)
	options = {
		callback: function(param1, param2) {}, // If different from signature
		TODO: type: 'FIFO', // FIFO, LIFO
	};
*/
TimedQ.prototype.enqueue = function(sig, data=[], options={}) {
	// Get (or create) the this.qgroup
	const q = this.get(sig, options.callback);

	// Now return, in case we just wanted to create the this.qgroup
	if(!data.length) return;

	// Push the data to the end of the queue
	q.items = q.items.concat(data);

	++q.totalenqueued;

	// console.log(data.length + ' items added to queue index ' + q.index + '. ' + q.items.length + ' total items now');

	// TODO: Set q.timing.start if the queue is not already running.

	return true;
};

TimedQ.prototype.enqueue_one = function(sig, data, options={}) {
	return this.enqueue(sig, [data], options);
};

TimedQ.prototype.dequeue = function(sig) {
	const q = this.queues.get(sig);

	if(!q || !q.items.length) return undefined;

	const qitem = q.items.pop();

	++q.totaldequeued;

	return qitem;
};

TimedQ.prototype.start = function() {
	clearTimeout(this.timer);
	this.process();
};

TimedQ.prototype.stop = function() {
	clearTimeout(this.timer);
};

TimedQ.prototype.process = function() {
	// Register as running to checks immediately
	this.timer = 1;

	let totaltime = 0,
			remaining = 0;

	for(let q of this.queues_array) {
		if(!q.items.length) continue;

		// Determine if we need to start with the function once (first run) or
		// If there is no timing data, just run once and time it.
		let max = 1;
		// if we can use the time data to determine a safe running count and do it
		if(q.timing.avg)
			max = Math.floor((this.options.runtime-totaltime) / q.timing.avg) || max;

		// Run our queue for max number of times
		const startdate = new Date().getTime();
		let x = 0;
		for(; x < max && q.items.length; ++x)
			q.fnc.apply(q, this.dequeue(q.signature));
		const enddate = new Date().getTime();

		// Set some timing data
		// In case the function takes less than one ms, we'll say it took 1ms
		const curtotaltime = ((enddate - startdate) || 1);
		// Avg runtime for each function in this run
		const curavg = curtotaltime / x;
		totaltime += curtotaltime;
		// TODO: This if/else should be simpler, one code path?
		if(!q.timing.avg) {
			q.timing.avg = curavg;
			q.timing.min = curavg;
			q.timing.max = curavg;
		} else {
			q.timing.avg = (q.timing.avg * (q.totaldequeued - x) + curtotaltime) / q.totaldequeued;
			q.timing.min = Math.min(q.timing.min, curavg);
			q.timing.max = Math.max(q.timing.max, curavg);
		}

		// How many queued items remaining in this queue
		remaining += q.items.length;

		// If we just finished processing this queue, log/fire appropriate events
		if(!q.items.length) {
			this.finishcount = this.totaldequeued;
		}

		// If we've exceeded our total runtime, break
		if(totaltime > this.options.runtime - 1) break;
	}

	// If there are more items to process continue, else wait 100ms and check again
	if(remaining) this.timer = setTimeout(this.process.bind(this), this.options.breaktime);
	else this.timer = setTimeout(this.process.bind(this), this.options.idletime);
};
