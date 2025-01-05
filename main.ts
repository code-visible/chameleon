import { Project } from "./sourcemap";

const res = new Project("hello", ".", "testdata");

res.walk();
res.parseAllFiles();
