# MongoDB Module

This module provides a wrapper around the MongoDB Node.js driver with connection pooling and utility functions.

## Setup

1. Create a MongoDB database (either locally or using MongoDB Atlas)
2. Add the following environment variables to your `.env.local`:

```bash
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=your-database-name
```

## Usage

The module provides several utility functions for working with MongoDB:

```typescript
import { getDb, getCollection, ping } from "@/modules/mongodb/server/mongodb-utils"

// Get a database instance
const db = await getDb()
// Or with a specific database name
const customDb = await getDb("custom-db-name")

// Get a typed collection
interface User extends Document {
  name: string
  email: string
}
const users = await getCollection<User>("users")

// Check connection
const isConnected = await ping()
```

## Features

- Connection pooling with proper handling for development and production
- Type-safe collection access
- Utility functions for common operations
- Environment-based configuration
- Connection health check

## Best Practices

1. Always use the utility functions instead of creating new connections
2. Use TypeScript interfaces with the `Document` type for collection types
3. Handle potential connection errors in your application code
4. Use environment variables for configuration