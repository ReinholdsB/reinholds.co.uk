'use strict';

const defaultSalary = 25000;

let formData = {
    dayExpense: 0,
    monthExpense: 1000,
    yearExpense: 0,
    year: "1920",
    income: defaultSalary,
    scale: 1,
    options: [
        {text: 'Yearly', value: '1'},
        {text: 'Monthly', value: '12'},
        {text: 'Weekly', value: '52'},
        {text: 'Daily', value: '365'}
    ],
    chartData: [],
    incomeMoneyFlow: [],
    expenseMoneyFlow: [],
    totalMoneyFlow: []
}

const arrayOfYears = [...Array(40).keys()];
const monthArray = [...Array(24).keys()];

function makeChart(ctx2, labels = arrayOfYears.flatMap(i => i + 1)) {
    return new Chart(ctx2, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: [],
                    backgroundColor: ['rgba(42,255,35,0.2)'],
                    borderColor: ['rgb(42,255,35)'],
                    borderWidth: 2
                },
                {
                    label: 'Total',
                    data: [],
                    backgroundColor: ['rgba(57,31,36,0.2)'],
                    borderColor: ['rgb(16,8,10)'],
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: [],
                    backgroundColor: ['rgba(255,58,95, 0.2)'],
                    borderColor: ['rgb(255,58,95)'],
                    borderWidth: 2
                }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {beginAtZero: true},
                    stacks: true
                }]
            },
            elements: {line: {tension: 0.1}}
        }
    });
}

const calculator = new Vue({
    el: '#calculator',
    data: formData,
    mounted() {
        if (localStorage.getItem('income')) {
            this.income = localStorage.getItem('income');
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
            return roundCurrency(this.income / 365);
        },
        weeklyIncome: function () {
            return roundCurrency(this.income / 52);
        },
        monthlyIncome: function () {
            return roundCurrency(this.income / 12);
        }
    },
    methods: {
        //https://blog.tompawlak.org/number-currency-formatting-javascript
        numFormat: function (e) {
            return e.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        },
        resetIncome() {
            localStorage.removeItem('income');
            this.income = defaultSalary
        },
        saveIncome() {
            localStorage.setItem('income', this.income);
        },
        initChart() {
            const ctx = document.getElementById('myChart');
            const ctx2 = document.getElementById('myChart2');
            this.chart = makeChart(ctx, ['January', '-', 'February', '-', 'March', '-', 'April', '-', 'May', '-', 'June', '-', 'July', '-', 'August', '-', 'September', '-', 'October', '-', 'November', '-', 'December', '-'],
            );
            this.chart2 = makeChart(ctx2, arrayOfYears.flatMap(i => i + 1));

        },
        refreshChart() {
            const monthlyExp = this.weeklyExpense * 52 / 12;
            this.totalMoneyFlow = monthArray.flatMap(i => {
                if (i % 2 !== 0) {
                    return (this.totalMoneyFlow[i - 1] || 0) - monthlyExp;
                } else {
                    return (this.totalMoneyFlow[i - 1] || 0) + this.monthlyIncome;
                }
            });
            // console.log(this.temp)
            // this.totalMoneyFlow = [];
            // this.totalMoneyFlow.push(this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[0] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[1] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[2] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[3] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[4] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[5] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[6] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[7] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[8] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[9] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[10] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[11] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[12] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[13] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[14] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[15] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[16] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[17] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[18] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[19] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[20] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[21] + this.monthlyIncome);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[22] - monthlyExp);
            // this.totalMoneyFlow.push(this.totalMoneyFlow[23] + this.monthlyIncome);

            this.incomeMoneyFlow = monthArray.flatMap(i => {
                if (i % 2 !== 0) {
                    return (this.incomeMoneyFlow[i - 1] || 0);
                } else {
                    return (this.incomeMoneyFlow[i - 1] || 0) + this.monthlyIncome;
                }

            });
            this.expenseMoneyFlow = monthArray.flatMap(i => {
                if (i % 2 !== 0) {
                    return (this.expenseMoneyFlow[i - 1] || 0) - monthlyExp;
                } else {
                    return (this.expenseMoneyFlow[i - 1] || 0);
                }
            });

            if (JSON.stringify(this.chartData) !== JSON.stringify(this.totalMoneyFlow)) {
                this.chartData = this.totalMoneyFlow;
                this.chart.data.datasets[0].data = this.incomeMoneyFlow;
                this.chart.data.datasets[1].data = this.chartData;
                this.chart.data.datasets[2].data = this.expenseMoneyFlow;
                this.chart2.data.datasets[0].data = arrayOfYears.flatMap(i => this.income * (i + 1));
                this.chart2.data.datasets[1].data = arrayOfYears.flatMap(i => (this.income - this.yearlyExpense) * (i + 1));
                this.chart2.data.datasets[2].data = arrayOfYears.flatMap(i => -this.yearlyExpense * (i + 1));
                this.chart.update();
                this.chart2.update();
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
