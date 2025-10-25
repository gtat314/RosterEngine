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

    this.todayCalendarRows = new CalendarCollection( rows );

};

/**
 * @method
 * @public
 * @param {Object} calendar 
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
RosterEngine.prototype._allocateEmployeeToTodayShift = function( employee, calendarRow ) {

    this._allocations.push({
        'id': calendarRow.id,
        'employee_id': employee.id,
        'employee_name': employee.getFullname()
    });

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
 * @param {DB_Calendar} todayCalendarRow 
 * @param {EmployeesCollection} availableEmployees
 * @returns {DB_Employee}
 */
RosterEngine.prototype._findEmployeeBySourceShift = function( todayCalendarRow, availableEmployees ) {

    var linkedTargetShift = this.shifts.getById( todayCalendarRow.shift_id );

    var linkedSourceShiftId = linkedTargetShift.propagate_from_shift_id;

    var olderCalendarRow = this._getMostRecentCalendarShift( todayCalendarRow.date, linkedSourceShiftId );

    if ( olderCalendarRow !== null ) {

        if ( olderCalendarRow.employee_id !== null ) {

            var employee = availableEmployees.getById( olderCalendarRow.employee_id );

            if ( employee !== null ) {

                return employee;

            }

        }

    }

    return null;

};




RosterEngine.prototype.calculate = function() {

    /**
     * first, keep in the entire scope, only the employees that are not in any kind of leave for today
     */
    let employees = this.employees.getWithoutLeaveForDate( this.todayCalendarRows.getElement( 0 ).date, this.leaves );

    /**
     * second, iterate over all available shifts for today, and check if any of them is manually set with an employee, by a user of the app
     * if we find manually set shifts, remove their assigned employee from the employees array we have in ram
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.is_manually_set === 1 ) {

            employees.removeById( todayCalendarRow.employee_id );

        }

    }

    /**
     * third, iterate over all available shifts for today, that are marked as necessary, meaning they have a slots_min value of non zero
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.is_necessary === 1 ) {

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case, move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( todayCalendarRow.is_manually_set === 1 ) { continue; }

            /**
             * load the role data from the role table, using the role_id of the calendar row
             */
            let role = this.roles.getById( todayCalendarRow.role_id );

            /**
             * load the pools that can accomodate this role, sorted by their sort_index in ascending order
             */
            let pools = this.junctionRolePool.getPoolsForRoleId( role.id, this.pools );

            /**
             * If no pools found for this role, no employee can be assigned,
             * so there is no reason to waste any more time with this shift
             */
            if ( pools === null ) { continue; }

            /**
             * load all employees with their data from the employees table, that belong to the pools we deduced previously
             */
            let associatedEmployees = this.junctionEmployeePool.getUniqueEmployeesInPools( pools, employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             */
            if ( associatedEmployees === null ) { continue; }

            /**
             * If this shift is a linked shift, and specifically a target shift, meaning it should be automatically filled by the same employee that filled another shift a previous day
             * try to find which employee was assigned to that source shift, if any
             * and if such employee exists AND is also among the associatedEmployees we deduced earlier
             * assign this employee and move on to the next today's shift
             */
            if ( todayCalendarRow.isLinkedTargetShift( this.shifts ) === true ) {

                let employeeToAssign = this._findEmployeeBySourceShift( todayCalendarRow, associatedEmployees );

                if ( employeeToAssign !== null ) {

                    this._allocateEmployeeToTodayShift( employeeToAssign, todayCalendarRow );
                    employees.removeById( employeeToAssign.id );

                    continue;

                }

            }

            /**
             * we have a winner for this shift! of course for now this is a placeholder, and much more brain power needs to be consumed on this point
             */
            let selectedEmployee = associatedEmployees.getElement( 0 );

            /**
             * we have assign our winner to the shift
             * and we remove him from the employees collection we have in ram
             */
            this._allocateEmployeeToTodayShift( selectedEmployee, todayCalendarRow );
            employees.removeById( selectedEmployee.id );

        }

    }

    /**
     * fourth, iterate over all today's shifts working on the ones that are not considered necessary
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.is_necessary !== 1 ) {

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( todayCalendarRow.is_manually_set === 1 ) { continue; }

            /**
             * load the role data from the role table, using the role_id of the calendar row
             */
            let role = this.roles.getById( todayCalendarRow.role_id );

            /**
             * load the pools that can accomodate this role, sorted by their sort_index in ascending order
             */
            let pools = this.junctionRolePool.getPoolsForRoleId( role.id, this.pools );

            /**
             * If no pools found for this role, no employee can be assigned,
             * so there is no reason to waste any more time with this shift
             */
            if ( pools === null ) { continue; }

            /**
             * load all employees with their data from the employees table, that belong to the pools we deduced previously
             */
            let associatedEmployees = this.junctionEmployeePool.getUniqueEmployeesInPools( pools, employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             * or that all employees have been assigned to the previously necessary shifts
             */
            if ( associatedEmployees === null ) { continue; }

            /**
             * If this shift is a linked shift, and specifically a target shift, meaning it should be automatically filled by the same employee that filled another shift a previous day
             * try to find which employee was assigned to that source shift, if any
             * and if such employee exists AND is also among the associatedEmployees we deduced earlier
             * assign this employee and move on to the next today's shift
             */
            if ( todayCalendarRow.isLinkedTargetShift( this.shifts ) === true ) {

                let employeeToAssign = this._findEmployeeBySourceShift( todayCalendarRow, associatedEmployees );

                if ( employeeToAssign !== null ) {

                    this._allocateEmployeeToTodayShift( employeeToAssign, todayCalendarRow );
                    employees.removeById( employeeToAssign.id );

                    continue;

                }

            }

            /**
             * we have a winner for this shift! of course for now this is a placeholder, and much more brain power needs to be consumed on this point
             */
            let selectedEmployee = associatedEmployees.getElement( 0 );

            /**
             * we have assign our winner to the shift
             * and we remove him from the employees collection we have in ram
             */
            this._allocateEmployeeToTodayShift( selectedEmployee, todayCalendarRow );
            employees.removeById( selectedEmployee.id );

        }

    }

    console.log( this._allocations );

};