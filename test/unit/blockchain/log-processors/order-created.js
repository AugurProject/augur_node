const { fix } = require("speedomatic");
const { setupTestDb, seedDb, makeMockAugur } = require("test.database");
const { BigNumber } = require("bignumber.js");
const { processOrderCreatedLog, processOrderCreatedLogRemoval } = require("src/blockchain/log-processors/order-created");

function getState(db, log) {
  return db("orders").where("orderId", log.orderId);
}

const augur = makeMockAugur({
  api: {
    OrdersFinder: {
      getExistingOrders5: () => Promise.resolve(["ORDER_ID"]),
    },
  },
});

function getPendingOrphansState(db, marketId) {
  return db("pending_orphan_checks").where("marketId", marketId);
}


describe("blockchain/log-processors/order-created", () => {
  let db;
  beforeEach(async () => {
    db = await setupTestDb().then(seedDb);
  });

  const log = {
    orderType: "0",
    shareToken: "0x0100000000000000000000000000000000000000",
    price: "7500",
    amount: augur.utils.convertDisplayAmountToOnChainAmount("3", new BigNumber(1), new BigNumber(10000)).toString(),
    sharesEscrowed: "0",
    moneyEscrowed: fix("2.25", "string"),
    creator: "CREATOR_ADDRESS",
    orderId: "ORDER_ID",
    tradeGroupId: "TRADE_GROUP_ID",
    blockNumber: 1400100,
    transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000B00",
    logIndex: 0,
  };
  test("OrderCreated log and removal", async () => {
    await db.transaction(async (trx) => {
      await(await processOrderCreatedLog(augur, log))(trx);
      expect(await getState(trx, log)).toEqual([{
        orderId: "ORDER_ID",
        blockNumber: 1400100,
        transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000B00",
        logIndex: 0,
        marketId: "0x0000000000000000000000000000000000000001",
        outcome: 0,
        shareToken: "0x0100000000000000000000000000000000000000",
        orderType: "buy",
        orderCreator: "CREATOR_ADDRESS",
        orderState: "OPEN",
        fullPrecisionPrice: new BigNumber("0.75", 10),
        fullPrecisionAmount: new BigNumber("3", 10),
        originalFullPrecisionAmount: new BigNumber("3", 10),
        price: new BigNumber("0.75", 10),
        amount: new BigNumber("3", 10),
        originalAmount: new BigNumber("3", 10),
        originalSharesEscrowed: new BigNumber("0", 10),
        originalTokensEscrowed: new BigNumber("2.25", 10),
        tokensEscrowed: new BigNumber("2.25", 10),
        sharesEscrowed: new BigNumber("0", 10),
        tradeGroupId: "TRADE_GROUP_ID",
        orphaned: 0,
      }]);
      expect(await getPendingOrphansState(trx, "0x0000000000000000000000000000000000000001")).toEqual([{
        marketId: "0x0000000000000000000000000000000000000001",
        outcome: 0,
        orderType: "buy",
      }]);
      await(await processOrderCreatedLogRemoval(augur, log))(trx);
      expect(await getState(trx, log)).toEqual([]);
    });
  });

  afterEach(async () => {
    await db.destroy();
  });
});
