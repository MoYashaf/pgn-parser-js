import { Token, TokenKind } from "./tokens";

export type results = ("1-0" | "0-1" | "1/2-1/2" | "*") | null


export class Lexer {
  private source: string
  private tokens: Token[]
  private start: number
  private current: number
  private line: number
  constructor(sourceCode: string) {
    this.source = sourceCode;
    this.tokens = new Array() as Token[];
    this.start = 0;
    this.current = 0;
    this.line = 1
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken()
    }
    this.tokens.push(new Token(TokenKind.EOF, "", null, this.line))
    return this.tokens
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  private advance(): string {
    return this.source.charAt(this.current++)
  }
  private scanToken() {
    const c = this.advance();
    switch (c) {
      // Single-character tokens
      case "[":
        this.addToken(TokenKind.L_BRACKET);
        break;
      case "]":
        this.addToken(TokenKind.R_BRACKET);
        break;
      case ".":
        if (this.match('.') && this.match('.')) {
          this.addToken(TokenKind.ELLIPSIS); // "..."
        } else {
          this.addToken(TokenKind.DOT);      // "."
        }
        break;
      case "x":
        this.addToken(TokenKind.CAPTURE);
        break;
      case "+":
        this.addToken(TokenKind.PLUS);       // Check
        break;
      case "#":
        this.addToken(TokenKind.HASH);       // Checkmate
      case "*":
        this.addToken(TokenKind.RESULT);       // Checkmate
        break;
      case "=":
        this.addToken(TokenKind.PROMOTION);  // Promotion
        break;
      case '"':
        this.string()
        break
      case "O":
        if (this.match('-') && this.match('O')) {
          if (this.match('-') && this.match('O')) {
            this.addToken(TokenKind.L_CASTLE)
          } else {
            this.addToken(TokenKind.S_CASTLE)
          }
        } else console.error("Expected 'O' at line " + this.line)
        break

      // case "B":
      // case "C":
      // case "E":
      // case "F":
      // case "K":
      // case "N":
      // case "O":
      // case "P":
      // case "Q":
      // case "R":
      // case "S":
      // case "W":
      // case "Z":
      //   this.addTokenWithLiteral(TokenKind.PIECE, c);
      //   break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line++;
        break;

      default:
        if (this.isDigit(c)) {
          this.number()
        } else if (this.isAlpha(c)) {
          this.identifier();
        }
        else {
          console.error("Unknown symbol at line " + this.line + " at " + this.current / this.line)
        }
        break;
    }
  }
  private number() {
    while (this.isDigit(this.peek())) {
      this.advance()
    }
    const remaining = this.source.slice(this.start, this.current + 4); // enough lookahead

    if (remaining.startsWith("1-0") || remaining.startsWith("0-1")) {
      // consume the "-0" or "-1"
      if (this.peek() === '-') { this.advance(); }
      if (this.isDigit(this.peek())) { this.advance(); }

      this.addToken(TokenKind.RESULT);
      return;
    }

    if (remaining.startsWith("1/2-1/2")) {
      // consume "/2-1/2"
      for (let i = 0; i < 6; i++) this.advance();
      this.addToken(TokenKind.RESULT);
      return;
    }
    this.addTokenWithLiteral(TokenKind.NUMBER, parseFloat(this.source.slice(this.start, this.current)))
  }

  private string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++;
      this.advance()
    }
    if (this.isAtEnd()) {
      console.error("Non Terminated string at line " + this.line)
      return;
    }
    this.advance();
    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addTokenWithLiteral(TokenKind.STRING, value)
  }

  private identifier() {
    while (this.isAlpha(this.peek())) this.advance()
    this.addToken(TokenKind.IDENT)
  }
  private addTokenWithLiteral(kind: TokenKind, literal: any) {
    const text = this.source.slice(this.start, this.current)
    this.tokens.push(new Token(kind, text, literal, this.line))
  }
  private addToken(kind: TokenKind) {
    this.addTokenWithLiteral(kind, null)
  }
  private match(expected: string /* Should be a single characeter pls */): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] != expected) return false;
    this.current++;
    return true;
  }
  private isDigit(c: string) {
    return '0'.charCodeAt(0) <= c.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0) ? true : false
  }
  private peek() {
    if (this.isAtEnd()) return '\0'
    return this.source.charAt(this.current)
  }
  private isAlpha(expected: string): boolean {
    return ('a'.charCodeAt(0) <= expected.charCodeAt(0) && expected.charCodeAt(0) <= 'z'.charCodeAt(0)) ||
      ('A'.charCodeAt(0) <= expected.charCodeAt(0) && expected.charCodeAt(0) <= 'Z'.charCodeAt(0))
      || expected == "_" || expected == "-"
  }
  private isAlphaNumeric(expected: string) {
    return this.isAlpha(expected) || this.isDigit(expected)
  }
} 
