# Chore Helper Card for Home Assistant
A custom card for Home Assistant that displays chores managed by the [Chore Helper integration](https://github.com/bmcclure/ha-chore-helper).

This card allows users to see their chores, mark them as complete, and configure the display to suit their needs.

The card is mainly made for personal use, however you are most welcome to use it in your Home Assistant instance. Do not expect me to honor any feature requests or promptly solve bugs.

## Features
Displays overdue chores at the top.

Shows chores for today and configurable future dates.

Allows users to mark chores as complete directly from the card.

## Installation
Download the Card
Copy the chore-helper-card.js file to your Home Assistant www directory.

### Add the Resource
1. Add the following to your Home Assistant configuration.yaml or via the UI:

```yaml
resources:
  - url: /local/chore-helper-card.js
    type: module
```

2. Add the Card to Your Dashboard
In your dashboard, add a new manual card with the following configuration.

```yaml
type: custom:chore-helper-card
```

## Configuration Options

|Option|	Type|	Default|	Description|
| -------- | ------- | -------- | ------- |
|show_overdue	|boolean	|true	|Show overdue chores at the top of the list.|
|show_future	|integer	|7|	Number of days into the future to display chores. Set to 0 to hide future chores.|

### Example Configuration
Here’s an example configuration:
```yaml
type: custom:chore-helper-card
show_overdue: true
show_future: 3
```
