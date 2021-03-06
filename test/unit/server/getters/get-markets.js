const ReportingState = require("src/types").ReportingState;
const { setupTestDb, seedDb } = require("test.database");
const { dispatchJsonRpcRequest } = require("src/server/dispatch-json-rpc-request");
jest.mock("src/blockchain/process-block");

describe("server/getters/get-markets", () => {
  let db;
  beforeEach(async () => {
    db = await setupTestDb().then(seedDb);
  });

  afterEach(async () => {
    await db.destroy();
  });

  const runTest = (t) => {
    test(t.description, async () => {
      if (t.preQuery) await t.preQuery(db);
      t.method = "getMarkets";
      const marketsMatched = await dispatchJsonRpcRequest(db, t, {});
      t.assertions(marketsMatched);
    });
  };
  runTest({
    description: "get markets in universe b",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
    },
    assertions: (marketsMatched) => {
      expect(marketsMatched).toEqual([
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000442",
        "0x0000000000000000000000000000000000000019",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000013",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000018",
        "0x0000000000000000000000000000000000000017",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000211",
        "0x0000000000000000000000000000000000000222",
        "0x00000000000000000000000000000000000000f1",
        "0x0000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000001",
      ]);
    },
  });
  runTest({
    description: "nonexistent universe",
    params: {
      universe: "0x1010101010101010101010101010101010101010",
    },
    assertions: (marketsMatched) => {
      expect(marketsMatched).toEqual([]);
    },
  });
  runTest({
    description: "user has created many markets",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      creator: "0x0000000000000000000000000000000000000b0b",
    },
    assertions: (marketsCreatedByUser) => {
      expect(marketsCreatedByUser).toEqual([
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000442",
        "0x0000000000000000000000000000000000000019",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000013",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000018",
        "0x0000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000211",
        "0x0000000000000000000000000000000000000222",
        "0x00000000000000000000000000000000000000f1",
        "0x0000000000000000000000000000000000000001",
      ]);
    },
  });
  runTest({
    description: "user has created 1 market",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      creator: "0x000000000000000000000000000000000000d00d",
    },
    assertions: (marketsCreatedByUser) => {
      expect(marketsCreatedByUser).toEqual([
        "0x0000000000000000000000000000000000000003",
      ]);
    },
  });
  runTest({
    description: "user has not created any markets",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      creator: "0x0000000000000000000000000000000000000bbb",
    },
    assertions: (marketsCreatedByUser) => {
      expect(marketsCreatedByUser).toEqual([]);
    },
  });
  runTest({
    description: "category with markets in it",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      category: "TEST CATEGORY",
    },
    assertions: (marketsInCategory) => {
      expect(marketsInCategory).toEqual([
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000442",
        "0x0000000000000000000000000000000000000019",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000013",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000018",
        "0x0000000000000000000000000000000000000017",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000211",
        "0x0000000000000000000000000000000000000222",
        "0x00000000000000000000000000000000000000f1",
        "0x0000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000001",
      ]);
    },
  });
  runTest({
    description: "category with markets in it, limit 2",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      category: "TEST CATEGORY",
      limit: 2,
    },
    assertions: (marketsInCategory) => {
      expect(marketsInCategory).toEqual([
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000442",
      ]);
    },
  });
  runTest({
    description: "empty category",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      category: "empty category",
    },
    assertions: (marketsInCategory) => {
      expect(marketsInCategory).toEqual([]);
    },
  });
  runTest({
    description: "get markets upcoming, unknown designated reporter",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.PRE_REPORTING,
      designatedReporter: "0xf0f0f0f0f0f0f0f0b0b0b0b0b0b0b0f0f0f0f0b0",
    },
    assertions: (marketsUpcomingDesignatedReporting) => {
      expect(marketsUpcomingDesignatedReporting).toEqual([]);
    },
  });
  runTest({
    description: "get all markets upcoming designated reporting, sorted ascending by volume",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.PRE_REPORTING,
      sortBy: "volume",
      isSortDescending: false,
    },
    assertions: (marketsUpcomingDesignatedReporting) => {
      expect(marketsUpcomingDesignatedReporting).toEqual([
        "0x0000000000000000000000000000000000000222",
      ]);
    },
  });
  runTest({
    description: "get all markets upcoming designated reporting by b0b",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.PRE_REPORTING,
      designatedReporter: "0x0000000000000000000000000000000000000b0b",
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000222",
      ]);
    },
  });
  runTest({
    description: "get markets awaiting unknown designated reporter",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.DESIGNATED_REPORTING,
      designatedReporter: "0xf0f0f0f0f0f0f0f0b0b0b0b0b0b0b0f0f0f0f0b0",
    },
    assertions: (marketsAwaitingDesignatedReporting) => {
      expect(marketsAwaitingDesignatedReporting).toEqual([]);
    },
  });
  runTest({
    description: "get all markets awaiting designated reporting, sorted ascending by volume",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.DESIGNATED_REPORTING,
      sortBy: "volume",
      isSortDescending: false,
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000003",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000442",
      ]);
    },
  });
  runTest({
    description: "get all markets awaiting designated reporting, sorted ascending by reportingStateUpdatedOn",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.DESIGNATED_REPORTING,
      sortBy: "reportingStateUpdatedOn",
      isSortDescending: true,
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000442",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000001",
      ]);
    },
  });
  runTest({
    description: "get all markets awaiting designated reporting by d00d",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.DESIGNATED_REPORTING,
      designatedReporter: "0x000000000000000000000000000000000000d00d",
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000003",
      ]);
    },
  });
  runTest({
    description: "get markets awaiting unknown designated reporter",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      designatedReporter: "0xf0f0f0f0f0f0f0f0b0b0b0b0b0b0b0f0f0f0f0b0",
    },
    assertions: (marketsAwaitingDesignatedReporting) => {
      expect(marketsAwaitingDesignatedReporting).toEqual([]);
    },
  });
  runTest({
    description: "get all markets awaiting designated reporting, sorted ascending by volume",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.DESIGNATED_REPORTING,
      sortBy: "volume",
      isSortDescending: false,
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000003",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000442",
      ]);
    },
  });
  runTest({
    description: "get all markets awaiting designated reporting by d00d",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      designatedReporter: "0x000000000000000000000000000000000000d00d",
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000003",
      ]);
    },
  });
  runTest({
    description: "get markets upcoming, unknown designated reporter",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      designatedReporter: "0xf0f0f0f0f0f0f0f0b0b0b0b0b0b0b0f0f0f0f0b0",
    },
    assertions: (marketsUpcomingDesignatedReporting) => {
      expect(marketsUpcomingDesignatedReporting).toEqual([]);
    },
  });
  runTest({
    description: "get all markets upcoming designated reporting, sorted ascending by volume",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.PRE_REPORTING,
      sortBy: "volume",
      isSortDescending: false,
    },
    assertions: (marketsUpcomingDesignatedReporting) => {
      expect(marketsUpcomingDesignatedReporting).toEqual([
        "0x0000000000000000000000000000000000000222",
      ]);
    },
  });
  runTest({
    description: "get markets with multiple reporting states",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: [ReportingState.PRE_REPORTING, ReportingState.DESIGNATED_REPORTING],
      sortBy: "volume",
      isSortDescending: false,
    },
    assertions: (marketIds) => {
      expect(marketIds).toEqual([
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000222",
        "0x0000000000000000000000000000000000000002",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000442",
        "0x0000000000000000000000000000000000000015",
      ]);
    },
  });
  runTest({
    description: "get all markets upcoming designated reporting by b0b",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      reportingState: ReportingState.PRE_REPORTING,
      designatedReporter: "0x0000000000000000000000000000000000000b0b",
    },
    assertions: (marketsInfo) => {
      expect(marketsInfo).toEqual([
        "0x0000000000000000000000000000000000000222",
      ]);
    },
  });
  runTest({
    description: "fts search for bob",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      search: "bob",
    },
    assertions: (marketsMatched) => {
      expect(marketsMatched).toEqual([
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000015",
      ]);
    },
  });
  runTest({
    description: "fts search for bob with category",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      search: "bob",
      category: "TEST CATEGORY",
    },
    assertions: (marketsMatched) => {
      expect(marketsMatched).toEqual([
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000015",
      ]);
    },
  });
  runTest({
    description: "search for sue",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      search: "sue",
    },
    assertions: (marketsCreatedByUser) => {
      expect(marketsCreatedByUser).toEqual([
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000018",
        "0x0000000000000000000000000000000000000019",
      ]);
    },
  });
  runTest({
    description: "don't filter for open orders",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      hasOrders: false,
    },
    assertions: (notFilteredMarkets) => {
      expect(notFilteredMarkets).toEqual([
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000442",
        "0x0000000000000000000000000000000000000019",
        "0x0000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000013",
        "0x0000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000018",
        "0x0000000000000000000000000000000000000017",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000211",
        "0x0000000000000000000000000000000000000222",
        "0x00000000000000000000000000000000000000f1",
        "0x0000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000001",
      ]);
    },
  });
  runTest({
    description: "filter for open orders",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      hasOrders: true,
    },
    assertions: (filteredMarkets) => {
      expect(filteredMarkets).toEqual([
        "0x0000000000000000000000000000000000000018",
        "0x0000000000000000000000000000000000000442",
        "0x000000000000000000000000000000000000021c",
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000211",
      ]);
    },
  });
  runTest({
    description: "set a maximum fee",
    params: {
      universe: "0x100000000000000000000000000000000000000b",
      maxFee: 0.11,
    },
    assertions: (marketsWithMaxFee) => {
      expect(marketsWithMaxFee).not.toContain("0x1000000000000000000000000000000000000001"); // .12 combined fee
    },
  });
  runTest({
    description: "set a maximum fee 2",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      maxFee: 0.03,
    },
    assertions: (marketIds) => {
      expect(marketIds).not.toContain("0x0000000000000000000000000000000000000001"); // .04 combined fee
    },
  });
  runTest({
    description: "set a maximum end time #1",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      maxEndTime: 1506573471,
    },
    assertions: (marketIds) => {
      expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
    },
  });
  runTest({
    description: "set a maximum end time #2",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      maxEndTime: 1506573470,
    },
    assertions: (marketIds) => {
      expect(marketIds).not.toContain("0x0000000000000000000000000000000000000001");
    },
  });
  runTest({
    description: "filter for minimum initial stake",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      enableInitialRepFilter: true,
    },
    assertions: (filteredMarkets) => {
      expect(filteredMarkets).toEqual([
        "0x0000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000019",
        "0x0000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000211",
        "0x0000000000000000000000000000000000000222",
        "0x00000000000000000000000000000000000000f1",
        "0x0000000000000000000000000000000000000001",
      ]);
    },
  });
  // runTest({
  //   description: "set a maximum spread percent #1",
  //   preQuery: (db) => db("markets").update({ spreadPercent: "0.1337" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxSpreadPercent: 0.1338,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum spread percent #2",
  //   preQuery: (db) => db("markets").update({ spreadPercent: "0.1337" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxSpreadPercent: 0.1337,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum spread percent #3",
  //   preQuery: (db) => db("markets").update({ spreadPercent: "0.1337" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxSpreadPercent: 0.1336,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).not.toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum spread percent #4 (market defaults to 100% spread)",
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxSpreadPercent: 1,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum spread percent #5 (don't set one)",
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum invalidROI percent #1",
  //   preQuery: (db) => db("markets").update({ invalidROIPercent: "0.1234" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxInvalidROIPercent: 0.1235,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum invalidROI percent #2",
  //   preQuery: (db) => db("markets").update({ invalidROIPercent: "0.1234" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxInvalidROIPercent: 0.1234,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum invalidROI percent #3",
  //   preQuery: (db) => db("markets").update({ invalidROIPercent: "0.1234" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxInvalidROIPercent: 0.1233,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).not.toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum invalidROI percent #4",
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxInvalidROIPercent: 0,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
  // runTest({
  //   description: "set a maximum invalidROI percent #5",
  //   preQuery: (db) => db("markets").update({ invalidROIPercent: "0.1234" }).where({ marketId: "0x0000000000000000000000000000000000000001"}),
  //   params: {
  //     universe: "0x000000000000000000000000000000000000000b",
  //     maxInvalidROIPercent: 0,
  //   },
  //   assertions: (marketIds) => {
  //     expect(marketIds).not.toContain("0x0000000000000000000000000000000000000001");
  //   },
  // });
});
