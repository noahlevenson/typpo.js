/*
*
*	typpo.js
*	A JavaScript library for procedurally animating imperfect typing
*	by Noah Levenson
*	
*	https://github.com/noahlevenson/typpo.js
*
*/

function Typpo(options) {

    this.self = this;

	this.speed = 0;

	this.badness = 0;

	this.correctionSpeed = 30;

	this.showCursor = false;

	this.cursor = "|";

	this.destination = document.getElementById(options.element);

	if (options.speed) {

		if (options.speed > 100) {

			this.speed = 100;

		}

		else if (options.speed < 0) {

			this.speed = 0;

		}

		else {

			this.speed = options.speed;

		}

	}

	this.slowness = 1000 - (this.speed * 10);

	if (options.badness) {

		if (options.badness > 100) {

			this.badness = 100;

		}

		else if (options.badness < 0) {

			this.badness = 0;

		}

		else {

			this.badness = options.badness;

		}
	
	}

	this.probability = this.badness / 100;

	if (options.correctionSpeed) {

		if (options.correctionSpeed > 100) {

			this.correctionSpeed = 100;

		}

		else if (options.correctionSpeed < 0) {

			this.correctionSpeed = 0;

		}

		else {

			this.correctionSpeed = options.correctionSpeed;

		}
	
	}

	this.backspaceSlowness = 1000 - (this.correctionSpeed * 10);
	
	this.pressKey = function(c) {

        window.requestAnimationFrame(function() {

            this.self.destination.innerHTML = this.self.destination.innerHTML + this.c;

        }.bind({self: this.self, c: c}));

	}

    this.write = function(s, callback, pos) {

        if (!pos) {

            var pos = 0;

        }

        if (!callback) {

            var callback = null;
        }

        setTimeout(function() {

            var c = this.s.substr(this.pos, 1);

            if (this.self.errorTable.hasOwnProperty(c) && this.self.probability > Math.random()) {

                this.self.pressKey(this.self.errorTable[c][Math.floor(Math.random() * this.self.errorTable[c].length)]);

                setTimeout(function() {

                    var html = this.self.destination.innerHTML;

                    window.requestAnimationFrame(function() {

                        this.self.destination.innerHTML = html.substr(0, html.length - 1);

                        this.self.write(this.s, this.callback, this.pos);

                    }.bind({self: this.self, s: this.s, callback: this.callback, pos: this.pos}));

                }.bind({self: this.self, s: this.s, callback: this.callback, pos: this.pos}), Math.random() * this.self.backspaceSlowness);

            }

            else {

                this.self.pressKey(c);

                this.pos += 1;

                if (this.pos <= this.s.length) {

                    this.self.write(this.s, this.callback, this.pos);
                
                }

                else {

                    if (this.callback) {

                        callback();

                    }
                
                }

            }

        }.bind({self: this.self, s: s, callback: callback, pos: pos}), Math.random() * this.self.slowness);

    }

    this.writeUncorrected = function(s, callback, pos) {

        if (!pos) {

            var pos = 0;

        }

        if (!callback) {

            var callback = null;
        }

        setTimeout(function() {

            var c = this.s.substr(this.pos, 1);

            if (this.self.errorTable.hasOwnProperty(c) && this.self.probability > Math.random()) {

                this.self.pressKey(this.self.errorTable[c][Math.floor(Math.random() * this.self.errorTable[c].length)]);

                this.pos += 1;

                if (this.pos <= this.s.length) {

                	this.self.writeUncorrected(this.s, this.callback, this.pos);
                
                }

                else {

                	if (this.callback) {

                		this.callback();

                	}
                
                }

            }

            else {

                this.self.pressKey(c);

                this.pos += 1;

                if (this.pos <= this.s.length) {

                    this.self.writeUncorrected(this.s, this.callback, this.pos);
                
                }

                else {

                    if (this.callback) {

                        this.callback();

                    }
                
                }

            }

        }.bind({self: this.self, s: s, callback: callback, pos: pos}), Math.random() * this.self.slowness);

    }

    this.enter = function(n, callback) {

        if (n && n > 1) {

            for (var i = 0; i < n; i += 1) {

                this.destination.innerHTML = this.destination.innerHTML + "<br>";

            }
        
        }

        else {

            this.destination.innerHTML = this.destination.innerHTML + "<br>";

        }

        if (callback) {

            callback();
            
        }
  
    }

	this.errorTable = {

		a: ["s", "z", "q"],
		b: ["v", "g", "n"],
		c: ["x", "d", "v"],
		d: ["s", "f", "c", "e"],
		e: ["w", "r", "d"],
		f: ["d", "g", "v", "r"],
		g: ["f", "h", "t", "b"],
		h: ["g", "j", "y", "n"],
		i: ["o", "u", "k"],
		j: ["h", "k", "u", "m"],
		k: ["l", "j", "i", ","],
		l: ["k", ";", "o", "."],
		m: ["n", ",", "j"],
		n: ["b", "m", "h"],
		o: ["i", "p", "l"],
		p: ["o", "[", ";"],
		q: ["w", "a"],
		r: ["e", "t", "f"],
		s: ["a", "d", "w", "x"],
		t: ["r", "y", "g"],
		u: ["y", "i", "j"],
		v: ["c", "b", "f"],
		w: ["q", "e", "s"],
		x: ["z", "c", "s"],
		y: ["t", "u", "h"],
		z: ["x", "a"],
		A: ["s", "z", "q", "a"],
		B: ["v", "n", "g", "b"],
		C: ["x", "v", "d", "c"],
		D: ["s", "f", "c", "e", "d"],
		E: ["w", "r", "d", "e"],
		F: ["d", "g", "r", "v", "f"],
		G: ["f", "h", "t", "b", "g"],
		H: ["g", "j", "y", "n", "h"],
		I: ["u", "o", "k", "i"],
		J: ["h", "k", "u", "m", "j"],
		K: ["j", "l", "i", ",", "k"],
		L: ["k", ";", "o", ".", "l"],
		M: ["m", ",", "j", "m"],
		N: ["b", "m", "h", "n"],
		O: ["i", "p", "l", "o"],
		P: ["o", "[", ";", "p"],
		Q: ["a", "s", "w", "q"],
		R: ["e", "t", "f", "r"],
		S: ["a", "d", "w", "x", "s"],
		T: ["r", "y", "g", "t"],
		U: ["y", "i", "j", "u"],
		V: ["c", "b", "f", "v"],
		W: ["e", "q", "s", "w"],
		X: ["z", "c", "s", "x"],
		Y: ["t", "u", "h", "y"],
		Z: ["x", "s", "a", "z"],
        "!": ["1", "@", "~"],
        "@": ["2", "!", "#"],
        "#": ["3", "@", "$"],
        "$": ["4", "#", "%"],
        "%": ["5", "$", "^"],
        "^": ["6", "%", "&"],
        "&": ["7", "^", "*"],
        "*": ["8,", "&", "("],
        "(": ["9", "*", ")"],
        ")": ["0", "(", "_"],
        "_": ["-", ")", "+"],
        "+": ["=", "_"]	

	};

}


