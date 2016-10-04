// lexer.js
define(function () {
    class Token {
        constructor(value) {
            this.value = value;
        }
    }
    class Number extends Token {
        constructor(value, typeIndicator) {
            super(value);
            this.typeIndicator = typeIndicator;
        }
        
        getDecimalValue() {
        	if (this.typeIndicator === "b") {
        		return parseInt(this.value.substr(2), 2);
        	} else if (this.typeIndicator === "d") {
        		return parseInt(this.value.substr(2), 10);
        	} else {
        		return parseInt(this.value, 10);
        	}
        }
    };
    class EndOfInput extends Token {}
    class Operator extends Token {}
    class BinaryOperator extends Operator {};
    class UnaryOperator extends Operator {};
    class Tilde extends UnaryOperator {
        constructor(char) {
            super(char);
        }
    } // ~
    class Plus extends BinaryOperator {
    	constructor(char) {
    		super(char);
    	}
    } // +
    class Minus extends BinaryOperator {
    	constructor(char) {
    		super(char);
    	}
    } // -

    class Lexer {

        constructor(input) {
            this.input = input;
            this.pos = 0;
        }

        getCurrentChar() {
            return this.input.charAt(this.pos);
        }
        getNextChar() {
        	return this.input.charAt(this.pos + 1);
        }

        token() {
            var char = this.getCurrentChar(); // getCurrentChar after end of input will return ""

            while (this.isWhiteSpace(char)) {
            	this.pos++;
            	char = this.getCurrentChar();
            }
            
            if (this.pos == this.input.length) {
                return new EndOfInput();
            }

            else if (this.isDigit(char)) {
                return this.parseNumber();
            }
            else if (char === "~") {
                this.pos++;
                return new Tilde(char);
            }
            else if (char === "+") {
            	this.pos++;
            	return new Plus(char);
            }
            else if (char === "-") {
            	this.pos++;
            	return new Minus(char);
            }
            else {
            	throw "Unable to parse input char: \"" + char + "\" at position: " + this.pos;
            }
        }

        isDigit(char) {
            return !isNaN(parseInt(char));
        }
        
        isWhiteSpace(char) {
        	return char === " " || char === "\t";
        }

        parseNumber() {
            var char = this.getCurrentChar();
            var num = "";
            var likelyBinary = true;
            var typeIndicator = "";
            if (char == "0") {            		
        		if (this.getNextChar() === "x") {
        			// hex
        			// TODO
        		}
        		else if (this.getNextChar() === "b") {
        			// binary
        			typeIndicator = "b";
        		}
        		else if (this.getNextChar() === "d") {
        			// decimal
        			typeIndicator = "d";
        		}
        	}
            
            while (this.pos < this.input.length && (this.isDigit(char) || 
            		(typeIndicator === "b" && char === "b") || (typeIndicator === "d" && char === "d"))) {
                num += char;
                if (typeIndicator == "b") {
                	if (char !== "0" && char !== "1" && char != "b") {
                		throw "Number started with 0b but was contained number other than 0 and 1: " + char;
                	}                	
                }
                if (typeIndicator == "d") {
                	if (char !== "d" && char < 0 && char > 9) {
                		throw "Number started with 0d but was contained number other than 0-9 and d: " + char;
                	}                	
                }
                this.pos++;
                char = this.getCurrentChar();
            }
            return new Number(num, typeIndicator);
        }
    }

    return {
        Lexer: Lexer,
        Tokens: {
            Token: Token,
            EndOfInput: EndOfInput,
            Number: Number,
            UnaryOperator: UnaryOperator,
            BinaryOperator: BinaryOperator,
            Tilde: Tilde,
            Plus: Plus,
            Minus: Minus
        }
    };
});