/*
 * Copyright (C) 2017 Daniel Kelly - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the GNU General Public License v3.0 license.
 *
 * You should have received a copy of the GNU General Public
 * License v3 with this file file. If not, please:
 * Email: myself@danielkelly.me, or
 * Visit: https://raw.githubusercontent.com/dafky2000/TimedQ.js/master/LICENSE
 *
 * Above and including this line must remain unchanged.
 *
 */

exports.TimedQ = TimedQ;

/**
 * Create a new TimeQ manager for running many separate queues.
 * @param {Object} [options] - (optional) Queue options
 * @returns {TimedQ} TimedQ instance
 * @class TimedQ
 */
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

/**
 * Create a new TimeQ.qgroup, a queue group is used for separating different queues of functions. Every unique enqueue signature has it's own `qgroup`
 * @param {Reference} [signature] - Signature used to identify qgroup, this could be a `String`, `Object`, `Integer`, `Function`, whatever a `Map()` supports as a key
 * @param {Integer} [index] - The array index of this `qgroup`, usually equal to the number of qgroups currently created.
 * @param {Object} [options] - (optional) `qgroup` options
 * @returns {TimedQ.qgroup} TimedQ qgroup reference
 */
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

/**
 * Gets a qgroup by it's signature. If the qgroup doesn't exist than it is created on the automatically
 * @param {Reference} [signature] - Signature to get
 * @param {Function} [callback] - (optional) If the qgroup doesn't exist and we are creating one, what is the callback function (if not the same as the signature)
 * @returns {TimedQ.qgroup} TimedQ.group reference
 */
TimedQ.prototype.get = function(signature, callback) {
	// Get the existing queue
	let q = this.queues.get(signature);

	// If this queue doesn't already exist, create it and return it
	if(!q) {
		q = this.queues.set(signature, new this.qgroup(signature, this.queues_array.length, {
											callback: callback,
										}))
									 .get(signature);
		this.queues_array.push(q);
	}

	return q;
};

/**
 * Enqueue/Add data to be run in a queue.
 * @param {Reference} [signature] - qgroup signature (Function) to assign the data to
 * @param {Array} [data] - 2-dimensional array of data, first level is for each function call, second level is for each parameter. For example: [ ['firstcall-param1','firstcall-param2'], ['secondcall-param1','secondcall-param2'], ... ]
 * @param {Object} [options] - (optional) Options to configure the queue such as a callback Function if the signature is not the Function itself
 * @returns {TimedQ.qgroup} TimedQ.group reference
 */
TimedQ.prototype.enqueue = function(signature, data=[], options={}) {
	// Get (or create) the this.qgroup
	const q = this.get(signature, options.callback);

	// Now return, in case we just wanted to create the this.qgroup
	if(!data.length) return;

	// Push the data to the end of the queue
	q.items = q.items.concat(data);

	++q.totalenqueued;

	// console.log(data.length + ' items added to queue index ' + q.index + '. ' + q.items.length + ' total items now');

	// TODO: Set q.timing.start if the queue is not already running.

	return true;
};

/**
 * Dequeue/remove and return one parameter set from a specific queue
 * @param {Reference} [signature] - qgroup signature idententifier
 * @returns {Array} - Set of parameters
 */
TimedQ.prototype.dequeue = function(signature) {
	const q = this.queues.get(signature);

	if(!q || !q.items.length) return undefined;

	const qitem = q.items.pop();

	++q.totaldequeued;

	return qitem;
};

/**
 * Starts the queue manager monitoring of the qgroups
 */
TimedQ.prototype.start = function() {
	clearTimeout(this.timer);
	this.process();
};

/**
 * Stops the queue manager monitoring of the qgroups
 */
TimedQ.prototype.stop = function() {
	clearTimeout(this.timer);
};

/**
 * The main processing function. Manages how many queue items to process, runs them and tracks timing data against each qgroup.
 */
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
