# Chore Helper Card for Home Assistant
A custom card for Home Assistant that displays chores managed by the [Chore Helper integration](https://github.com/bmcclure/ha-chore-helper).

This card allows users to see their chores, mark them as complete, and configure the display to suit their needs.

The card is mainly made for personal use, however you are most welcome to use it in your Home Assistant instance. Do not expect me to honor any feature requests or promptly solve bugs.

## Features
Displays overdue chores at the top.

Shows chores for today and configurable future dates.

Allows users to mark chores as complete directly from the card.

## Installation (HACS)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=isabellaalstrom&repository=chore-helper-card&category=plugin)

## Installation (Manual)
1. Download chore-helper-card.js
2. Copy that up to your Home Assistant www directory.
3. Add the following to your Home Assistant configuration.yaml or via the UI:

```yaml
resources:
  - url: /local/chore-helper-card.js
    type: module
```

## Add the Card to Your Dashboard
In your dashboard, add a new manual card with the following configuration.

```yaml
type: custom:chore-helper-card
```

## Configuration Options

|Option|	Type|	Default|	Description|
| -------- | ------- | -------- | ------- |
|title|string|Chores|Add a custom title for your card|
|show_overdue	|boolean	|true	|Show overdue chores at the top of the list.|
|show_today	|boolean	|true	|Show chores that are due today.|
|show_future	|integer	|7|	Number of days into the future to display chores. Set to 0 to hide future chores.|

### Example Configuration
Here’s an example configuration:
```yaml
type: custom:chore-helper-card
show_overdue: true
show_future: 3
```
![image](https://github.com/user-attachments/assets/b17da0ba-47bf-4144-868f-a605b103684e)
