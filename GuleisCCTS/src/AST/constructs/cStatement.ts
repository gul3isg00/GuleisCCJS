import { CExpression } from "./cExpression";
import { Break } from "./types/break";
import { Compound } from "./types/compound";
import { Conditional } from "./types/conditional";
import { Continue } from "./types/continue";
import { Do } from "./types/do";
import { Exp } from "./types/exp";
import { For } from "./types/for";
import { ForDeclaration } from "./types/forDeclaration";
import { ReturnStatement } from "./types/returnStatement";
import { While } from "./types/while";

export type CStatement = ReturnStatement | CExpression | Conditional | Compound | For | ForDeclaration | While | Do | Exp | Break | Continue;