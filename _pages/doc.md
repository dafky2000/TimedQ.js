---
layout: single
title: Documentation Overview
permalink: /doc/
sidebar:
  nav: "documentation"
---

Documentation is split up into 3 section. The [Quick-start guide](/doc/#quick-start), [API documentation](/doc/#api-documentation) and [Examples](/doc/#examples). The aim is to keep this library as simple as possible and not require excessive documentation.

# Quick-start

Include the javascript source file in your html document.

```html
<script src="//rawgit.com/dafky2000/TimedQ.js/master/TimedQ.js"></script>
```

Create a queue instance and enqueue a function along with a dataset.

```javascript
// Once initiated the queue manager automatically starts waiting for queued data
const Q = new TimedQ();
// Add data to the queue, will be processed immediately
Q.enqueue(function(param1, param2) { console.log(param1 + param2); }, [
  ['data for param1','data for param2'],
  ['more data for param1','more data for param2'],
  ['even more data for param1','even more data for param2'],
]);

```

# API documentation

<div id="jsdoc-documentation" markdown="1">
{% include jsdox/TimedQ.md %}
</div>

# Examples
