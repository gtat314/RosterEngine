function RosterEngine() {

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.olderCalendarRows = null;

    /**
     * @property
     * @public
     * @type {DepartmentsCollection}
     */
    this.departments = null;

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
     * @type {RosterCalendarInput[]}
     */
    this.inputs = [];

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.todayCalendarRows = null;

    /**
     * @property
     * @public
     * @type {RosterCalendar}
     */
    this.calendarView = null;

    /**
     * @property
     * @private
     * @type {Object[]}
     */
    this._allocations = [];

};

/**
 * @method
 * @public
 * @param {RosterCalendar} rosterCalendar 
 * @returns {void}
 */
RosterEngine.prototype.set_inputs = function( rosterCalendar ) {

    this.inputs = rosterCalendar.getInputs();

    this.calendarView = rosterCalendar;

    this.calendarView.progressModal.setSteps( this.inputs.length );
    this.calendarView.progressModal.setSubtitle( 'Εντοπίστηκαν 230 βάρδιες' );

    var rows = [];

    for ( var input of this.inputs ) {

        rows.push( input.calendar );

    }

};

/**
 * @method
 * @public
 * @param {Object} todayCalendarRows 
 * @returns {void}
 */
RosterEngine.prototype.set_todayCalendarRows = function( todayCalendarRows ) {

    this.todayCalendarRows = new CalendarCollection( todayCalendarRows );

};

/**
 * @method
 * @public
 * @param {Object} calendar 
 * @returns {void}
 */
RosterEngine.prototype.set_calendar = function( calendar ) {

    this.olderCalendarRows = new CalendarCollection( calendar );

};

/**
 * @method
 * @public
 * @param {Object} departments 
 */
RosterEngine.prototype.set_departments = function( departments ) {

    this.departments = new DepartmentsCollection( departments );

};

/**
 * @method
 * @public
 * @param {Object} employees 
 */
RosterEngine.prototype.set_employees = function( employees ) {

    this.employees = new EmployeesCollection( employees );

};

/**
 * @method
 * @public
 * @param {Object} employeePreferences 
 */
RosterEngine.prototype.set_employeePreferences = function( employeePreferences ) {

    this.employeePreferences = new EmployeePreferenceTimetableCollection( employeePreferences );

};

/**
 * @method
 * @public
 * @param {Object} holidays 
 */
RosterEngine.prototype.set_holidays = function( holidays ) {

    this.holidays = new HolidaysCollection( holidays );

};

/**
 * @method
 * @public
 * @param {Object} linksEmployeePool 
 */
RosterEngine.prototype.set_linksEmployeePool = function( linksEmployeePool ) {

    this.junctionEmployeePool = new JunctionEmployeePool( linksEmployeePool );

};

/**
 * @method
 * @public
 * @param {Object} linksRolePool 
 */
RosterEngine.prototype.set_linksRolePool = function( linksRolePool ) {

    this.junctionRolePool = new JunctionRolePool( linksRolePool );

};

/**
 * @method
 * @public
 * @param {Object} leaves 
 */
RosterEngine.prototype.set_leaves = function( leaves ) {

    this.leaves = new LeavesCollection( leaves );

};

/**
 * @method
 * @public
 * @param {Object} pools 
 */
RosterEngine.prototype.set_pools = function( pools ) {

    this.pools = new PoolsCollection( pools );

};

/**
 * @method
 * @public
 * @param {Object} roles 
 */
RosterEngine.prototype.set_roles = function( roles ) {

    this.roles = new RolesCollection( roles );

};

/**
 * @method
 * @public
 * @param {Object} shifts 
 */
RosterEngine.prototype.set_shifts = function( shifts ) {

    this.shifts = new ShiftsCollection( shifts );

};

/**
 * @method
 * @public
 * @param {Object} shiftPonds 
 */
RosterEngine.prototype.set_shiftPonds = function( shiftPonds ) {

    this.shiftPonds = new ShiftPondCollection( shiftPonds );

};

/**
 * @method
 * @public
 * @param {Object} timetables 
 */
RosterEngine.prototype.set_timetables = function( timetables ) {

    this.timetables = new TimetablesCollection( timetables );

};

