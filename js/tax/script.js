'use strict';

let formData = {
    dayRate: 300,
    dayExpense: 10,
    monthExpense: 175,
    yearExpense: 0,
    weeksWorked: 48,
    year: "1920",
//    dividends: 10000,
    salary: 8632,
    scale: 1,
    options: [
        {text: 'Yearly', value: '1'},
        {text: 'Monthly', value: '12'},
        {text: 'Weekly', value: '52'},
        {text: 'Daily', value: '365'}
    ],
    chartData: [],
    chartDataTemp: [],
};

const taxValues = {
    vat: 0.2,
    corpTax: 0.19
};

const TAX = {
    year: '2019/20',
    allowance: {
        basic: 12500,
        age_65_74: 12500,
        age_75_over: 12500,
        blind: 2320,
        thresholds: {
            age: 27700,
            taper: 100000
        }
    },
    income: {
        basic: {
            till: 37500,
            rate: 0.20,
        },
        higher: {
            till: 150000,
            rate: 0.40,
        },
        additional: {
            start: 150000,
            till: -1,
            rate: 0.45,
        }
    },
    dividend: {
        allowance: 2000,
        basic: 0.075,
        higher: 0.325,
        additional: 0.381
    },
    natInsurance: {
        pensionAge: 65,
        rate_0: {
            start: 0,
            till: 8632,
            rate: 0,
        },
        rate_12: {
            start: 8632,
            till: 50000,
            rate: 0.12,
        },
        rate_2: {
            start: 50000,
            till: -1,
            rate: 0.02,
        },
        rate_employer: {
            start: 166.00 * 52,
            till: -1,
            rate: 0.138,
        }
    },
    studentLoan: {
        plan_1: {
            threshold: 18330,
            rate: 0.09,
        },
        plan_2: {
            threshold: 25000,
            rate: 0.09,
        }
    }
};

const TAX_1819 = {
    year: '2018/19',
    allowance: {
        basic: 11850,
        age_65_74: 11850,
        age_75_over: 11850,
        blind: 2320,
        thresholds: {
            age: 27700,
            taper: 100000
        }
    },
    income: {
        basic: {
            till: 34500,
            rate: 0.20,
        },
        higher: {
            till: 150000,
            rate: 0.40,
        },
        additional: {
            start: 150000,
            till: -1,
            rate: 0.45,
        }
    },
    dividend: {
        allowance: 2000,
        basic: 0.075,
        higher: 0.325,
        additional: 0.381
    },
    natInsurance: {
        pensionAge: 65,
        rate_0: {
            start: 0,
            till: 162 * 52,
            rate: 0,
        },
        rate_12: {
            start: 162 * 52,
            till: 892 * 52,
            rate: 0.12,
        },
        rate_2: {
            start: 892 * 52,
            till: -1,
            rate: 0.02,
        },
        rate_employer: {
            start: 162.00 * 52,
            till: -1,
            rate: 0.138,
        }
    },
    studentLoan: {
        plan_1: {
            threshold: 18330,
            rate: 0.09,
        },
        plan_2: {
            threshold: 25000,
            rate: 0.09,
        }
    }
};

