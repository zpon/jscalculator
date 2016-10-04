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
                    if (binaryOperators.length > 0) {
                        var e2 = expressions.pop();
                        var e1 = expressions.pop();
                        expressions.push(new BinaryExpression(binaryOperators.pop(), e1, e2));
                    }
                    binaryOperators.push(token);
                    this.pos++;
                } else if (token instanceof Lexer.Tokens.EndOfInput) {
                    this.pos++;
                    break;
                }
            }

            if (binaryOperators.length > 0) {
                console.assert(binaryOperators.length === 1, "binaryOperators must at most be 1");
                console.assert(expressions.length == 2);
                var e2 = expressions.pop();
                var e1 = expressions.pop();
                return new BinaryExpression(binaryOperators.pop(), e1, e2);
                //				expressionList.push();
            } else {
                //				expressionList.push();
                console.assert(expressions.length === 1, "expression should be empty on end of input, was: " + JSON.stringify(expressions));
                return expressions.pop();
            }

            return new Expression(expressionList);
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