/**
 * @method
 * @public
 * @description this is a helper function for getting some data for UI info client side, and bears no weight in the engine whatsoever
 * @returns {Number}
 */
RosterEngine.prototype.get_employeesWithoutLeaveForDate = function() {

    var employees = this.employees.getWithoutLeaveForDate( this.todayCalendarRows.getElement( 0 ).date, this.leaves );

    this._removeEmployeesThatHadANightShiftTheDayBefore( employees );

    return employees.length;

};

/**
 * @method
 * @public
 * @returns {void}
 */
RosterEngine.prototype.save = function() {

    this.calendarView.progressModal.setSubtitle( 'Αποθήκευση βαρδιών' );

    if ( this._allocations.length > 0 ) {

        new Relay( 'POST', '/api/calendar/automatic-allocations/', {
            'allocations': this._allocations
        }).call( function(){

            setTimeout( function(){

                window.location.reload();

            }, 500);

        });

    } else {

        window.location.reload();

    }

};




/**
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @returns {void}
 */
RosterEngine.prototype._fillCalendarRowWithEmployee = function( employee, calendarRow ) {

    this._allocations.push({
        'id': calendarRow.id,
        'employee_id': employee.id,
        'employee_name': employee.getFullname()
    });

    calendarRow.employee_id = employee.id;
    calendarRow.employee_name = employee.getFullname();

};

/**
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._getPreviousDate = function( dateString ) {

    var date = new Date( dateString );

    date.setDate( date.getDate() - 1 );

    var year = date.getFullYear();
    var month = String( date.getMonth() + 1 ).padStart( 2, '0' );
    var day = String( date.getDate() ).padStart( 2, '0' );

    var formatted = year + '-' + month + '-' + day;

    return formatted;

};

/**
 * 
 * @param {String} currentDateStr YYYY-MM-DD
 * @param {Number} shiftId 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._getMostRecentCalendarShift = function( currentDateStr, shiftId ) {

    var previousDateString = this._getPreviousDate( currentDateStr );

    for ( var i = 0 ; i < 7 ; i++ ) {

        var olderCalendarRow = this.olderCalendarRows.getByDateAndShiftId( previousDateString, shiftId );

        if ( olderCalendarRow === null ) {

            previousDateString = this._getPreviousDate( previousDateString );

        } else {

            return olderCalendarRow;

        }

    }

    return null;

};

/**
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._findEmployeeThatFilledTheSourceShiftUsingTargetShift = function( row ) {

    if ( row.shift_id === null ) { return null; }

    var targetShift = this.shifts.getById( row.shift_id );

    if ( targetShift.propagate_from_shift_id === null ) { return null; }

    var sourceShift = this.shifts.getById( targetShift.propagate_from_shift_id );

    var sourceCalendarRow = this._getMostRecentCalendarShift( row.date, sourceShift.id );

    if ( sourceCalendarRow === null ) { return null; }

    if ( sourceCalendarRow.employee_id === null ) { return null; }

    return this.employees.getById( sourceCalendarRow.employee_id );

};

/**
 * 
 * @param {EmployeesCollection} employees 
 * @param {String} currentDate YYYY-MM-DD
 */
RosterEngine.prototype._removeEmployeesThatHadANightShiftTheDayBefore = function( employees ) {

    var previousDateString = this._getPreviousDate( this.todayCalendarRows.getElement( 0 ).date );

    var previousDateCalendarRows = this.olderCalendarRows.getAllByDate( previousDateString );

    for ( var row of previousDateCalendarRows ) {

        if ( row.shift_times === '21:00-07:00' && row.employee_id !== null ) {

            employees.removeById( row.employee_id );

        }

    }

};

/**
 * @method
 * @private
 * @returns {EmployeesCollection}
 * @description helper function to make the code more readable
 */
RosterEngine.prototype._removeEmployeesWhoAreOnLeaveToday = function() {

    return this.employees.getWithoutLeaveForDate( this.todayCalendarRows.getElement( 0 ).date, this.leaves );

};

