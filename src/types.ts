import { BigNumber } from "bignumber.js";
import { Augur, FormattedEventLog } from "augur.js";
import { EventEmitter } from "events";
import { NetworkConfiguration } from "augur-core";
import * as Knex from "knex";
import * as WebSocket from "ws";
import * as https from "https";
import * as http from "http";
import * as t from "io-ts";

// BigNumber Configs
//
BigNumber.config({
  MODULO_MODE: BigNumber.EUCLID,
  ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN,
  EXPONENTIAL_AT: [-1E9, 1E9],
});

export { BlockDetail, FormattedEventLog } from "augur.js";

export enum ReportingState {
  PRE_REPORTING = "PRE_REPORTING",
  DESIGNATED_REPORTING = "DESIGNATED_REPORTING",
  OPEN_REPORTING = "OPEN_REPORTING",
  CROWDSOURCING_DISPUTE = "CROWDSOURCING_DISPUTE",
  AWAITING_NEXT_WINDOW = "AWAITING_NEXT_WINDOW",
  AWAITING_FINALIZATION = "AWAITING_FINALIZATION",
  FINALIZED = "FINALIZED",
  FORKING = "FORKING",
  AWAITING_NO_REPORT_MIGRATION = "AWAITING_NO_REPORT_MIGRATION",
  AWAITING_FORK_MIGRATION = "AWAITING_FORK_MIGRATION",
}

export enum FeeWindowState {
  PAST = "PAST",
  CURRENT = "CURRENT",
  FUTURE = "FUTURE",
}

export enum OrderState {
  ALL = "ALL",
  OPEN = "OPEN",
  FILLED = "FILLED",
  CANCELED = "CANCELED",
}

export enum Action {
  ALL = "ALL",
  BUY = "BUY",
  SELL = "SELL",
  CANCEL = "CANCEL",
  CLAIM_MARKET_CREATOR_FEES = "CLAIM_MARKET_CREATOR_FEES",
  CLAIM_PARTICIPATION_TOKENS = "CLAIM_PARTICIPATION_TOKENS",
  CLAIM_TRADING_PROCEEDS = "CLAIM_TRADING_PROCEEDS",
  CLAIM_WINNING_CROWDSOURCERS = "CLAIM_WINNING_CROWDSOURCERS",
  DISPUTE = "DISPUTE",
  INITIAL_REPORT = "INITIAL_REPORT",
  MARKET_CREATION = "MARKET_CREATION",
  COMPLETE_SETS = "COMPLETE_SETS",
}

export enum Coin {
  ALL = "ALL",
  ETH = "ETH",
  REP = "REP",
}

export interface ConnectOptions extends NetworkConfiguration {
  propagationDelayWaitMillis?: number;
  maxRetries?: number;
  blocksPerChunk?: number;
}

export interface BaseTransactionRow {
  blockNumber: number;
  logIndex: number;
  transactionHash: Bytes32;
}

export interface BaseTransaction extends BaseTransactionRow {
  blockHash: Bytes32;
}

export interface WebSocketConfigs {
  pingMs?: number;
  ws?: {[config: string]: any};
  wss?: {[config: string]: any};
}

export interface EthereumNodeEndpoints {
  [protocol: string]: string;
}
export interface UploadBlockNumbers {
  [networkId: string]: number;
}

export type AbiEncodedData = string;
export type Address = string;
export type Bytes32 = string;
export type Int256 = string;

export interface MarketCreatedLogExtraInfo {
  minPrice?: string;
  maxPrice?: string;
  tags?: Array<string|null>;
  outcomeNames?: Array<string|number|null>;
  description?: string;
  longDescription?: string|null;
  _scalarDenomination?: string|null;
  resolutionSource?: string|null;
  marketType?: string;
}

export interface MarketCreatedOnContractInfo {
  marketCreatorFeeRate: string;
  feeWindow: Address;
  endTime: string;
  designatedReporter: Address;
  designatedReportStake: string;
  numTicks: string;
}

export type ErrorCallback = (err: Error|null) => void;

export type GenericCallback<ResultType> = (err: Error|null, result?: ResultType) => void;

export type AsyncCallback = (err: Error|null, result?: any) => void;

