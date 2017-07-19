---
layout: single
author_profile: false
---

<h1>{{ site.github.repository_name }}</h1>

{{ site.github.project_tagline }}

# The problem

In the browser, DOM animations and Javascript execution run in a single thread. If you need to process large amounts of data while keeping the browser responsive you must use some sort of processing queue or a web worker.

## Traditional queues

**DISCLAIMER**: By *traditional* I mean how *I've* traditionally done them.

* Hardcoded batch sizes have inconsistent execution time between different devices and browsers
* Makes your code subject to more profiling reviews (could be a good thing too :wink:)

## Web workers

Have their own set of limitations that make this library appealing:

* Web workers cannot directly interact with the DOM
* Communicating with web workers is done through messages exchanges of serialized data, this can be a pain for already established projects

# The solution

A self-adjusting queue management system which runs batches within reasonable timeframes, giving the browser *time* to update and draw.

Select the **result** tab to begin the test.

<iframe width="100%" height="550" src="//jsfiddle.net/dafky2000/rnobkxam/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

# Similar projects and resources

[timed-queue](https://www.npmjs.com/package/timed-queue) Distributed timed job queue, backed by redis.
