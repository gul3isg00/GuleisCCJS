import { Assign } from "./types/assign";
import { BinOp } from "./types/binOp";
import { Constant } from "./types/constant";
import { UnOp } from "./types/unop";
import { Var } from "./types/var";

export type CExpression = Assign | Var | UnOp | Constant | BinOp;