const calculator = new Vue({
    el: '#calculator',
    data: formData,
    mounted() {
        if (localStorage.getItem('dayRate')) {
            this.dayRate = localStorage.getItem('dayRate');
        }
        setInterval(() => {
            this.refreshChart();
        }, 100);
    },
    computed: {
        yearlyExpense: function () {
            return (this.dayExpense * this.weeksWorked * 5) + (this.monthExpense * 12) + this.yearExpense;
        },
        yearlyIncome: function () {
            return this.weeksWorked * this.dayRate * 5
        },
        perYear: function () {
            return this.yearlyIncome;
        },
        corpTax: function () {
            return (this.yearlyIncome - this.yearlyExpense - this.salary) * (taxValues.corpTax);
        },
        perYearNet: function () {
            return (this.yearlyIncome - this.yearlyExpense - this.salary) * (1 - taxValues.corpTax);
        },
        salaryTax: function () {
            return calcIncomeTax(this.salary).totalTax;
        },
        employerNI: function () {
            return calcEmployerNI(this.salary);
        },
        salaryNI: function () {
            return calcSalaryNI(this.salary);
        },
        studentLoanContribution: function () {
            return calcStudentLoanRepayment(this.salary, 1);
        },
        salaryAfterTax: function () {
            const tax = calcIncomeTax(this.salary).totalTax + calcSalaryNI(this.salary);
            return this.salary - tax;
        },
        dividends: function () {
            return this.perYearNet;
        },
        dividendsTax: function () {
            return calcSalaryAndDividendsTax(this.salary, this.dividends).totalTax;
        },
        dividendsTaxed: function () {
            return this.dividends - this.dividendsTax;
        },
        incomeBeforeTax: function () {
            return this.dividends + this.salary;
        },
        incomeAfterTax: function () {
            return this.dividendsTaxed + this.salaryAfterTax;
        }
    },
    methods: {
        //https://blog.tompawlak.org/number-currency-formatting-javascript
        numFormat: function (e) {
            return e.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        },
        resetDayRate() {
            localStorage.removeItem('dayRate');
        },
        saveDayRate() {
            localStorage.setItem('dayRate', this.dayRate);
        },
        resetSalary() {
            localStorage.removeItem('salary');
        },
        refreshChart() {
            this.chartDataTemp = [
                this.yearlyExpense,
                this.salaryTax,
                this.corpTax,
                this.dividendsTax,
                this.salaryAfterTax,
                this.dividendsTaxed,
            ];
            if (JSON.stringify(this.chartData) !== JSON.stringify(this.chartDataTemp)) {
                let total = this.yearlyExpense + this.salaryTax + this.corpTax + this.dividendsTax +this.salaryAfterTax + this.dividendsTaxed;
                this.chartData = this.chartDataTemp;
                this.chartData2 = [
                    Math.round((this.yearlyExpense + this.salaryTax + this.corpTax + this.dividendsTax)/total * 100) / 100,
                    Math.round((this.salaryAfterTax + this.dividendsTaxed)/total * 100) / 100,
                ];
                const ctx = document.getElementById('myChart');
                if (this.chart != null) {
                    this.chart.destroy();
                }
                this.chart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: [
                            'Expenses',
                            'Tax - Salary',
                            'Tax - Corporation',
                            'Tax - Dividends',
                            'Net - Salary',
                            'Net - Dividends',
                        ],
                        datasets: [{
                            label: 'tax vs salary vs dividends',
                            data: this.chartData,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(235,106,74,0.2)',
                                'rgba(49,192,123,0.2)',
                                'rgba(93,255,76,0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgb(235,76,48)',
                                'rgb(49,192,123)',
                                'rgb(48,255,93)'
                            ],
                            borderWidth: 1
                        },
                            {
                                label: 'tax vs salary vs dividends',
                                data: this.chartData2,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(93,255,76,0.2)'
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgb(48,255,93)'
                                ],
                                borderWidth: 1
                            }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            }
        }
    }
});

function onlyPositive(value) {
    return Math.max(0, value) || 0;
}

function calcIncomeTax(salary, dividends) {
    const income = salary + dividends;
    const tax = TAX.income;
    const allowanceReduction = onlyPositive(income - TAX.allowance.thresholds.taper) / 2;
    const allowance = onlyPositive(TAX.allowance.basic - allowanceReduction);

    const basicRateSalaryAmount = onlyPositive(Math.min(salary, tax.basic.till + allowance) - allowance);
    const higherRateSalaryAmount = onlyPositive(Math.min(salary, tax.higher.till) - (tax.basic.till + allowance));
    const additionalRateSalaryAmount = onlyPositive(salary - tax.higher.till);

    const basicRateTax = tax.basic.rate * basicRateSalaryAmount;
    const higherRateTax = tax.higher.rate * higherRateSalaryAmount;
    const additionalRateTax = tax.additional.rate * additionalRateSalaryAmount;

    return {
        allowance: Math.round(allowance),
        allowanceReduction: Math.round(allowanceReduction),

        basicRateSalaryAmount: Math.round(basicRateSalaryAmount),
        higherRateSalaryAmount: Math.round(higherRateSalaryAmount),
        additionalRateSalaryAmount: Math.round(additionalRateSalaryAmount),

        basicRateTax: Math.round(basicRateTax),
        higherRateTax: Math.round(higherRateTax),
        additionalRateTax: Math.round(additionalRateTax),

        totalTax: roundCurrency(basicRateTax + higherRateTax + additionalRateTax),
        totalNet: roundCurrency(basicRateSalaryAmount + higherRateSalaryAmount + additionalRateSalaryAmount)
    };
}

