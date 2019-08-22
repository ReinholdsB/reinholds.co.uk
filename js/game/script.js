'use strict';

const moneyUpdateTime = 50;
const storageUpdateTime = 5000;
const config = {
    workers: {
        perSecond: 0.5,
        cost: 5
    },
    factories: {
        perSecond: 5,
        cost: 100
    },
    sweatshop: {
        perSecond: 25,
        cost: 500
    }
};

function getMoneyPerSecond() {
    return (this.workers * config.workers.perSecond )
        + (this.factories * config.factories.perSecond )
        + (this.sweatshop * config.sweatshop.perSecond );
}

const calculator = new Vue({
    el: '#calculator',
    data: {
        money: 0,
        workers: 0,
        factories: 0,
        sweatshop: 0
    },
    mounted() {
        if (localStorage.getItem('gameData')) {
            let gameData = JSON.parse(localStorage.getItem('gameData'));
            if (gameData.money) {
                this.money = gameData.money;
            } else {
                this.money = 0;
            }
            if (gameData.workers) {
                this.workers = gameData.workers;
            } else {
                this.workers = 0;
            }
            if (gameData.factories) {
                this.factories = gameData.factories;
            } else {
                this.factories = 0;
            }
            if (gameData.sweatshop) {
                this.sweatshop = gameData.sweatshop;
            } else {
                this.sweatshop = 0;
            }
        }
        setInterval(() => {
            this.updateMoney();
        }, moneyUpdateTime);
        setInterval(() => {
            this.updateStorage();
        }, storageUpdateTime);
    },
    computed: {
        // money: function () {
        //     return this.money;
        // }
    },
    methods: {
        updateMoney() {
            this.money = this.money + (getMoneyPerSecond.call(this) * (moneyUpdateTime / 1000));
        },
        updateStorage() {
            localStorage.setItem('gameData', JSON.stringify({
                money: this.money,
                workers: this.workers,
                factories: this.factories,
                sweatshop: this.sweatshop
            }));
        },
        resetApp() {
            this.money = 0;
            this.workers = 0;
            this.factories = 0;
            this.sweatshop = 0;
        },
        addOneMoney() {
            this.money = this.money + 1;
        },
        addOneWorker() {
            const cost = config.workers.cost + (config.workers.cost/10 * this.workers);
            if (this.money >= config.workers.cost) {
                this.workers = this.workers + 1;
                this.money = this.money - config.workers.cost;
            }
        },
        addOneFactory() {
            const cost = config.factories.cost + (config.factories.cost/10 * this.factories);
            if (this.money >= config.factories.cost) {
                this.factories = this.factories + 1;
                this.money = this.money - config.factories.cost;
            }
        },
        addOneSweatshop() {
            const cost = config.sweatshop.cost + (config.sweatshop.cost/10 * this.sweatshop);
            if (this.money >= cost) {
                this.sweatshop = this.sweatshop + 1;
                this.money = this.money - cost;
            }
        }
    }
});

function roundMoney(x) {
    let s = x.toString();
    let n = s.indexOf('.');
    return s.substring(0, n !== -1 ? n : s.length);
}