/**
 * @method
 * @private
 * @param {DB_Calendar} calendarRow 
 * @param {EmployeesCollection} employees 
 * @returns {EmployeesCollection|null}
 * @description load the role data from the role table, using the role_id of the calendar row
 *              load the pools that can accomodate this role, sorted by their sort_index in ascending order
 *              If no pools found for this role, no employee can be assigned, so there is no reason to waste any more time with this shift
 *              load all employees with their data from the employees table, that belong to the pools we deduced previously
 */
RosterEngine.prototype._getAssociatedEmployeesForCalendarRow = function( calendarRow, employees ) {

    var role = this.roles.getById( calendarRow.role_id );

    var pools = this.junctionRolePool.getPoolsForRoleId( role.id, this.pools );

    if ( pools === null ) {

        return null;

    }

    return this.junctionEmployeePool.getUniqueEmployeesInPools( pools, employees );

};

/**
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @return {Boolean}
 */
RosterEngine.prototype._rowIsATargetShift = function( row ) {

    return row.isLinkedTargetShift( this.shifts );

};

/**
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {EmployeesCollection} employees 
 * @returns {Boolean}
 */
RosterEngine.prototype._employeeExistsInAvailableEmployees = function( employee, employees ) {

    if ( employee === null ) {

        return false;

    }

    var result = employees.getById( employee.id );

    if ( result === null ) {

        return false;

    }

    return true;

};

/**
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {Boolean}
 */
RosterEngine.prototype._rowIsAPondSlaveShift = function( row ) {

    var shiftId = row.shift_id;

    if ( shiftId === null ) {

        return false;

    }

    return this.shiftPonds.isPondSlaveShift( shiftId );

};

/**
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {Boolean}
 */
RosterEngine.prototype._rowIsAPondMasterShift = function( row ) {

    var shiftId = row.shift_id;

    if ( shiftId === null ) {

        return false;

    }

    return this.shiftPonds.isPondMasterShift( shiftId );

};

/**
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow = function( row ) {

    if ( row.shift_id === null ) {

        return null;

    }

    var pondRow = this.shiftPonds.getPondByShiftId( row.shift_id );

    if ( pondRow === null ) {

        return null;

    }

    var masterShiftId = this.shiftPonds.getMasterShiftIdForPondId( pondRow.pond_id );

    if ( masterShiftId === null ) {

        return null;

    }

    var masterCalendarRow = this.todayCalendarRows.getByShiftId( masterShiftId );

    if ( masterCalendarRow === null ) {

        return null;

    }

    return masterCalendarRow;

};




/**
 * @todo perhaps we should check of the available employees, which ones have already filled rows for today manually and remove them from available employees?
 *          but then what if an employee was set manually in a pond shift, meaning he is typically still available to fill more shifts today?
 */
