import { Component, Input, ElementRef, HostListener, forwardRef, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { startOfMonth, endOfMonth, addMonths, subMonths, setYear, eachDay, getDate, getMonth, getYear, isToday, isSameDay, isSameMonth, isSameYear, format, getDay, subDays, setDay } from 'date-fns';
import { CommonModule } from '@angular/common';
import { NgSlimScrollModule } from 'ngx-slimscroll';

var counter = 0;
var isNil = function (value) {
    return (typeof value === 'undefined') || (value === null);
};
var NgDatepickerComponent = /** @class */ (function () {
    function NgDatepickerComponent(elementRef) {
        this.elementRef = elementRef;
        this.headless = false;
        this.isOpened = false;
        this.position = 'bottom-right';
        this.positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
        this.onTouchedCallback = function () { };
        this.onChangeCallback = function () { };
        this.scrollOptions = {
            barBackground: '#DFE3E9',
            gridBackground: '#FFFFFF',
            barBorderRadius: '3',
            gridBorderRadius: '3',
            barWidth: '6',
            gridWidth: '6',
            barMargin: '0',
            gridMargin: '0'
        };
    }
    NgDatepickerComponent.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    Object.defineProperty(NgDatepickerComponent.prototype, "value", {
        get: function () {
            return this.innerValue;
        },
        set: function (val) {
            this.innerValue = val;
            this.onChangeCallback(this.innerValue);
        },
        enumerable: true,
        configurable: true
    });
    NgDatepickerComponent.prototype.ngOnInit = function () {
        this.view = 'days';
        this.date = new Date();
        this.setOptions();
        this.initDayNames();
        this.initYears();
        if (this.positions.indexOf(this.position) === -1) {
            throw new TypeError("ng-datepicker: invalid position property value '" + this.position + "' (expected: " + this.positions.join(', ') + ")");
        }
    };
    NgDatepickerComponent.prototype.ngOnChanges = function (changes) {
        if ('options' in changes) {
            this.setOptions();
            this.initDayNames();
            this.init();
            this.initYears();
        }
    };
    Object.defineProperty(NgDatepickerComponent.prototype, "defaultFieldId", {
        get: function () {
            var value = "datepicker-" + counter++;
            Object.defineProperty(this, 'defaultFieldId', { value: value });
            return value;
        },
        enumerable: true,
        configurable: true
    });
    NgDatepickerComponent.prototype.setOptions = function () {
        var today = new Date();
        this.minYear = this.options && this.options.minYear || getYear(today) - 30;
        this.maxYear = this.options && this.options.maxYear || getYear(today) + 30;
        this.displayFormat = this.options && this.options.displayFormat || 'MMM D[,] YYYY';
        this.barTitleFormat = this.options && this.options.barTitleFormat || 'MMMM YYYY';
        this.dayNamesFormat = this.options && this.options.dayNamesFormat || 'ddd';
        this.barTitleIfEmpty = this.options && this.options.barTitleIfEmpty || 'Click to select a date';
        this.firstCalendarDay = this.options && this.options.firstCalendarDay || 0;
        this.locale = this.options && { locale: this.options.locale } || {};
        this.placeholder = this.options && this.options.placeholder || '';
        this.addClass = this.options && this.options.addClass || {};
        this.addStyle = this.options && this.options.addStyle || {};
        this.fieldId = this.options && this.options.fieldId || this.defaultFieldId;
        this.useEmptyBarTitle = this.options && 'useEmptyBarTitle' in this.options ? this.options.useEmptyBarTitle : true;
    };
    NgDatepickerComponent.prototype.nextMonth = function () {
        this.date = addMonths(this.date, 1);
        this.init();
    };
    NgDatepickerComponent.prototype.prevMonth = function () {
        this.date = subMonths(this.date, 1);
        this.init();
    };
    NgDatepickerComponent.prototype.setDate = function (i) {
        this.date = this.days[i].date;
        this.value = this.date;
        this.init();
        this.close();
    };
    NgDatepickerComponent.prototype.setYear = function (i) {
        this.date = setYear(this.date, this.years[i].year);
        this.init();
        this.initYears();
        this.view = 'days';
    };
    NgDatepickerComponent.prototype.isDateSelectable = function (date) {
        if (isNil(this.options)) {
            return true;
        }
        var minDateSet = !isNil(this.options.minDate);
        var maxDateSet = !isNil(this.options.maxDate);
        var timestamp = date.valueOf();
        if (minDateSet && (timestamp < this.options.minDate.valueOf())) {
            return false;
        }
        if (maxDateSet && (timestamp > this.options.maxDate.valueOf())) {
            return false;
        }
        return true;
    };
    NgDatepickerComponent.prototype.init = function () {
        var _this = this;
        var actualDate = this.date || new Date();
        var start = startOfMonth(actualDate);
        var end = endOfMonth(actualDate);
        this.days = eachDay(start, end).map(function (date) {
            return {
                date: date,
                day: getDate(date),
                month: getMonth(date),
                year: getYear(date),
                inThisMonth: true,
                isToday: isToday(date),
                isSelected: isSameDay(date, _this.innerValue) && isSameMonth(date, _this.innerValue) && isSameYear(date, _this.innerValue),
                isSelectable: _this.isDateSelectable(date)
            };
        });
        var tmp = getDay(start) - this.firstCalendarDay;
        var prevDays = tmp < 0 ? 7 - this.firstCalendarDay : tmp;
        for (var i = 1; i <= prevDays; i++) {
            var date = subDays(start, i);
            this.days.unshift({
                date: date,
                day: getDate(date),
                month: getMonth(date),
                year: getYear(date),
                inThisMonth: false,
                isToday: isToday(date),
                isSelected: isSameDay(date, this.innerValue) && isSameMonth(date, this.innerValue) && isSameYear(date, this.innerValue),
                isSelectable: this.isDateSelectable(date)
            });
        }
        if (this.innerValue) {
            this.displayValue = format(this.innerValue, this.displayFormat, this.locale);
            this.barTitle = format(start, this.barTitleFormat, this.locale);
        }
        else {
            this.displayValue = '';
            this.barTitle = this.useEmptyBarTitle ? this.barTitleIfEmpty : format(start, this.barTitleFormat, this.locale);
        }
    };
    NgDatepickerComponent.prototype.initYears = function () {
        var _this = this;
        var range = this.maxYear - this.minYear;
        this.years = Array.from(new Array(range), function (x, i) { return i + _this.minYear; }).map(function (year) {
            return { year: year, isThisYear: year === getYear(_this.date) };
        });
    };
    NgDatepickerComponent.prototype.initDayNames = function () {
        this.dayNames = [];
        var start = this.firstCalendarDay;
        for (var i = start; i <= 6 + start; i++) {
            var date = setDay(new Date(), i);
            this.dayNames.push(format(date, this.dayNamesFormat, this.locale));
        }
    };
    NgDatepickerComponent.prototype.toggleView = function () {
        this.view = this.view === 'days' ? 'years' : 'days';
    };
    NgDatepickerComponent.prototype.toggle = function () {
        this.isOpened = !this.isOpened;
        if (!this.isOpened && this.view === 'years') {
            this.toggleView();
        }
    };
    NgDatepickerComponent.prototype.close = function () {
        this.isOpened = false;
        if (this.view === 'years') {
            this.toggleView();
        }
    };
    NgDatepickerComponent.prototype.reset = function (fireValueChangeEvent) {
        if (fireValueChangeEvent === void 0) { fireValueChangeEvent = false; }
        this.date = null;
        this.innerValue = null;
        this.init();
        if (fireValueChangeEvent && this.onChangeCallback) {
            this.onChangeCallback(this.innerValue);
        }
    };
    NgDatepickerComponent.prototype.writeValue = function (val) {
        if (val) {
            this.date = val;
            this.innerValue = val;
            this.init();
            this.displayValue = format(this.innerValue, this.displayFormat, this.locale);
            this.barTitle = format(startOfMonth(val), this.barTitleFormat, this.locale);
        }
    };
    NgDatepickerComponent.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    NgDatepickerComponent.prototype.registerOnTouched = function (fn) {
        this.onTouchedCallback = fn;
    };
    NgDatepickerComponent.prototype.onBlur = function (e) {
        if (!this.isOpened) {
            return;
        }
        var input = this.elementRef.nativeElement.querySelector('.ngx-datepicker-input');
        if (input == null) {
            return;
        }
        if (e.target === input || input.contains((e.target))) {
            return;
        }
        var container = this.elementRef.nativeElement.querySelector('.ngx-datepicker-calendar-container');
        if (container && container !== e.target && !container.contains((e.target)) && !((e.target)).classList.contains('year-unit')) {
            this.close();
        }
    };
    return NgDatepickerComponent;
}());
NgDatepickerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ng-datepicker',
                template: "<div class=\"ngx-datepicker-container\">\n  <input type=\"text\" *ngIf=\"!headless\" class=\"ngx-datepicker-input\" [(ngModel)]=\"displayValue\" readonly [placeholder]=\"placeholder\"\n    [ngClass]=\"addClass\" [ngStyle]=\"addStyle\" [id]=\"fieldId\" [disabled]=\"disabled\" (click)=\"toggle()\" />\n  <ng-content></ng-content>\n  <div class=\"ngx-datepicker-calendar-container ngx-datepicker-position-{{position}}\" *ngIf=\"isOpened\">\n    <div class=\"topbar-container\">\n      <svg width=\"7px\" height=\"10px\" viewBox=\"0 0 7 10\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n        (click)=\"prevMonth()\">\n        <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n          <g transform=\"translate(-923.000000, -1882.000000)\" fill=\"#CED0DA\">\n            <g transform=\"translate(80.000000, 1361.000000)\">\n              <g transform=\"translate(0.000000, 430.000000)\">\n                <g transform=\"translate(825.000000, 0.000000)\">\n                  <g transform=\"translate(0.000000, 72.000000)\">\n                    <g transform=\"translate(18.000000, 15.000000)\">\n                      <polygon id=\"Back\" points=\"6.015 4 0 9.013 6.015 14.025\"></polygon>\n                    </g>\n                  </g>\n                </g>\n              </g>\n            </g>\n          </g>\n        </g>\n      </svg>\n      <span class=\"topbar-title\" (click)=\"toggleView()\">{{ barTitle }}</span>\n      <svg width=\"7px\" height=\"10px\" viewBox=\"0 0 6 10\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n        (click)=\"nextMonth()\">\n        <g id=\"Source-Sans---UI-Elements-Kit\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n          <g id=\"White-Layout\" transform=\"translate(-1182.000000, -1882.000000)\" fill=\"#CED0DA\">\n            <g id=\"Dropdowns-&amp;-Selector\" transform=\"translate(80.000000, 1361.000000)\">\n              <g id=\"Dropdowns\" transform=\"translate(0.000000, 430.000000)\">\n                <g id=\"Calendar\" transform=\"translate(825.000000, 0.000000)\">\n                  <g transform=\"translate(0.000000, 72.000000)\" id=\"Top-Bar-Nav\">\n                    <g transform=\"translate(18.000000, 15.000000)\">\n                      <polygon id=\"Forward\" transform=\"translate(262.007500, 9.012500) scale(-1, 1) translate(-262.007500, -9.012500) \" points=\"265.015 4 259 9.013 265.015 14.025\"></polygon>\n                    </g>\n                  </g>\n                </g>\n              </g>\n            </g>\n          </g>\n        </g>\n      </svg>\n    </div>\n    <div class=\"main-calendar-container\" *ngIf=\"view === 'days'\">\n      <div class=\"main-calendar-day-names\">\n        <span class=\"day-name-unit\" *ngFor=\"let name of dayNames\">{{ name }}</span>\n      </div>\n      <div class=\"main-calendar-days\">\n        <span class=\"day-unit\" *ngFor=\"let day of days; let i = index;\" [ngClass]=\"{ 'is-prev-month': !day.inThisMonth, 'is-today': day.isToday, 'is-selected': day.isSelected, 'is-disabled': !day.isSelectable }\"\n          (click)=\"day.isSelectable && setDate(i)\">\n          {{ day.day }}\n        </span>\n      </div>\n    </div>\n    <div class=\"main-calendar-container\" *ngIf=\"view === 'years'\">\n      <div class=\"main-calendar-years\" slimScroll [options]=\"scrollOptions\">\n        <span class=\"year-unit\" *ngFor=\"let year of years; let i = index;\" [ngClass]=\"{ 'is-selected': year.isThisYear }\" (click)=\"setYear(i)\">{{ year.year }}</span>\n      </div>\n    </div>\n  </div>\n</div>\n",
                styles: [".ngx-datepicker-position-bottom-left{top:40px;right:0}.ngx-datepicker-position-bottom-right{top:40px;left:0}.ngx-datepicker-position-top-left{bottom:40px;right:0}.ngx-datepicker-position-top-right{bottom:40px;left:0}.ngx-datepicker-container{position:relative}.ngx-datepicker-container .ngx-datepicker-input{padding:5px 10px;font-size:14px;width:200px;outline:0;border:1px solid #dfe3e9}.ngx-datepicker-container .ngx-datepicker-calendar-container{position:absolute;width:300px;background:#fff;-webkit-box-shadow:0 1px 4px 0 rgba(0,0,0,.08);box-shadow:0 1px 4px 0 rgba(0,0,0,.08);border:1px solid #dfe3e9;border-radius:4px}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container{width:100%;height:50px;padding:15px;border-bottom:1px solid #dfe3e9;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container svg{cursor:pointer}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container svg g{fill:#ced0da}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container .topbar-title{color:#3d495c;font-size:14px;font-weight:600;cursor:pointer}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container{width:100%;height:100%;padding:15px 10px 0;font-size:12px;font-weight:500}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-day-names{color:#a4a9b1;width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-day-names .day-name-unit{width:calc(100% / 7);text-transform:uppercase;text-align:center}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years{padding:15px 0;width:100%;display:inline-block;max-height:275px;overflow:hidden}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit{width:calc(100% / 7);height:40px;display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;float:left;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-radius:50%;color:#3d495c}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-prev-month,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-prev-month,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-prev-month,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-prev-month{color:#a4a9b1}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit:hover{background:#a4a9b1;color:#fff}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-selected,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-selected,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-selected,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-selected{background:#1a91eb;color:#fff}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-disabled,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-disabled,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-disabled,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-disabled{cursor:not-allowed;color:#a4a9b1}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-disabled:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-disabled:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-disabled:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-disabled:hover{background:0 0}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years{height:210px;display:block;padding:0}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit{width:calc(100% / 3);border-radius:10px}"],
                providers: [
                    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(function () { return NgDatepickerComponent; }), multi: true }
                ]
            },] },
];
NgDatepickerComponent.ctorParameters = function () { return [
    { type: ElementRef, },
]; };
NgDatepickerComponent.propDecorators = {
    "options": [{ type: Input },],
    "headless": [{ type: Input },],
    "isOpened": [{ type: Input },],
    "position": [{ type: Input },],
    "onBlur": [{ type: HostListener, args: ['document:click', ['$event'],] },],
};
var NgDatepickerModule = /** @class */ (function () {
    function NgDatepickerModule() {
    }
    return NgDatepickerModule;
}());
NgDatepickerModule.decorators = [
    { type: NgModule, args: [{
                declarations: [NgDatepickerComponent],
                imports: [CommonModule, FormsModule, NgSlimScrollModule],
                exports: [NgDatepickerComponent, CommonModule, FormsModule, NgSlimScrollModule]
            },] },
];

export { NgDatepickerModule, NgDatepickerComponent };
//# sourceMappingURL=ng2-datepicker.js.map
