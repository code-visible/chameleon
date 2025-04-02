import { parseArgs } from "node:util";

export interface Config {
    name: string;
    project: string;
    directory: string;
    minify: boolean;
    dumpPath: string;
    excludes: string;
}

export function parseConfig(): Config {
    const { values } = parseArgs({
        args: Bun.argv,
        options: {
            project: {
                type: "string",
                short: "p",
                default: ".",
            },
            directory: {
                type: "string",
                short: "d",
                default: ".",
            },
            minify: {
                type: "string",
                short: "m",
                default: "",
            },
            dump: {
                type: "string",
                short: "r",
                default: "parsed.json",
            },
            excludes: {
                type: "string",
                short: "e",
                default: "",
            },
            types: {
                type: "string",
                short: "t",
                default: "",
            },
            name: {
                type: "string",
                short: "n",
                default: "project",
            },
        },
        strict: false,
        allowPositionals: true,
    });
    const minifyStr = values.minify.toString();
    const minify =
        minifyStr !== "" &&
        minifyStr !== "false" &&
        minifyStr !== "False" &&
        minifyStr !== "0";

    return {
        name: values.name.toString(),
        project: values.project.toString(),
        directory: values.directory.toString(),
        dumpPath: values.dump.toString(),
        minify,
        excludes: values.excludes.toString(),
    };
}
