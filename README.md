# Custom Radio Card

A custom Lovelace card for Home Assistant that allows you to play radio streams on your media players using a simple drag-and-drop interface.

## Features

- **Drag & Drop:** Drag a radio station and drop it onto a media player to start playback immediately.
- **Status Display:** Shows which station is currently linked to a player when it is playing.
- **Player Status:** Visually indicates if a player is unavailable.
- **More Info:** Long-press (or click and hold) a player to open the standard Home Assistant more-info dialog for that entity.

## Installation

1. Download `custom-radio-card.js` and place it in your Home Assistant `config/www` folder.
2. Add the resource to your Dashboard configuration:
   - Go to **Settings** > **Dashboards** > **3 dots (top right)** > **Resources**.
   - Click **Add Resource**.
   - URL: `/local/custom-radio-card.js`
   - Resource Type: `JavaScript Module`.
3. Refresh your browser.

## Configuration

Add the card to your dashboard view via YAML.

### Options

| Name | Type | Requirement | Description |
|---|---|---|---|
| `type` | string | **Required** | Must be `custom:custom-radio-card`. |
| `stations` | list | **Required** | A list of radio station objects. |
| `media_players` | list | **Required** | A list of media player objects to display. |

### Station Object

| Name | Type | Description |
|---|---|---|
| `name` | string | The display name of the station. |
| `url` | string | The stream URL for the radio station. |

### Media Player Object

| Name | Type | Description |
|---|---|---|
| `name` | string | The display name for the player on the card. |
| `entity_id` | string | The Home Assistant entity ID (e.g., `media_player.kitchen`). |

### Example Configuration

```yaml
type: custom:custom-radio-card
stations:
  - name: "Radio 538"
    url: "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3"
  - name: "Sky Radio"
    url: "http://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3"
  - name: "Q-Music"
    url: "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3"
media_players:
  - name: "Living Room"
    entity_id: media_player.living_room_speaker
  - name: "Office"
    entity_id: media_player.office_google_home
```

## Usage

1. The card displays your configured **Stations** at the top and **Players** at the bottom.
2. Click and drag a **Station** box.
3. Drop it onto a **Player** box.
4. The stream will start playing on that device.