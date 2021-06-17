"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var key_did_provider_ed25519_1 = require("key-did-provider-ed25519");
var dids_1 = require("dids");
var key_did_resolver_1 = require("key-did-resolver");
var _3id_did_resolver_1 = require("@ceramicnetwork/3id-did-resolver");
var http_client_1 = require("@ceramicnetwork/http-client");
var stream_caip10_link_1 = require("@ceramicnetwork/stream-caip10-link");
var idx_1 = require("@ceramicstudio/idx");
var json2csv_1 = require("json2csv");
var graphqlRequest = require("graphql-request");
require("dotenv").config();
// fetch all the guilds
// then process each guild one by one
// TODO: Move to a separate package
var BATCH_SIZE = 100;
var SUBGRAPH_URL = process.env.SUBGRAPH_URL;
var NETWORK = process.env.NETWORK;
// These should be read from a local file
var lastGuildID = "";
var lastContributorID = "";
var DATE = Date.now().toString().substr(0, 10);
var fetchGuilds = function () { return __awaiter(void 0, void 0, void 0, function () {
    var fetchGuildQuery, resp, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetchGuildQuery = graphqlRequest.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      query getGuildByOwner($lastID: String) {\n\t\t\t\tguilds(first: ", " where: { id_gt: $lastID, active: true }) {\n          id\n      }\n\t\t}\n    "], ["\n      query getGuildByOwner($lastID: String) {\n\t\t\t\tguilds(first: ", " where: { id_gt: $lastID, active: true }) {\n          id\n      }\n\t\t}\n    "])), BATCH_SIZE);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, graphqlRequest.request(SUBGRAPH_URL, fetchGuildQuery, {
                        lastID: lastGuildID
                    })];
            case 2:
                resp = _a.sent();
                if (resp && resp.guilds && resp.guilds.length > 0) {
                    return [2 /*return*/, resp.guilds];
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.error("Failed to fetch Guilds: " + err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, []];
        }
    });
}); };
var fetchContributors = function (guild) { return __awaiter(void 0, void 0, void 0, function () {
    var fetchContributors, resp, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetchContributors = graphqlRequest.gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n\t    query getContributors($lastID: String, $date: String, $guild: String) {\n\t\t\t\tguildSubscriptions(first: ", ", where: { id_gt: $lastID, expires_gte: $date, guild: $guild }) {\n\t\t\t\t\tid,\n          owner\n      }\n\t\t}\n\t"], ["\n\t    query getContributors($lastID: String, $date: String, $guild: String) {\n\t\t\t\tguildSubscriptions(first: ", ", where: { id_gt: $lastID, expires_gte: $date, guild: $guild }) {\n\t\t\t\t\tid,\n          owner\n      }\n\t\t}\n\t"])), BATCH_SIZE);
                console.log(guild);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, graphqlRequest.request(SUBGRAPH_URL, fetchContributors, {
                        lastID: lastContributorID,
                        date: DATE,
                        guild: guild
                    })];
            case 2:
                resp = _a.sent();
                if (resp && resp.guildSubscriptions && resp.guildSubscriptions.length > 0) {
                    return [2 /*return*/, resp.guildSubscriptions];
                }
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.error("Failed to fetch guild subscriptions: " + err_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, []];
        }
    });
}); };
var setupCeramic = function () { return __awaiter(void 0, void 0, void 0, function () {
    var ceramic, resolver, seed, provider, did;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ceramic = new http_client_1["default"]("https://ceramic-clay.3boxlabs.com");
                console.log(ceramic);
                resolver = __assign(__assign({}, key_did_resolver_1["default"].getResolver()), _3id_did_resolver_1["default"].getResolver(ceramic));
                seed = process.env.NODE_WALLET_SEED.split(",");
                provider = new key_did_provider_ed25519_1.Ed25519Provider(new Uint8Array(seed.map(Number)));
                did = new dids_1.DID({ resolver: resolver });
                console.log("WALLET DID");
                console.log(did);
                ceramic.setDID(did);
                ceramic.did.setProvider(provider);
                return [4 /*yield*/, ceramic.did.authenticate()];
            case 1:
                _a.sent();
                console.log(did.id);
                return [2 /*return*/, ceramic];
        }
    });
}); };
// Convert id to did
var ethAddressToDID = function (address, ceramic) { return __awaiter(void 0, void 0, void 0, function () {
    var link;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(address);
                return [4 /*yield*/, stream_caip10_link_1.Caip10Link.fromAccount(ceramic, address + '@eip155:1')];
            case 1:
                link = _a.sent();
                console.log(link);
                // console.log(link.did)
                // console.log(link.did._id)
                return [2 /*return*/, link.did];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var ceramic, aliases, idx, guilds, contributors, _i, guilds_1, guild, activeContributors, _a, activeContributors_1, contributor, did, profile, csv, record, merged;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, setupCeramic()];
            case 1:
                ceramic = _c.sent();
                aliases = {
                    contributorProfile: "kjzl6cwe1jw147hrqhk7ho3awg5cf3l4x83y2e7l2thcemakdxv5eti8bwhklui",
                    contributorCSV: "kjzl6cwe1jw1475xzl8f0zydr6dinz0akseglx7hja6a13na2l29hh65knps18b",
                    guildCSVMapping: "kjzl6cwe1jw148kqr4ie3icw225t9d8dvupd6rtl0h8ringvw7evmjr5mgf626t"
                };
                idx = new idx_1.IDX({ ceramic: ceramic, aliases: aliases });
                return [4 /*yield*/, fetchGuilds()];
            case 2:
                guilds = _c.sent();
                contributors = [];
                _i = 0, guilds_1 = guilds;
                _c.label = 3;
            case 3:
                if (!(_i < guilds_1.length)) return [3 /*break*/, 15];
                guild = guilds_1[_i];
                contributors = [];
                return [4 /*yield*/, fetchContributors(guild.id)];
            case 4:
                activeContributors = _c.sent();
                _a = 0, activeContributors_1 = activeContributors;
                _c.label = 5;
            case 5:
                if (!(_a < activeContributors_1.length)) return [3 /*break*/, 9];
                contributor = activeContributors_1[_a];
                console.log("Fetch profile from Ceramic");
                console.log(contributor);
                return [4 /*yield*/, ethAddressToDID(contributor.owner, ceramic)];
            case 6:
                did = _c.sent();
                console.log(did);
                return [4 /*yield*/, idx.get("contributorProfile", 'did:3:kjzl6cwe1jw146kdpi7tdxw3tl7i9dj7sfyzwbsmo62xij83sf870aln9qecfym')];
            case 7:
                profile = _c.sent();
                console.log(profile);
                // Add and construnct CSV
                contributors.push({ "name": profile.name, "email": profile.email, "address": profile.address });
                _c.label = 8;
            case 8:
                _a++;
                return [3 /*break*/, 5];
            case 9:
                // create CSV and store
                console.log(contributors);
                if (!(contributors.length > 0)) return [3 /*break*/, 14];
                csv = json2csv_1.parse(contributors);
                console.log(csv);
                return [4 /*yield*/, idx.set("contributorCSV", { "csv": csv })];
            case 10:
                record = _c.sent();
                return [4 /*yield*/, ceramic.pin.add(record)];
            case 11:
                _c.sent();
                console.log("Record");
                console.log(record.cid.toString());
                return [4 /*yield*/, idx.merge("guildCSVMapping", (_b = {}, _b[guild.id] = record.cid.toString(), _b))];
            case 12:
                merged = _c.sent();
                return [4 /*yield*/, ceramic.pin.add(merged)];
            case 13:
                _c.sent();
                console.log(merged);
                _c.label = 14;
            case 14:
                _i++;
                return [3 /*break*/, 3];
            case 15: return [2 /*return*/];
        }
    });
}); };
main();
var templateObject_1, templateObject_2;