export type LogProcessor = (augur: Augur, log: FormattedEventLog) => Promise<(db: Knex) => Promise<void>>;

export interface EventLogProcessor {
  add: LogProcessor;
  remove: LogProcessor;
  noAutoEmit?: boolean;
}

export interface LogProcessors {
  [contractName: string]: {
    [eventName: string]: EventLogProcessor;
  };
}

export interface JsonRpcRequest {
  id: string|number|null;
  jsonrpc: string;
  method: string;
  params: any;
}

export interface JsonRpcResponse {
  id: string|number|null;
  jsonrpc: string;
  result: any;
}

export const OutcomeParam = t.keyof({
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null,
});

export const SortLimitParams = t.partial({
  sortBy: t.union([t.string, t.null, t.undefined]),
  isSortDescending: t.union([t.boolean, t.null, t.undefined]),
  limit: t.union([t.number, t.null, t.undefined]),
  offset: t.union([t.number, t.null, t.undefined]),
});

export interface SortLimit {
  sortBy: string|null|undefined;
  isSortDescending: boolean|null|undefined;
  limit: number|null|undefined;
  offset: number|null|undefined;
}

export interface GetMarketInfoRequest {
  jsonrpc: string;
  id: string|number;
  method: string;
  params: {
    market: string;
  };
}

export interface GetAccountTransferHistoryRequest {
  jsonrpc: string;
  id: string|number;
  method: string;
  params: {
    account: Address;
    token: Address|null;
  };
}

export interface MarketsContractAddressRow {
  marketId: Address;
}

export interface MarketIdUniverseFeeWindow extends MarketsContractAddressRow {
  universe: Address;
  feeWindow: Address;
}

export interface MarketPricing<BigNumberType> {
  minPrice: BigNumberType;
  maxPrice: BigNumberType;
  numTicks: BigNumberType;
}

export interface MarketsRow<BigNumberType> extends MarketPricing<BigNumberType> {
  marketId: Address;
  transactionHash: Bytes32;
  logIndex: number;
  universe: Address;
  marketType: string;
  marketCreator: Address;
  numOutcomes: number;
  creationBlockNumber: number;
  creationFee: BigNumberType;
  reportingFeeRate: BigNumberType;
  marketCreatorFeeRate: BigNumberType;
  marketCreatorFeesBalance: BigNumberType|null;
  marketCreatorMailbox: Address;
  marketCreatorMailboxOwner: Address;
  initialReportSize: BigNumberType|null;
  validityBondSize: BigNumberType;
  category: string;
  tag1: string|null;
  tag2: string|null;
  volume: BigNumberType;
  openInterest: BigNumberType;
  sharesOutstanding: BigNumberType;
  marketStateId: number;
  feeWindow: Address;
  endTime: number;
  finalizationBlockNumber?: number|null;
  lastTradeBlockNumber?: number|null;
  reportingState?: ReportingState|null;
  shortDescription: string;
  longDescription?: string|null;
  scalarDenomination?: string|null;
  designatedReporter: Address;
  designatedReportStake: BigNumberType;
  resolutionSource?: string|null;
  consensusPayoutId?: number|null;
  isInvalid?: boolean|null;
  forking: number;
  needsMigration: number;
  needsDisavowal: number;
  spreadPercent: BigNumberType;
  invalidROIPercent: BigNumberType;
  bestBidTakerInvalidProfitTokens: BigNumberType;
  bestAskTakerInvalidProfitTokens: BigNumberType;
  initialReporterAddress: string;
}

export interface SearchRow {
  marketId: Address;
  category: string;
  tags: string|null;
  shortDescription: string;
  longDescription?: string|null;
  scalarDenomination?: string|null;
  resolutionSource?: string|null;
}

export interface PositionsRow<BigNumberType> {
  outcome: number;
  marketId?: Address;
  numShares: BigNumberType|null;
  account: Address|null;
  realizedProfitLoss?: BigNumberType;
  unrealizedProfitLoss?: BigNumberType;
  numSharesAdjustedForUserIntention?: BigNumberType;
}

