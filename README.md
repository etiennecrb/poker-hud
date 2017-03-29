# poker-hud

A simple HUD for [Winamax Poker](https://www.winamax.fr/en/) software. 

The app create a database which store all hands available in the selected hand history folder. When a file changes inside the hand history directory, the app parses it, computes some statistics and displays a widget per player around the table.

![Screenshot](./static/hud.png)

## HUD

![Main metrics](./static/main_metrics.png)

The widget shows the player's name, the number of hands for this player and from left to right:
* Voluntary put money in the pot
* PreFlop Raise
* Agression Factor

![Alternative metrics](./static/alt_metrics.png)

Click on the statistics to show alternative metrics:
* Percentage of continuation bet
* Percentage of fold on continuation bet

These metrics are followed by the total number of opportunity to do so.

## Setup and run

``` bash
# install dependencies
npm install
```

``` bash
# run
npm run start
```
## Build for all platforms

``` bash
npm run build
```
