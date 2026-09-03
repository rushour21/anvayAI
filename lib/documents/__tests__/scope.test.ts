import { describe, it, expect } from "vitest";
import { chooseScope } from "../scope";

/* The database half of scope resolution needs live Postgres; the precedence
   rules are the part that actually decides which PDF gets answered from, so
   they're kept pure and tested here. */
describe("chooseScope", () => {
  it("prefers attached documents when the message has any", () => {
    expect(chooseScope({ hasAttached: true, hasProject: true })).toBe("attached");
    expect(chooseScope({ hasAttached: true, hasProject: false })).toBe("attached");
  });

  it("falls back to the project when nothing is attached", () => {
    expect(chooseScope({ hasAttached: false, hasProject: true })).toBe("project");
  });

  it("falls back to the conversation with no attachment and no project", () => {
    expect(chooseScope({ hasAttached: false, hasProject: false })).toBe("conversation");
  });

  it("widens rather than searching nothing when 'attached' is asked for but nothing is attached", () => {
    expect(chooseScope({ hasAttached: false, hasProject: true, requested: "attached" })).toBe("project");
    expect(chooseScope({ hasAttached: false, hasProject: false, requested: "attached" })).toBe("conversation");
  });

  it("honours an explicit widen to project, and degrades when there is no project", () => {
    expect(chooseScope({ hasAttached: true, hasProject: true, requested: "project" })).toBe("project");
    expect(chooseScope({ hasAttached: true, hasProject: false, requested: "project" })).toBe("conversation");
  });

  it("honours an explicit narrow to the conversation even inside a project", () => {
    expect(chooseScope({ hasAttached: true, hasProject: true, requested: "conversation" })).toBe("conversation");
  });
});
