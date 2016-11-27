const readline = require('readline');
const fs = require('fs');
const fp = require('lodash/fp');
const _ = require('lodash');
const path = require('path')

const winamax = require('./parsers/winamax.js');
const af = require('./metrics/af.js');
const cbet = require('./metrics/cbet.js');
const vpip = require('./metrics/vpip.js');

const rl = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, "static/sample_mtt.txt"))
});

winamax.parse(rl, [af, cbet, vpip]).then(function (results) {
    const container = document.getElementById('results');
    // Empty container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    _(results[1].playerBySeat).forEach(function (player) {
        container.appendChild(createPlayerInfo(results[0][player.name], player.name));
    });
});

function createPlayerInfo(metrics, playerName) {
    const container = document.createElement('div');
    container.className = 'player-info';

    const vpip = _.get(metrics, 'vpip', 0);
    const pfr = _.get(metrics, 'pfr', 0);
    const vnpip = _.get(metrics, 'vnpip', 0);
    const af_pre_calls = _.get(metrics, 'af_pre_calls', 0);
    const af_post_calls = _.get(metrics, 'af_post_calls', 0);
    const af_pre_bets = _.get(metrics, 'af_pre_bets', 0);
    const af_post_bets = _.get(metrics, 'af_post_bets', 0);
    const cbet_p = _.get(metrics, 'cbet_p', 0);
    const cbet_n = _.get(metrics, 'cbet_n', 0);
    const cbet_fold_p = _.get(metrics, 'cbet_fold_p', 0);
    const cbet_fold_n = _.get(metrics, 'cbet_fold_n', 0);

    const title = document.createElement('h3');
    title.innerHTML = playerName + ' (' + (vpip + vnpip) + ')';

    const content = document.createElement('p');

    if (vpip + vnpip > 0) {
        content.innerHTML += 'VP$IP: ' + Math.round(100 * vpip / (vpip + vnpip)) + '% <br>';
        content.innerHTML += 'PFR: ' + Math.round(100 * pfr / (vpip + vnpip)) + '% <br>';
        if (af_pre_calls + af_post_calls > 0) {
            content.innerHTML += 'AF: ' + (Math.round(10 * (af_pre_bets + af_post_bets) / (af_pre_calls + af_post_calls)) / 10) + '<br>';
        } else if (af_pre_bets + af_post_bets > 0) {
            content.innerHTML += 'AF: Infinity <br>';
        }
    }
    if (cbet_p + cbet_n > 0) {
        content.innerHTML += 'CBET: ' + Math.round(100 * cbet_p / (cbet_p + cbet_n)) + '% (' + (cbet_p + cbet_n) + ') <br>';
    }
    if (cbet_fold_p + cbet_fold_n > 0) {
        content.innerHTML += 'CBET Fold: ' + Math.round(100 * cbet_fold_p / (cbet_fold_p + cbet_fold_n)) + '% (' + (cbet_fold_p + cbet_fold_n) + ') <br>';
    }

    container.appendChild(title);
    container.appendChild(content);
    return container;
}
