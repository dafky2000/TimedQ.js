# How to contribute

Third-party patches are essential to make TimedQ.js great. We want to keep it as easy as possible to contribute changes that et things working in your environment. There are a few guidelines that we need contributors to follow so that we can have a chance of keeping on top of things.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* Submit a ticket for your issue, assuming one does not already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you fill in the earliest version that you know has the issue.
* Fork the repository on GitHub

## Making Changes

* Create a topic branch from where you want to base your work.
  * This is usually the master branch.
  * Only target release branches if you are certain your fix must be on that
    branch.
  * To quickly create a topic branch based on master; `git checkout -b
    fix/master/my_contribution master`. Please avoid working directly on the
    `master` branch.
* Make commits of logical units.
* Check for unnecessary whitespace with `git diff --check` before committing.
* Make sure your commit messages are descriptive yet concise.

## Final notes

This is my first written and managed open source project, everything is subject to change. Please bear with me!
