export class Lexer {
  lex_regex: RegExp;

  constructor() {
    this.lex_regex = /\/|\*|\+|-|~|!|{|}|\(|\)|;|\bint\b|\breturn\b|[a-zA-Z]\w*|[0-9]+/g;
  }

  lex(input: string): RegExpMatchArray | null {
    return input.match(this.lex_regex);
  }
}