export interface OutcomesRow<BigNumberType> {
  marketId: Address;
  outcome: number;
  price: BigNumberType;
  volume: BigNumberType;
  shareVolume: BigNumberType;
  description: string|null;
  spreadPercent: BigNumberType;
  invalidROIPercent: BigNumberType;
  bestBidTakerInvalidProfitTokens: BigNumberType;
  bestAskTakerInvalidProfitTokens: BigNumberType;
}

export interface TotalInitialREPStakeRow<BigNumberType> {
  marketId: Address;
  totalInitialREPStake: BigNumberType;
  endTime: number;
}

export interface TokensRow {
  contractAddress?: Address;
  symbol: string;
  marketId: Address;
  outcome?: number;
}

export interface CategoriesRow<BigNumberType> {
  category: string;
  nonFinalizedOpenInterest: BigNumberType;
  openInterest: BigNumberType;
  universe: Address;
}

export interface BlocksRow {
  blockNumber: number;
  timestamp: number;
}

export interface TransactionHashesRow {
  blockNumber: number;
  transactionHash: number;
}

export interface DisputeTokensRow<BigNumberType> extends Payout<BigNumberType> {
  disputeToken: Address;
  marketId: Address;
  amountStaked: BigNumberType;
  claimed: BigNumberType;
  winning: BigNumberType|null;
}

export interface DisputeTokensRowWithTokenState<BigNumberType> extends DisputeTokensRow<BigNumberType> {
  ReportingState: ReportingState;
}

export interface PayoutRow<BigNumberType> extends Payout<BigNumberType> {
  payoutId: number;
  tentativeWinning: number;
}

export interface PayoutNumerators<BigNumberType> {
  payout0: BigNumberType;
  payout1: BigNumberType;
  payout2: BigNumberType|null;
  payout3: BigNumberType|null;
  payout4: BigNumberType|null;
  payout5: BigNumberType|null;
  payout6: BigNumberType|null;
  payout7: BigNumberType|null;
}

export interface Payout<BigNumberType> extends PayoutNumerators<BigNumberType> {
  isInvalid: boolean|number;
}

export interface NormalizedPayoutNumerators<BigNumberType> {
  payout: Array<BigNumberType>;
}

export interface NormalizedPayout<BigNumberType> extends NormalizedPayoutNumerators<BigNumberType> {
  isInvalid: boolean|number;
}

export interface UIDisputeTokenInfo<BigNumberType> extends Payout<BigNumberType> {
  disputeToken: Address;
  marketId: Address;
  amountStaked: BigNumberType;
  claimed: boolean;
  winningToken: boolean|null;
  ReportingState: ReportingState;
}

export interface UIDisputeTokens<BigNumberType> {
  [stakeToken: string]: UIDisputeTokenInfo<BigNumberType>;
}

export interface StakeDetails<BigNumberType> extends NormalizedPayout<BigNumberType> {
  stakeCompleted: BigNumberType;
  size?: BigNumberType;
  stakeCurrent?: BigNumberType;
  tentativeWinning: boolean;
}

export interface UIStakeInfo<BigNumberType> {
  marketId: Address;
  disputeRound: number|null;
  stakeCompletedTotal: BigNumberType;
  bondSizeOfNewStake: BigNumberType;
  stakes: Array<StakeDetails<BigNumberType>>;
}

export interface UIFeeWindowCurrent<BigNumberType> {
  endTime: number;
  feeWindow: Address|null;
  feeWindowId: number;
  startTime: number;
  universe: Address;
  totalStake?: BigNumberType;
  feeWindowEthFees?: BigNumberType;
  feeWindowRepStaked?: BigNumberType;
  feeWindowFeeTokens?: BigNumberType;
  feeWindowParticipationTokens?: BigNumberType;
  participantContributions?: BigNumberType;
  participantContributionsCrowdsourcer?: BigNumberType;
  participantContributionsInitialReport?: BigNumberType;
  participantParticipationTokens?: BigNumberType;
  participationTokens?: BigNumberType;
}

export interface UIMarketCreatorFee {
  marketId: Address;
  unclaimedFee: string;
}

export interface UIConsensusInfo {
  outcomeId: number;
  isInvalid: boolean;
}

