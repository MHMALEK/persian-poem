"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
class HttpClient {
    constructor(baseURL) {
        this.getData = (endpoint, params = {}, headers = {}) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield ((_a = this.client) === null || _a === void 0 ? void 0 : _a.get(endpoint, { params, headers }));
                return response === null || response === void 0 ? void 0 : response.data;
            }
            catch (error) {
                return null;
            }
        });
        this.client = this.create(baseURL);
    }
    create(baseURL) {
        return axios.create({
            baseURL,
            timeout: 5000,
        });
    }
}
exports.default = HttpClient;
