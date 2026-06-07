export abstract class ASTNode
{
  abstract toString(): string;

  print()
  {
    const rawString = this.toString();
    let formattedString = "";
    let indentLevel = 0;
    const indentSpace = "  ";

    for (let i = 0; i < rawString.length; i++)
    {
      const char = rawString[i];

      if (char === '(' || char === '[' || char === '{' || char === '<')
      {
        indentLevel++;
        formattedString += char + '\n' + indentSpace.repeat(indentLevel);
      }
      else if (char === ')' || char === ']' || char === '}' || char === '>')
      {
        indentLevel = Math.max(0, indentLevel - 1);

        formattedString += '\n' + indentSpace.repeat(indentLevel) + char;
      }
      else if (char === ',')
      {
        formattedString += char + '\n' + indentSpace.repeat(indentLevel);
        if (rawString[i + 1] === ' ')
        {
          i++;
        }
      }
      else
      {
        formattedString += char;
      }
    }

    console.log(formattedString);
  }
}