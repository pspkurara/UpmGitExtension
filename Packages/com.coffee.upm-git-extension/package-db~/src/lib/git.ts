import fs from "fs";
import cp from "child_process";
import * as utils from "./utils";

export class Git {
  cwd: string;
  url: string;

  constructor(url: string, cwd: string) {
    this.cwd = cwd;
    this.url = url;
  }

  async exec(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cp.exec(cmd, { cwd: this.cwd, encoding: "utf-8" }, (err, o) => {
        if (err) reject(err);
        else resolve(o);
      });
    });
  }

  async init(): Promise<void> {
    if (fs.existsSync(this.cwd + "/.git")) return;
    utils.mkdir(this.cwd);
    await this.exec("git init");
    await this.exec(`git remote add origin ${this.url}`);
  }

  async fetch(): Promise<string> {
    try {
      await this.exec(
        'git fetch --depth=1 -fq --prune origin "refs/tags/*:refs/tags/*" "+refs/heads/*:refs/remotes/origin/*"'
      );
      return this.getHash();
    } catch {
      return "";
    }
  }

  private async showRefInternal(): Promise<string> {
    try {
      return await this.exec("git show-ref");
    } catch {
      return "";
    }
  }

  async getHash(): Promise<string> {
    return this.showRefInternal();
  }

  async showRef(): Promise<string[]> {
    return (await this.showRefInternal())
      .split(/[\r\n]+/)
      .map(x => x.split(/\s+/)[1] || "")
      .map(x => x.match(/^refs\/(tags\/|remotes\/origin\/)([^/]+)$/))
      .map(x => (x ? x[0] : ""))
      .filter(x => x);
  }

  async checkout(ref: string, files: string): Promise<boolean> {
    try {
      await this.exec(`git checkout -q ${ref} -- ${files}`);
      return true;
    } catch {
      return false;
    }
  }
}
