import { GameNode, HeaderNode, MoveNode, ProgramNode, ResultNode } from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenKind } from "./tokens";

export default class Parser {
  private tokens: Token[] = []
  private current = 0;

  private peek(): Token {
    return this.tokens[this.current] as Token;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private previous(): Token {
    return this.tokens[this.current - 1] as Token;
  }

  private isAtEnd(): boolean {
    return this.peek().kind === TokenKind.EOF;
  }
  private consume(kind: TokenKind, message: string): Token {
    const token = this.advance();
    if (token.kind != kind) console.error(`${message} at ${token.line}`)
    return token;
  }
  public produceAST(src: string): ProgramNode {
    const lexer = new Lexer(src)
    this.tokens = lexer.scanTokens()
    const program: ProgramNode = {
      type: "Program",
      games: []
    }
    while (!this.isAtEnd()) {
      program.games.push(this.parseGame())
    }
    return program;
  }

  parseGame(): GameNode {
    const game: GameNode = {
      type: "Game",
      headers: [],
      moves: [],
      result: this.parseResult()
    };
    while (this.peek().kind === TokenKind.L_BRACKET) {
      game.headers.push(this.parseHeader());
    }

    // Now parse moves until result or EOF
    while (!this.isAtEnd() && this.peek().kind !== TokenKind.RESULT) {
      game.moves.push(this.parseMove());
    }

    // Optional result
    if (this.peek().kind === TokenKind.RESULT) {
      game.result = this.parseResult();
    }
    return game
  }
  parseHeader(): HeaderNode {
    const header: HeaderNode = {
      type: "Header",
      key: "",
      value: "",
    }
    this.consume(TokenKind.L_BRACKET, "Expected '[' at header start");

    const keyToken = this.consume(TokenKind.IDENT, "Expected header key");
    const valueToken = this.consume(TokenKind.STRING, "Expected header value");

    this.consume(TokenKind.R_BRACKET, "Expected ']' at header end");

    return {
      type: "Header",
      key: keyToken.lexeme,
      value: valueToken.literal as string,
    };
  }
  parseMove(): MoveNode {
    const move: MoveNode = {
      type: "Move",
      capture: false,
      to: { type: "Square", file: "", rank: 0 },
      piece: undefined,
      promotion: undefined,
      check: false,
      checkmate: false,
    };

    // 1. Optional move number
    if (this.peek().kind === TokenKind.NUMBER) {
      move.number = this.advance().literal as number;
    }

    // 2. Optional dot / ellipsis
    if (this.peek().kind === TokenKind.DOT || this.peek().kind === TokenKind.ELLIPSIS) {
      this.advance();
    }

    // 3. Optional piece
    if (this.peek().kind === TokenKind.IDENT) {
      const text = this.peek().lexeme;
      if ("KQRBN".includes(text[0]!)) {
        move.piece = text[0]!;
        this.advance();
      }
    }

    // 4. Optional capture
    if (this.peek().kind === TokenKind.CAPTURE) {
      move.capture = true;
      this.advance();
    }

    // 5. Target square (file + rank)
    if (this.peek().kind === TokenKind.IDENT) {
      move.to.file = this.advance().lexeme;
    } else {
      console.error("Expected target file");
    }

    if (this.peek().kind === TokenKind.NUMBER) {
      move.to.rank = this.advance().literal as number;
    } else {
      console.error("Expected target rank");
      this.advance()
    }

    // 6. Optional promotion
    if (this.peek().kind === TokenKind.PROMOTION) {
      this.advance(); // consume '='
      if (this.peek().kind === TokenKind.IDENT) {
        move.promotion = this.advance().lexeme;
      } else {
        console.error("Expected promotion piece");
        this.advance()
      }
    }

    // 7. Optional check/checkmate
    if (this.peek().kind === TokenKind.PLUS) {
      move.check = true;
      this.advance();
    } else if (this.peek().kind === TokenKind.HASH) {
      move.checkmate = true;
      this.advance();
    }

    return move;
  }
  parseResult(): (ResultNode | null) {
    let result = "";
    if (this.peek().kind == TokenKind.RESULT) result = this.advance().lexeme;
    return {
      type: "Result",
      value: result
    }
  }
}
