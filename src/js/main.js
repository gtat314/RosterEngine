function RosterEngine() {

    /**
     * @public
     * @property
     * @type {Number} int
     */
    this.DISTANCE_FROM_NIGHT = 8;

    /**
     * @public
     * @property
     * @type {Number} int
     */
    this.DISTANCE_FROM_WEEKEND = 3;

    /**
     * @private
     * @property
     * @type {Number} int
     */
    this._HALL_ID = 21;

    /**
     * @private
     * @property
     * @type {Boolean}
     */
    this._11_HOUR_FLAG = false;

    /**
     * @property
     * @public
     * @type {Number} int
     */
    this.shift_low_availability_threshold_number = 3;

    /**
     * @property
     * @private
     * @type {CalendarCollection}
     */
    this.mixedCalendarRows = null;

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.olderCalendarRows = null;

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.currentCalendarRows = null;

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.futureCalendarRows = null;

    /**
     * @property
     * @public
     * @type {EmployeesCollection}
     */
    this.employees = null;

    /**
     * @property
     * @public
     * @type {EmployeePreferenceTimetableCollection}
     */
    this.employeePreferences = null;

    /**
     * @property
     * @public
     * @type {HolidaysCollection}
     */
    this.holidays = null;

    /**
     * @property
     * @public
     * @type {JunctionEmployeePool}
     */
    this.junctionEmployeePool = null;

    /**
     * @property
     * @public
     * @type {JunctionRolePool}
     */
    this.junctionRolePool = null;

    /**
     * @property
     * @public
     * @type {LeavesCollection}
     */
    this.leaves = null;

    /**
     * @property
     * @public
     * @type {PoolsCollection}
     */
    this.pools = null;

    /**
     * @property
     * @public
     * @type {RolesCollection}
     */
    this.roles = null;

    /**
     * @property
     * @public
     * @type {ShiftsCollection}
     */
    this.shifts = null;

    /**
     * @property
     * @public
     * @type {ShiftPondCollection}
     */
    this.shiftPonds = null;

    /**
     * @property
     * @public
     * @type {TimetablesCollection}
     */
    this.timetables = null;

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.todayCalendarRows = null;

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.holidayRows = null;

    /**
     * @property
     * @public
     * @type {DB_Settings}
     */
    this.settings = null;

    /**
     * @property
     * @private
     * @type {Object[]}
     */
    this._allocations = [];

    /**
     * @property
     * @private
     * @type {Map}
     */
    this._getNextDateByDaysMap = new Map();

    /**
     * @property
     * @private
     * @type {Map}
     */
    this._findMasterCalendarRowBySlaveCalendarRowCache = new Map();

    /**
     * @property
     * @private
     * @type {String} YYYY-MM-DD
     */
    this.fromDate = null;

    /**
     * @property
     * @private
     * @type {String} YYYY-MM-DD
     */
    this.untilDate = null;

    /**
     * @property
     * @private
     * @type {Object}
     */
    this.holiday_connections = {
        'Πρωτοχρονιά': 'Χριστούγεννα',
        'Αγίου Πνεύματος': 'Καθαρά Δευτέρα',
        '28η Οκτωβρίου': '25η Μαρτίου',
        'Άγιον Πάσχα': 'Άγιον Πάσχα',
        'Χριστούγεννα': 'Πρωτοχρονιά',
        'Καθαρά Δευτέρα': 'Αγίου Πνεύματος',
        '25η Μαρτίου': '28η Οκτωβρίου'

    };

    this.holiday_yearly_offsets = {
        'Πρωτοχρονιά': [-1],
        'Αγίου Πνεύματος': [0],
        '28η Οκτωβρίου': [0],
        'Άγιον Πάσχα': [-1, -2],
        'Χριστούγεννα': [0],
        'Καθαρά Δευτέρα': [-1],
        '25η Μαρτίου': [-1]
    };

    this.bitflags = {

        'GOOD'                          : 0b0,
        'IS_ON_LEAVE'                   : 0b1,
        'HARD_SHIFT_EXCLUSION'          : 0b10,
        'HOLIDAY_ANAVAILABILITY'        : 0b100,
        'WORKS_SAME_DAY'                : 0b1000,
        'WORKED_PREVIOUS_NIGHT'         : 0b10000,
        'LESS_THAN_11_HOURS'            : 0b100000,
        'WORKS_NEXT_DAY_AND_NIGHTSHIFT' : 0b1000000,
        'UNACCEPTABLE_NYX_SCORE'        : 0b10000000,
        'UNACCEPTABLE_SKO_SCORE'        : 0b100000000,

    }

};

/**
 * 
 * @param {String} from YYYY-MM-DD
 * @param {String} until YYYY-MM-DD
 */
RosterEngine.prototype.set_currentDateSpan = function (from, until) {

    this.fromDate = from;
    this.untilDate = until;

};

/**
 * @method
 * @public
 * @param {Object} rows 
 * @returns {void}
 */
RosterEngine.prototype.set_futureRows = function ( rows ) {

    this.futureCalendarRows = new CalendarCollection( rows );

};

/**
 * @method
 * @public
 * @param {Object} rows 
 * @returns {void}
 */
RosterEngine.prototype.set_currentRows = function (rows) {

    this.currentCalendarRows = new CalendarCollection(rows);

};

/**
 * @method
 * @public
 * @param {Object} rows 
 * @returns {void}
 */
RosterEngine.prototype.set_holidayRows = function (rows) {

    this.holidayRows = new CalendarCollection( rows );

};

/**
 * this.settings is pretty much an object after hydration. its form is along these lines:
 * 
 * this.settings = {
 *      dayoffsPerWeek: "2",
 *      eveningHolidayVariant: "4",
 *      eveningSkVariant: "4",
 *      eveningVariant: "0",
 *      morningHolidayVariant: "4",
 *      morningSkVariant: "4",
 *      nightHolidayVariant: "8",
 *      nightParaskeuiVariant: "3",
 *      nightSavvatoVariant: "0",
 *      nightKyriakiVariant: "0",
 *      nightVariant: "8"
 * };
 * 
 * WARNING: any numerical values, are presented as strings at this point, despite being numerical. hence the quotation marks around the numbers
 * 
 * @method
 * @public
 * @param {Object} settings 
 * @returns {void}
 */
RosterEngine.prototype.set_settings = function (settings) {

    if (this.settings === null) {

        this.settings = new DB_Settings().hydrate(settings);

    }

};

/**
 * @method
 * @public
 * @param {Object} todayCalendarRows 
 * @returns {void}
 */
RosterEngine.prototype.set_todayCalendarRows = function (todayCalendarRows) {

    this._allocations = [];
    this.todayCalendarRows = new CalendarCollection(todayCalendarRows);

};

/**
 * @method
 * @public
 * @param {Object} calendar 
 * @returns {void}
 */
RosterEngine.prototype.set_calendar = function (calendar) {

    this.olderCalendarRows = new CalendarCollection(calendar);

};

/**
 * @method
 * @public
 * @param {Object} calendar 
 * @returns {void}
 */
RosterEngine.prototype.set_calendarAll = function (calendar) {

    this._allocations = [];
    this.allCalendarRows = new CalendarCollection(calendar);

};

/**
 * @method
 * @public
 * @param {Object} employees 
 */
RosterEngine.prototype.set_employees = function (employees) {

    this.employees = new EmployeesCollection( employees );
    this.employees.calcInveteracyCoefficients( this.settings.coefficients );
    this.employees.sortByInveteracyCoefficient( 'ASC' );

};

/**
 * @method
 * @public
 * @param {Object} employeePreferences 
 */
RosterEngine.prototype.set_employeePreferences = function (employeePreferences) {

    if (this.employeePreferences === null) {

        this.employeePreferences = new EmployeePreferenceTimetableCollection(employeePreferences);

    }

};

/**
 * @method
 * @public
 * @param {Object} holidays 
 */
RosterEngine.prototype.set_holidays = function (holidays) {

    if (this.holidays === null) {

        this.holidays = new HolidaysCollection(holidays);

    }

};

/**
 * @method
 * @public
 * @param {Object} linksEmployeePool 
 */
RosterEngine.prototype.set_linksEmployeePool = function (linksEmployeePool) {

    if (this.junctionEmployeePool === null) {

        this.junctionEmployeePool = new JunctionEmployeePool(linksEmployeePool);

    }

};

/**
 * @method
 * @public
 * @param {Object} linksRolePool 
 */
RosterEngine.prototype.set_linksRolePool = function (linksRolePool) {

    if (this.junctionRolePool === null) {

        this.junctionRolePool = new JunctionRolePool(linksRolePool);

    }

};

/**
 * @method
 * @public
 * @param {Object} leaves 
 */
RosterEngine.prototype.set_leaves = function (leaves) {

    this.leaves = new LeavesCollection(leaves);

};

/**
 * @method
 * @public
 * @param {Object} pools 
 */
RosterEngine.prototype.set_pools = function (pools) {

    if (this.pools === null) {

        this.pools = new PoolsCollection( pools ).order( 'name', 'ASC' );

    }

};

/**
 * @method
 * @public
 * @param {Object} roles 
 */
RosterEngine.prototype.set_roles = function (roles) {

    if (this.roles === null) {

        this.roles = new RolesCollection(roles).order('sort_index', 'ASC');

    }

};

/**
 * @method
 * @public
 * @param {Object} shifts 
 */
RosterEngine.prototype.set_shifts = function (shifts) {

    if (this.shifts === null) {

        this.shifts = new ShiftsCollection(shifts);

    }

};

/**
 * @method
 * @public
 * @param {Object} shiftPonds 
 */
RosterEngine.prototype.set_shiftPonds = function (shiftPonds) {

    if (this.shiftPonds === null) {

        this.shiftPonds = new ShiftPondCollection(shiftPonds);

    }

};

/**
 * @method
 * @public
 * @param {Object} timetables 
 */
RosterEngine.prototype.set_timetables = function (timetables) {

    if (this.timetables === null) {

        this.timetables = new TimetablesCollection(timetables);

    }

};

