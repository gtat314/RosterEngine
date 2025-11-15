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
     * @type {CalendarCollection}
     */
    this.todayCalendarRows = null;

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

};

/**
 * @method
 * @public
 * @param {Object} settings 
 * @returns {void}
 */
RosterEngine.prototype.set_settings = function( settings ) {

    this.settings = new DB_Settings().hydrate( settings );

};

/**
 * @method
 * @public
 * @param {Object} todayCalendarRows 
 * @returns {void}
 */
RosterEngine.prototype.set_todayCalendarRows = function( todayCalendarRows ) {

    this._allocations = [];
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
RosterEngine.prototype.save = function( callbackFunc ) {

    if ( this._allocations.length > 0 ) {

        new Relay( 'POST', '/api/calendar/automatic-allocations/', {
            'allocations': this._allocations
        }).call( function(){

            callbackFunc();

        });

    } else {

        callbackFunc();

    }

};




/**
 * @method
 * @private
 * @returns {void}
 */
RosterEngine.prototype._augmentEmployees = function() {

    /**
     * this block allocates the _hard_shift_weight to all employees
     */
    for ( employee of this.employees ) {

        employee._hard_shift_weight = 0;

        var previousCalendarShiftsThisEmployeeHasWorkedFor = this.olderCalendarRows.getAllForEmployeeId( employee.id );

        for ( let calendarRow of previousCalendarShiftsThisEmployeeHasWorkedFor ) {

            if ( calendarRow.isEverydayShift() ) {

                if ( calendarRow.isEveningShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'eveningVariant' );

                } else if ( calendarRow.isNightShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'nightVariant' );

                }

            } else if ( calendarRow.isWeekendShift() ) {

                if ( calendarRow.isMorningShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'morningSkVariant' );

                } else if ( calendarRow.isEveningShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'eveningSkVariant' );

                } else if ( calendarRow.isNightShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'nightSkVariant' );

                }

            } else if ( calendarRow.isHolidayShift() ) {

                if ( calendarRow.isMorningShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'morningHolidayVariant' );

                } else if ( calendarRow.isEveningShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'eveningHolidayVariant' );

                } else if ( calendarRow.isNightShift() ) {

                    employee._hard_shift_weight += this.settings.getFloat( 'nightHolidayVariant' );

                }

            }

        }

    }

    /**
     * this block allocates the _lastAttendance property to all employees in the format of '2025-11-25 14:00'
     */
    for ( employee of this.employees ) {

        employee._lastAttendance = this.olderCalendarRows.getLastAttendanceForEmployee( employee.id );

    }

    /**
     * this block keeps only the employees that are not on leave today
     */
    var availableEmployees = this.employees.getWithoutLeaveForDate( this.todayCalendarRows.getElement( 0 ).date, this.leaves );

    /**
     * this block removes all employees that the day before were on a night shift
     */
    this._removeEmployeesThatHadANightShiftTheDayBefore( availableEmployees );

    /**
     * this block removes all employees that somehow they were already allocated in a shift today
     */
    this._removeEmployeesThatAlreadyFillAShiftToday( availableEmployees );

    return availableEmployees;

};

/**
 * @method
 * @public
 * @param {CalendarCollection} calendarCollection 
 * @param {EmployeesCollection} employeeCollection
 * @returns {void}
 */
