# GuleisCCTS

This is a personal project I have undertaken to help myself learn the inner workings of a compiler.


The idea is to write a TypeScript (TS) C compiler, which compiles C to x86-64 assembly. written in the AT&T syntax.


In future I hope to also integrate this with a web-based GUI so I can visualise the compilation for educational purposes.


For anyone wishing to try something similar themselves, I am heavily following the guide written by **Nora Sandler**. (https://norasandler.com/2017/11/29/Write-a-Compiler.html)

## Running / Testing
### Compiling exemplar files.
npm start -- <stage_number>

### ARM Assembly to machine code.
gcc c_src/exemplar/stage_2/valid/<file_name> -o <file_name>

### Running executable.
./<file_name>
echo $?


## Project Structure


## Theory

For this compiler there are 3 main parts. 

1. A **Lexer**
2. A **Parser**
3. A **Generator**

### Lexer

Lexers simply break down the inputted c file into tokens.


For example:

```
int main() {
    return 2;
}
```

would be broken down to:

``["int", "main", "(", ")", "{", "return", "2", ";", "}"]``


These tokens can then be parsed to the parser.

### Parser

The parser is arguably the most complex and important part of the process. This is the part which determines whether the code being compiled is valid.


It does this by building an **Abstract syntax tree** from the tokens, creating a structural representation of the input whilst checking for the correct synax.


In this implementation the important tokens can be separated out into 4 main types.

#### Programs

#### Functions

#### Statements

#### Expressions
Currently expressions are defined as either **Unary Operations** (operations that act on a single value), **Binary Operations** (operations that act on 2 values), and **Constants** (unchanging integer values).

##### Precidence

In order to enforce the precidence of the operators we separate expressions into, **Expressions**, **Terms**, and **Factors**.

An **Expression** can be:
- An **Expression** + or - an **Expression**
- A **Term**

A **Term** can be:
- A **Term** * or / a **Term**
- A **Factor**

A **Factor** can be:
- An **Expression** within brackets.
- An **Unary Operator** and a **Factor**
- A **Constant**

By breaking down and evaluating **Expressions** this way it means proper logic can be followed, and we can safely disambiguate the order and type of operations being used within the expression.

### Generator