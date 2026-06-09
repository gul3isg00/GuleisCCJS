# GuleisCCTS

GuleisCCTS is a TypeScript (TS) C compiler, which compiles C to x86-64 assembly, written in the AT&T syntax. 

When run locally, after assembly compilation completes, gcc is automatically used to finish the job, translating the assembly to machine code.

To help with the debugging of the compiler, and for educational purposes, a React/Vite webapp was developed which hooks into the compiler to demonstrate the process of compilation visually.

For anyone wishing to try something similar themselves, I am heavily following the guide (Now book!) written by **Nora Sandler**. (https://norasandler.com/2017/11/29/Write-a-Compiler.html)

## Pre-requisites

- Node (v26.2.0)
- gcc

## Setup

Clone the repository to a local directory, once cloned, install both of the sub-directories with ``npm install``.

Once both subdirectories (``GuleisCCTS`` & ``Interactive-GuleisCCTS-Site``) have been installed, re-run the install command in the project root.

## Project Structure

```
GuleisCCTS
│   README.md    
|
└───GuleisCCTS (Back-end project with the compiler source code)
│   │   
│   └───c_src (A folder containing a variety of .c files for testing.)
│   │
│   └───src (The compiler source code)
│       │   
│       └───AST (Contains the source files for all AST Nodes)
│   
└───Interactive-GuleisCCTS-Site (Front-end project containing the React web-app for visualisation.)
```

## Running / Testing (Back-end)
### Enter project
``cd GuleisCCTS``

### C file compilation.
``npm start -- <file_path>``

### Running executable.
``./<file_name>``

### Running test script.
``npm test -- <start_stage_number> <end_stage_number>``

*(start/end_stage_number must be a number 1-10. If no "end_stage_number" is inputted, it'll just run a singular test)*

## Running (Front-end)
### Enter project
``cd Interactive-GuleisCCTS-Site``

### Run web-app
``npm run dev``

## Capabilities

This is an active project, which is being updated weekly. Currently the compiler is able to correctly handle and compile programs which utilise:

- **Integers** (e.g. ``1``)
- **Unary Operators** (!, ~, -, ++, --)
- **Binary Operators** (+, *, /, etc.)
- **Local Variables** (e.g. ``int x = 1;``)
- **Conditionals** (e.g. ``if (x) else``)
- **Compound Statements** (e.g. ``if (x) { x = 3; } else { b = 3; }``)
- **Loops** (e.g. ``for``, ``while``, ``do{} while()``)
- **Functions** (e.g. ``int foo(int a){return a;}``)

The end goal is that the compiler will be able to handle *everything* (I say optimisitically), such that any valid C programs can be compiled within it.

## Theory