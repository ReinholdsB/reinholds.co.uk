'use strict';

let formData = {
    dayRate: 300,
    dayExpense: 10,
    monthExpense: 175,
    yearExpense: 0,
    weeksWorked: 48,
    year: "1920",
    dividends: 0,
    salary: 8632,
    scale: 1,
    options: [
        { text: 'Yearly', value: '1' },
        { text: 'Monthly', value: '12' },
        { text: 'Weekly', value: '52' },
        { text: 'Daily', value: '365' }
    ]
};

let taxValues = {
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
            return calcStudentLoanRepayment(this.salary , 1);
        },
        salaryAfterTax: function () {
            return this.salary - calcIncomeTax(this.salary).totalTax - calcSalaryNI(this.salary);
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