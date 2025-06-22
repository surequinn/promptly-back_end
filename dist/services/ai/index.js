"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock_1 = require("./mock");
const openai_1 = require("./openai");
const aiServiceProvider = process.env.AI_SERVICE_PROVIDER || "mock";
let aiService;
switch (aiServiceProvider) {
    case "openai":
        aiService = new openai_1.OpenAIService();
        break;
    default:
        aiService = new mock_1.MockAIService();
}
exports.default = aiService;
//# sourceMappingURL=index.js.map