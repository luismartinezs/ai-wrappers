#!/bin/bash

# Read password from .env.local
MONGODB_PASSWORD=$(grep MONGODB_PASSWORD .env.local | cut -d '=' -f2)

# Use the password in the connection string
mongosh "mongodb+srv://luismartinezwebdev:$MONGODB_PASSWORD@cluster0.vvdj8.mongodb.net/ai-wrappers" --eval 'db.conversations.drop(); db.messages.drop(); db.memoryagent_conversations.drop(); db.memoryagent_messages.drop(); db["ai-wrappers"].drop();'