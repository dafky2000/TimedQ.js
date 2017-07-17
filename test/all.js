const TimedQ = require('../TimedQ.js').TimedQ;

const test_size = 1000000;
const test_size_repeat = 10;

function dummyData() {
	const data = [];
	for(let x = 0; x < test_size; ++x) {
		data.push(['test'+x]);
	}

	let newdata = [];
	for(let x = 0; x < test_size_repeat; ++x) {
		newdata = newdata.concat(data);
	}

	return newdata;
}

// using assert passed to the test function that just logs failures
exports['test that logs all failures'] = function(assert, done) {
	const Q = new TimedQ();
	// Q.stop(); // Stop the queue since it is automatically started

	const f = function(input) { return 'f1' + input; };
	const f2 = function(input) { return 'f2' + input; };

	const dummydata = dummyData();
	Q.enqueue(f, dummydata);
	Q.enqueue(f2, dummydata);

	assert.equal(Q.queues_array[0].items.length, dummydata.length, 'Initial queue #1 length');
	assert.equal(Q.queues_array[1].items.length, dummydata.length, 'Initial queue #2 length');

	(function wait_for_done() {
		const left = Q.queues_array[0].items.length + Q.queues_array[1].items.length;
		console.log(left);

		if(left) {
			setTimeout(wait_for_done, 1000);
		} else {
			done();
		}
	})();
};

if (module == require.main) require('test').run(exports);