RosterEngine.prototype.calculate = function() {

    /**
     * this block doesnt change, we get rid from available employees,
     * whoever is on leave or has worked a night shift the previous day
     */
    let employees = this._removeEmployeesWhoAreOnLeaveToday();
    this._removeEmployeesThatHadANightShiftTheDayBefore( employees );

    /**
     * BLOCK 1, 2, 3: handle the linked target shifts
     * FOR every row in the calendar rows for this day
     *  IF this row corresponds to a shift that is a linked target one
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      find the employee the filled the linked source shift
     *      IF this employee exists in the employees subset we deduced earlier by discrading the ones on leave
     *          fill this calendar row with this employee
     *          remove this employee from the available employees we have for filling today's shifts
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( this._rowIsATargetShift( todayCalendarRow ) ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let employeeThatFilledTheSourceShift = this._findEmployeeThatFilledTheSourceShiftUsingTargetShift( todayCalendarRow );

            if ( this._employeeExistsInAvailableEmployees( employeeThatFilledTheSourceShift, employees ) ) {

                this._fillCalendarRowWithEmployee( employeeThatFilledTheSourceShift, todayCalendarRow );
                employees.removeById( employeeThatFilledTheSourceShift.id );

            }

        }

    }

    /**
     * BLOCK 4: fill necessay shifts
     * FOR every row in the calendar rows for this day
     *  IF this row is necessary
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      IF today's shift is a pond slave shift, move on to the next calendar row
     *      find employees that are available today and eligible to fill this role
     *      IF noone is found, move on to the next calendar row
     *      plainly select the first random employee to fill this today's shift
     *      fill this calendar row with this employee
     *      remove this employee from the available employees we have for filling today's shifts
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isNecessary() ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            if ( this._rowIsAPondSlaveShift( todayCalendarRow ) ) { continue; }

            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

            if ( associatedEmployees === null ) { continue; }

            let selectedEmployee = associatedEmployees.getElement( 0 );

            this._fillCalendarRowWithEmployee( selectedEmployee, todayCalendarRow );

            employees.removeById( selectedEmployee.id );

        }

    }

    /**
     * BLOCK 5: fill necessary pond (slave) shifts that their masters have been filled in step 4 or has been manually set before
     * FOR every row in the calendar rows for this day
     *  IF this row is necessary AND IF today's shift is a pond slave shift
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      find the pond master shift for today
     *      IF for some reason we cant even fathom at this point there is no pond master, move on to the next calendar row
     *      IF the pond master shift for today is not filled, either manually or automatically, move on to the next calendar row
     *      find the employee that filled the pond master shift for today
     *      fill this calendar row with this employee 
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isNecessary() && this._rowIsAPondSlaveShift( todayCalendarRow ) ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let todayMasterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( todayMasterCalendarRow === null ) { continue; }

            if ( todayMasterCalendarRow.isFilled() === false ) { continue; }

            let employeeThatFilledTheMasterCalendarRow = this.employees.getById( todayMasterCalendarRow.employee_id );

            this._fillCalendarRowWithEmployee( employeeThatFilledTheMasterCalendarRow, todayCalendarRow );

        }

    }

    /**
     * BLOCK 6: fill unnecessary pond (master) shifts
     * FOR every row in the calendar rows for this day
     *  IF this row is un-necessary AND also a pond master
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      find employees that are available today and eligible to fill this role
     *      IF noone is found, move on to the next calendar row
     *      plainly select the first random employee to fill this today's shift
     *      fill this calendar row with this employee
     *      remove this employee from the available employees we have for filling today's shifts
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isUnnecessary() && this._rowIsAPondMasterShift( todayCalendarRow ) ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

            if ( associatedEmployees === null ) { continue; }

            let selectedEmployee = associatedEmployees.getElement( 0 );

            this._fillCalendarRowWithEmployee( selectedEmployee, todayCalendarRow );

            employees.removeById( selectedEmployee.id );

        }

    }

    /**
     * BLOCK 7: fill unnecessary pond (slave) shifts
     * FOR every row in the calendar rows for this day
     *  IF this row is un-necessary AND also a pond slave
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      find the pond master shift for today
     *      IF for some reason we cant even fathom at this point there is no pond master, move on to the next calendar row
     *      IF the pond master shift for today is not filled, either manually or automatically, move on to the next calendar row
     *      find the employee that filled the pond master shift for today
     *      fill this calendar row with this employee 
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isUnnecessary() && this._rowIsAPondSlaveShift( todayCalendarRow ) ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let todayMasterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( todayMasterCalendarRow === null ) { continue; }

            if ( todayMasterCalendarRow.isFilled() === false ) { continue; }

            let employeeThatFilledTheMasterCalendarRow = this.employees.getById( todayMasterCalendarRow.employee_id );

            this._fillCalendarRowWithEmployee( employeeThatFilledTheMasterCalendarRow, todayCalendarRow );

        }

    }

    /**
     * BLOCK 8: fill unnecessary shifts
     * FOR every row in the calendar rows for this day
     *  IF this row is un-necessary AND also a pond slave
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      find employees that are available today and eligible to fill this role
     *      IF noone is found, move on to the next calendar row
     *      plainly select the first random employee to fill this today's shift
     *      fill this calendar row with this employee
     *      remove this employee from the available employees we have for filling today's shifts
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isUnnecessary() ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

            if ( associatedEmployees === null ) { continue; }

            let selectedEmployee = associatedEmployees.getElement( 0 );

            this._fillCalendarRowWithEmployee( selectedEmployee, todayCalendarRow );

            employees.removeById( selectedEmployee.id );

        }

    }

    console.log( this._allocations );

};