/**
 * @method
 * @public
 * @description this is a helper function for getting some data for UI info client side, and bears no weight in the engine whatsoever
 * @returns {Number}
 */
RosterEngine.prototype.get_employeesWithoutLeaveForDate = function () {

    var employees = this.employees.getWithoutLeaveForDate(this.todayCalendarRows.getElement(0).date, this.leaves);

    this._removeEmployeesThatHadANightShiftTheDayBefore(employees);

    return employees.length;

};

/**
 * @method
 * @public
 * @returns {void}
 */
RosterEngine.prototype.save = function (callbackFunc) {

    console.log(this._allocations);

    if (this._allocations.length > 0) {

        new Relay('POST', '/api/calendar/automatic-allocations/', {
            'allocations': this._allocations
        }).call(function () {

            callbackFunc();

        });

    } else {

        callbackFunc();

    }

};

/**
 * @param {DB_Calendar} row 
 * @returns {String|null}
 */
RosterEngine.prototype.get_weekend_start = function (row) {

    if ( row.isFriday() ) {

        return row.date;

    } else if ( row.isSaturday() ) {

        return lib_getDateByIntegerOffset(row.date, -1);

    } else if ( row.isSunday() ) {

        return lib_getDateByIntegerOffset(row.date, -2);

    }

    return null;

};

/**
 * @param {DB_Calendar} row 
 * @returns {String}
 */
RosterEngine.prototype.get_weekend_end = function (row) {

    if ( row.isFriday() ) {

        return lib_getDateByIntegerOffset(row.date, 2);

    } else if ( row.isSaturday() ) {

        return lib_getDateByIntegerOffset(row.date, 1);

    } else if ( row.isSunday() ) {

        return row.date;

    }

    return null;

};

/**
 * @runs 1 time / day
 * @see DB_Calendar.prototype.getPreviousDateBy6Days
 * @see ShiftsCollection.prototype.getByIdCached
 * @see ShiftsCollection.prototype.isLinkedShift
 * @see ShiftsCollection.prototype.isLinkedTargetShift
 * @see ShiftPondCollection.prototype.isPondMasterShift
 * @method
 * @public
 * @param {CalendarCollection} activeCalendarCollection
 * @param {CalendarCollection} calendarCollection edw einai kai oi 97 meres
 * @param {EmployeesCollection} employeeCollection autoi einai OLOI oi ypalliloi
 * @param {String} startingDate 'YYYY-MM-DD'
 * @returns {void}
 */
RosterEngine.prototype._augmentPayloadCalendarRows = function (activeCalendarCollection, calendarCollection, employeeCollection, startingDate) {

    // console.log(structuredClone(startingDate));

    let cutoff_date = lib_getDateByIntegerOffset(startingDate, -6);
    let last_date = lib_getDateByIntegerOffset(this.untilDate, 20)
    let dictionary_ponds = {};

    for (let row of calendarCollection) {

        row.shift_weight = 0;

        if ( row.isNightShift() ) {

            if ( row.isFriday() ) {

                row.shift_weight = parseFloat( this.settings.nightParaskeuiVariant );
 
            }

            if ( row.isSaturday() ) {

                row.shift_weight = parseFloat( this.settings.nightSavvatoVariant );

            }

            if ( row.isSunday() ) {

                row.shift_weight = parseFloat( this.settings.nightKyriakiVariant );

            }

        }

        if (row.date < cutoff_date) {

            continue;

        }

        row._pools = new PoolsCollection([]);

        if (row.date >= cutoff_date && row.date <= last_date) {

            row._pools = this._getPoolsForCalendarRow(row);

        }

        /**
        * @todo: remove willing with rules and without rules can_employee_fill_this_shift
        * must be called before each assignment to be up to date  
        **/

        row._isAPondShift = false;
        row._isAPondMasterShift = false;
        row._pondMasterRow = null;
        row._pond = null;
        row._isALinkedShift = false;
        row._isALinkedTargetShift = false;
        row._linkSourceRow = null;
        row._linkTargetRow = null;
        row._eligibleEmployees = new EmployeesCollection([]);
        row._days_after = null;
        row._days_total = null;
        row._eligibleEmployeesWithRules = new EmployeesCollection([]);
        row._eligibleEmployeesWithoutRules = new EmployeesCollection([]);
        row._willingEmployeesWithoutRules = new EmployeesCollection([]);
        row._unwillingEmployeesWithoutRules = new EmployeesCollection([]);
        row._timeBracket = lib_calculateDayBracket(row.shift_times);

        if (row.shift_id !== null) {

            let shift = this.shifts.getByIdCached(row.shift_id);

            if (shift !== null) {

                row._isALinkedShift = this.shifts.isLinkedShift(shift.id);
                row._days_after = shift.days_after;
                row._days_total = shift.days_total;

                if (row._isALinkedShift) {

                    row._isALinkedTargetShift = this.shifts.isLinkedTargetShift(shift.id);

                    if (row._isALinkedTargetShift) {

                        let sourceShift = this.shifts.getByIdCached(shift.propagate_from_shift_id);

                        if (sourceShift !== null) {

                            let sourceCalendarRow = this.getMostRecentCalendarShiftFromPayload(row.date, sourceShift.id, calendarCollection);

                            if (sourceCalendarRow !== null) {

                                row._linkSourceRow = sourceCalendarRow.id;

                            }

                        }

                    }

                }

                if (row.shift_pond !== null) {

                    row._isAPondShift = true;
                    row._pond = row.shift_pond;
                    row._isAPondMasterShift = this.shiftPonds.isPondMasterShift(shift.id);

                    if (row._isAPondMasterShift === false) {

                        row._pondMasterRow = this.getMasterCalendarRowIdBySlaveCalendarRowInPayload(row, calendarCollection);

                    }

                    if (dictionary_ponds.hasOwnProperty(row.shift_pond)) {

                        dictionary_ponds[row.shift_pond].push(row);

                    } else {

                        dictionary_ponds[row.shift_pond] = [];
                        dictionary_ponds[row.shift_pond].push(row);

                    }

                }

            }

        }

    }

    for ( let row of calendarCollection ) {

        if ( row.hasOwnProperty( '_linkSourceRow' ) && row._linkSourceRow !== null ) {

            let sourceRow = calendarCollection.getByIdCached( row._linkSourceRow );

            // if ( sourceRow === null ) {

            //     console.log( structuredClone( row ) );

            // }

            sourceRow._linkTargetRow = row.id;

        }

    }

    for (let pond in dictionary_ponds) {

        let pond_master_row;
        let master_necessity = false;
        let slave_necessity = false;

        for (let row of dictionary_ponds[pond]) {

            if (row._isAPondMasterShift) {

                pond_master_row = row;
                master_necessity = row.is_necessary;

            } else {

                if (row.is_necessary === 1) {

                    slave_necessity = true;

                }

            }

        }

        if (!master_necessity && slave_necessity == true) {

            pond_master_row.is_necessary = 1;

        }

    }

    for (let holiday of this.holidayRows) {

        if (!holiday.isFilled()) {

            continue;

        }

        let holiday_name = this.holidays.getNameByDate(holiday.date);

        if (holiday_name == null) {

            continue;

        }

        let year_numeric = holiday.date.slice( 0, 4 );

        let employee = this.employees.getById(holiday.employee_id);

        /**
         * @todo check what we are to do wit this one, since it was not in the original code ID 260808202813
         */
        if ( employee !== null ) {

            if (!Object.hasOwn(employee._holidays_worked, holiday_name)) {

                employee._holidays_worked[holiday_name] = [];

            }

            if (!employee._holidays_worked[holiday_name].includes(year_numeric)) {

                employee._holidays_worked[holiday_name].push(year_numeric);

            }

        }

    }

    /**
     * @todo allo function to opoio xwrista otan kanei assign employees na tsekarei an o employee pou einai eligible exei
     * kanei exclude auti ti vardia apo tis vardies pou thelei na kanei. auto tha kaleitai sto assign_employee
     */
    this._calculate_and_store_eligibility_on_rows_sm(employeeCollection, activeCalendarCollection);

};

/**
 * @todo sto augment payload rows na valw ena property se kathe row an anikei sta past, sta current i sta future.
 * ta past na mi ginontai allocates katholou, ta current na ginontai allocated kanonika kai ta future na ginontai pseudoallocated
 * @method
 * @private
 * @see DB_Employee.prototype.getFullname @cached
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @param {Boolean} not_future
 * @returns {void}
 */
RosterEngine.prototype._allocate = function (employee, calendarRow, not_future = true) {

    // console.log( 'run allocate' );

    if (employee === null) {

        // console.warn( 'allocate has received a null employee' );
        return;

    }

    calendarRow.employee_id = employee.id;
    calendarRow.employee_name = employee.getFullname();

    if (not_future) {

        this._allocations.push({
            'id': calendarRow.id,
            'employee_id': employee.id,
            'employee_name': employee.getFullname()
        });

        employee._current_provisionally_set_shifts.push(calendarRow);

        if (calendarRow.isNightShift()) {

            employee._current_provisional_nights.push(calendarRow);

        }

        if ( calendarRow.isWeekendShift() ) {

            employee._current_provisional_weekends.push(calendarRow);
            employee._all_weekends.push(calendarRow);

        }

    } else {

        employee._current_provisionally_set_shifts.push(calendarRow);

        if (calendarRow.isNightShift()) {

            employee._future_provisional_nights.push(calendarRow);

        }

        if ( calendarRow.isWeekendShift() ) {

            employee._future_provisional_weekends.push(calendarRow);
            employee._all_weekends.push(calendarRow);

        }

    }

};

/**
 * Undoes the allocation. It simply removes from the _allocations array for now. it needs to be complete
 *
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @returns {void}
 */
