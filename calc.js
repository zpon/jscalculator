define(['lexer', 'parser'], function (Lexer, Parser) {
    class Result {
        constructor(input, representation, resultValue) {
            this.input = input;
            this.representation = representation;
            this.resultValue = resultValue;
        }
    }

    function calc(ast) {
        if (!(ast instanceof Parser.Exps.Base)) {
            throw "Wrong input";
        }

        if (ast instanceof Parser.Exps.BinaryExpression) {
            let r1 = calc(ast.expression1);
            let r2 = calc(ast.expression2);
            if (ast.binaryOperator.value === "+") {
                return new Result(r1.input + ast.binaryOperator.value + r2.input, r1.representation + " - " + r2.representation, r1.resultValue + r2.resultValue)
            } else if (ast.binaryOperator.value === "-") {
                return new Result(r1.input + ast.binaryOperator.value + r2.input, r1.representation + " - " + r2.representation, r1.resultValue - r2.resultValue);
            } else if (ast.binaryOperator.value === "*") {
                return new Result(r1.input + ast.binaryOperator.value + r2.input, r1.representation + " * " + r2.representation, r1.resultValue * r2.resultValue);
            } else if (ast.binaryOperator.value === "/") {
                return new Result(r1.input + ast.binaryOperator.value + r2.input, r1.representation + " / " + r2.representation, r1.resultValue / r2.resultValue);
            } else {
                throw "Unknown operator: " + ast.binaryOperator.value;
            }
        } else if (ast instanceof Parser.Exps.UnaryExpression) {
            let r = calc(ast.expression);
            if (ast.unaryOperator.value === "~") {
                return new Result(ast.unaryOperator.value + r.input, "~" + r.representation + "", ~r.resultValue);
            } else {
                throw "Unknown operator";
            }
        } else if (ast instanceof Parser.Exps.Number) {
            return new Result(ast.token.getDecimalValue(), ast.token.value, ast.token.getDecimalValue());
        }
    }
    return {
        calculate: function (ast) {
            return calc(ast);
        },
        foo: function (lexer) {
            if (!(lexer instanceof Lexer.Lexer)) {
                console.warn("Wrong input");
            }

            let token = lexer.token();
            while (!(token instanceof Lexer.Tokens.EndOfInput)) {
                if (token instanceof Lexer.Tokens.Tilde) {
                    token = lexer.token();
                    if (token instanceof Lexer.Tokens.Number) {
                        let value = token.value;
                        let decimalNumber = token.getDecimalValue();
                        if (token.typeIndicator === "") {
                            value += "(dec)";
                        }
                        var result = ~decimalNumber;
                        return new Result(lexer.input, "~" + value + "", result);
                    } else {
                        throw "Expected number after tilde operator";
                    }
                }
                if (token instanceof Lexer.Tokens.Number) {
                    let nextToken = lexer.token();
                    if (nextToken instanceof Lexer.Tokens.EndOfInput) {
                        return new Result(token.value, token.value, token.getDecimalValue());
                    } else if (nextToken instanceof Lexer.Tokens.Plus) {
                        var plusToken = nextToken;
                        nextToken = lexer.token();
                        if (!(nextToken instanceof Lexer.Tokens.Number)) {
                            throw "Expected number after plus operator";
                        } else {
                            var n1 = token.getDecimalValue();
                            var n2 = nextToken.getDecimalValue();
                            return new Result(token.value + plusToken.value + nextToken.value, token.value + " + " + nextToken.value,
                                n1 + n2);
                        }
                    } else if (nextToken instanceof Lexer.Tokens.Minus) {
                        var minusToken = nextToken;
                        nextToken = lexer.token();
                        if (!(nextToken instanceof Lexer.Tokens.Number)) {
                            throw "Expected number after minus operator";
                        } else {
                            var n1 = token.getDecimalValue();
                            var n2 = nextToken.getDecimalValue();
                            return new Result(token.value + minusToken.value + nextToken.value, token.value + " - " + nextToken.value,
                                n1 - n2);
                        }
                    }
                }
                token = lexer.token();
            }
        }
    }
});