function calcSalaryAndDividendsTax(salary, dividends) {
    if (dividends <= TAX.dividend.allowance) return {
        basicRateTax: 0,
        higherRateTax: 0,
        additionalTaxRateMath: 0,
        totalTax: 0
    };
    const income = salary + dividends;

    const salaryTaxes = calcIncomeTax(salary, dividends);
    const allowance = salaryTaxes.allowance;

    const tax = TAX.income;

    let additionalRateDividend;
    let higherRateDividend;
    let basicRateDividend;

    const higherTill = tax.higher.till;
    const basicTill = tax.basic.till;

    const basicLimit = basicTill + TAX.allowance.basic;

    //TODO Handle cases where dividend allowance falls between tax brackets
    if (salary > higherTill) {
        basicRateDividend = 0;
        higherRateDividend = 0;
        additionalRateDividend = onlyPositive(dividends - TAX.dividend.allowance);
    } else if (salary > basicLimit) {
        additionalRateDividend = onlyPositive(income - higherTill);
        higherRateDividend = onlyPositive(Math.min(onlyPositive(higherTill - salary), dividends) - TAX.dividend.allowance);
        basicRateDividend = 0;
    } else {
        additionalRateDividend = onlyPositive(income - higherTill);

        const higherAllowance = onlyPositive(TAX.dividend.allowance - basicLimit - salary);

        higherRateDividend = onlyPositive(Math.min(onlyPositive(income - basicLimit - higherAllowance), higherTill - basicLimit));

        basicRateDividend = onlyPositive(Math.min(dividends, basicLimit) - TAX.dividend.allowance - onlyPositive(allowance - salary));
    }

    const additionalTaxRate = TAX.dividend.additional * additionalRateDividend;
    const higherRateTax = TAX.dividend.higher * higherRateDividend;
    const basicRateTax = TAX.dividend.basic * basicRateDividend;

    const result = {
        dividendAllowance: Math.round(TAX.dividend.allowance),
        basicRateTax: Math.round(basicRateTax),
        higherRateTax: Math.round(higherRateTax),
        additionalTaxRateMath: Math.round(additionalTaxRate),
        totalTax: Math.round(basicRateTax + higherRateTax + additionalTaxRate)
    };
    return result;
}

function roundCurrency(x) {
    return Math.round(x * 100) / 100;
}

function calcSalaryNI(salary) {
    const ni = TAX.natInsurance;
    const basicRateNi = onlyPositive(Math.min(salary, ni.rate_12.till) - ni.rate_0.till) * ni.rate_12.rate;
    const higherRateNi = onlyPositive(salary - ni.rate_12.till) * ni.rate_2.rate;

    return roundCurrency(basicRateNi + higherRateNi);
}

function calcEmployerNI(salary) {
    let natInsurance = 0;
    if (salary > TAX.natInsurance.rate_employer.start) {
        natInsurance += (salary - TAX.natInsurance.rate_employer.start) * TAX.natInsurance.rate_employer.rate;
    }
    return roundCurrency(natInsurance);
}

function calcStudentLoanRepayment(salary, plan) {
    let studentLoan = 0;
    if (plan === 1 && salary > TAX.studentLoan.plan_1.threshold) {
        studentLoan += (salary - TAX.studentLoan.plan_1.threshold) * TAX.studentLoan.plan_1.rate;
    } else if (plan === 2 && salary > TAX.studentLoan.plan_2.threshold) {
        studentLoan += (salary - TAX.studentLoan.plan_2.threshold) * TAX.studentLoan.plan_2.rate;
    }
    return roundCurrency(studentLoan);
}