RosterEngine.prototype._augmentCalendarRows = function( calendarCollection, employeeCollection ) {

    for ( let row of calendarCollection ) {

        row._isAPondShift = false;
        row._isAPondMasterShift = false;
        row._pondMasterRow = null;
        row._pond = null;
        row._isALinkedShift = false;
        row._isALinkedTargetShift = false;
        row._linkSourceRow = null;

    }

    for ( let row of calendarCollection ) {

        if ( row.shift_id !== null ) {

            let shift = this.shifts.getById( row.shift_id );

            if ( shift !== null ) {

                row._isALinkedShift = this.shifts.isLinkedShift( row.shift_id );

            }

        }

    }

    for ( let row of calendarCollection ) {

        if ( row._isALinkedShift ) {

            row._isALinkedTargetShift = this.shifts.isLinkedTargetShift( row.shift_id );

        }

    }

    for ( let row of calendarCollection ) {

        if ( row._isALinkedShift && row._isALinkedTargetShift ) {

            var targetShift = this.shifts.getById( row.shift_id );

            if ( targetShift === null ) { continue; }

            var sourceShift = this.shifts.getById( targetShift.propagate_from_shift_id );

            if ( sourceShift === null ) { continue };

            var sourceCalendarRow = this._getMostRecentCalendarShift( row.date, sourceShift.id );

            if ( sourceCalendarRow === null ) { continue; }

            row._linkSourceRow = sourceCalendarRow.id;

        }

    }

    for ( let row of calendarCollection ) {

        if ( row.shift_id !== null ) {

            let shift = this.shifts.getById( row.shift_id );

            if ( shift !== null ) {

                let pondRow = this.shiftPonds.getPondByShiftId( row.shift_id );

                if ( pondRow !== null ) {

                    row._isAPondShift = true;

                }

            }

        }

    }

    for ( let row of calendarCollection ) {

        if ( row._isAPondShift ) {

            row._isAPondMasterShift = this.shiftPonds.isPondMasterShift( row.shift_id );

        }

    }

    for ( let row of calendarCollection ) {

        if ( row._isAPondShift ) {

            let pondRow = this.shiftPonds.getPondByShiftId( row.shift_id );

            if ( pondRow !== null ) {

                row._pond = pondRow.pond_id;

            }

        }

    }

    for ( let row of calendarCollection ) {

        if ( row._isAPondShift && row._isAPondMasterShift === false ) {

            row._pondMasterRow = this._getMasterCalendarRowIdBySlaveCalendarRow( row );

        }

    }

    for ( let row of calendarCollection ) {

        let eligibleEmployeesNum = 0;

        let role = this.roles.getById( row.role_id );

        let pools = this.junctionRolePool.getPoolsForRoleId( role.id, this.pools );

        if ( pools !== null ) {

            let uniqueEmployees = this.junctionEmployeePool.getUniqueEmployeesInPools( pools, this.employees );

            if ( uniqueEmployees !== null ) {

                for ( let employee of uniqueEmployees ) {

                    let result = employeeCollection.getById( employee.id );

                    if ( result !== null ) {

                        eligibleEmployeesNum++;

                    }

                }

            }

        }

        row._eligibleEmployeesNum = eligibleEmployeesNum;

    }

    calendarCollection.sortByEligibleEmployees();

};

/**
 * @method
 * @private
 * @param {String} startStr YYYY-MM-DD hh:mm
 * @param {String} endStr YYYY-MM-DD hh:mm
 * @returns {Number|null} integer
 */
