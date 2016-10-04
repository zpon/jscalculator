requirejs(['lexer', 'calc', 'parser'], function (Lexer, Calc, Parser) {

    QUnit.assert.types = function (a, b, message) {
        var actual = a instanceof b;

        this.pushResult({
            result: actual,
            actual: a.constructor.name,
            expected: b.name,
            message: actual ? "okay" : (message || a.constructor.name + " is not an instance of " + b.name)
        });
    }

    QUnit.module("Lexer", function () {

        QUnit.test("Number decimal", function (assert) {

            {
                let lexer = new Lexer.Lexer("1234");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Number, "Passed!");
                assert.equal(token.value, "1234");
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed!");
                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed!");
            }

            {
                let lexer = new Lexer.Lexer("1010");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Number, "Passed!");
                assert.equal(token.value, "1010");
                assert.equal(token.getDecimalValue(), 1010);
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed!");
            }

            {
                let lexer = new Lexer.Lexer("0d9");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Number, "Passed!");
                assert.equal(token.value, "0d9");
                assert.equal(9, token.getDecimalValue());
            }
        });

        QUnit.test("Number binary", function (assert) {
            // Binary numbers
            {
                let lexer = new Lexer.Lexer("0b10");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Number, "Passed!");
                assert.equal(token.value, "0b10");
                assert.equal(token.typeIndicator, "b");
                assert.equal(token.getDecimalValue(), 2);

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed!");
            }

            {
                let lexer = new Lexer.Lexer("0b000010");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Number, "Passed!");
                assert.equal(token.value, "0b000010");
                assert.equal(token.typeIndicator, "b");
                assert.equal(token.getDecimalValue(), 2);

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed!");
            }
        });

        QUnit.test("Tilde", function (assert) {

            {
                let lexer = new Lexer.Lexer("~");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Tilde, "Passed!");
                assert.equal(token.value, "~");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed! " + token.prototype);
            }

            {
                let lexer = new Lexer.Lexer("~1234");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Tilde, "Passed!");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Number, "Passed! " + token.prototype);
                assert.equal(token.value, "1234");
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed! " + token.prototype);
            }
        });


        QUnit.test("Plus", function (assert) {

            {
                let lexer = new Lexer.Lexer("+");
                let token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Plus, "Passed!");
                assert.equal(token.value, "+");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed! " + token.prototype);
            }

            {
                let lexer = new Lexer.Lexer("1234+");
                let token = lexer.token();

                assert.ok(token instanceof Lexer.Tokens.Number, "Passed! " + token.prototype);
                assert.equal(token.value, "1234");
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.Plus, "Passed!");

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed! " + token.prototype);
            }

            {
                let lexer = new Lexer.Lexer("12+34");
                let token = lexer.token();

                assert.ok(token instanceof Lexer.Tokens.Number, "Passed! " + token.prototype);
                assert.equal(token.value, "12");
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Plus);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.getDecimalValue(), 34);

                token = lexer.token();
                assert.ok(token instanceof Lexer.Tokens.EndOfInput, "Passed! " + token.prototype);
            }
        });

        QUnit.test("Minus", function (assert) {

            {
                let lexer = new Lexer.Lexer("-");
                let token = lexer.token();
                assert.types(token, Lexer.Tokens.Minus);
                assert.equal(token.value, "-");

                token = lexer.token();
                assert.types(token, Lexer.Tokens.EndOfInput);
            }

            {
                let lexer = new Lexer.Lexer("1234-");
                let token = lexer.token();

                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.value, "1234");
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Minus);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.EndOfInput);
            }

            {
                let lexer = new Lexer.Lexer("12-34");
                let token = lexer.token();

                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.value, "12");
                assert.equal(token.typeIndicator, "");

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Minus);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.getDecimalValue(), 34);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.EndOfInput);
            }
        });

        QUnit.test("Ignore white space", function (assert) {
            {
                let lexer = new Lexer.Lexer(" 10 ");
                let token = lexer.token();

                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.getDecimalValue(), 10);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.EndOfInput);
            } {
                let lexer = new Lexer.Lexer("   10   + \t		1  \t"); // space and tabs
                let token = lexer.token();

                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.getDecimalValue(), 10);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Plus);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.Number);
                assert.equal(token.getDecimalValue(), 1);

                token = lexer.token();
                assert.types(token, Lexer.Tokens.EndOfInput);
            }
        });
    });

    QUnit.module("Parser", function () {
        QUnit.test("Unary", function (assert) {
            {
                let lexer = new Lexer.Lexer("~10");
                let parser = new Parser.Parser(lexer);
                let ast = parser.parse();

                assert.types(ast, Parser.Exps.UnaryExpression);
                assert.equal(ast.unaryOperator.value, "~");
                assert.types(ast.expression, Parser.Exps.Number);
                assert.equal(ast.expression.token.value, 10);
            }
        });

        QUnit.test("Binary", function (assert) {
            {
                let lexer = new Lexer.Lexer("10 + 2");
                let parser = new Parser.Parser(lexer);
                let ast = parser.parse();

                assert.types(ast, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1, Parser.Exps.Number);
                assert.equal(ast.expression1.token.value, 10);
                assert.types(ast.binaryOperator, Lexer.Tokens.Plus);
                assert.equal(ast.binaryOperator.value, "+");
                assert.equal(ast.expression2.token.value, 2);
            }

            {
                let lexer = new Lexer.Lexer("10 + 2 + 3");
                let parser = new Parser.Parser(lexer);
                let ast = parser.parse();

                // ((10+2)+3)
                assert.types(ast, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1.expression1, Parser.Exps.Number);
                assert.types(ast.expression1.expression1.token, Lexer.Tokens.Number);
                assert.equal(ast.expression1.expression1.token.value, 10);
                assert.types(ast.expression1.binaryOperator, Lexer.Tokens.Plus);
                assert.types(ast.expression1.expression2, Parser.Exps.Number);
                assert.types(ast.expression1.expression2.token, Lexer.Tokens.Number);
                assert.equal(ast.expression1.expression2.token.value, 2);
                assert.types(ast.expression2, Parser.Exps.Number);
                assert.types(ast.expression2.token, Lexer.Tokens.Number);
                assert.equal(ast.expression2.token.value, 3);
            }
        });

        QUnit.test("Mixed operator ~10 + 2 + 3 + 4 + 5", function (assert) {
            {
                let lexer = new Lexer.Lexer("~10 + 2 + 3 + 4 + 5");
                let parser = new Parser.Parser(lexer);
                let ast = parser.parse();

                var out = printAst(ast);
                console.log(out);
                // ((((~(10) + 2) + 3) + 4) + 5)
                assert.types(ast, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1.expression1, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1.expression1.expression1, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1.expression1.expression1.expression1, Parser.Exps.UnaryExpression);
                assert.types(ast.expression1.expression1.expression1.expression1.expression, Parser.Exps.Number);
                assert.equal(ast.expression1.expression1.expression1.expression1.expression.token.value, 10);
                assert.types(ast.expression1.expression1.expression1.expression2, Parser.Exps.Number);
                assert.equal(ast.expression1.expression1.expression1.expression2.token.value, 2);
                assert.types(ast.expression1.expression1.expression2, Parser.Exps.Number);
                assert.equal(ast.expression1.expression1.expression2.token.value, 3);
                assert.types(ast.expression1.expression2, Parser.Exps.Number);
                assert.equal(ast.expression1.expression2.token.value, 4);
                assert.types(ast.expression2, Parser.Exps.Number);
                assert.equal(ast.expression2.token.value, 5);
            }
        });

        QUnit.test("Mixed operator 2 + ~3 + 4", function (assert) {
            {
                let lexer = new Lexer.Lexer("2 + ~3 + 4");
                let parser = new Parser.Parser(lexer);
                let ast = parser.parse();

                var out = printAst(ast);
                console.log(out);
                // ((2 + ~(3)) + 4)
                assert.types(ast, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1, Parser.Exps.BinaryExpression);
                assert.types(ast.expression1.expression1, Parser.Exps.Number);
                assert.equal(ast.expression1.expression1.token.value, 2);
                assert.types(ast.expression1.expression2, Parser.Exps.UnaryExpression);
                assert.types(ast.expression1.expression2.unaryOperator, Lexer.Tokens.Tilde);
                assert.types(ast.expression1.expression2.expression, Parser.Exps.Number);
                assert.equal(ast.expression1.expression2.expression.token.value, 3);
                assert.types(ast.expression2, Parser.Exps.Number);
                assert.equal(ast.expression2.token.value, 4);
            }
        });
    });

    function printAst(element) {
        if (element instanceof Parser.Exps.Expression) {
            for (var i = 0; i < element.expressionList.length; i++) {
                console.log("---");
                printAst(element.expressionList[i]);
            }
        } else if (element instanceof Parser.Exps.BinaryExpression) {
            //            console.log("(");
            var out = "(";
            out += printAst(element.expression1);
            //            console.log(element.binaryOperator.value);
            out += element.binaryOperator.value;
            out += printAst(element.expression2);
            //            console.log(")");
            out += ")";
            return out;
        } else if (element instanceof Parser.Exps.UnaryExpression) {
            //            console.log(element.unaryOperator.value);
            var  out = element.unaryOperator.value;
            out += "(";
            out += printAst(element.expression);
            out += ")";
            return out;
        } else if (element instanceof Parser.Exps.Number) {
            //            console.log(element.token.value);
            return element.token.value;
        }
    }

    QUnit.module("Calc", function () {
        QUnit.test("Number", function (assert) {
            {
                let lexer = new Lexer.Lexer("10");
                let parser = new Parser.Parser(lexer);
                let result = Calc.calculate(parser.parse());
                assert.equal(result.resultValue, 10);
            }

            {
                let lexer = new Lexer.Lexer("0b10");
                let parser = new Parser.Parser(lexer);
                let result = Calc.calculate(parser.parse());
                assert.equal(result.resultValue, 2);
            }
        });

        QUnit.test("Tilde", function (assert) {
            {
                let lexer = new Lexer.Lexer("~10");
                let parser = new Parser.Parser(lexer);
                let result = Calc.calculate(parser.parse());
                assert.equal(result.resultValue, -11);
            }

            {
                let lexer = new Lexer.Lexer("~0b10");
                let parser = new Parser.Parser(lexer);
                let result = Calc.calculate(parser.parse());
                assert.equal(result.resultValue, -3);
            }
        });

        QUnit.test("Plus", function (assert) {
            {
                let lexer = new Lexer.Lexer("10+10");
                let parser = new Parser.Parser(lexer);
                let result = Calc.calculate(parser.parse());
                assert.equal(result.resultValue, 20);
            }

            {
                let lexer = new Lexer.Lexer("10+10 + 20");
                let parser = new Parser.Parser(lexer);
                let result = Calc.calculate(parser.parse());
                assert.equal(result.resultValue, 40);
            }
        });
    });
})