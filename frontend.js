requirejs.config({
    paths: {
        'jquery': 'https://code.jquery.com/jquery-3.1.1.slim.min'
    }
})

requirejs(['jquery', 'lexer', 'calc', 'parser'], function ($, Lexer, Calc, Parser) {

    $(function () {
        function createBinaryString(nMask) {
            // nMask must be between -2147483648 and 2147483647
            for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
            return sMask;
        }

        //        class Token {
        //            constructor(string) {
        //                this.string = string;
        //            }
        //        }
        //        class Operator extends Token {}
        //        class Tilde extends Operator {}
        //
        //        function tokenizer(input) {
        //            var tokens = [];
        //            var i = 0;
        //            var currentString = "";
        //            var currentToken;
        //            while (i < input.length) {
        //                var char = input.charAt(i);
        //                if (char === "~") {
        //                    var tilde = new Tilde(char);
        //                    tokens.push();
        //                }
        //                if (!isNaN(parseInt(char))) {
        //                    if (!currentToken instanceof Number) {
        //                        currenToken = new Number();
        //                    }
        //                    currentString.push(char);
        //                }
        //                i++;
        //            }
        //            currentToken.string = currentString;
        //
        //            return tokens;
        //        }



        console.log("hej1");
        $("#calc_form").submit(function (event) {
            event.preventDefault();
            var value = $("#calc_input").val();

            let lexer = new Lexer.Lexer(value);
            let parser = new Parser.Parser(lexer);
            let ast = parser.parse();

            console.log(value + " => " + parser.astToString(ast));

            var result = Calc.calculate(ast);

            $("#calc_history").prepend("<div>" + result.representation + " = " + result.resultValue + " = " + createBinaryString(result.resultValue) + "</div>");

        });
    });
});