RosterEngine.prototype._deallocate = function (employee, calendarRow) {

    // @todo this needs to take care of the various augmentations of the employee and the row 

    if (employee === null || calendarRow === null) {

        return;

    }

    // iterate over the array and find the index of the element row, where row.id equals calendarRow id given
    const allocationIndex = this._allocations.findIndex(function (row) {
        // @todo check if the employee id is correct as well
        return row.id === calendarRow.id;

    });

    // then simply remove the element of the array, which has the index found above
    if (allocationIndex !== -1) {

        this._allocations.splice(allocationIndex, 1);

    }

    if ( calendarRow.isNightShift() ) {

        employee._current_provisional_nights.removeById(calendarRow.id);
        employee._future_provisional_nights.removeById(calendarRow.id);

    }

    if ( calendarRow.isWeekendShift() ) {

        employee._current_provisional_weekends.removeById(calendarRow.id);
        employee._future_provisional_weekends.removeById(calendarRow.id);
        employee._all_weekends.removeById(calendarRow.id);

    }

};

/**
 * Method that returns the nyx_score of an employee for a specific date
 *
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {String} dateString YYYY-MM-DD 
 * @returns {Object|null} associative array
 */
RosterEngine.prototype._get_employee_nyx_scores_by_date = function (employee, dateString) {

    if (dateString == null || employee == null) {

        return null;

    }

    //gather all nightshift that the employee has in the calendar in a collection
    let temp_nightshifts = employee._nights_worked.concatCollection(
        employee._current_set_nights.concatCollection(
            employee._current_provisional_nights.concatCollection(
                employee._future_set_nights.concatCollection(
                    employee._future_provisional_nights
                )
            )
        )
    );

    //sort by date
    temp_nightshifts.order('date', 'ASC');

    let average_score = Infinity;
    let proposed_average_score = Infinity;
    let dates_and_scores_associative_array = new Object();
    let proposed_date = dateString;
    let date_before_proposed = null;
    let date_after_proposed = null;

    let previous_date = null;

    //go row by row in order
    for (let row of temp_nightshifts) {

        let just_passed_proposed_date = false;

        if (previous_date == null) {

            //if this is the first nightshift found in the calendar
            dates_and_scores_associative_array[row.date] = -1;

            //if no previous date worked night, and already after the proposed nightshift
            if (row.date > proposed_date) {

                dates_and_scores_associative_array[proposed_date] = -1;

                dates_and_scores_associative_array[row.date] =
                    lib_datesDifferenceInDays(proposed_date, row.date);

                date_after_proposed = row.date;

            }

        } else {

            //if at least one previous date of nightshift found
            if (row.date > proposed_date) {

                //check if this is the nightshift that is just past the proposed date
                if (previous_date < proposed_date) {

                    just_passed_proposed_date = true;

                }

            }

            if (just_passed_proposed_date) {

                //if it's just past the proposed date
                date_before_proposed = previous_date;
                date_after_proposed = row.date;

                dates_and_scores_associative_array[proposed_date]
                    = lib_datesDifferenceInDays(previous_date, proposed_date);

                dates_and_scores_associative_array[date_after_proposed]
                    = lib_datesDifferenceInDays(proposed_date, row.date);

            } else {

                //if the previous date is also past the proposed date
                dates_and_scores_associative_array[row.date]
                    = lib_datesDifferenceInDays(previous_date, row.date);

            }

        }

        previous_date = row.date;

    }

    if (!Object.hasOwn(dates_and_scores_associative_array, proposed_date)) {

        //if the proposed date was never reached
        if (previous_date != null) {

            //if this person has worked at least a nightshift,
            //or is already set to work one before the proposed date
            //but no nightshifts after yet
            dates_and_scores_associative_array[proposed_date]
                = lib_datesDifferenceInDays(previous_date, proposed_date);

            date_before_proposed = previous_date;

        } else {

            //if this person hasn't worked any nightshifts and isn't set to work a nightshift yet
            dates_and_scores_associative_array[proposed_date] = -1;

        }

    }

    let nightshift_counter = 0;
    let current_nyx_score_total = 0;
    let proposed_nyx_score_total = 0;

    for (const shift_date in dates_and_scores_associative_array) {

        //calculate the sum of the proposed nyx_scores
        if (dates_and_scores_associative_array[shift_date] > 0) {

            proposed_nyx_score_total += dates_and_scores_associative_array[shift_date];

        }

        nightshift_counter += 1;

    }

    if (date_before_proposed != null) {

        //if the employee has worked or is set to work at least a night before the proposed
        current_nyx_score_total = proposed_nyx_score_total - dates_and_scores_associative_array[proposed_date];

        if (date_after_proposed != null) {

            //if the employee is set to work at least a night after the proposed
            current_nyx_score_total -= dates_and_scores_associative_array[date_after_proposed];

            current_nyx_score_total += lib_datesDifferenceInDays(
                date_before_proposed,
                date_after_proposed
            );

        }

    } else {

        //if the employee hasn't and is not set to work a date before the proposed
        if (date_after_proposed != null) {

            //if the employee is set to work at least one date after the proposed
            current_nyx_score_total = proposed_nyx_score_total
                - dates_and_scores_associative_array[date_after_proposed];

        } else {

            //if the employee is not set to work any dates after the proposed and hasn't worked before
            current_nyx_score_total = Infinity;

        }

    }

    if (nightshift_counter > 1) {

        //because the first nightshift doesn't contribute
        proposed_average_score = proposed_nyx_score_total / (nightshift_counter - 1);

    } else {

        //if the employee has no other nightshifts in the callendar other than the proposed
        proposed_average_score = 0;

    }

    if (nightshift_counter > 2) {

        //because the first and the proposed nightshift don't contribute
        average_score = current_nyx_score_total / (nightshift_counter - 2);

    } else {

        //if the employee has up to one other nightshift in the calendar other than the proposed
        average_score = 0;

    }

    return {
        'average_score': average_score,
        'proposed_average_score': proposed_average_score,
        'dates_and_scores_associative_array': dates_and_scores_associative_array,
        'proposed_date': proposed_date,
        'date_before_proposed': date_before_proposed,
        'date_after_proposed': date_after_proposed,
        'desired_score': this._get_employee_desired_nyx_score(employee)
    };

};

/**
 * Method that returns the sko_score of an employee for a specific date
 *
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {String} dateString YYYY-MM-DD 
 * @returns {Object} associative array
 */
RosterEngine.prototype._get_employee_sko_scores_by_date = function (employee, dateString) {

    if (dateString == null || employee == null) {

        return null;

    }

    //gather all weekend shifts that the employee has in the calendar in a collection
    let temp_weekends = employee._weekends_worked.concatCollection(
        employee._current_set_weekends.concatCollection(
            employee._current_provisional_weekends.concatCollection(
                employee._future_set_weekends.concatCollection(
                    employee._future_provisional_weekends
                )
            )
        )
    );

    //sort by date
    temp_weekends.order('date', 'ASC');

    let average_score = Infinity;
    let proposed_average_score = Infinity;
    let dates_and_scores_associative_array = new Object();
    let proposed_date = dateString;
    let date_before_proposed = null;
    let date_after_proposed = null;

    let previous_date = null;

    //go row by row in order
    for (let row of temp_weekends) {

        let just_passed_proposed_date = false;

        if (previous_date == null) {

            //if this is the first weekend shift found in the calendar
            dates_and_scores_associative_array[row.date] = -1;

            //if no previous date worked weekend, and already after the proposed weekend shift
            if (row.date > proposed_date) {

                dates_and_scores_associative_array[proposed_date] = -1;

                dates_and_scores_associative_array[row.date]
                    = lib_calculateWeekendsDistanceByDates(
                        proposed_date,
                        row.date
                    );

                date_after_proposed = row.date;

            }

        } else {

            //if at least one previous date of weekend shift found
            if (row.date > proposed_date) {

                //check if this is the weekend shift that is just past the proposed date
                if (previous_date < proposed_date) {

                    just_passed_proposed_date = true;

                }

            }

            if (just_passed_proposed_date) {

                //if it's just past the proposed date
                date_before_proposed = previous_date;
                date_after_proposed = row.date;

                dates_and_scores_associative_array[proposed_date]
                    = lib_calculateWeekendsDistanceByDates(previous_date, proposed_date);

                dates_and_scores_associative_array[date_after_proposed]
                    = lib_calculateWeekendsDistanceByDates(proposed_date, row.date);

            } else {

                //if the previous date is also past the proposed date
                dates_and_scores_associative_array[row.date]
                    = lib_calculateWeekendsDistanceByDates(previous_date, row.date);

            }

        }

        previous_date = row.date;

    }

    if (!Object.hasOwn(dates_and_scores_associative_array, proposed_date)) {

        //if the proposed date was never reached
        if (previous_date != null) {

            //if this person has worked at least a weekend,
            //or is already set to work one before the proposed date
            //but no weekends after yet
            dates_and_scores_associative_array[proposed_date]
                = lib_calculateWeekendsDistanceByDates(previous_date, proposed_date);

            date_before_proposed = previous_date;

        } else {

            //if this person hasn't worked any weekends and isn't set to work a nightshift yet
            dates_and_scores_associative_array[proposed_date] = -1;

        }

    }

    let weekend_shift_counter = 0;
    let current_sko_score_total = 0;
    let proposed_sko_score_total = 0;

    for (const shift_date in dates_and_scores_associative_array) {

        //calculate the sum of the proposed sko_scores
        if (dates_and_scores_associative_array[shift_date] > 0) {

            proposed_sko_score_total += dates_and_scores_associative_array[shift_date];

        }

        if (dates_and_scores_associative_array[shift_date] != 0) {

            //don't calculate dates in a previously counted weekend
            weekend_shift_counter += 1;

        }

    }

    if (date_before_proposed != null) {

        //if the employee has worked or is set to work at least a weekend shift before the proposed
        current_sko_score_total = proposed_sko_score_total - dates_and_scores_associative_array[proposed_date];

        if (date_after_proposed != null) {

            //if the employee is set to work at least a weekend shift after the proposed
            current_sko_score_total -=
                dates_and_scores_associative_array[date_after_proposed];

            current_sko_score_total +=
                lib_calculateWeekendsDistanceByDates(
                    date_before_proposed,
                    date_after_proposed
                );

        }

    } else {

        //if the employee hasn't and is not set to work a date before the proposed
        if (date_after_proposed != null) {

            //if the employee is set to work at least one date after the proposed
            current_sko_score_total = proposed_sko_score_total
                - dates_and_scores_associative_array[date_after_proposed];

        } else {

            //if the employee is not set to work any dates after the proposed and hasn't worked before
            current_sko_score_total = Infinity;

        }

    }

    if (weekend_shift_counter > 1) {

        //because the first weekend doesn't contribute
        proposed_average_score = proposed_sko_score_total / (weekend_shift_counter - 1);

    } else {

        //if the employee has no other weekends in the callendar other than the proposed
        proposed_average_score = 0;

    }

    if (weekend_shift_counter > 2) {

        //because the first and the proposed weekends don't contribute
        average_score = current_sko_score_total / (weekend_shift_counter - 2);

    } else {

        //if the employee has up to one other weekend in the calendar other than the proposed
        average_score = 0;

    }

    // console.log( structuredClone({
    //     'average_score':                        average_score,
    //     'proposed_average_score':               proposed_average_score,
    //     'dates_and_scores_associative_array':   dates_and_scores_associative_array,
    //     'proposed_date':                        proposed_date,
    //     'date_before_proposed':                 date_before_proposed, 
    //     'date_after_proposed':                  date_after_proposed
    // }) );

    return {
        'average_score': average_score,
        'proposed_average_score': proposed_average_score,
        'dates_and_scores_associative_array': dates_and_scores_associative_array,
        'proposed_date': proposed_date,
        'date_before_proposed': date_before_proposed,
        'date_after_proposed': date_after_proposed,
        'desired_score': this._get_employee_desired_sko_score(employee)
    };

};

