import { Component, Input, ElementRef, HostListener, forwardRef, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { startOfMonth, endOfMonth, addMonths, subMonths, setYear, eachDay, getDate, getMonth, getYear, isToday, isSameDay, isSameMonth, isSameYear, format, getDay, subDays, setDay } from 'date-fns';
import { CommonModule } from '@angular/common';
import { NgSlimScrollModule } from 'ngx-slimscroll';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */

// Counter for calculating the auto-incrementing field ID
let counter = 0;
/**
 * Internal library helper that helps to check if value is empty
 * @param value
 */
const isNil = (value) => {
    return (typeof value === 'undefined') || (value === null);
};
class NgDatepickerComponent {
    /**
     * @param {?} elementRef
     */
    constructor(elementRef) {
        this.elementRef = elementRef;
        /**
         * Disable datepicker's input
         */
        this.headless = false;
        /**
         * Set datepicker's visibility state
         */
        this.isOpened = false;
        /**
         * Datepicker dropdown position
         */
        this.position = 'bottom-right';
        this.positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
        this.onTouchedCallback = () => { };
        this.onChangeCallback = () => { };
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
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /**
     * @return {?}
     */
    get value() {
        return this.innerValue;
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set value(val) {
        this.innerValue = val;
        this.onChangeCallback(this.innerValue);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.view = 'days';
        this.date = new Date();
        this.setOptions();
        this.initDayNames();
        this.initYears();
        // Check if 'position' property is correct
        if (this.positions.indexOf(this.position) === -1) {
            throw new TypeError(`ng-datepicker: invalid position property value '${this.position}' (expected: ${this.positions.join(', ')})`);
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if ('options' in changes) {
            this.setOptions();
            this.initDayNames();
            this.init();
            this.initYears();
        }
    }
    /**
     * @return {?}
     */
    get defaultFieldId() {
        // Only evaluate and increment if required
        const /** @type {?} */ value = `datepicker-${counter++}`;
        Object.defineProperty(this, 'defaultFieldId', { value });
        return value;
    }
    /**
     * @return {?}
     */
    setOptions() {
        const /** @type {?} */ today = new Date(); // this const was added because during my tests, I noticed that at this level this.date is undefined
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
    }
    /**
     * @return {?}
     */
    nextMonth() {
        this.date = addMonths(this.date, 1);
        this.init();
    }
    /**
     * @return {?}
     */
    prevMonth() {
        this.date = subMonths(this.date, 1);
        this.init();
    }
    /**
     * @param {?} i
     * @return {?}
     */
    setDate(i) {
        this.date = this.days[i].date;
        this.value = this.date;
        this.init();
        this.close();
    }
    /**
     * @param {?} i
     * @return {?}
     */
    setYear(i) {
        this.date = setYear(this.date, this.years[i].year);
        this.init();
        this.initYears();
        this.view = 'days';
    }
    /**
     * Checks if specified date is in range of min and max dates
     * @param {?} date
     * @return {?}
     */
    isDateSelectable(date) {
        if (isNil(this.options)) {
            return true;
        }
        const /** @type {?} */ minDateSet = !isNil(this.options.minDate);
        const /** @type {?} */ maxDateSet = !isNil(this.options.maxDate);
        const /** @type {?} */ timestamp = date.valueOf();
        if (minDateSet && (timestamp < this.options.minDate.valueOf())) {
            return false;
        }
        if (maxDateSet && (timestamp > this.options.maxDate.valueOf())) {
            return false;
        }
        return true;
    }
    /**
     * @return {?}
     */
    init() {
        // this.date may be null after .reset(); fall back to current date.
        const /** @type {?} */ actualDate = this.date || new Date();
        const /** @type {?} */ start = startOfMonth(actualDate);
        const /** @type {?} */ end = endOfMonth(actualDate);
        this.days = eachDay(start, end).map(date => {
            return {
                date: date,
                day: getDate(date),
                month: getMonth(date),
                year: getYear(date),
                inThisMonth: true,
                isToday: isToday(date),
                isSelected: isSameDay(date, this.innerValue) && isSameMonth(date, this.innerValue) && isSameYear(date, this.innerValue),
                isSelectable: this.isDateSelectable(date)
            };
        });
        const /** @type {?} */ tmp = getDay(start) - this.firstCalendarDay;
        const /** @type {?} */ prevDays = tmp < 0 ? 7 - this.firstCalendarDay : tmp;
        for (let /** @type {?} */ i = 1; i <= prevDays; i++) {
            const /** @type {?} */ date = subDays(start, i);
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
    }
    /**
     * @return {?}
     */
    initYears() {
        const /** @type {?} */ range = this.maxYear - this.minYear;
        this.years = Array.from(new Array(range), (x, i) => i + this.minYear).map(year => {
            return { year: year, isThisYear: year === getYear(this.date) };
        });
    }
    /**
     * @return {?}
     */
    initDayNames() {
        this.dayNames = [];
        const /** @type {?} */ start = this.firstCalendarDay;
        for (let /** @type {?} */ i = start; i <= 6 + start; i++) {
            const /** @type {?} */ date = setDay(new Date(), i);
            this.dayNames.push(format(date, this.dayNamesFormat, this.locale));
        }
    }
    /**
     * @return {?}
     */
    toggleView() {
        this.view = this.view === 'days' ? 'years' : 'days';
    }
    /**
     * @return {?}
     */
    toggle() {
        this.isOpened = !this.isOpened;
        if (!this.isOpened && this.view === 'years') {
            this.toggleView();
        }
    }
    /**
     * @return {?}
     */
    close() {
        this.isOpened = false;
        if (this.view === 'years') {
            this.toggleView();
        }
    }
    /**
     * @param {?=} fireValueChangeEvent
     * @return {?}
     */
    reset(fireValueChangeEvent = false) {
        this.date = null;
        this.innerValue = null;
        this.init();
        if (fireValueChangeEvent && this.onChangeCallback) {
            this.onChangeCallback(this.innerValue);
        }
    }
    /**
     * @param {?} val
     * @return {?}
     */
    writeValue(val) {
        if (val) {
            this.date = val;
            this.innerValue = val;
            this.init();
            this.displayValue = format(this.innerValue, this.displayFormat, this.locale);
            this.barTitle = format(startOfMonth(val), this.barTitleFormat, this.locale);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.onTouchedCallback = fn;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onBlur(e) {
        if (!this.isOpened) {
            return;
        }
        const /** @type {?} */ input = this.elementRef.nativeElement.querySelector('.ngx-datepicker-input');
        if (input == null) {
            return;
        }
        if (e.target === input || input.contains(/** @type {?} */ (e.target))) {
            return;
        }
        const /** @type {?} */ container = this.elementRef.nativeElement.querySelector('.ngx-datepicker-calendar-container');
        if (container && container !== e.target && !container.contains(/** @type {?} */ (e.target)) && !(/** @type {?} */ (e.target)).classList.contains('year-unit')) {
            this.close();
        }
    }
}
NgDatepickerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ng-datepicker',
                template: `<div class="ngx-datepicker-container">
  <input type="text" *ngIf="!headless" class="ngx-datepicker-input" [(ngModel)]="displayValue" readonly [placeholder]="placeholder"
    [ngClass]="addClass" [ngStyle]="addStyle" [id]="fieldId" [disabled]="disabled" (click)="toggle()" />
  <ng-content></ng-content>
  <div class="ngx-datepicker-calendar-container ngx-datepicker-position-{{position}}" *ngIf="isOpened">
    <div class="topbar-container">
      <svg width="7px" height="10px" viewBox="0 0 7 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        (click)="prevMonth()">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-923.000000, -1882.000000)" fill="#CED0DA">
            <g transform="translate(80.000000, 1361.000000)">
              <g transform="translate(0.000000, 430.000000)">
                <g transform="translate(825.000000, 0.000000)">
                  <g transform="translate(0.000000, 72.000000)">
                    <g transform="translate(18.000000, 15.000000)">
                      <polygon id="Back" points="6.015 4 0 9.013 6.015 14.025"></polygon>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
      <span class="topbar-title" (click)="toggleView()">{{ barTitle }}</span>
      <svg width="7px" height="10px" viewBox="0 0 6 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        (click)="nextMonth()">
        <g id="Source-Sans---UI-Elements-Kit" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="White-Layout" transform="translate(-1182.000000, -1882.000000)" fill="#CED0DA">
            <g id="Dropdowns-&amp;-Selector" transform="translate(80.000000, 1361.000000)">
              <g id="Dropdowns" transform="translate(0.000000, 430.000000)">
                <g id="Calendar" transform="translate(825.000000, 0.000000)">
                  <g transform="translate(0.000000, 72.000000)" id="Top-Bar-Nav">
                    <g transform="translate(18.000000, 15.000000)">
                      <polygon id="Forward" transform="translate(262.007500, 9.012500) scale(-1, 1) translate(-262.007500, -9.012500) " points="265.015 4 259 9.013 265.015 14.025"></polygon>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
    <div class="main-calendar-container" *ngIf="view === 'days'">
      <div class="main-calendar-day-names">
        <span class="day-name-unit" *ngFor="let name of dayNames">{{ name }}</span>
      </div>
      <div class="main-calendar-days">
        <span class="day-unit" *ngFor="let day of days; let i = index;" [ngClass]="{ 'is-prev-month': !day.inThisMonth, 'is-today': day.isToday, 'is-selected': day.isSelected, 'is-disabled': !day.isSelectable }"
          (click)="day.isSelectable && setDate(i)">
          {{ day.day }}
        </span>
      </div>
    </div>
    <div class="main-calendar-container" *ngIf="view === 'years'">
      <div class="main-calendar-years" slimScroll [options]="scrollOptions">
        <span class="year-unit" *ngFor="let year of years; let i = index;" [ngClass]="{ 'is-selected': year.isThisYear }" (click)="setYear(i)">{{ year.year }}</span>
      </div>
    </div>
  </div>
</div>
`,
                styles: [`.ngx-datepicker-position-bottom-left{top:40px;right:0}.ngx-datepicker-position-bottom-right{top:40px;left:0}.ngx-datepicker-position-top-left{bottom:40px;right:0}.ngx-datepicker-position-top-right{bottom:40px;left:0}.ngx-datepicker-container{position:relative}.ngx-datepicker-container .ngx-datepicker-input{padding:5px 10px;font-size:14px;width:200px;outline:0;border:1px solid #dfe3e9}.ngx-datepicker-container .ngx-datepicker-calendar-container{position:absolute;width:300px;background:#fff;-webkit-box-shadow:0 1px 4px 0 rgba(0,0,0,.08);box-shadow:0 1px 4px 0 rgba(0,0,0,.08);border:1px solid #dfe3e9;border-radius:4px}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container{width:100%;height:50px;padding:15px;border-bottom:1px solid #dfe3e9;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container svg{cursor:pointer}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container svg g{fill:#ced0da}.ngx-datepicker-container .ngx-datepicker-calendar-container .topbar-container .topbar-title{color:#3d495c;font-size:14px;font-weight:600;cursor:pointer}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container{width:100%;height:100%;padding:15px 10px 0;font-size:12px;font-weight:500}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-day-names{color:#a4a9b1;width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-day-names .day-name-unit{width:calc(100% / 7);text-transform:uppercase;text-align:center}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years{padding:15px 0;width:100%;display:inline-block;max-height:275px;overflow:hidden}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit{width:calc(100% / 7);height:40px;display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;float:left;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-radius:50%;color:#3d495c}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-prev-month,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-prev-month,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-prev-month,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-prev-month{color:#a4a9b1}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-today,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit:hover{background:#a4a9b1;color:#fff}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-selected,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-selected,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-selected,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-selected{background:#1a91eb;color:#fff}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-disabled,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-disabled,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-disabled,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-disabled{cursor:not-allowed;color:#a4a9b1}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .day-unit.is-disabled:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-days .year-unit.is-disabled:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .day-unit.is-disabled:hover,.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit.is-disabled:hover{background:0 0}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years{height:210px;display:block;padding:0}.ngx-datepicker-container .ngx-datepicker-calendar-container .main-calendar-container .main-calendar-years .year-unit{width:calc(100% / 3);border-radius:10px}`],
                providers: [
                    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgDatepickerComponent), multi: true }
                ]
            },] },
];
/** @nocollapse */
NgDatepickerComponent.ctorParameters = () => [
    { type: ElementRef, },
];
NgDatepickerComponent.propDecorators = {
    "options": [{ type: Input },],
    "headless": [{ type: Input },],
    "isOpened": [{ type: Input },],
    "position": [{ type: Input },],
    "onBlur": [{ type: HostListener, args: ['document:click', ['$event'],] },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class NgDatepickerModule {
}
NgDatepickerModule.decorators = [
    { type: NgModule, args: [{
                declarations: [NgDatepickerComponent],
                imports: [CommonModule, FormsModule, NgSlimScrollModule],
                exports: [NgDatepickerComponent, CommonModule, FormsModule, NgSlimScrollModule]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { NgDatepickerModule, NgDatepickerComponent };
//# sourceMappingURL=ng2-datepicker.js.map
