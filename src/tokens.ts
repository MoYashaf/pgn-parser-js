export enum TokenKind {
  EOF = "EOF",
  IDENT = "Identifier",
  STRING = "String",
  NUMBER = "Number",
  DOT = "Dot",
  ELLIPSIS = "Ellipsis",
  L_BRACKET = "Left_Bracket",
  R_BRACKET = "Right_Bracket",
  PLUS = "Plus",
  HASH = "Hash",
  PROMOTION = "Promotion",
  CAPTURE = "Capture",
  S_CASTLE = "Short_Castle",
  L_CASTLE = "Long_Castle",
  RESULT = "Result",
}
// export function tokenize(sourceCode: string): Token[] {
//   const tokens: Token[] = [] as Token[];
//   const src = sourceCode.split("");
//   while (src.length > 0) {
//   }
//   return tokens;
// }

export class Token {
  public kind: TokenKind
  public lexeme: string
  public literal: Object
  public line: number

  constructor(kind: TokenKind, lexeme: string, literal: any, line: number) {
    this.kind = kind
    this.lexeme = lexeme
    this.literal = literal
    this.line = line
  }

}
