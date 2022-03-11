# Podcast Flows API

Backend service for creating and editing podcast flows

## Endpoints

| method | Endpoint                      | Description                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------------ |
| POST   | /auth/register                | Saves users's Spotify Web API's tokens                             |
| GET    | /api/status/                  | Returns "OK" (plain text). Used to verified the service is running |
| GET    | /api/podcast-flows/           | Returns all the flows registered by this user                      |
| POST   | /api/podcast-flows/           | Creates a new flow                                                 |
| GET    | /api/podcast-flows/{id}       | Returns a flow specified by its unique ID                          |
| POST   | /api/podcast-flows/{id}       | Modifies a flow specified by its unique ID                         |
| DELETE | /api/podcast-flows/{id}       | Deletes a flow specified by its unique ID                          |
| PUT    | /api/podcast-flows/{id}/renew | Renew the content of the flow with the shows it is subscribed to   |

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
