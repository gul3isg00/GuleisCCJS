import { BinOp } from "./types/binOp";
import { Constant } from "./types/constant";
import { UnOp } from "./types/unop";

export type CExpression = UnOp | Constant | BinOp;