// for (const [k, v] of Object.entries({
//     '01': {salary: 5000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 0, dividendTax: 0},
//     '02': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 0, dividendTax: 0},
//     '03': {salary: 15000, ni: 789.12, incomeTax: 630, employerNi: 907.49, dividend: 0, dividendTax: 0},
//     '04': {salary: 46350, ni: 4551.12, incomeTax: 6900, employerNi: 5233.79, dividend: 0, dividendTax: 0},
//     '05': {salary: 80000, ni: 5227.52, incomeTax: 20360, employerNi: 9877.49, dividend: 0, dividendTax: 0},
//     '06': {salary: 150000, ni: 6627.52, incomeTax: 53100, employerNi: 19537.49, dividend: 0, dividendTax: 0},
//     '07': {salary: 200000, ni: 7627.52, incomeTax: 75600, employerNi: 26437.49, dividend: 0, dividendTax: 0},
//
//     '11': {salary: 1000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 2000, dividendTax: 0},
//     '14': {salary: 46350, ni: 4551.12, incomeTax: 6900, employerNi: 5233.79, dividend: 2000, dividendTax: 0},
//     '17': {salary: 200000, ni: 7627.52, incomeTax: 75600, employerNi: 26437.49, dividend: 2000, dividendTax: 0},
//
//     '21': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 5000, dividendTax: 0},
//     '22': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 10000, dividendTax: 0},
//     '23': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 30000, dividendTax: 1211},
//     '24': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 50000, dividendTax: 3624},
//     '25': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 100000, dividendTax: 19874},
//     '26': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 200000, dividendTax: 59025},
//
//     '31': {salary: 5000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 10000, dividendTax: 86},
//     '32': {salary: 5000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 30000, dividendTax: 1586},
//     '33': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 30000, dividendTax: 1843},
//     '34': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 100000, dividendTax: 23922},
//     '35': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 200000, dividendTax: 61603},
//
//     '36': {salary: 15000, ni: 789.12, incomeTax: 630, employerNi: 907.49, dividend: 50000, dividendTax: 8263},
//     '44': {salary: 46350, ni: 4551.12, incomeTax: 6900, employerNi: 5233.79, dividend: 50000, dividendTax: 15600},
//     '45': {salary: 80000, ni: 5227.52, incomeTax: 20360, employerNi: 9877.49, dividend: 50000, dividendTax: 15600},
//     '46': {salary: 150000, ni: 6627.52, incomeTax: 53100, employerNi: 19537.49, dividend: 50000, dividendTax: 19050},
//     '47': {salary: 200000, ni: 7627.52, incomeTax: 75600, employerNi: 26437.49, dividend: 50000, dividendTax: 38100},
// })) {
//     const actualNi = calcSalaryNI(v.salary);
//     test(actualNi === v.ni,
//         "TEST id=" + k + " - NI formula          - salary=" + v.salary + ", expected=" + v.ni + ", actual=" + actualNi);
//
//     const actualIncomeTax = calcIncomeTax(v.salary, v.dividend);
//     test(actualIncomeTax.totalTax === v.incomeTax,
//         "TEST id=" + k + " - incomeTax formula   - salary=" + v.salary + ", dividend=" + v.dividend + ", expected=" + v.incomeTax + ", actual=" + actualIncomeTax.totalTax +
//         ', FullResponse=' + JSON.stringify(actualIncomeTax));
//
//     const employerNi = calcEmployerNI(v.salary);
//     test(employerNi === v.employerNi,
//         "TEST id=" + k + " - employerNi formula  - salary=" + v.salary + ", expected=" + v.employerNi + ", actual=" + employerNi);
//
//     const dividendTax = calcSalaryAndDividendsTax(v.salary, v.dividend);
//     test(dividendTax.totalTax === v.dividendTax,
//         "TEST id=" + k + " - dividendTax formula - salary=" + v.salary + ", dividend=" + v.dividend + ", expected=" + v.dividendTax + ", actual=" + dividendTax.totalTax +
//         ', FullResponse=' + JSON.stringify(dividendTax));
// }

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
