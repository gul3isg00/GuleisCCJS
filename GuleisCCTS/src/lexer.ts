export class Lexer
{
  lex_regex: RegExp;

  constructor()
  {
    this.lex_regex = /\/\/|\n|--|\+\+|\^=|\|=|&=|>>=|<<=|%=|\*=|\/=|-=|\+=|<<|>>|>=|>|<=|<|!=|==|=|\|\||&&|\/|\*|\+|,|-|~|!|{|}|\(|\)|;|\||&|\^|\bint\b|\breturn\b|\bif\b|\belse\b|:|\?|[a-zA-Z]\w*|[0-9]+/g;
  }

  lex(input: string): RegExpMatchArray | null
  {
    const tokens = input.match(this.lex_regex);

    return tokens;
  }
}