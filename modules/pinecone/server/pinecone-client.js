"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pineconeClient = void 0;
var pinecone_1 = require("@pinecone-database/pinecone");
if (!process.env.PINECONE_API_KEY) {
    throw new Error("Missing PINECONE_API_KEY environment variable");
}
exports.pineconeClient = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});