RosterEngine.prototype_getHoursBetween = function( startStr, endStr ) {

    // basic type check
    if ( typeof startStr !== 'string' || typeof endStr !== 'string' ) {

        return null;

    }

    var formatRe = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

    if ( formatRe.test( startStr ) === false || formatRe.test( endStr ) === false ) {

        return null;

    }

    function parseDateTime( s ) {

        if ( typeof s !== 'string' ) {

            return null;

        }

        var parts = s.split( ' ' );

        if ( parts.length !== 2 ) {

            return null;

        }

        var dateParts = parts[ 0 ].split( '-' );
        var timeParts = parts[ 1 ].split( ':' );

        if ( dateParts.length !== 3 || timeParts.length !== 2 ) {

            return null;

        }

        var y = Number( dateParts[ 0 ] );
        var m = Number( dateParts[ 1 ] );
        var d = Number( dateParts[ 2 ] );
        var hh = Number( timeParts[ 0 ] );
        var mm = Number( timeParts[ 1 ] );

        if ( Number.isInteger( y ) === false || Number.isInteger( m ) === false || Number.isInteger( d ) === false || Number.isInteger( hh ) === false || Number.isInteger( mm ) === false ) {

            return null;

        }

        if ( m < 1 || m > 12 || hh < 0 || hh > 23 || mm < 0 || mm > 59 ) {

            return null;

        }

        // construct local Date (year, monthIndex, day, hours, minutes)
        var dt = new Date( y, m - 1, d, hh, mm, 0, 0 );

        // verify constructed date matches parts (catches invalid day like 2025-02-30)
        if ( dt.getFullYear() !== y || dt.getMonth() !== ( m - 1 ) || dt.getDate() !== d || dt.getHours() !== hh || dt.getMinutes() !== mm ) {

            return null;

        }

        return dt;

    }

    var d1 = parseDateTime( startStr );
    var d2 = parseDateTime( endStr );

    if ( d1 === null || d2 === null ) {

        return null;

    }

    if ( d1.getTime() > d2.getTime() ) {

        return null;

    }

    var diffMs = d2.getTime() - d1.getTime();
    var hours = Math.floor( diffMs / ( 1000 * 60 * 60 ) );

    return hours;

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
 * @param {EmployeesCollection} employees 
 * @returns {void}
 */
RosterEngine.prototype._removeEmployeesThatAlreadyFillAShiftToday = function( employees ) {

    for ( var row of this.todayCalendarRows ) {

        if ( row.employee_id !== null ) {

            employees.removeById( row.employee_id );

        }

    }

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
 * @returns {Number|null}
 */
RosterEngine.prototype._getMasterCalendarRowIdBySlaveCalendarRow = function( row ) {

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

    return masterCalendarRow.id;

};

/**
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow = function( row ) {

    if ( row.hasOwnProperty( '_pondMasterRow' ) === false ) {

        return null;

    }

    if ( row._pondMasterRow === null ) {

        return null;

    }

    return this.todayCalendarRows.getById( row._pondMasterRow );

};




RosterEngine.prototype.calculate = function() {

    /**
     * this block doesnt change, we get rid from available employees,
     * whoever is on leave or has worked a night shift the previous day
     * also whoever employee is already assigned, either manually or anyway else, is removed from employees that are available to work today
     */
    let employees = this._augmentEmployees();

    /**
     * this is mainly a helper function
     * but among other things it also assigns a number of eligible employees for each shift and sorts the today's rows in an ascending order
     */
    this._augmentCalendarRows( this.todayCalendarRows, employees ); console.log( structuredClone( this.todayCalendarRows ) );

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

        if ( todayCalendarRow.isLinkedTargetShift() ) {

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
     * BLOCK 4: fill necessay shifts that are also night shifts as well, first and foremost
     * FOR every row in the calendar rows for this day
     *  IF this row is necessary AND night
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

        if ( todayCalendarRow.isNecessary() && todayCalendarRow.isNightShift() ) {

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            if ( todayCalendarRow.isPondSlave() ) { continue; }

            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

            if ( associatedEmployees === null ) { continue; }

            let selectedEmployee = associatedEmployees.getElement( 0 );

            this._fillCalendarRowWithEmployee( selectedEmployee, todayCalendarRow );

            employees.removeById( selectedEmployee.id );

        }

    }

    /**
     * BLOCK 5: fill necessay shifts
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

            if ( todayCalendarRow.isPondSlave() ) { continue; }

            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

            if ( associatedEmployees === null ) { continue; }

            let selectedEmployee = associatedEmployees.getElement( 0 );

            this._fillCalendarRowWithEmployee( selectedEmployee, todayCalendarRow );

            employees.removeById( selectedEmployee.id );

        }

    }

    /**
     * BLOCK 6: fill necessary pond (slave) shifts that their masters have been filled in step 4 or has been manually set before
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

        if ( todayCalendarRow.isNecessary() && todayCalendarRow.isPondSlave() ) {

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
     * BLOCK 7: fill unnecessary pond (master) shifts
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

        if ( todayCalendarRow.isUnnecessary() && todayCalendarRow.isPondMaster() ) {

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
     * BLOCK 8: fill unnecessary pond (slave) shifts
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

        if ( todayCalendarRow.isUnnecessary() && todayCalendarRow.isPondSlave() ) {

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
     * BLOCK 9: fill shifts that belong in a pond and a slave is filled but the master is not.
     * fill the master and then any other slave shifts in this pond that are also not filled
     * FOR every shift in the calendar rows for this day
     *  IF this shift is a pond slave AND is also somehow filled either manually or automatically
     *      extract the employee info that filled that slave shift
     *      extract the pond master shift from today's rows
     *      IF no pond master shift is found, for reasons i cant even begin to fathom, abandon everything and move on to the next today's shift
     *      IF a pond master shift is found and it is NOT filled
     *          fill the pond master shift with the employee we extracted previously
     *      extract all pond slave shifts from today's rows that are in the same pond with the shift we are currently handling
     *      remove from these pond slave shifts, the very pond slave shift we are currently handling. this is mainly for peace of mind, i think we dont have to
     *      FOR every pond slave shift extracted previously
     *          IF this pond slave shift is somehow filled, either automatically or manually, abort and move on to the next pond slave shift
     *          fill the pond slave shift with the employee we extracted in the beginning of this block
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isPondSlave() && todayCalendarRow.isFilled() ) {

            let employeeDerivedFromSlaveRow = this.employees.getById( todayCalendarRow.employee_id );

            let masterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( masterCalendarRow === null ) { continue; }

            if ( masterCalendarRow.isNotFilled() ) {

                this._fillCalendarRowWithEmployee( employeeDerivedFromSlaveRow, masterCalendarRow );

            }

            let samePondSlaveCalendarRows = this.todayCalendarRows.getAllSlavesForPond( todayCalendarRow._pond );

            samePondSlaveCalendarRows.removeById( todayCalendarRow.id );

            for ( let slaveRow of samePondSlaveCalendarRows ) {

                if ( slaveRow.isFilled() ) { continue; }

                this._fillCalendarRowWithEmployee( employeeDerivedFromSlaveRow, slaveRow );

            }

        }

    }

    /**
     * BLOCK 10: fill unnecessary shifts
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

        if ( todayCalendarRow.isManuallySet() ) { continue; }

        if ( todayCalendarRow.isFilled() ) { continue; }

        let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

        if ( associatedEmployees === null ) { continue; }

        let selectedEmployee = associatedEmployees.getElement( 0 );

        this._fillCalendarRowWithEmployee( selectedEmployee, todayCalendarRow );

        employees.removeById( selectedEmployee.id );

    }

    // console.log( this._allocations );

};