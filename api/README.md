# Podcast Flows API

Backend service for creating and editing podcast flows

## Endpoints

| Endpoint                       | Description                                   |
| ------------------------------ | --------------------------------------------- |
| GET /api/podcast-flows/        | Returns all the flows registered by this user |
| POST /api/podcast-flows/       | Creates a new flow                            |
| GET /api/podcast-flows/{id}    | Returns a flow specified by its unique ID     |
| POST /api/podcast-flows/{id}   | Modifies a flow specified by its unique ID    |
| DELETE /api/podcast-flows/{id} | Deletes a flow specified by its unique ID     |

## Schema

### Flow

| Field name    | Value type        | Description                                                             |
| ------------- | ----------------- | ----------------------------------------------------------------------- |
| id            | string            | Unique Identifier. (This is tight to the playlist ID)                   |
| name          | string            | Flow's name.                                                            |
| showIds       | string[]          | List of IDs from Spotify's URI (e.g. spotify:show:{id})                 |
| userId        | string            | Spotify's username (e.g spotify:user:{userId})                          |
| interval      | TimeInterval      | Frequency for refreshing this flow                                      |
| createdAt     | number            | Creation date of this flow                                              |
| modifiedAt    | number            | Date of the last modification made                                      |
| lastUpdateAt? | (number \| null ) | Refers to the time when the playlist was refreshed with newest episodes |

#### Enums

**TimeInterval**: 'daily', 'weekly', 'monthly'
