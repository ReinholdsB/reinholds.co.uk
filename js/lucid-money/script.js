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
    chartDataTemp: [],
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
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['January', '-', 'February', '-', 'March', '-', 'April', '-', 'May', '-', 'June', '-', 'July', '-', 'August', '-', 'September', '-', 'October', '-', 'November', '-', 'December', '-'],
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

        },
        refreshChart() {
            this.chartDataTemp = [];
            const monthlyExp = this.weeklyExpense * 52 / 12;
            this.chartDataTemp.push(this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[0] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[1] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[2] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[3] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[4] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[5] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[6] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[7] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[8] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[9] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[10] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[11] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[12] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[13] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[14] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[15] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[16] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[17] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[18] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[19] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[20] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[21] + this.monthlyIncome);
            this.chartDataTemp.push(this.chartDataTemp[22] - monthlyExp);
            this.chartDataTemp.push(this.chartDataTemp[23] + this.monthlyIncome);

            this.chartDataTemp2 = [];
            this.chartDataTemp2.push(this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[0]);
            this.chartDataTemp2.push(this.chartDataTemp2[1] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[2]);
            this.chartDataTemp2.push(this.chartDataTemp2[3] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[4]);
            this.chartDataTemp2.push(this.chartDataTemp2[5] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[6]);
            this.chartDataTemp2.push(this.chartDataTemp2[7] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[8]);
            this.chartDataTemp2.push(this.chartDataTemp2[9] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[10]);
            this.chartDataTemp2.push(this.chartDataTemp2[11] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[12]);
            this.chartDataTemp2.push(this.chartDataTemp2[13] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[14]);
            this.chartDataTemp2.push(this.chartDataTemp2[15] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[16]);
            this.chartDataTemp2.push(this.chartDataTemp2[17] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[18]);
            this.chartDataTemp2.push(this.chartDataTemp2[19] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[20]);
            this.chartDataTemp2.push(this.chartDataTemp2[21] + this.monthlyIncome);
            this.chartDataTemp2.push(this.chartDataTemp2[22]);
            this.chartDataTemp2.push(this.chartDataTemp2[23] + this.monthlyIncome);

            this.chartDataTemp3 = [];
            this.chartDataTemp3.push(0);
            this.chartDataTemp3.push(this.chartDataTemp3[0] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[1]);
            this.chartDataTemp3.push(this.chartDataTemp3[2] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[3]);
            this.chartDataTemp3.push(this.chartDataTemp3[4] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[5]);
            this.chartDataTemp3.push(this.chartDataTemp3[6] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[7]);
            this.chartDataTemp3.push(this.chartDataTemp3[8] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[9]);
            this.chartDataTemp3.push(this.chartDataTemp3[10] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[11]);
            this.chartDataTemp3.push(this.chartDataTemp3[12] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[13]);
            this.chartDataTemp3.push(this.chartDataTemp3[14] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[15]);
            this.chartDataTemp3.push(this.chartDataTemp3[16] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[17]);
            this.chartDataTemp3.push(this.chartDataTemp3[18] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[19]);
            this.chartDataTemp3.push(this.chartDataTemp3[20] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[21]);
            this.chartDataTemp3.push(this.chartDataTemp3[22] - monthlyExp);
            this.chartDataTemp3.push(this.chartDataTemp3[23]);

            if (JSON.stringify(this.chartData) !== JSON.stringify(this.chartDataTemp)) {
                this.chartData = this.chartDataTemp;
                this.chart.data.datasets[0].data = this.chartDataTemp2
                this.chart.data.datasets[1].data = this.chartData
                this.chart.data.datasets[2].data = this.chartDataTemp3
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
