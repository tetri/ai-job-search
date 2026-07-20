import { expect, test } from "bun:test";
import { runCLI, parseJSON } from "./helpers.ts";

test("search returns valid jobs for idwall", async () => {
  const result = await runCLI(["search", "-c", "idwall", "-n", "2"]);
  expect(result.exitCode).toBe(0);
  
  const data = parseJSON<{ results: any[] }>(result);
  expect(data.results.length).toBeGreaterThan(0);
  
  const first = data.results[0];
  expect(first.id).toBeDefined();
  expect(first.title).toBeDefined();
  expect(first.company).toBe("idwall");
  expect(first.url).toContain("inhire.app/vagas");
});

test("detail returns vacancy details", async () => {
  // Let's first search to get a valid ID
  const searchRes = await runCLI(["search", "-c", "idwall", "-n", "1"]);
  const searchData = parseJSON<{ results: any[] }>(searchRes);
  const firstJob = searchData.results[0];
  
  if (firstJob) {
    const detailRes = await runCLI(["detail", firstJob.url]);
    expect(detailRes.exitCode).toBe(0);
    
    const detailData = parseJSON<any>(detailRes);
    expect(detailData.id).toBe(firstJob.id);
    expect(detailData.title).toBe(firstJob.title);
    expect(detailData.description).toBeDefined();
  }
});
