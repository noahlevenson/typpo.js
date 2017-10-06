# typpo.js

Typpo.js is a JavaScript library that can procedurally animate lifelike human typing -- errors, corrections and all.

Just set some parameters and supply a string, then watch Typpo type it with startling inaccuracy.

It's built around a promise system that makes it simple to animate asynchronously generated text, like live tweets or newsfeeds.

### Using Typpo.js is easy:

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

### The options object
**element**<br>
String. The HTML element that Typpo will type into.

**badness**<br>
Integer. Typpo's overall typing inaccuracy, 0 - 100. 0 is a perfect typist, 100 is a terrible one.

**speed**<br>
Integer. Typpo's typing speed, 0 - 100. 0 is very slow, 100 is very fast.

**backspaceSpeed**<br>
Integer. The speed at which Typpo recognizes its errors and deletes them, 0 - 100. 0 is very slow, 100 is very fast.

**showCursor**<br>
Boolean. Determines whether Typpo displays the cursor.

**cursor**<br>
String. The character(s) that Typpo will display as its cursor.

### Methods
**write(string)**
**writeUncorrected(string)**
**enter(number)**
**pause(time)**
**backspaceAll(ttl)**


### Contact
I'd love to see how you're using Typpo.js. Show me your projects!

twitter.com/noahlevenson

noahlevenson [at] gmail [dot] com

www.noahlevenson.com