export interface UIOutcomeInfo<BigNumberType> {
  id: number;
  volume: BigNumberType;
  price: BigNumberType;
  description: string|null;
}

export interface UIMarketInfo<BigNumberType> {
  id: Address;
  universe: Address;
  marketType: string;
  numOutcomes: number;
  minPrice: BigNumberType;
  maxPrice: BigNumberType;
  cumulativeScale: BigNumberType;
  author: Address;
  creationTime: number;
  creationBlock: number;
  creationFee: BigNumberType;
  settlementFee: BigNumberType;
  reportingFeeRate: BigNumberType;
  marketCreatorFeeRate: BigNumberType;
  marketCreatorFeesBalance: BigNumberType|null;
  marketCreatorMailbox: Address;
  marketCreatorMailboxOwner: Address;
  initialReportSize: BigNumberType|null;
  category: string;
  tags: Array<string|null>;
  volume: BigNumberType;
  openInterest: BigNumberType;
  outstandingShares: BigNumberType;
  feeWindow: Address;
  endTime: number;
  finalizationBlockNumber?: number|null;
  finalizationTime?: number|null;
  lastTradeBlockNumber?: number|null;
  lastTradeTime?: number|null;
  reportingState?: ReportingState|null;
  forking: number;
  needsMigration: number;
  description: string;
  details?: string|null;
  scalarDenomination?: string|null;
  designatedReporter: Address;
  designatedReportStake: BigNumberType;
  resolutionSource?: string|null;
  numTicks: BigNumberType;
  tickSize: BigNumberType;
  consensus: NormalizedPayout<BigNumberType>|null;
  outcomes: Array<UIOutcomeInfo<string>>;
  totalInitialREPStake: BigNumberType;
  passesInitialREPFilter: boolean;
  initialReporterAddress: string;
}

export type UIMarketsInfo<BigNumberType> = Array<UIMarketInfo<BigNumberType>|null>;

// OpenInterestAggregation is an aggregation of various types of open interest
// for markets within some particular context. Eg. all markets within a category.
export interface OpenInterestAggregation<BigNumberType> {
  nonFinalizedOpenInterest: BigNumberType; // sum of open interest for non-finalized markets in this aggregation (ie. markets with ReportingState != FINALIZED)
  openInterest: BigNumberType; // sum of open interest for all markets in this aggregation
  liquidityTokens: BigNumberType; // sum of markets_liquidity.liquidityTokens for all markets in this aggregation for a given markets_liquidity.spreadPercent because a market has one liquidityTokens per spreadPercent
}

// TagAggregation is an aggregation of tag statistics/data for a set of
// markets within some particular context, eg. all markets in a category.
export interface TagAggregation<BigNumberType> extends OpenInterestAggregation<BigNumberType> {
  tagName: string;
  numberOfMarketsWithThisTag: number;
}

export interface UICategory<BigNumberType> extends OpenInterestAggregation<BigNumberType> {
  categoryName: string;
  tags: Array<TagAggregation<BigNumberType>>;
}

// Does not extend BaseTransaction since UI is expecting "creationBlockNumber"
export interface UIOrder<BigNumberType> {
  orderId: Bytes32;
  transactionHash: Bytes32;
  logIndex: number;
  shareToken: Address;
  owner: Address;
  creationTime: number;
  creationBlockNumber: number;
  orderState: OrderState;
  price: BigNumberType;
  amount: BigNumberType;
  originalAmount: BigNumberType;
  fullPrecisionPrice: BigNumberType;
  fullPrecisionAmount: BigNumberType;
  originalFullPrecisionAmount: BigNumberType;
  originalTokensEscrowed: BigNumberType;
  originalSharesEscrowed: BigNumberType;
  tokensEscrowed: BigNumberType;
  sharesEscrowed: BigNumberType;
  canceledBlockNumber?: Bytes32;
  canceledTransactionHash?: Bytes32;
  canceledTime?: Bytes32;
}

export interface UIOrders<BigNumberType> {
  [marketId: string]: {
    [outcome: number]: {
      [orderType: string]: {
        [orderId: string]: UIOrder<BigNumberType>;
      };
    };
  };
}

