define(['lexer'], function (Lexer) {
    // <syntax>				::== <expression> <end-of-input>
    // <expression>			::== <unary-expression> | <binary-expression> | <number>
    // <binary-expression>	::== <expression> <binary-operator> <expression>
    // <binary-operator>	::== '+' | '-' | '*' | '/'
    // <unary-expression>	::== <unary-operator> <expression>
    // <unary-operator>		::== '~' | '-'
    // <number>				::== ('' <decimal> | '0b' <binary>)
    // <decimal>			::== ('0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9')+
    // <binary>				::== ('0' | '1')+
    // <end-of-input>		::== EndOfInput

    class Base {};
    class Expression extends Base {
        constructor(expressionList) {
            super();
            this.expressionList = expressionList;
        }
    }
    class UnaryExpression extends Base {
        constructor(unaryOperator, expression) {
            super();
            this.unaryOperator = unaryOperator;
            this.expression = expression;
        }
    };
    class BinaryExpression extends Base {
        constructor(binaryOperator, expression1, expression2) {
            super();
            this.binaryOperator = binaryOperator;
            this.expression1 = expression1;
            this.expression2 = expression2;
        }
    }
    class Number extends Base {
        constructor(token) {
            super();
            this.token = token;
        }
    };



    class Parser {

        constructor(lexer) {
            if (!(lexer instanceof Lexer.Lexer)) {
                throw "Input is not of type Lexer";
            }

            this.lexer = lexer;
            this.pos = 0;

            this.tokenList = [];
            let token = lexer.token();
            while (true) {
                this.tokenList.push(token);
                if (token instanceof Lexer.Tokens.EndOfInput) {
                    break;
                }
                token = lexer.token();
            }
        }

        precedence(operator) {
            if (!(operator instanceof Lexer.Tokens.BinaryOperator)) {
                throw "Only BinaryOperator's has a defined precedence: " + operator.constructor.name;
            }

            // precedence from http://en.cppreference.com/w/cpp/language/operator_precedence

            if (operator instanceof Lexer.Tokens.Plus || operator instanceof Lexer.Tokens.Minus) {
                return 6;
            } else if (operator instanceof Lexer.Tokens.Times || operator instanceof Lexer.Tokens.Divisor) {
                return 5;
            } else {
                throw "Unknown operator: " + operator.constructor.name;
            }
        }

        parse() {
            return this.parseExpression(this.tokenList);
        }

        parseUnary(tokenList) {
            let token = this.tokenList[this.pos];

            this.pos++;
            let expression = this.parseExpression(this.tokenList);
            return new UnaryExpression(token, expression);
        }

        parseExpression(tokenList, i) {
            let expressionList = [];

            let binaryOperators = [];
            let unaryOperator = [];
            let expressions = [];

            while (this.pos < this.tokenList.length) {
                var token = this.tokenList[this.pos];
                if (token instanceof Lexer.Tokens.UnaryOperator) {
                    unaryOperator.push(token);
                    this.pos++;
                    //                    expressions.push(this.parseUnary(this.tokenList));
                } else if (token instanceof Lexer.Tokens.Number) {
                    expressions.push(new Number(token));
                    if (unaryOperator.length > 0) {
                        expressions.push(new UnaryExpression(unaryOperator.pop(), expressions.pop()));
                    }
                    this.pos++;
                    //					token = this.tokenList[this.pos];

                } else if (token instanceof Lexer.Tokens.BinaryOperator) {
                    while (binaryOperators.length > 0 && this.precedence(binaryOperators[binaryOperators.length - 1]) <= this.precedence(token)) {
                        let operator = binaryOperators.pop();
                        var e2 = expressions.pop();
                        var e1 = expressions.pop();
                        expressions.push(new BinaryExpression(operator, e1, e2));
                    }
                    //                    if (binaryOperators.length > 0) {//                        var e2 = expressions.pop();
                    //                        var e1 = expressions.pop();
                    //                        expressions.push(new BinaryExpression(binaryOperators.pop(), e1, e2));
                    //                    }
                    binaryOperators.push(token);
                    this.pos++;
                } else if (token instanceof Lexer.Tokens.EndOfInput) {
                    this.pos++;
                    break;
                }
            }

            if (binaryOperators.length > 0) {
                while (binaryOperators.length > 0) {
                    var e2 = expressions.pop();
                    var e1 = expressions.pop();
                    expressions.push(new BinaryExpression(binaryOperators.pop(), e1, e2));
                }
                console.assert(binaryOperators.length === 0, "binaryOperators must at most be 1, was: " + binaryOperators.length);
                //                console.assert(expressions.length <= 1);
                //                var e2 = expressions.pop();//                var e1 = expressions.pop();
                //                return new BinaryExpression(binaryOperators.pop(), e1, e2);
                //				expressionList.push();
            }
            console.assert(expressions.length === 1, "Exactly one expression should be available: " + expressions.length);
            return expressions.pop();
            //            else {
            //                //				expressionList.push();
            //                console.assert(expressions.length === 1, "expression should be empty on end of input, was: " + JSON.stringify(expressions));
            //                return expressions.pop();
            //            }

            return new Expression(expressionList);
        }

        astToString(element) {
            if (element instanceof Expression) {
                for (var i = 0; i < element.expressionList.length; i++) {
                    this.astToString(element.expressionList[i]);
                }
            } else if (element instanceof BinaryExpression) {
                var out = "(";
                out += this.astToString(element.expression1);
                out += element.binaryOperator.value;
                out += this.astToString(element.expression2);
                out += ")";
                return out;
            } else if (element instanceof UnaryExpression) {
                var  out = element.unaryOperator.value;
                out += "(";
                out += this.astToString(element.expression);
                out += ")";
                return out;
            } else if (element instanceof Number) {
                return element.token.value;
            }
        }
    }

    return {
        Parser: Parser,
        Exps: {
            Expression: Expression,
            UnaryExpression: UnaryExpression,
            BinaryExpression: BinaryExpression,
            Number: Number,
            Base: Base
        }

    }




});