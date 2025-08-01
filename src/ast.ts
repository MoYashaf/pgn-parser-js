import { results } from "./lexer";

export type NodeType =
  | "Program"
  | "Game"
  | "Header"
  | "Move"
  | "MoveNumber"
  | "Result"
  | "Square"
  | "Piece";

export interface ProgramNode {
  type: "Program";
  games: GameNode[];
}

export interface GameNode {
  type: "Game";
  headers: HeaderNode[];
  moves: MoveNode[];
  result: ResultNode | null;
}

export interface HeaderNode {
  type: "Header";
  key: string;
  value: string;
}

export interface MoveNode {
  type: "Move";
  number?: number;      // Move number (optional for black’s response)
  piece?: string;       // "K", "Q", "R", "B", "N" or undefined for pawn
  fromFile?: string;    // disambiguation
  fromRank?: number;
  capture: boolean;
  to: SquareNode;
  promotion?: string;
  check?: boolean;
  checkmate?: boolean;
}

export interface SquareNode {
  type: "Square";
  file: string;
  rank: number;
}

export interface ResultNode {
  type: "Result";
  value: string
}