export interface OrdersRow<BigNumberType> extends BaseTransactionRow {
  orderId?: Bytes32;
  marketId: Address;
  outcome: number;
  shareToken: Address;
  orderType: string;
  orderCreator: Address;
  orderState: OrderState;
  price: BigNumberType;
  amount: BigNumberType;
  originalAmount: BigNumberType;
  fullPrecisionPrice: BigNumberType;
  fullPrecisionAmount: BigNumberType;
  originalFullPrecisionAmount: BigNumberType;
  originalTokensEscrowed: BigNumberType;
  originalSharesEscrowed: BigNumberType;
  tokensEscrowed: BigNumberType;
  sharesEscrowed: BigNumberType;
  tradeGroupId: Bytes32|null;
}

export interface OutcomesLiquidityRow<BigNumberType> {
  marketId: Address;
  outcome: number;
  spreadPercent: BigNumberType;
  liquidityTokens: BigNumberType;
}

export interface UITrade {
  transactionHash: string;
  logIndex: number;
  orderId: string;
  type: string;
  price: string;
  amount: string;
  maker: boolean|null;
  selfFilled: boolean;
  marketCreatorFees: string;
  reporterFees: string;
  settlementFees: string;
  marketId: Address;
  outcome: number;
  shareToken: Address;
  timestamp: number;
  tradeGroupId: Bytes32|null;
}

export interface TradesRow<BigNumberType> extends BaseTransactionRow {
  orderId: Bytes32;
  marketId: Address;
  outcome: number;
  shareToken: Address;
  orderType: string;
  creator: Address;
  filler: Address;
  numCreatorTokens: BigNumberType;
  numCreatorShares: BigNumberType;
  numFillerTokens: BigNumberType;
  numFillerShares: BigNumberType;
  price: BigNumberType;
  amount: BigNumberType;
  marketCreatorFees: BigNumberType;
  reporterFees: BigNumberType;
  tradeGroupId: Bytes32|null;
}

export interface CompleteSetsRow<BigNumberType> extends BaseTransactionRow {
  marketId: Address;
  account: Address;
  universe: Address;
  eventName: string;
  numPurchasedOrSold: BigNumberType;
  numCompleteSets: BigNumberType;
}

export interface UICompleteSetsRow<BigNumberType> extends CompleteSetsRow<BigNumberType> {
  timestamp: number;
}

export interface TradingHistoryRow extends TradesRow<BigNumber> {
  timestamp: number;
}

export interface ProceedTradesRow<BigNumberType> {
  logIndex: number;
  blockNumber: number;
  timestamp: number;
  marketId: Address;
  outcome: number;
  price: BigNumberType;
  amount: BigNumberType;
  type: "sell";
  maker: false;
}
export interface TimestampedPriceAmount<BigNumberType> {
  price: BigNumberType;
  amount: BigNumberType;
  timestamp: number;
}

export interface MarketPriceHistory<BigNumberType> {
  [outcome: number]: Array<TimestampedPriceAmount<BigNumberType>>;
}

export interface MarketsRowWithTime extends MarketsRow<BigNumber> {
  creationTime: number;
  finalizationTime?: null|number;
  lastTradeTime?: null|number;
}

export interface JoinedReportsMarketsRow<BigNumberType> extends Payout<BigNumberType> {
  creationBlockNumber: number;
  creationTime: number;
  logIndex: number;
  transactionHash: Bytes32;
  blockHash: Bytes32;
  marketId: Address;
  universe: Address;
  feeWindow: Address;
  crowdsourcerId?: Address;
  initialReporter?: Address;
  marketType: string;
  participantType: string;
  amountStaked: BigNumberType;

}

export interface UIReport<BigNumberType> {
  creationBlockNumber: number;
  creationTime: number;
  logIndex: number;
  transactionHash: Bytes32;
  blockHash: Bytes32;
  marketId: Address;
  feeWindow: Address;
  payoutNumerators: Array<BigNumberType|null>;
  amountStaked: BigNumberType;
  crowdsourcerId: Address;
  isCategorical: boolean;
  isScalar: boolean;
  isInvalid: boolean;
  isSubmitted: boolean;
}

