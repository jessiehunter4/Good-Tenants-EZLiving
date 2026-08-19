import { describe, expect, it } from "vitest";

import {
  assessInventory,
  assessPublishHealth,
  assessSchemaTracking,
  assessSecurityPosture,
  assessSync,
  countByLevel,
  worstLevel,
  type HealthVerdict,
} from "./opsHealth";

const NOW = new Date("2026-08-13T12:00:00Z");

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
}

describe("assessSync", () => {
  it("reports unknown, never zero, when the source is unreachable", () => {
    // The distinction this module exists for: an unread source must not
    // render as a fact.
    const verdict = assessSync(
      { lastRunAt: null, lastError: null, unreachable: true },
      NOW,
    );
    expect(verdict.level).toBe("unknown");
    expect(verdict.message).toContain("Could not reach");
  });

  it("is critical when the last run recorded an error", () => {
    const verdict = assessSync(
      { lastRunAt: hoursAgo(1), lastError: "Feed fetch failed: 502", unreachable: false },
      NOW,
    );
    expect(verdict.level).toBe("critical");
    expect(verdict.message).toContain("502");
  });

  it("warns when no sync has ever run", () => {
    const verdict = assessSync(
      { lastRunAt: null, lastError: null, unreachable: false },
      NOW,
    );
    expect(verdict.level).toBe("warn");
    expect(verdict.message).toContain("has ever run");
  });

  it("is healthy for a recent sync", () => {
    expect(
      assessSync({ lastRunAt: hoursAgo(2), lastError: null, unreachable: false }, NOW)
        .level,
    ).toBe("ok");
  });

  it("warns past the daily window", () => {
    expect(
      assessSync({ lastRunAt: hoursAgo(30), lastError: null, unreachable: false }, NOW)
        .level,
    ).toBe("warn");
  });

  it("escalates once the mirror is meaningfully adrift", () => {
    expect(
      assessSync({ lastRunAt: hoursAgo(80), lastError: null, unreachable: false }, NOW)
        .level,
    ).toBe("critical");
  });

  it("holds at ok right up to the warning boundary", () => {
    expect(
      assessSync({ lastRunAt: hoursAgo(25), lastError: null, unreachable: false }, NOW)
        .level,
    ).toBe("ok");
    expect(
      assessSync({ lastRunAt: hoursAgo(26), lastError: null, unreachable: false }, NOW)
        .level,
    ).toBe("warn");
  });

  it("flags a future timestamp instead of reporting zero hours ago", () => {
    const verdict = assessSync(
      { lastRunAt: "2026-08-14T12:00:00Z", lastError: null, unreachable: false },
      NOW,
    );
    expect(verdict.level).toBe("warn");
    expect(verdict.message).toContain("future");
  });

  it("prefers the error over staleness when both apply", () => {
    const verdict = assessSync(
      { lastRunAt: hoursAgo(200), lastError: "timeout", unreachable: false },
      NOW,
    );
    expect(verdict.message).toContain("timeout");
  });
});

describe("assessPublishHealth", () => {
  it("is healthy once today's rental is out", () => {
    expect(assessPublishHealth(1, 0).level).toBe("ok");
  });

  it("warns, and says how many, when the queue is waiting on a human", () => {
    const verdict = assessPublishHealth(0, 3);
    expect(verdict.level).toBe("warn");
    expect(verdict.message).toContain("3 awaiting");
  });

  it("warns when nothing published and nothing is queued", () => {
    // A legitimate outcome, and the one worth surfacing because it is silent.
    expect(assessPublishHealth(0, 0).level).toBe("warn");
  });

  it("is unknown when the queue could not be read", () => {
    expect(assessPublishHealth(null, null).level).toBe("unknown");
  });
});

describe("assessInventory", () => {
  it("treats an empty mirror as critical", () => {
    expect(assessInventory(0).level).toBe("critical");
  });

  it("warns on a suspiciously thin mirror", () => {
    expect(assessInventory(3).level).toBe("warn");
  });

  it("is healthy with real inventory", () => {
    expect(assessInventory(212).level).toBe("ok");
  });

  it("separates unreadable from empty", () => {
    expect(assessInventory(null).level).toBe("unknown");
    expect(assessInventory(0).level).toBe("critical");
  });
});

describe("assessSchemaTracking", () => {
  it("is critical when no migrations exist", () => {
    // Good Tenants today.
    const verdict = assessSchemaTracking(0);
    expect(verdict.level).toBe("critical");
    expect(verdict.message).toContain("cannot be reviewed");
  });

  it("is healthy once a history exists", () => {
    expect(assessSchemaTracking(76).level).toBe("ok");
  });
});

describe("assessSecurityPosture", () => {
  it("is critical while any critical finding is open", () => {
    expect(assessSecurityPosture(10, 3).level).toBe("critical");
  });

  it("warns for non-critical findings", () => {
    expect(assessSecurityPosture(4, 0).level).toBe("warn");
  });

  it("is healthy at zero", () => {
    expect(assessSecurityPosture(0, 0).level).toBe("ok");
  });
});

describe("worstLevel", () => {
  const v = (level: HealthVerdict["level"]): HealthVerdict => ({ level, message: "" });

  it("returns ok only when everything is ok", () => {
    expect(worstLevel([v("ok"), v("ok")])).toBe("ok");
  });

  it("ranks unknown above ok, because an unread system is not a healthy one", () => {
    expect(worstLevel([v("ok"), v("unknown")])).toBe("unknown");
  });

  it("ranks a confirmed warning above an unknown", () => {
    expect(worstLevel([v("unknown"), v("warn")])).toBe("warn");
  });

  it("ranks critical above everything", () => {
    expect(worstLevel([v("unknown"), v("warn"), v("critical")])).toBe("critical");
  });

  it("returns ok for an empty set", () => {
    expect(worstLevel([])).toBe("ok");
  });
});

describe("countByLevel", () => {
  it("tallies every level, including zeroes", () => {
    const counts = countByLevel([
      { level: "ok", message: "" },
      { level: "ok", message: "" },
      { level: "critical", message: "" },
    ]);
    expect(counts).toEqual({ ok: 2, warn: 0, critical: 1, unknown: 0 });
  });
});
