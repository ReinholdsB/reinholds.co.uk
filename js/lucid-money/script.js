'use strict';

const defaultSalary = 25000;

let formData = {
    dayExpense: 0,
    monthExpense: 1000,
    yearExpense: 0,
    year: "1920",
    salary: defaultSalary,
    scale: 1,
    options: [
        {text: 'Yearly', value: '1'},
        {text: 'Monthly', value: '12'},
        {text: 'Weekly', value: '52'},
        {text: 'Daily', value: '365'}
    ],
    chartData: [],
    chartDataTemp: [],
}

const calculator = new Vue({
    el: '#calculator',
    data: formData,
    mounted() {
        if (localStorage.getItem('dayRate')) {
            this.dayRate = localStorage.getItem('dayRate');
        }
        this.initChart()
        setInterval(() => {
            this.refreshChart();
        }, 50);
    },
    computed: {
        yearlyExpense: function () {
            return (this.dayExpense * 365) + (this.monthExpense * 12) + this.yearExpense;
        },
        weeklyExpense: function () {
            return roundCurrency(this.yearlyExpense / 52);
        },
        yearlyIncome: function () {
            return this.weeksWorked * this.dayRate * 5
        },
        perYear: function () {
            return this.yearlyIncome;
        },
        dailyIncome: function () {
            return roundCurrency(this.salary / 365);
        },
        weeklyIncome: function () {
            return roundCurrency(this.salary / 52);
        },
        monthlyIncome: function () {
            return roundCurrency(this.salary / 12);
        }
    },
    methods: {
        //https://blog.tompawlak.org/number-currency-formatting-javascript
        numFormat: function (e) {
            return e.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        },
        resetDayRate() {
            localStorage.removeItem('dayRate');
            this.dayRate = defaultDayRate
        },
        saveDayRate() {
            localStorage.setItem('dayRate', this.dayRate);
        },
        resetSalary() {
            localStorage.removeItem('salary');
            this.salary = defaultSalary
        },
        initChart() {
            const ctx = document.getElementById('myChart');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'],
                    datasets: [
                        {
                            label: 'Income',
                            data: [],
                            backgroundColor: ['rgba(42,255,35,0.2)'
                            ],
                            borderColor: ['rgb(42,255,35)'],
                        },
                        {
                            label: 'Expenses',
                            data: [],
                            backgroundColor: ['rgba(255,58,95, 0.2)'],
                            borderColor: ['rgb(255,58,95)'],
                            borderWidth: 1
                        }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            stacks: true
                        }]
                    },
                    animation: {
                        animate: false
                    }
                }
            });

        },
        refreshChart() {
            this.chartDataTemp = [
                this.monthlyIncome * 1,
                this.monthlyIncome * 2,
                this.monthlyIncome * 3,
                this.monthlyIncome * 4,
                this.monthlyIncome * 5,
                this.monthlyIncome * 6,
                this.monthlyIncome * 7,
                this.monthlyIncome * 8,
                this.monthlyIncome * 9,
                this.monthlyIncome * 10,
                this.monthlyIncome * 11,
                this.monthlyIncome * 12
            ];
            this.chartDataTemp2 = [
                this.weeklyExpense * 52 / 12 * 1,
                this.weeklyExpense * 52 / 12 * 2,
                this.weeklyExpense * 52 / 12 * 3,
                this.weeklyExpense * 52 / 12 * 4,
                this.weeklyExpense * 52 / 12 * 5,
                this.weeklyExpense * 52 / 12 * 6,
                this.weeklyExpense * 52 / 12 * 7,
                this.weeklyExpense * 52 / 12 * 8,
                this.weeklyExpense * 52 / 12 * 9,
                this.weeklyExpense * 52 / 12 * 10,
                this.weeklyExpense * 52 / 12 * 11,
                this.weeklyExpense * 52 / 12 * 12
            ];
            if (JSON.stringify(this.chartData) !== JSON.stringify(this.chartDataTemp)
                || JSON.stringify(this.chartData2) !== JSON.stringify(this.chartDataTemp2)) {
                this.chartData = this.chartDataTemp;
                this.chartData2 = this.chartDataTemp2
                this.chart.data.datasets[0].data = this.chartData
                this.chart.data.datasets[1].data = this.chartData2
                this.chart.update();
            }
        }
    }
});

function roundCurrency(x) {
    return Math.round(x * 100) / 100;
}

// for sync tests
function test(condition, message) {
    try {
        console.assert.apply(console, arguments);
        if (typeof message === 'string' && condition) {
            // console.log('\u2714 ' + message);
        }
    } catch (error) {
        test.exitCode = 1;
        console.error('\u2716 ' + error);
    }
}

// for async tests
test.async = function (fn, timeout) {
    let timer = setTimeout(
        function () {
            test(false, 'timeout ' + fn);
        },
        timeout || test.timeout
    );
    fn(function () {
        clearTimeout(timer);
    });
};

// default timeout
test.timeout = 10000;

// for node env only
try {
    process.on('exit', function () {
        process.exit(test.exitCode || 0);
    });
    module.exports = test;
} catch (browser) {
}