export interface FeeWindowRow {
  feeWindow: Address;
  feeToken: Address;
  feeWindowId: number;
  universe: Address;
  startTime: number;
  state: FeeWindowState;
  endTime: number;
  fees: number|string;
}

export interface InitialReportersRow<BigNumberType> {
  marketId: Address;
  reporter: Address;
  amountStaked: BigNumberType;
  initialReporter: number;
  redeemed: boolean;
  isDesignatedReporter: boolean;
  repBalance: BigNumberType;
}

export interface UnclaimedFeeWindowsRow<BigNumberType> {
  feeWindow: Address;
  startTime: number;
  endTime: number;
  balance: BigNumberType;
  participationTokenStake: BigNumberType;
  feeTokenStake: BigNumberType;
  totalFees: BigNumberType;
}

export interface UnclaimedFeeWindowInfo<BigNumberType> {
  startTime: number;
  endTime: number;
  balance: BigNumberType;
  expectedFees: BigNumberType;
}

export interface UnclaimedFeeWindows<BigNumberType> {
  [feeWindow: string]: UnclaimedFeeWindowInfo<BigNumberType>;
}

export interface UIInitialReporters<BigNumberType> {
  [initialReporter: string]: InitialReportersRow<BigNumberType>;
}

export interface ForkMigrationTotalsRow<BigNumberType> extends Payout<BigNumberType> {
  universe: Address;
  repTotal: BigNumberType;
}

export interface UIForkMigrationTotalsRow<BigNumberType> extends NormalizedPayout<BigNumberType> {
  universe: Address;
  repTotal: BigNumberType;
}

export interface UIForkMigrationTotals<BigNumberType> {
  [universe: string]: UIForkMigrationTotalsRow<BigNumberType>;
}

export interface UniverseInfoRow<BigNumberType> extends Payout<BigNumberType> {
  universe: Address;
  parentUniverse: Address;
  balance: BigNumberType;
  supply: BigNumberType;
  numMarkets: BigNumberType;
}

export interface UIUniverseInfoRow<BigNumberType> extends NormalizedPayout<string> {
  universe: Address;
  parentUniverse: Address;
  balance: BigNumberType;
  supply: BigNumberType;
  numMarkets: BigNumberType;
}

export interface ServersData {
  servers: Array<WebSocket.Server>;
  httpServers: Array<http.Server | https.Server>;
  controlEmitter: EventEmitter;
}

export interface AllOrdersRow<BigNumberType> {
  orderId: Address;
  originalTokensEscrowed: BigNumberType;
  originalSharesEscrowed: BigNumberType;
  tokensEscrowed: BigNumberType;
  sharesEscrowed: BigNumberType;
  marketId: Address;
}

export interface PendingOrphanedOrderData {
  marketId: Address;
  outcome: number;
  orderType: string;
}

export interface AccountTransactionHistoryRow<BigNumberType> {
  action: Action;
  coin: string;
  details: string;
  fee: BigNumberType;
  marketId: string;
  marketDescription: string;
  marketType: string;
  outcome: number;
  outcomeDescription: string;
  payout0: BigNumberType;
  payout1: BigNumberType;
  payout2: BigNumberType;
  payout3: BigNumberType;
  payout4: BigNumberType;
  payout5: BigNumberType;
  payout6: BigNumberType;
  payout7: BigNumberType;
  isInvalid: boolean;
  price: BigNumberType;
  quantity: BigNumberType;
  scalarDenomination: string;
  timestamp: number;
  total: BigNumberType;
  transactionHash: string;
  marketCreatorFees: BigNumberType;
  minPrice: BigNumberType;
  maxPrice: BigNumberType;
  numCreatorShares: BigNumberType;
  numCreatorTokens: BigNumberType;
  numPayoutTokens: BigNumberType;
  numShares: BigNumberType;
  reporterFees: BigNumberType;
}

export interface UIAccountTransactionHistoryRow<BigNumberType> {
  action: Action;
  coin: string;
  details: string;
  fee: BigNumberType;
  marketDescription: string;
  outcome: number;
  outcomeDescription: string;
  price: BigNumberType;
  quantity: BigNumberType;
  timestamp: number;
  total: BigNumberType;
  transactionHash: string;
}
