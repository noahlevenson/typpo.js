# typpo.js

Typpo.js is a JavaScript library that can procedurally animate lifelike human typing -- errors, corrections and all.

Just set some parameters and supply a string, then watch Typpo type it with startling inaccuracy.

It's built around a promise system that makes it simple to animate asynchronously generated text, like live tweets or newsfeeds.

#### Using Typpo.js is easy:

~~~ javascript
<script src="typpo.js"></script>

<div id="myDiv"></div>

<script>
var options = {
    element: "myDiv", 
    badness: 20, 
    speed: 80, 
    backspaceSpeed: 10, 
    showCursor: true, 
    cursor: "|"
};

var myTyppo = new Typpo(options);

myTyppo.onDrain = function() {
    console.log("The Typpo task queue has been emptied!");
}

myTyppo.write("I'll correct my mistakes while typing this.");
myTyppo.pause(2000);
myTyppo.enter(2);
myTyppo.writeUncorrected("But I won't correct my mistakes while typing this.")
myTyppo.backspaceAll(3000);
</script>
~~~

## Documentation
