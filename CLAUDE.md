# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension for controlling Atomberg smart appliances (primarily fans) through their IoT API. The extension allows users to view, manage, and control their Atomberg devices directly from Raycast.

## Development Commands

```bash
npm run dev          # Start development mode with hot reload
npm run build        # Build the extension for production
npm run lint         # Check code style and potential issues
npm run fix-lint     # Auto-fix linting issues
npm run publish      # Publish to Raycast Store
```

## Architecture Overview

### Core Structure
- **Three main commands**: 
  - `list-atomberg-devices` (device listing/control)
  - `manage-atomberg-credentials` (credential management)
  - `device-commands` (interactive device control with command list and state panel)
- **Service-oriented architecture** with clear separation of concerns
- **Custom React hooks** for state management and API interaction
- **Centralized configuration** through constants and types

### Key Components

**API Service Layer (`src/services/atomberg-api.ts`)**
- `AtombergApiService` class handles all Atomberg API interactions
- Manages JWT token lifecycle (24-hour expiry with 5-minute refresh buffer)
- Implements proper authentication flow using API key + refresh token → access token
- Handles device listing, control commands, device state fetching, and error management

**State Management Hooks**
- `useAtombergDevices` (`src/hooks/useAtombergDevices.ts`): Manages device listing and operations
- `useDeviceState` (`src/hooks/useDeviceState.ts`): Manages individual device state and real-time updates
- Uses `useMemo` to prevent infinite re-rendering of API service instances

**UI Components (`src/components/`)**
- `DeviceItem`: Individual device list item with control actions
- `EmptyStates`: Reusable empty state views for different scenarios

**Utility Layer (`src/utils/device-utils.ts`)**
- Pure functions for data transformation (grouping devices by room)
- Credential validation utilities

### Authentication Flow

1. User configures API key and refresh token in Raycast preferences
2. Extension uses refresh token to obtain 24-hour access token from `/get_access_token`
3. Access token is cached in LocalStorage with expiry tracking
4. All API calls use access token + API key headers
5. Tokens auto-refresh when needed (5-minute buffer before expiry)

### API Integration

**Base URL**: `https://api.developer.atomberg-iot.com/v1`

**Key Endpoints**:
- `GET /get_access_token` - Authentication (requires refresh token + API key)
- `GET /get_list_of_devices` - Device listing
- `GET /get_device_state` - Get real-time device state and status
- `POST /devices/{id}/command` - Device control

**Response Patterns**:
All API responses follow `{ status: "Success", message: {...} }` structure.

### Data Flow

1. **Device Listing**: `useAtombergDevices` → `AtombergApiService.fetchDevices()` → UI components
2. **Device Control**: UI action → `AtombergApiService.controlDevice()` → API call
3. **Device State**: `useDeviceState` → `AtombergApiService.fetchDeviceState()` → List detail panel with metadata
4. **Command Execution**: User selects command → `executeCommand()` → `AtombergApiService.controlDevice()` → Auto-refresh state
5. **Room Grouping**: Raw devices → `groupDevicesByRoom()` → `List.Section` components
6. **Navigation**: Device list → Action.OpenInBrowser → Device commands view with split interface

### Configuration Management

- **Constants** (`src/constants.ts`): API URLs, endpoints, storage keys
- **Types** (`src/types.ts`): TypeScript interfaces for API responses and app state
- **Preferences**: Secure storage of API credentials via Raycast's password-type preferences

### Common Patterns

**Error Handling**: Centralized in service layer with Toast notifications
**Loading States**: Managed through custom hook with proper state transitions  
**Component Structure**: Functional components with proper prop interfaces
**Memory Management**: Careful use of `useMemo` and `useCallback` to prevent unnecessary re-renders

## Important Notes

- API credentials are stored securely using Raycast's preference system (password type)
- Access tokens are cached locally but never committed to version control
- All API calls require both API key (header) and access token (Bearer auth)
- Device rooms are used for UI organization with alphabetical sorting
- Extension supports light/dark theme through proper icon assets
- Device commands view uses Raycast's List with detail panel for split interface
- Left panel shows executable commands, right panel shows real-time device state
- Real-time device state includes power, speed, sleep mode, LED, timers, and timestamps
- Navigation between views uses Raycast's URL scheme with encoded arguments

## Device Commands Interface

The split-panel device commands view provides:

**Left Panel - Command List:**
- **Power Control**: Toggle device on/off
- **Speed Control**: Increase/decrease fan speed by 1 level
- **Feature Toggles**: Oscillation, sleep mode, LED indicators
- **Timer Management**: Set 1h/2h timers or cancel existing timers
- **Interactive Execution**: Click any command to execute immediately

**Right Panel - Live Device State:**
- **Connection status** (online/offline) with color-coded indicators  
- **Power state** and current fan speed level
- **Active features** (sleep mode, LED status)
- **Timer information** (remaining hours and elapsed time)
- **Device metadata** (ID, last update timestamp, brightness, color)
- **Auto-refresh** after command execution with 1-second delay

## Future Enhancements

- **UDP State Reading**: Direct device communication to avoid API rate limits
- **Device Controls**: Interactive controls for speed, oscillation, timers
- **Real-time Updates**: WebSocket or polling for live state changes
- **Device Grouping**: Advanced filtering and organization options