/**
 * Method that returns the desired nyx_score for an employee
 *
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Number} integer
 */
RosterEngine.prototype._get_employee_desired_nyx_score = function (employee) {

    // @todo make this work with the unique groupings when they are implemented
    return parseInt( employee.getInveteracyCoefficient() ) + 7;


};

/**
 * Method that returns the desired sko_score for an employee
 *
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Number} integer
 */
RosterEngine.prototype._get_employee_desired_sko_score = function (employee) {

    // @todo make this work with the unique groupings when they are implemented
    return Math.floor( parseInt( employee.getInveteracyCoefficient() ) / 4) + 3;

};

/**
 *
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @param {Number} daysNum integer
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._getNextDateByDays = function (dateString, daysNum) {

    var key = dateString + ':' + daysNum;

    if (this._getNextDateByDaysMap.has(key)) {

        return this._getNextDateByDaysMap.get(key);

    }

    var date = new Date(dateString);

    date.setDate(date.getDate() + daysNum);

    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');

    this._getNextDateByDaysMap.set(key, year + '-' + month + '-' + day);

    return this._getNextDateByDaysMap.get(key);

};

/**
 * @see lib_getPreviousDate
 * @param {String} currentDateStr YYYY-MM-DD
 * @param {Number} shiftId 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._getMostRecentCalendarShift = function (currentDateStr, shiftId) {

    // console.log( 'run' );

    var previousDateString = lib_getPreviousDate(currentDateStr);

    for (var i = 0; i < 7; i++) {

        var olderCalendarRow = this.olderCalendarRows.getByDateAndShiftId(previousDateString, shiftId);

        if (olderCalendarRow === null) {

            previousDateString = lib_getPreviousDate(previousDateString);

        } else {

            return olderCalendarRow;

        }

    }

    return null;

};

/**
 * @see lib_getPreviousDate
 * @param {String} currentDateStr YYYY-MM-DD
 * @param {Number} shiftId 
 * @param {CalendarCollection} calendarCollection
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype.getMostRecentCalendarShiftFromPayload = function (currentDateStr, shiftId, calendarCollection) {

    // console.log( 'run' );

    var previousDateString = lib_getPreviousDate(currentDateStr);

    for (var i = 0; i < 7; i++) {

        var olderCalendarRow = calendarCollection.getByDateAndShiftId(previousDateString, shiftId);

        if (olderCalendarRow === null) {

            previousDateString = lib_getPreviousDate(previousDateString);

        } else {

            return olderCalendarRow;

        }

    }

    return null;

};

/**
 * @see EmployeesCollection.getByIdCached
 * @method
 * @private
 * @param {DB_Calendar} targetCalendarRow 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._findEmployeeThatFilledTheSourceShiftUsingTargetShift = function (targetCalendarRow) {

    // console.log( 'run' );

    // var sourceCalendarRow = this.mixedCalendarRows.getLinkSourceByLinkTarget( targetCalendarRow, this.shifts );

    if (targetCalendarRow.shift_id === null) { return null; }

    var targetShift = this.shifts.getByIdCached(targetCalendarRow.shift_id);

    if (targetShift === null) { return null; }

    if (targetShift.propagate_from_shift_id === null) { return null; }

    var sourceShift = this.shifts.getByIdCached(targetShift.propagate_from_shift_id);

    var sourceCalendarRow = this._getMostRecentCalendarShift(targetCalendarRow.date, sourceShift.id);

    if (sourceCalendarRow === null) { return null; }

    if (sourceCalendarRow.employee_id === null) { return null; }

    return this.employees.getByIdCached(sourceCalendarRow.employee_id);

};

/**
 * @see lib_getPreviousDate
 * @see EmployeesCollection.removeById @noncachable
 * @param {EmployeesCollection} employees 
 * @param {String} currentDate YYYY-MM-DD
 */
RosterEngine.prototype._removeEmployeesThatHadANightShiftTheDayBefore = function (employees) {

    // console.log( 'run' );

    var previousDateString = lib_getPreviousDate(this.todayCalendarRows.getElement(0).date);

    var previousDateCalendarRows = this.olderCalendarRows.getAllByDate(previousDateString);

    for (var row of previousDateCalendarRows) {

        if (row.shift_times === '21:00-07:00' && row.employee_id !== null) {

            employees.removeById(row.employee_id);

        }

    }

};

/**
 * @see ShiftPondCollection.prototype.getPondByShiftId
 * @see ShiftPondCollection.prototype.getMasterShiftIdForPondId
 * @see CalendarCollection.prototype.getByShiftIdAndDate
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @param {CalendarCollection} calendarCollection
 * @returns {Number|null}
 */
RosterEngine.prototype.getMasterCalendarRowIdBySlaveCalendarRowInPayload = function (row, calendarCollection) {

    // console.log( 'run' );

    if (row.shift_id === null) {

        return null;

    }

    var pondRow = this.shiftPonds.getPondByShiftId( row.shift_id );

    if (pondRow === null) {

        return null;

    }

    var masterShiftId = this.shiftPonds.getMasterShiftIdForPondId( pondRow.pond_id );

    if (masterShiftId === null) {

        return null;

    }

    var masterCalendarRow = calendarCollection.getByShiftIdAndDate( masterShiftId, row.date );

    if (masterCalendarRow === null) {

        return null;

    }

    return masterCalendarRow.id;

};

/**
 *
 * @method
 * @private
 * @see CalendarCollection.prototype.getByIdCached
 * @param {DB_Calendar} row 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow = function (row) {

    // console.log( 'run' );

    if (this._findMasterCalendarRowBySlaveCalendarRowCache.has(row.id)) {

        // console.log( 'cache hit' );

        return this._findMasterCalendarRowBySlaveCalendarRowCache.get(row.id);

    }

    if (row.hasOwnProperty('_pondMasterRow') === false) {

        this._findMasterCalendarRowBySlaveCalendarRowCache.set(row.id, null);

        return null;

    }

    if (row._pondMasterRow === null) {

        this._findMasterCalendarRowBySlaveCalendarRowCache.set(row.id, null);

        return null;

    }

    this._findMasterCalendarRowBySlaveCalendarRowCache.set(row.id, this.todayCalendarRows.getByIdCached(row._pondMasterRow));

    return this._findMasterCalendarRowBySlaveCalendarRowCache.get(row.id);

};

/**
 * @see TimetablesCollection.prototype.getWeekendIds
 * @todo sto payload
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Boolean}
 */
RosterEngine.prototype._employeeHasExcludedWeekendsFromHisPreferences = function (employee) {

    // console.log( 'run' );

    if (employee.hasOwnProperty('_employeeHasExcludedWeekendsFromHisPreferences')) {

        return employee._employeeHasExcludedWeekendsFromHisPreferences;

    }

    var weekendTimetableIds = this.timetables.getWeekendIds();

    var found = false;

    for (let node of this.employeePreferences) {

        if (node.employee_id === employee.id && weekendTimetableIds.includes(node.timetable_id)) {

            found = true;

            break;

        }

    }

    // if found it means a preference is found, so he hasnt excluded weekend shifts
    if (found === true) {

        employee._employeeHasExcludedWeekendsFromHisPreferences = false;

        return false;

    } else {

        employee._employeeHasExcludedWeekendsFromHisPreferences = true;

        return true;

    }

};

/**
 * @see TimetablesCollection.prototype.getNightIds
 * @todo sto payload
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Boolean} 
 */
RosterEngine.prototype._employeeHasExcludedNightsFromHisPreferences = function (employee) {

    // console.log( 'run' );

    var nightTimetableIds = this.timetables.getNightIds();

    var found = false;

    for (let node of this.employeePreferences) {

        if (node.employee_id === employee.id && nightTimetableIds.includes(node.timetable_id)) {

            found = true;

            break;

        }

    }

    // if found it means a preference is found, so he hasnt excluded weekend shifts
    if (found === true) {

        return false;

    } else {

        return true;

    }

};

/**
 * @see DB_Role.prototype.getPoolsByPreference
 * @see RolesCollection.prototype.getByIdCached
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {PoolsCollection}
 */
