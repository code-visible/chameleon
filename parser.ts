import { join } from "node:path";
import ts, { SyntaxKind, forEachChild } from "typescript";
import { Callable } from "./call";
import { Abstract } from "./definition";
import { generateRandomString } from "./utils";

const ANONYMOUS_IMPORT_PREFIX = "import";
export type LookupPkgFn = (name: string) => string;

export class Parser {
    dir: string;
    sourceFile: ts.SourceFile;
    imports: Map<string, string>;
    fns: Map<string, Callable>;
    absts: Map<string, Abstract>;
    pkgs: Map<string, string>;
    fn: string;

    constructor(
        dir: string,
        sourceFile: ts.SourceFile,
        pkgs: Map<string, string>,
    ) {
        this.dir = dir;
        this.sourceFile = sourceFile;
        this.imports = new Map();
        this.fns = new Map();
        this.absts = new Map();
        this.fn = "";
        this.pkgs = pkgs;
    }

    parseSource() {
        this.parseNode(this.sourceFile);
    }

    // search global nodes
    parseNode(node: ts.Node) {
        // will the ast types overlap ? don't return to prevent overlap since the cost is low
        if (ts.isImportDeclaration(node)) {
            this.parseImport(node);
        }
        if (ts.isFunctionDeclaration(node)) {
            this.parseFunction(node);
        }
        if (ts.isClassDeclaration(node)) {
            this.parseClass(node);
        }
        if (ts.isVariableDeclaration(node)) {
            this.parseVariable(node);
        }
        if (ts.isVariableStatement(node)) {
            this.parseVariableStatement(node);
        }
        if (ts.isExportDeclaration(node)) {
            this.parseExport(node);
        }
        forEachChild(node, this.parseNode.bind(this));
    }

    normalizeImportPath(p: string): string {
        if (p.startsWith(".")) {
            return join(this.dir, p);
        }
        for (const [alias, pkg] of this.pkgs.entries()) {
            if (alias === p) return pkg;
            // is it safe for different platforms ?
            const alias_ = `${alias}/`;
            if (p.startsWith(alias_)) {
                return join(pkg, p.slice(alias_.length));
            }
        }
        return p;
    }

    parseImport(node: ts.ImportDeclaration) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
        const localPath = this.normalizeImportPath(importPath);
        if (node.importClause) {
            if (node.importClause.name) {
                this.imports.set(node.importClause.name.text, localPath);
            }
            if (
                node.importClause.namedBindings &&
                ts.isNamedImports(node.importClause.namedBindings)
            ) {
                for (const element of node.importClause.namedBindings
                    .elements) {
                    this.imports.set(element.name.text, localPath);
                }
            }
        } else {
            const randomAlias = `${ANONYMOUS_IMPORT_PREFIX}_${generateRandomString()}`;
            this.imports.set(randomAlias, localPath);
        }
    }

    parseExport(node: ts.ExportDeclaration) {
        if (node.moduleSpecifier) {
            const exportPath = (node.moduleSpecifier as ts.StringLiteral).text;
            const localPath = this.normalizeImportPath(exportPath);
            const randomAlias = `${ANONYMOUS_IMPORT_PREFIX}_${generateRandomString()}`;
            this.imports.set(randomAlias, localPath);
        }
    }

    parseFunction(node: ts.FunctionDeclaration) {
        // const params = node.parameters.map((param) => param.name.getText());
        if (node.name) {
            const id = node.name.text;
            this.fns.set(id, new Callable(id, []));
        }
        // TODO: refactor legacy parse impl
        // let start = false;
        // const fn = [];
        // for (const el of node.getChildren(this.sourceFile)) {
        //     if (start) fn.push(el.getText(this.sourceFile));
        //     if (el.kind === SyntaxKind.FunctionKeyword) start = true;
        //     if (el.kind === SyntaxKind.CloseParenToken) break;
        // }
        // if (fn.length > 0) {
        //     const id = fn[0];
        //     const func = new Callable(id);
        //     this.fns.set(id, func);
        //     this.fn = id;
        //     forEachChild(node, this.searchCall.bind(this));
        // }
    }

    searchCall(node: ts.Node) {
        if (node.kind === SyntaxKind.CallExpression) {
            this.parseCall(node);
            return;
        }
        forEachChild(node, this.searchCall.bind(this));
    }

    parseCall(node: ts.Node) {
        // TODO
    }

    // it doesn't work in some cases
    // parseMethod(node: ts.Node) {
    //     const fn = [];
    //     for (const el of node.getChildren(this.sourceFile)) {
    //         fn.push(el.getText(this.sourceFile));
    //         if (el.kind === SyntaxKind.CloseParenToken) {
    //             el.getText(this.sourceFile);
    //             break;
    //         }
    //     }
    //     if (fn.length > 0) {
    //         const id = `${this.abstract}.${fn[0]}`;
    //         const func = new Callable(fn[0], this.abstract);
    //         this.fns.set(id, func);
    //         this.fn = id;
    //         forEachChild(node, this.searchCall.bind(this));
    //     }
    // }

    parseVariable(node: ts.VariableDeclaration) {
        let identifier = "";
        let isArrowFunction = false;
        for (const el of node.getChildren(this.sourceFile)) {
            if (SyntaxKind.Identifier) {
                identifier = el.getText(this.sourceFile);
                continue;
            }
            if (el.kind === SyntaxKind.ArrowFunction) {
                isArrowFunction = true;
                break;
            }
        }
        if (isArrowFunction && identifier) {
            const func = new Callable(identifier, []);
            this.fns.set(identifier, func);
        }
    }

    parseVariableStatement(node: ts.VariableStatement) {
        const requireKeyword = "require";
        node.declarationList.declarations.forEach((decl) => {
            if (
                ts.isVariableDeclaration(decl) &&
                decl.initializer &&
                ts.isCallExpression(decl.initializer) &&
                ts.isIdentifier(decl.initializer.expression) &&
                decl.initializer.expression.text === requireKeyword &&
                decl.initializer.arguments.length === 1 &&
                ts.isStringLiteral(decl.initializer.arguments[0])
            ) {
                const importPath = decl.initializer.arguments[0].text;
                const localPath = this.normalizeImportPath(importPath);
                if (ts.isIdentifier(decl.name)) {
                    this.imports.set(decl.name.text, localPath);
                }
            }
        });
    }

    searchMethod(abst: string, member: ts.ClassElement) {
        if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name)) {
            // TODO: avoid broken parameters
            // const params = member.parameters.map((param) =>
            //     param.name.getText(),
            // );
            if (member.name) {
                const id = member.name.text;
                this.fns.set(id, new Callable(id, [], abst));
            }
        }
    }

    parseClass(node: ts.ClassDeclaration) {
        if (node.name) {
            const id = node.name.text;
            this.absts.set(id, new Abstract(id));

            // parse methods
            node.members.forEach((member) => this.searchMethod(id, member));
        }
    }
}
