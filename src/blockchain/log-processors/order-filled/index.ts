import { Augur } from "augur.js";
import * as Knex from "knex";
import { BigNumber } from "bignumber.js";
import { Address, FormattedEventLog, TokensRow, MarketsRow, OrdersRow, ErrorCallback } from "../../../types";
import { calculateFillPrice } from "./calculate-fill-price";
import { calculateNumberOfSharesTraded } from "./calculate-number-of-shares-traded";
import { updateOrdersAndPositions } from "./update-orders-and-positions";
import { updateVolumetrics } from "./update-volumetrics";
import { augurEmitter } from "../../../events";
import { fixedPointToDecimal, onChainSharesToHumanReadableShares, numTicksToTickSize } from "../../../utils/convert-fixed-point-to-decimal";
import { BN_WEI_PER_ETHER } from "../../../constants";

interface TokensRowWithNumTicksAndCategory extends TokensRow {
  category: string;
  minPrice: BigNumber;
  maxPrice: BigNumber;
  numTicks: BigNumber;
}

export function processOrderFilledLog(db: Knex, augur: Augur, log: FormattedEventLog, callback: ErrorCallback): void {
  const shareToken: Address = log.shareToken;
  const blockNumber: number = log.blockNumber;
  const filler: Address = log.filler;
  db.first("marketId", "outcome").from("tokens").where({ contractAddress: shareToken }).asCallback((err: Error|null, tokensRow?: Partial<TokensRow>): void => {
    if (err) return callback(err);
    if (!tokensRow) return callback(new Error("market and outcome not found"));
    const marketId = tokensRow.marketId!;
    const outcome = tokensRow.outcome!;
    db.first("minPrice", "maxPrice", "numTicks", "category").from("markets").where({ marketId }).asCallback((err: Error|null, marketsRow?: Partial<MarketsRow<BigNumber>>): void => {
      if (err) return callback(err);
      if (!marketsRow) return callback(new Error("market min price, max price, category, and/or num ticks not found"));
      const minPrice = marketsRow.minPrice!;
      const maxPrice = marketsRow.maxPrice!;
      const numTicks = marketsRow.numTicks!;
      const category = marketsRow.category!;
      const orderId = log.orderId;
      const tickSize = numTicksToTickSize(numTicks, minPrice, maxPrice);
      db.first("orderCreator", "fullPrecisionPrice", "orderType").from("orders").where({ orderId }).asCallback((err: Error|null, ordersRow?: Partial<OrdersRow<BigNumber>>): void => {
        if (err) return callback(err);
        if (!ordersRow) return callback(new Error("order not found"));
        const orderCreator = ordersRow.orderCreator!;
        const price = ordersRow.fullPrecisionPrice!;
        const orderType = ordersRow.orderType!;
        const numCreatorTokens = fixedPointToDecimal(log.numCreatorTokens, BN_WEI_PER_ETHER);
        const numCreatorShares = onChainSharesToHumanReadableShares(log.numCreatorShares, tickSize);
        const numFillerTokens = fixedPointToDecimal(log.numFillerTokens, BN_WEI_PER_ETHER);
        const numFillerShares = onChainSharesToHumanReadableShares(log.numFillerShares, tickSize);
        const marketCreatorFees = fixedPointToDecimal(log.marketCreatorFees, BN_WEI_PER_ETHER);
        const reporterFees = fixedPointToDecimal(log.reporterFees, BN_WEI_PER_ETHER);
        const amount = calculateNumberOfSharesTraded(numCreatorShares, numCreatorTokens, calculateFillPrice(augur, price, minPrice, maxPrice, orderType));
        const tradeData = {
          marketId,
          outcome,
          orderId,
          creator: orderCreator,
          orderType,
          filler,
          shareToken,
          blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          tradeGroupId: log.tradeGroupId,
          numCreatorTokens,
          numCreatorShares,
          numFillerTokens,
          numFillerShares,
          price,
          amount,
          marketCreatorFees,
          reporterFees,
        };
        augurEmitter.emit("OrderFilled", tradeData);
        db.insert(tradeData).into("trades").asCallback((err: Error|null): void => {
          if (err) return callback(err);
          updateVolumetrics(db, augur, category, marketId, outcome, blockNumber, orderId, orderCreator, tickSize, minPrice, maxPrice, true, (err: Error|null): void => {
            if (err) return callback(err);
            updateOrdersAndPositions(db, augur, marketId, orderId, orderCreator, filler, tickSize, callback);
          });
        });
      });
    });
  });
}

export function processOrderFilledLogRemoval(db: Knex, augur: Augur, log: FormattedEventLog, callback: ErrorCallback): void {
  const shareToken: Address = log.shareToken;
  const blockNumber: number = log.blockNumber;
  db.first("tokens.marketId", "tokens.outcome", "markets.numTicks", "markets.category", "markets.minPrice", "markets.maxPrice").from("tokens").join("markets", "tokens.marketId", "markets.marketId").where("tokens.contractAddress", shareToken).asCallback((err: Error|null, tokensRow?: Partial<TokensRowWithNumTicksAndCategory>): void => {
    if (err) return callback(err);
    if (!tokensRow) return callback(new Error("market and outcome not found"));
    const marketId = tokensRow.marketId!;
    const outcome = tokensRow.outcome!;
    const numTicks = tokensRow.numTicks!;
    const minPrice = tokensRow.minPrice!;
    const maxPrice = tokensRow.maxPrice!;
    const category = tokensRow.category!;
    const orderId = log.orderId;
    db.first("orderCreator").from("orders").where({ orderId }).asCallback((err: Error|null, ordersRow?: Partial<OrdersRow<BigNumber>>): void => {
      if (err) return callback(err);
      if (!ordersRow) return callback(new Error("order not found"));
      const orderCreator = ordersRow.orderCreator!;
      const tickSize = numTicksToTickSize(numTicks, minPrice, maxPrice);
      updateVolumetrics(db, augur, category, marketId, outcome, blockNumber, orderId, orderCreator, tickSize, minPrice, maxPrice, false, (err: Error|null): void => {
        if (err) return callback(err);
        db.from("trades").where({ marketId, outcome, orderId, blockNumber }).del().asCallback((err?: Error|null): void => {
          if (err) return callback(err);
          updateOrdersAndPositions(db, augur, marketId, orderId, orderCreator, log.filler, tickSize, (err?: Error|null) => {
            if (err) return callback(err);
            augurEmitter.emit("OrderFilled", Object.assign({}, log, { creator: orderCreator }));
            return callback(err);
          });
        });
      });
    });
  });
}