RosterEngine.prototype._getPoolsForCalendarRow = function (calendar_row) {

    // console.log( 'run' );

    var role = this.roles.getByIdCached(calendar_row.role_id);

    if (role === null) {

        return new PoolsCollection([]);

    }

    return role.getPoolsByPreference(this.pools, this.junctionRolePool);

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @returns {Boolean}
 */
RosterEngine.prototype._employee_wants_to_go_to_shift = function (employee, calendarRow) {

    return employee._shiftPreferences[calendarRow.shift_weekday][calendarRow._timeBracket];

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 */
RosterEngine.prototype._can_employee_fill_this_shift_no_rules_sm = function (employee, calendarRow) {

    for (const poolId of employee._poolIds) {

        for (const pool of calendarRow._pools) {

            if (pool.id === poolId) {

                return true;

            }

        }

    }

    return false;

};

/**
 * @todo na balw gia expluded night shift kai excluded weekend preferences
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @param {Boolean} flag_11HoursAreConsidered 
 * @returns {Boolean|Number}
 */
RosterEngine.prototype._can_employee_fill_this_shift_rules_only_sm = function (employee, calendarRow, flag_11HoursAreConsidered = true, flag_return_code = false) {

    let code = this.bitflags.GOOD;

    // @todo make this return an integer with one being true and all other integers being a code for what went wrong
    // eg 10 worked previous night, 100 working next day and this being a nightshift, and so on.
    if (employee._leaves.hasDate(calendarRow.date)) {
        
        if (flag_return_code == true) {

            code |= this.bitflags.IS_ON_LEAVE;

        } else {

            return false;

        }

    }

    const todayDate = calendarRow.date;
    const previousDate = lib_getDateByIntegerOffset(todayDate, -1);
    const nextDate = lib_getDateByIntegerOffset(todayDate, 1);

    let nightShiftDistancePast = Infinity;
    let nightShiftDistanceFuture = Infinity;
    // @todo use the various groupings for nightshifts and weekends stored on augmented employees
    const tempCollection = employee._shifts_worked.concatCollection(
        employee._current_set_shifts.concatCollection(
            employee._current_provisionally_set_shifts.concatCollection(
                employee._future_set_shifts
            )
        )
    );
    // this handles the case that the employee has excluded nightshifts or weekends
    if (
        !this._employee_wants_to_go_to_shift(employee, calendarRow) &&
        (
            calendarRow.isNightShift() ||
            calendarRow.isWeekendShift()
        )
    ) {

        if (flag_return_code == true) {

            code |= this.bitflags.HARD_SHIFT_EXCLUSION;

        } else {

            return false;

        }
    
    }

    if ( calendarRow.shift_weekday == 7 ) {

        let holiday_name = this.holidays.getNameByDate( calendarRow.date );

        if(
            this._is_employee_available_for_holiday(
                employee,
                holiday_name,
                lib_extractYearFromDateString( calendarRow.date )
            ) == false
        ) {

            if (flag_return_code == true) {

                code |= this.bitflags.HOLIDAY_ANAVAILABILITY;

            } else {

                return false;

            }

        }

    }

    // @todo make distinction between preset rows that exclude and 
    // provional rows that exclude
    for (const row of tempCollection) {

        if (row.date === todayDate) {

            if (flag_return_code == true) {

                code |= this.bitflags.WORKS_SAME_DAY;

            } else {

                return false;

            }

        }

        if (row.date === previousDate) {

            if (row.isNightShift()) {

                if (flag_return_code == true) {

                    code |= this.bitflags.WORKED_PREVIOUS_NIGHT;

                } else {

                    return false;

                }

            }

        }

        if (flag_11HoursAreConsidered === true && (Math.abs(lib_getHoursBetweenShifts(row, calendarRow)) < 11)) {

            if (flag_return_code == true) {

                code |= this.bitflags.LESS_THAN_11_HOURS;

            } else {

                return false;

            }

        }

        if (row.date === nextDate && calendarRow.isNightShift()) {

            if (flag_return_code == true) {

                code |= this.bitflags.WORKS_NEXT_DAY_AND_NIGHTSHIFT;

            } else {

                return false;

            }

        }

        if (row.date < calendarRow.date) {

            if (row.isNightShift() && calendarRow.isNightShift()) {

                if (lib_datesDifferenceInDays(row.date, calendarRow.date) < nightShiftDistancePast) {

                    nightShiftDistancePast = lib_datesDifferenceInDays(row.date, calendarRow.date);

                }

            }

        }

        if (row.date > calendarRow.date) {

            if (row.isNightShift() && calendarRow.isNightShift()) {

                if (lib_datesDifferenceInDays(calendarRow.date, row.date) < nightShiftDistanceFuture) {

                    nightShiftDistanceFuture = lib_datesDifferenceInDays(calendarRow.date, row.date);

                }

            }

        }

        if (nightShiftDistancePast < this.DISTANCE_FROM_NIGHT || nightShiftDistanceFuture < this.DISTANCE_FROM_NIGHT) {

            if (flag_return_code == true) {

                code |= this.bitflags.UNACCEPTABLE_NYX_SCORE;

            } else {

                return false;

            }

        }

        if (row.isWeekendShift() && calendarRow.isWeekendShift()) {

            const dist = lib_calculateWeekendsDistance(row, calendarRow);

            if (dist > 0 && dist < this.DISTANCE_FROM_WEEKEND) {

                if (flag_return_code == true) {

                    code |= this.bitflags.UNACCEPTABLE_SKO_SCORE;

                } else {

                    return false;

                }

            }

        }

    }

    if (flag_return_code == true) {

        return code;

    } else {

        return true;

    }

};

/**
 * 
 * @param {EmployeesCollection} employees_collection 
 * @param {CalendarCollection} rows_collection 
 * @returns {void}
 */
RosterEngine.prototype._calculate_and_store_eligibility_on_rows_sm = function (employees_collection, rows_collection) {
    /**
    * @todo: remove willing with rules and without rules can_employee_fill_this_shift
    * must be called before each assignment to be up to date  
    **/
    for (const row of rows_collection) {

        row._eligibleEmployeesWithRules = new EmployeesCollection([]);
        row._eligibleEmployeesWithoutRules = new EmployeesCollection([]);

        for (const employee of employees_collection) {

            if (this._can_employee_fill_this_shift_no_rules_sm(employee, row)) {

                if (this._can_employee_fill_this_shift_rules_only_sm(employee, row, true)) {

                    row._eligibleEmployeesWithRules.push(employee);

                }

                row._eligibleEmployeesWithoutRules.push(employee);

                if (this._employee_wants_to_go_to_shift(employee, row)) {

                    row._willingEmployeesWithoutRules.push(employee);

                } else {

                    row._unwillingEmployeesWithoutRules.push(employee);

                }

            }

        }

    }

};

/**
 * @IMPORTANT this is probably useless, the algorithm goes over the
 * eligible employees before rules are applied and applies them adhoc
 * @param {CalendarCollection} rows_collection 
 * @returns {void}
 */
RosterEngine.prototype._cull_eligibility_on_rows_sm = function (rows_collection) {
    for (const row of rows_collection) {

        let culled_employees = new EmployeesCollection([]);

        for (const employee of row._eligibleEmployeesWithRules) {

            if (!this._can_employee_fill_this_shift_rules_only_sm(employee, row, true)) {

                culled_employees.push(employee);

            }
        }
        for (const employee of culled_employees) {

            row._eligibleEmployeesWithRules.removeById(employee.id);

        }
    }
};

RosterEngine.prototype.filter_eligible_employees = function (row, exclude_unwilling = true) {

    if (exclude_unwilling) {

        row._capableAndWilling = new EmployeesCollection([]);

    } else {

        /**
         * @todo: employees with rules goes here if ever implemented
         */

    }

    for (let employee of row._eligibleEmployeesWithoutRules) {

        if (
            this._can_employee_fill_this_shift_rules_only_sm(employee, row) == true
            && this._employee_wants_to_go_to_shift(employee, row) == true
        ) {

            if (exclude_unwilling) {

                if (this._employee_wants_to_go_to_shift(employee, row) == true) {

                    row._capableAndWilling.push(employee);

                }

            } else {

                /**
                 * @todo: employees with rules goes here if ever implemented
                 */

            }

        }

    }

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {String} dateString 
 * @returns {Float}
 */
RosterEngine.prototype.calculate_employee_weekend_nightshift_weight_before_date = function( employee, dateString ) {

    let weight = 0.0;

    for ( let weekend_shift of employee._all_weekends ) {

        if ( weekend_shift.isNightShift() && weekend_shift.date < dateString ) {

            if ( weekend_shift._isAPondShift && !weekend_shift._isAPondMasterShift ) {

                if ( weekend_shift.pond_master_row != null ) {

                    if ( weekend_shift.pond_master_row.employee_id == employee.id ) {

                        continue;

                    }

                }

            }

            weight += weekend_shift.shift_weight;

        }

    }

    // console.log( 'weight: ' + weight + ' employee.getInveteracyCoefficient(): ' + employee.getInveteracyCoefficient() );

    // if ( isNaN( weight ) ) {

    //     console.log( 'weight is NaN' );
    //     console.log( structuredClone( employee ) );

    // }

    return weight * employee.getInveteracyCoefficient();

};

/**
 * @see DB_Calendar.prototype.isEverydayShift @noncachable
 * @see DB_Calendar.prototype.isEveningShift @cached
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.isWeekendShift @cached
 * @see DB_Calendar.prototype.isMorningShift @cached
 * @see DB_Calendar.prototype.isHolidayShift @noncachable
 * @see CalendarCollection.prototype.getAllForEmployeeId because it only runs once per day
 * @method
 * @private
 * @param {EmployeesCollection} employees
 * @param {CalendarCollection} olderCalendarRows
 * @param {CalendarCollection} futureCalendarRows
 * @param {CalendarCollection} currentCalendarRows
 * @returns {void}
 */
RosterEngine.prototype._augmentPayloadEmployees = function (employees, olderCalendarRows, futureCalendarRows, currentCalendarRows) {

    /**
     * this block allocates the _hard_shift_weight to all employees
     */
    for (let employee of employees) {

        employee._all_weekends = new CalendarCollection([]);
        employee._weekends_worked = new CalendarCollection([]);//is this used in any states? use in can employee fill shift and assignment
        employee._shifts_worked = olderCalendarRows.getAllForEmployeeId(employee.id);
        employee._nights_worked = new CalendarCollection([]);
        employee._future_set_shifts = futureCalendarRows.getAllForEmployeeId(employee.id);
        employee._future_set_nights = new CalendarCollection([]);
        employee._future_provisional_nights = new CalendarCollection([]);
        employee._future_set_weekends = new CalendarCollection([]);
        employee._future_provisional_weekends = new CalendarCollection([]);
        employee._current_set_shifts = currentCalendarRows.getAllForEmployeeId(employee.id);
        employee._current_set_nights = new CalendarCollection([]);
        employee._current_set_weekends = new CalendarCollection([]);
        employee._current_provisional_nights = new CalendarCollection([]);
        employee._current_provisional_weekends = new CalendarCollection([]);
        employee._current_provisionally_set_shifts = new CalendarCollection([]);
        employee._leaves = this.leaves.getByEmployeeId(employee.id);
        employee._poolIds = this.pools.getByEmployee(employee, this.junctionEmployeePool);
        employee._shiftPreferences = this.employeePreferences.getArrayForEngine(employee.id, this.timetables);
        employee._holidays_worked = {};

        // for (let row of employee._shifts_worked) {
        for ( let row of olderCalendarRows ) {

            if ( row.employee_id !== employee.id ) {

                continue;

            }

            if (row.isNightShift()) {

                employee._nights_worked.push(row);

            }

            if (row.isWeekendShift()) {

                // console.log( 'pushed row:' );
                // console.log( structuredClone( row ) );
                // console.log( row );

                employee._weekends_worked.push(row);
                employee._all_weekends.push(row);

                // console.log( structuredClone( row ) );

                // console.log( structuredClone( employee._all_weekends ) );
                // console.log( employee._all_weekends );

            }


        }

        // for (let row of employee._future_set_shifts) {
        for ( let row of futureCalendarRows ) {

            if ( row.employee_id !== employee.id ) {

                continue;

            }

            if (row.isNightShift()) {

                employee._future_set_nights.push(row);

            }

            if (row.isWeekendShift()) {

                // console.log( 'pushed row:' );
                // console.log( structuredClone( row ) );
                // console.log( row );

                employee._future_set_weekends.push(row);
                employee._all_weekends.push(row);

            }

        }

        // for (let row of employee._current_set_shifts) {
        for ( let row of currentCalendarRows ) {

            if ( row.employee_id !== employee.id ) {

                continue;

            }

            if (row.isNightShift()) {

                employee._current_set_nights.push(row);

            }

            if (row.isWeekendShift()) {

                // console.log( 'pushed row:' );
                // console.log( structuredClone( row ) );
                // console.log( row );

                employee._current_set_weekends.push(row);
                employee._all_weekends.push(row);

            }

        }

    }

};

/**
 * @see HolidaysCollection.prototype.getNameByDate @cached
 * @see HolidaysCollection.prototype.getPreviousHolidayDate @cached
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._get_source_holiday_date_by_date = function (dateString) {

    let holiday_name = this.holidays.getNameByDate(dateString);

    return this.holidays.getPreviousHolidayDate(dateString, this.holiday_connections[holiday_name]);

}

/**
 * 
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} row 
 * @param {CalendarCollection} rowCollection 
 * @param {'both'|'backwards'|'forwards'} direction 
 */
RosterEngine.prototype._check_linkage_integrity = function (employee, row, rowCollection, direction = 'both') {

    /**
     * @question what happens if in the past this encounters a filled shift
     * @todo nake the algorithm stop after going back 2 shifts in the past
     * or maybe if it encounters a past filled shift in the chain and the
     * employee is different return false and request to fill all the chain
     * with the previous employee 
     */

    let linkTarget = null;
    let linkSource = null;

    if (row._linkSourceRow != null) {

        linkSource = rowCollection.getById(row._linkSourceRow);
        // console.log(structuredClone(linkSource));

    }

    if (row._linkTargetRow != null) {

        linkTarget = rowCollection.getById(row._linkTargetRow);
        // console.log(structuredClone(linkTarget));

    }

    if (direction == 'both') {

        if (linkSource != null) {

            if (this._check_linkage_integrity(employee, linkSource, rowCollection, 'backwards') == false) {
                // console.warn("integrity failure backwards");
                return false;

            }

        }

        if (linkTarget != null) {

            if (this._check_linkage_integrity(employee, linkTarget, rowCollection, 'forwards') == false) {
                // console.warn("integrity failed forwards");
                return false;

            }

        }

        return true;

    } else if (direction == 'backwards') {

        if (row.isFilled()) {

            if (row.employee_id == employee.id) {

                return true;

            } else {

                return false;

            }

        }

        if (this._can_employee_fill_this_shift_no_rules_sm(employee, row) == false) {

            return false;

        }

        if (this._can_employee_fill_this_shift_rules_only_sm(employee, row) == false) {

            return false;

        }

        if (linkSource != null) {

            if (this._check_linkage_integrity(employee, linkSource, rowCollection, 'backwards') == false) {

                return false;

            }

        }

        return true;

    } else if (direction == 'forwards') {

        let this_link_is_filled_with_the_same_employee = false;

        if (row.isFilled()) {

            if (row.employee_id == employee.id) {

                this_link_is_filled_with_the_same_employee = true;

            } else {

                return false;

            }

        }

        if (this_link_is_filled_with_the_same_employee == false) {
            // console.warn('not the same employee filling shift');
            if (this._can_employee_fill_this_shift_no_rules_sm(employee, row) == false) {

                return false;

            }

            if (this._can_employee_fill_this_shift_rules_only_sm(employee, row) == false) {

                return false;

            }

            // console.warn('employee passed all tests for linkages');

        }

        if (linkTarget != null) {

            if (this._check_linkage_integrity(employee, linkTarget, rowCollection, 'forwards') == false) {

                return false;

            }

        }

        return true;

    }

    return false;

};

/**
 * 
 * @param {DB_Calendar} row 
 * @param {CalendarCollection} rowCollection 
 * @param {String} direction 
 * @returns {CalendarCollection | null}
 */
RosterEngine.prototype.get_linked_chain = function (row, rowCollection, direction = "both") {

    let linked_chain = new CalendarCollection([]);

    let link_target = null;
    let link_source = null;

    if (row._linkSourceRow != null) {

        link_source = rowCollection.getById(row._linkSourceRow);

    }

    if (row._linkTargetRow != null) {

        link_target = rowCollection.getById(row._linkTargetRow);

    }

    if ( direction == "both" ) {

        if ( link_source != null ) {

            linked_chain = this.get_linked_chain( link_source, rowCollection, "backwards" );

        }

        linked_chain.push(row);

        if (link_target != null) {

            linked_chain = linked_chain.concatCollection(

                this.get_linked_chain( link_target, rowCollection, "forwards" )

            );

        }

        return linked_chain;

    } else if ( direction == "backwards" ) {

        if ( link_source != null ) {

            linked_chain = this.get_linked_chain( link_source, rowCollection, "backwards" )

        }

        linked_chain.push( row )

        return linked_chain;

    } else if ( direction == "forwards" ) {

        linked_chain.push(row);

        if (link_target != null) {

            linked_chain = linked_chain.concatCollection(

                this.get_linked_chain( link_target, rowCollection, "forwards" )

            );

        }

        return linked_chain;

    }

    return null;

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {CalendarCollection} rowCollection 
 * @returns {Boolean}
 */
RosterEngine.prototype.check_chain_willingness = function (employee, rowCollection) {

    for ( let row of rowCollection ) {

        if ( !this._employee_wants_to_go_to_shift(employee,row) ) {

            return false;

        }

    }

    return true;

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {CalendarCollection} rowCollection 
 * @returns {Boolean}
 */
RosterEngine.prototype.check_chain_integrity = function (employee, rowCollection) {

    for ( let row of rowCollection ) {

        if ( row.isFilled() ) {

            if ( row.employee_id == employee.id ) {

                continue;

            } else {

                return false;

            }

        }

        if ( !this._can_employee_fill_this_shift_no_rules_sm( employee,row ) ) {

            return false;

        }

        if ( !this._can_employee_fill_this_shift_rules_only_sm( employee, row ) ) {

            return false;

        }

    }

    return true;

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {CalendarCollection} rowCollection 
 */
RosterEngine.prototype.fill_chain = function (employee, rowCollection) {

    for ( let row of rowCollection ) {

        if ( !row.isFilled() ) {

            this._allocate( employee, row );

        }

    }

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} row 
 * @param {CalendarCollection} rowCollection 
 * @param {'both'|'backwards'|'forwards'} direction 
 */
RosterEngine.prototype.fill_chained_links = function (employee, row, rowCollection, direction = 'both') {

    let linkTarget = null;
    let linkSource = null;

    if (row._linkSourceRow != null) {

        linkSource = rowCollection.getById(row._linkSourceRow);

    }

    if (row._linkTargetRow != null) {

        linkTarget = rowCollection.getById(row._linkTargetRow);

    }

    if (direction == 'both') {

        let backwards_sucess = true;
        let forwards_success = true;

        if (linkSource != null) {

            backwards_sucess = this.fill_chained_links(employee, linkSource, rowCollection, 'backwards');

        }

        if (linkTarget != null) {

            forwards_success = this.fill_chained_links(employee, linkTarget, rowCollection, 'forwards');

        }

        if (backwards_sucess && forwards_success) {

            return true;

        } else {

            return false;

        }

    } else if (direction == 'backwards') {

        if (row.isFilled()) {

            // @todo reached a filled part of the chain. this generally shouldn't happen so log it.
            // console.warn("found filled row going backwards on a linked chain. aborting the chain");

            if (row.employee_id == employee.id) {

                return true;

            }

            return false;

        }

        if (linkSource != null) {

            if (!this.fill_chained_links(employee, linkSource, rowCollection, 'backwards')) {

                return false;

            }

        }

        this._allocate(employee, row);
        return true;

    } else if (direction == 'forwards') {

        if (row.isFilled()) {
            // checking if the filled row has the same employee we carry. if not aborting and logging
            if (row.employee_id != employee.id) {

                // console.warn("found filled row going forwards on a linked chain that doesn't match the given employee. aborting the chain");
                return false;
            }

            return true;

        }

        if (linkTarget != null) {

            if (!this.fill_chained_links(employee, linkTarget, rowCollection, 'forwards')) {

                return false;

            }

        }

        this._allocate(employee, row);
        return true;

    }

};

/**
 * 
 * @param {Object} scores_a 
 * @param {Object} scores_b 
 * @param {Object} scores_a_type2 
 * @param {Object} scores_b_type2 
 * @param {Number} type1_deviation_multiplier 
 */
RosterEngine.prototype.compare_deviations = function (
    scores_a,
    scores_b,
    scores_a_type2 = null,
    scores_b_type2 = null,
    type1_deviation_multiplier = 1
) {

    let type1_deviations = this._get_deviations(
        scores_a,
        scores_b
    );

    let a_type1_positive_deviation = type1_deviations.a_positive;
    let a_type1_negative_deviation = type1_deviations.a_negative;
    let b_type1_positive_deviation = type1_deviations.b_positive;
    let b_type1_negative_deviation = type1_deviations.b_negative;

    if (scores_a_type2 != null && scores_b_type2 != null) {

        let type2_deviations = this._get_deviations(
            scores_a_type2,
            scores_b_type2
        );

        let a_type2_positive_deviation = type2_deviations.a_positive;
        let a_type2_negative_deviation = type2_deviations.a_negative;
        let b_type2_positive_deviation = type2_deviations.b_positive;
        let b_type2_negative_deviation = type2_deviations.b_negative;

        if (
            a_type2_negative_deviation + a_type1_negative_deviation *
            type1_deviation_multiplier > b_type2_negative_deviation +
            b_type1_negative_deviation * type1_deviation_multiplier
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had a less negative sko deviation"
            // );
            return "a";

        }

        if (
            a_type2_negative_deviation + a_type1_negative_deviation *
            type1_deviation_multiplier < b_type2_negative_deviation +
            b_type1_negative_deviation * type1_deviation_multiplier
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had a more negative sko deviation"
            // );
            return "b";

        }

        if (
            a_type1_positive_deviation > b_type1_positive_deviation
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had a more positive sko deviation"
            // );
            return "a";

        }

        if (
            a_type1_positive_deviation < b_type1_positive_deviation
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had a less positive sko deviation"
            // );
            return "b";

        }

        if (
            a_type2_positive_deviation > b_type2_positive_deviation
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had a more positive nyx deviation"
            // );
            return "a";

        }

        if (
            a_type2_positive_deviation < b_type2_positive_deviation
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had a less positive nyx deviation"
            // );
            return "b";

        }

        if (
            scores_a_type2.average_score == Infinity ||
            scores_a.average_score == Infinity
        ) {

            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had equal nyx and sko deviations" + 
            //     " but he had never worked a nightshift or a weekend before"
            // );
            return "a";

        }

        if (
            scores_b_type2.average_score == Infinity ||
            scores_b.average_score == Infinity
        ) {
            // console.log(
            //     structuredClone(selected_employee.getFullname()) + " was swapped for "
            //      + structuredClone(employee.getFullname()) +
            //     ", because he had equal nyx and sko deviations" + 
            //     " but he had worked atleast a nightshift and a weekend before" +
            //     " and the other guy hadn't"
            // );
            return "b";

        }

        return "inconclussive";

    } else {

        if (a_type1_negative_deviation > b_type1_negative_deviation) {

            // console.log(
            //     structuredClone(employee_a.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee_b.getFullname()) +
            //     ", because he had a less negative sko deviation"
            // );
            return "a";
        }

        if (a_type1_negative_deviation < b_type1_negative_deviation) {

            // console.log(
            //     structuredClone(employee_a.getFullname()) + " was swapped for "
            //      + structuredClone(employee_b.getFullname()) +
            //     ", because he had a more negative sko deviation"
            // );
            return "b";

        }

        if (
            a_type1_positive_deviation > b_type1_positive_deviation
        ) {

            // console.log(
            //     structuredClone(employee_a.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee_b.getFullname()) +
            //     ", because he had a more positive sko deviation"
            // );
            return "a";

        }

        if (
            a_type1_positive_deviation < b_type1_positive_deviation
        ) {

            // console.log(
            //     structuredClone(employee_a.getFullname()) + " was swapped for "
            //      + structuredClone(employee_b.getFullname()) +
            //     ", because he had a less positive sko deviation"
            // );
            return "b";

        }

        if (scores_a.average_score == Infinity) {

            // console.log(
            //     structuredClone(employee_a.getFullname()) + " was NOT swapped for "
            //      + structuredClone(employee_b.getFullname()) +
            //     ", because he had equal sko deviation" + 
            //     " but he had never worked a weekend before"
            // );
            return "a";

        }

        if (scores_b.average_score == Infinity) {
            // console.log(
            //     structuredClone(employee_a.getFullname()) + " was swapped for "
            //      + structuredClone(employee_b.getFullname()) +
            //     ", because he had equal sko deviation" + 
            //     " but he had worked atleast a weekend before" +
            //     " and the other guy hadn't"
            // );
            return "b";

        }

        return "inconclussive";
    }

};

/**
 * 
 * @param {Object} scores_a 
 * @param {Object} scores_b 
 * @returns 
 */
RosterEngine.prototype._get_deviations = function (
    scores_a,
    scores_b
) {

    let a_score = scores_a.dates_and_scores_associative_array[scores_a.proposed_date];

    let a_future_score = -1;

    if (scores_a.date_after_proposed != null) {

        a_future_score = scores_a.dates_and_scores_associative_array[scores_a.date_after_proposed];

    }

    let b_score = scores_b.dates_and_scores_associative_array[scores_b.proposed_date];

    let b_future_score = -1;

    if (scores_b.date_after_proposed != null) {

        b_future_score = scores_b.dates_and_scores_associative_array[
            scores_b.date_after_proposed
        ];

    }

    let a_positive_deviation = Infinity;
    let b_positive_deviation = Infinity;

    let a_negative_deviation = 0;
    const desired_a_score = scores_a.desired_score;
    // console.log( 'desired_a_score: ' + structuredClone( desired_a_score ) );
    // console.log( 'a_score: ' + structuredClone( a_score ) );
    // console.log( 'a_future_score: ' + structuredClone( a_future_score ) );
    if (a_score > 0) {

        if (a_score < desired_a_score) {

            a_negative_deviation += a_score - desired_a_score;

        } else {

            if (a_positive_deviation == Infinity) {
                a_positive_deviation = 0;
            }

            a_positive_deviation += a_score - desired_a_score;

        }

    }

    if (a_future_score > 0) {

        if (a_future_score < desired_a_score) {

            a_negative_deviation += a_future_score - desired_a_score;

        } else {

            if (a_positive_deviation == Infinity) {
                a_positive_deviation = 0;
            }

            //a_positive_deviation += a_future_score - desired_a_score;

        }

    }

    let b_negative_deviation = 0
    const desired_b_score = scores_b.desired_score;
    // console.log( 'desired_b_score: ' + structuredClone( desired_b_score ) );
    // console.log( 'b_score: ' + structuredClone( b_score ) );
    // console.log( 'b_future_score: ' + structuredClone( b_future_score ) );
    if (b_score > 0) {

        if (b_score < desired_b_score) {

            b_negative_deviation += b_score - desired_b_score;

        } else {

            if (b_positive_deviation == Infinity) {
                b_positive_deviation = 0;
            }

            b_positive_deviation += b_score - desired_b_score;

        }

    }

    if (b_future_score > 0) {

        if (b_future_score < desired_b_score) {

            b_negative_deviation += b_future_score - desired_b_score;

        } else {

            if (b_positive_deviation == Infinity) {
                b_positive_deviation = 0;
            }

            //b_positive_deviation += b_future_score - desired_b_score;

        }

    }

    return {
        'a_negative': a_negative_deviation,
        'a_positive': a_positive_deviation,
        'b_negative': b_negative_deviation,
        'b_positive': b_positive_deviation
    };

};

/**
 * 
 * @param {Object} a_scores 
 * @param {Object} b_scores 
 * @param {Object} a_scores_type2 
 * @param {Object} b_scores_type2 
 * @param {Number} type1_multiplier 
 * @returns {String} "a" | "b" | "inconclussive"
 */
RosterEngine.prototype.compare_trajectories = function (
    a_scores,
    b_scores,
    a_scores_type2 = null,
    b_scores_type2 = null,
    type1_multiplier = 1
) {

    let trajectories = this._get_trajectories(a_scores, b_scores);

    if (a_scores_type2 != null && b_scores_type2 != null) {

        let trajectories2 = this._get_trajectories(a_scores_type2, b_scores_type2);

        trajectories.a *= type1_multiplier;
        trajectories.a += trajectories2.a;
        trajectories.b *= type1_multiplier;
        trajectories.b += trajectories2.b;

    }

    if (trajectories.a > trajectories.b) {

        return "a";

    }

    if (trajectories.a < trajectories.b) {

        return "b";

    }

    return "inconclussive";

};

RosterEngine.prototype._get_trajectories = function (a_scores, b_scores) {

    let a_trajectory = 0;
    let b_trajectory = 0;

    if (a_scores.proposed_average_score >= a_scores.desired_score) {

        if (a_scores.average_score >= a_scores.desired_score) {
            //stay up
            a_trajectory += 2;

        } else {
            //go up
            a_trajectory += 3;

        }

    } else {

        if (a_scores.average_score >= a_scores.desired_score) {
            //go down
            a_trajectory += 0;

        } else {
            //stay down
            a_trajectory += 1;

        }

    }

    if (b_scores.proposed_average_score >= b_scores.desired_score) {

        if (b_scores.average_score >= b_scores.desired_score) {
            //stay up
            b_trajectory += 2;

        } else {
            //go up
            b_trajectory += 3;

        }

    } else {

        if (b_scores.average_score >= b_scores.desired_score) {
            //go down
            b_trajectory += 0;

        } else {
            //stay down
            b_trajectory += 1;

        }

    }

    return {
        'a': a_trajectory,
        'b': b_trajectory
    };

};

RosterEngine.prototype.compare_heat = function (
    a_scores,
    b_scores,
    a_scores_type2 = null,
    b_scores_type2 = null,
    type1_multiplier = 1
) {

    let heats = this._get_heats(a_scores, b_scores);

    if (a_scores_type2 != null && b_scores_type2 != null) {

        let heats2 = this._get_heats(a_scores_type2, b_scores_type2);

        heats.a *= type1_multiplier;
        heats.a += heats2.a;
        heats.b *= type1_multiplier;
        heats.b += heats2.b;

    }

    if (heats.a > heats.b) {

        return "a";

    }

    if (heats.a < heats.b) {

        return "b";

    }

    return "inconclussive";

};

RosterEngine.prototype._get_heats = function (
    a_scores,
    b_scores
) {
    let a_heat = 0;
    let b_heat = 0;

    if (
        Math.abs(
            a_scores.proposed_average_score - a_scores.desired_score
        ) < Math.abs(
            a_scores.average_score - a_scores.desired_score
        )
    ) {
        //better
        a_heat += 4;

    } else if (

        Math.abs(
            a_scores.proposed_average_score - a_scores.desired_score
        ) == Math.abs(
            a_scores.average_score - a_scores.desired_score
        )

    ) {
        //same
        a_heat += 2;

    } else {
        //worse
        a_heat += 0;

    }

    if (
        Math.abs(
            b_scores.proposed_average_score - b_scores.desired_score
        ) < Math.abs(
            b_scores.average_score - b_scores.desired_score
        )
    ) {
        //better
        b_heat += 4;

    } else if (

        Math.abs(
            b_scores.proposed_average_score - b_scores.desired_score
        ) == Math.abs(
            b_scores.average_score - b_scores.desired_score
        )

    ) {
        //same
        b_heat += 2;

    } else {
        //worse
        b_heat += 0;

    }

    return {
        'a': a_heat,
        'b': b_heat
    };

};

RosterEngine.prototype.compare_absolute_proposed_deviations = function (
    a_scores,
    b_scores,
    a_scores_type2 = null,
    b_scores_type2 = null,
    type1_multiplier = 1
) {

    let proposed_absolute_distances = this._get_absolute_proposed_distances(a_scores, b_scores);

    if (a_scores_type2 != null && b_scores_type2 != null) {

        let proposed_absolute_distances2 = this._get_absolute_proposed_distances(a_scores_type2, b_scores_type2);

        proposed_absolute_distances.a *= type1_multiplier;
        proposed_absolute_distances.a += proposed_absolute_distances2.a;
        proposed_absolute_distances.b *= type1_multiplier;
        proposed_absolute_distances.b += proposed_absolute_distances2.b;

    }

    if (proposed_absolute_distances.a <= proposed_absolute_distances.b) {

        return "a";

    } else {

        return "b";

    }

};

RosterEngine.prototype._get_absolute_proposed_distances = function (
    a_scores,
    b_scores
) {

    return {
        'a': Math.abs(a_scores.proposed_average_score - a_scores.desired_score),
        'b': Math.abs(b_scores.proposed_average_score - b_scores.desired_score)
    };

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {String} holiday_name 
 * @param {Number} year 
 * @returns 
 */
RosterEngine.prototype._is_employee_available_for_holiday = function (employee, holiday_name, year = -1) {

    if (year < 0) {

        return true;

    }

    if (holiday_name == null) {

        return true;

    }

    let blocking_holiday_name = this.holiday_connections[holiday_name];
    let blocking_year_offsets = this.holiday_yearly_offsets[holiday_name];

    if( Object.hasOwn(employee._holidays_worked,blocking_holiday_name) ) {

        for (let blocking_offset of blocking_year_offsets) {

            let blocking_year = blocking_offset + year;

            if (employee._holidays_worked[blocking_holiday_name].includes(blocking_year)){

                return false;

            }

        }

    } else {

        return true;

    }

    return true;

};

/**
 * @see DB_Employee.prototype.getFullname @cached
 * @see DB_Calendar.prototype.isLinkedTargetShift @cached
 * @see DB_Calendar.prototype.isFilled @noncachable
 * @see DB_Calendar.prototype.isLinkedSourceShift @cached
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.isNecessary @noncachable
 * @see DB_Calendar.prototype.isNotFilled @noncachable
 * @see DB_Calendar.prototype.isPondSlave @cached
 * @see DB_Calendar.prototype.isUnnecessary @noncachable
 * @see DB_Calendar.prototype.isPondMaster @cached
 * @see HolidaysCollection.prototype.getNameByDate @cached
 * @see EmployeesCollection.prototype.getById @noncachable
 * @see EmployeesCollection.prototype.removeById @noncachable
 * @see CalendarCollection.prototype.concatCollection
 * @see CalendarCollection.prototype.sortByEligibleEmployeesAsc
 * @see CalendarCollection.prototype.removeById @noncachable
 * @see RosterEngine.prototype._allocate
 * @see RosterEngine.prototype._autofill_future_nightshifts
 * @see RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow
 */
RosterEngine.prototype.calculate = function () {

    this.allRowsTemp = this.olderCalendarRows.concatCollection(this.currentCalendarRows.concatCollection(this.futureCalendarRows));

    let payload = new Object();
    payload['nextState'] = null;
    payload['mostRecentLinkages'] = new CalendarCollection([]);
    payload['unwillingRows'] = new CalendarCollection([]);
    payload['willingness'] = true;
    payload['linkage'] = true;
    payload['holidayLoop'] = true;
    // payload['holidayLoop'] = false;
    payload['necessary'] = true;
    payload['pastRows'] = this.olderCalendarRows;
    payload['currentRows'] = this.currentCalendarRows;
    payload['futureRows'] = this.futureCalendarRows;
    payload['allRows'] = this.olderCalendarRows.concatCollection(this.currentCalendarRows.concatCollection(this.futureCalendarRows));
    payload['employees'] = this.employees;
    payload['weekends'] = {};
    payload['fridayNightWeight'] = this.settings.nightParaskeuiVariant;
    payload['saturdayNightWeight'] = this.settings.nightSavvatoVariant;
    payload['sundayNightWeight'] = this.settings.nightKyriakiVariant;

    this._augmentPayloadEmployees(payload.employees, payload.pastRows, payload.futureRows, payload.currentRows);
    this._augmentPayloadCalendarRows(payload.currentRows, payload.allRows, payload.employees, this.fromDate);
    // debugger;
    for (let row of payload.pastRows) {
        row.is_past = true;
        row.is_current = false;
        row.is_future = false;
    }
    for (let row of payload.currentRows) {
        row.is_past = false;
        row.is_current = true;
        row.is_future = false;
    }
    for (let row of payload.futureRows) {
        row.is_past = false;
        row.is_current = false;
        row.is_future = true;
    }

    for (let row of payload.allRows) {

        // console.log( 'entered payload.allRows' );

        if (row.isWeekendShift()) {

            // console.log( 'entered row.isWeekendShift' );

            let found_weekend = null;
            for (let weekend_key in payload.weekends) {

                let weekend = payload.weekends[ weekend_key ];

                if (weekend.contains_date(row.date)) {

                    // console.log( 'found the weekend' );

                    found_weekend = weekend;
                    break;

                }

            }

            if (found_weekend != null) {

                // console.log( 'pushing on found_weekend.push(row)' );

                found_weekend.push(row);

            } else {

                // console.log( 'didnt find the weekend, creating new' );

                let weekend_start = this.get_weekend_start(row);
                let weekend_end = this.get_weekend_end(row);

                if ( typeof weekend_start !== 'string' || typeof weekend_end !== 'string' ) {

                    // console.log( 'bad day format' );
                    // console.log( typeof weekend_start === 'string' );
                    // console.log( weekend_start instanceof String );
                    // console.log( structuredClone( weekend_start ) );
                    // console.log( structuredClone( weekend_end ) );

                    continue;

                }

                // console.log( 'cerating new weekend' );

                found_weekend = new Weekend(weekend_start, weekend_end);
                payload.weekends[found_weekend.name] = found_weekend;
                found_weekend.push(row);


            }

            // console.log( 'assigning weekend id to row' );

            row.weekend_id = found_weekend.name;

        }

    }

    payload['startingDate'] = this.fromDate;
    payload['endingDate'] = this.untilDate;

    /**
    * @todo: must include willingness status in the payload
    * start with willing and make a second pass after the first with unwilling employees
    **/

    // payload['empty_pond_slave_rows'] = empty_pond_slave_rows;
    // payload['empty_unnecessary_rows'] = empty_unnecessary_rows;
    // payload['all_empty_rows'] = all_empty_rows;
    payload['engine'] = this;
    payload['testString'] = 'Test Start';

    let initial_state = new FillLinkedTargetsState();
    // let initial_state = new FillWeekendNighshiftsState();

    let state_machine_instance = new Machine();
    state_machine_instance.payload = payload;

    state_machine_instance.run_from_state(initial_state);

    // const employeeToCheck = this.employees.getById( 161 );
    // const dateString = '2026-09-27';
    // console.log( structuredClone( this._get_employee_nyx_scores_by_date( employeeToCheck, dateString ) ) );
    // console.log( structuredClone( this._get_employee_sko_scores_by_date( employeeToCheck, dateString ) ) );

};








class Weekend {

    /**
     * 
     * @param {String} from_date 
     * @param {String} to_date 
     */

    constructor(from_date, to_date) {

        this.name = from_date + "-" + to_date;
        this.start = from_date;
        this.end = to_date;
        this.rows = new CalendarCollection([]);

    }

    /**
     * 
     * @param {String} date 
     * @returns {Boolean}
     */
    contains_date(date) {

        if (date >= this.start && date <= this.end) {

            return true;

        }

        return false;

    }

    /**
     * 
     * @param {DB_Calendar} row 
     */
    push(row) {

        this.rows.push(row);

    }

};
