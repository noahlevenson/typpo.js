# typpo.js

Typpo.js is a JavaScript library that procedurally animates bad typing. Set the typing speed, correction speed and overall typing skill, then watch Typpo type your text with lifelike inaccuracy.

It's built around an asynchronous promise system that simplifies the animation of unpredictable sources of text, such as live internet feeds.

USAGE:

~~~ javascript
<script src="typpo.js"></script>

<div id="myDiv"></div>

var options = {
    element: "myDiv", 
    badness: 20, 
    speed: 80, 
    backspaceSpeed: 10, 
    showCursor: true, 
    cursor: "|"
};

var myTyppo = new Typpo(options);
~~~