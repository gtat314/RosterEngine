function RosterEngine() {

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
    this.futureCalendarRows = null;

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

    /**
     * @property
     * @private
     * @type {Map}
     */
    this._getPreviousDateMap = new Map();

};

RosterEngine.prototype.set_futureRows = function ( rows ) {

    this.futureCalendarRows = new CalendarCollection( rows );

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

    if ( this.employeePreferences === null ) {

        this.employeePreferences = new EmployeePreferenceTimetableCollection( employeePreferences );

    }

};

/**
 * @method
 * @public
 * @param {Object} holidays 
 */
RosterEngine.prototype.set_holidays = function( holidays ) {

    if ( this.holidays === null ) {

        this.holidays = new HolidaysCollection( holidays );

    }

};

/**
 * @method
 * @public
 * @param {Object} linksEmployeePool 
 */
RosterEngine.prototype.set_linksEmployeePool = function( linksEmployeePool ) {

    if ( this.junctionEmployeePool === null ) {

        this.junctionEmployeePool = new JunctionEmployeePool( linksEmployeePool );

    }

};

/**
 * @method
 * @public
 * @param {Object} linksRolePool 
 */
RosterEngine.prototype.set_linksRolePool = function( linksRolePool ) {

    if ( this.junctionRolePool === null ) {

        this.junctionRolePool = new JunctionRolePool( linksRolePool );

    }

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

    if ( this.pools === null ) {

        this.pools = new PoolsCollection( pools );

    }

};

/**
 * @method
 * @public
 * @param {Object} roles 
 */
RosterEngine.prototype.set_roles = function( roles ) {

    if ( this.roles === null ) {

        this.roles = new RolesCollection( roles );

    }

};

/**
 * @method
 * @public
 * @param {Object} shifts 
 */
RosterEngine.prototype.set_shifts = function( shifts ) {

    if ( this.shifts === null ) {

        this.shifts = new ShiftsCollection( shifts );

    }

};

/**
 * @method
 * @public
 * @param {Object} shiftPonds 
 */
RosterEngine.prototype.set_shiftPonds = function( shiftPonds ) {

    if ( this.shiftPonds === null ) {

        this.shiftPonds = new ShiftPondCollection( shiftPonds );

    }

};

/**
 * @method
 * @public
 * @param {Object} timetables 
 */
RosterEngine.prototype.set_timetables = function( timetables ) {

    if ( this.timetables === null ) {

        this.timetables = new TimetablesCollection( timetables );

    }

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

    console.log( this._allocations );

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
 * @runs 116 times / day
 * @see DB_Calendar.prototype.isEverydayShift @notcached
 * @see DB_Calendar.prototype.isMorningShift @cached
 * @see DB_Calendar.prototype.hasDayoffRules @cached
 * @see EmployeesCollection.prototype.removeById
 * @see RosterEngine.prototype._assign_hard_shift
 * @see RosterEngine.prototype._assign_easy_shift
 * @see RosterEngine.prototype._is_the_employee_necessary_for_this_day
 * @see RosterEngine.prototype._getNextDateByDays
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @param {CalendarCollection} calendar_row_collection
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_employee = function( calendar_row, calendar_row_collection ) {

    // console.log( 'run' );

    if ( calendar_row.isEverydayShift() && calendar_row.isMorningShift() ) {

        return this._assign_easy_shift( calendar_row );

    } else {

        if ( calendar_row.hasDayoffRules() ) {

            let copy_of_eligibles = new EmployeesCollection([]);

            for ( let eligible_employee of calendar_row._eligibleEmployees ) {

                copy_of_eligibles.push( eligible_employee );

            }

            for ( let eligible_employee of calendar_row._eligibleEmployees ) {

                // @future_dick na valoume kai to days total
                if (
                    this._is_the_employee_necessary_for_this_day(
                        eligible_employee,
                        this._getNextDateByDays( calendar_row.date, calendar_row._days_after ),
                        calendar_row_collection
                    )
                ) {

                    calendar_row._eligibleEmployees.removeById( eligible_employee.id );

                }

            }

            let found_employee = this._assign_hard_shift( calendar_row );

            if ( found_employee !== null ) {

                return found_employee;

            } else {

                calendar_row._eligibleEmployees = copy_of_eligibles;

                return this._assign_hard_shift( calendar_row );

            }

        } else {

            return this._assign_hard_shift( calendar_row );

        }

    }

};

/**
 * @see EmployeesCollection.prototype.getById
 * @method
 * @private
 * @description if employee given is null, returns false
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendar_row
 * @returns {Boolean}
 */
RosterEngine.prototype._is_employee_necessary_for_this_shift = function( employee, calendar_row ) {

    // console.log( 'run' );

    if ( employee === null ) {

        return false;

    }

    // 1
    if ( calendar_row._eligibleEmployees.getById( employee.id ) === null ) {

        return false;

    }

    if ( calendar_row._eligibleEmployees.length <= this.shift_low_availability_threshold_number ) {

        return true;

    }

    return false;

};

/**
 * @see DB_Calendar.prototype.isNecessary @cached
 * @see RosterEngine.prototype._is_employee_necessary_for_this_shift
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {String} target_date YYYY-MM-DD
 * @param {CalendarCollection} calendar_rows 
 * @returns {Boolean}
 */
RosterEngine.prototype._is_the_employee_necessary_for_this_day = function( employee, target_date, calendar_rows ) {

    // console.log( 'run' );

    if ( ! ( employee instanceof DB_Employee ) ) {

        return false;

    }

    if ( target_date === null ) {

        return false;

    }

    if ( ! ( calendar_rows instanceof CalendarCollection ) || calendar_rows.length === 0 ) {

        return false;

    }

    for ( let row of calendar_rows ) {

        if ( row.date === target_date ) {

            if ( row.isNecessary() ) {

                if ( this._is_employee_necessary_for_this_shift( employee, row ) ) {

                    return true;

                }

            }

        }

    }

    return false;

};





/**
 * @runs 1 time / day
 * @see DB_Calendar.prototype.getPreviousDateBy6Days @notcached
 * @see ShiftsCollection.prototype.getByIdCached
 * @see ShiftsCollection.prototype.isLinkedShift @cached
 * @see ShiftsCollection.prototype.isLinkedTargetShift @cached
 * @see ShiftPondCollection.prototype.isPondMasterShift @cached
 * @see RosterEngine.prototype._getMostRecentCalendarShift
 * @see RosterEngine.prototype._getMasterCalendarRowIdBySlaveCalendarRow
 * @see RosterEngine.prototype._calculate_and_store_eligibility_on_rows
 * @method
 * @public
 * @param {CalendarCollection} calendarCollection edw einai kai oi 97 meres
 * @param {EmployeesCollection} employeeCollection autoi einai OLOI oi ypalliloi
 * @returns {void}
 */
RosterEngine.prototype._augmentCalendarRows = function ( calendarCollection, employeeCollection ) {

    // console.log( 'run' );

    let cutoff_date = this.todayCalendarRows.getElement( 0 ).getPreviousDateBy6Days();
    let dictionary_ponds = {};

    for ( let row of calendarCollection ) {

        if ( row.date < cutoff_date ) {

            continue;

        }

        row._isAPondShift           = false;
        row._isAPondMasterShift     = false;
        row._pondMasterRow          = null;
        row._pond                   = null;
        row._isALinkedShift         = false;
        row._isALinkedTargetShift   = false;
        row._linkSourceRow          = null;
        row._eligibleEmployees      = null;
        row._days_after             = null;
        row._days_total             = null;

        if ( row.shift_id !== null ) {

            let shift = this.shifts.getByIdCached( row.shift_id );

            if ( shift !== null ) {

                row._isALinkedShift = this.shifts.isLinkedShift( shift.id );
                row._days_after = shift.days_after;
                row._days_total = shift.days_total;

                if ( row._isALinkedShift ) {

                    row._isALinkedTargetShift = this.shifts.isLinkedTargetShift( shift.id );

                    if ( row._isALinkedTargetShift ) {

                        let sourceShift = this.shifts.getByIdCached( shift.propagate_from_shift_id );

                        if ( sourceShift !== null ) {

                            let sourceCalendarRow = this._getMostRecentCalendarShift( row.date, sourceShift.id );

                            if ( sourceCalendarRow !== null ) {

                                row._linkSourceRow = sourceCalendarRow.id;

                            }

                        }

                    }

                }

                if ( row.shift_pond !== null ) {

                    row._isAPondShift = true;
                    row._pond = row.shift_pond;
                    row._isAPondMasterShift = this.shiftPonds.isPondMasterShift( shift.id );

                    if ( row._isAPondMasterShift === false ) {

                        row._pondMasterRow = this._getMasterCalendarRowIdBySlaveCalendarRow( row );

                    }

                    if ( dictionary_ponds.hasOwnProperty( row.shift_pond ) ) {

                        dictionary_ponds[ row.shift_pond ].push( row );

                    } else {

                        dictionary_ponds[ row.shift_pond ] = [];
                        dictionary_ponds[ row.shift_pond ].push( row );

                    }

                }

            }

        }

    }

    for ( let pond in dictionary_ponds ) {

        let pond_master_row;
        let master_necessity = false;
        let slave_necessity = false;

        for ( let row of pond ) {

            if ( row._isAPondMasterShift ) {

                pond_master_row = row;
                master_necessity = row.is_necessary;

            } else {

                if ( row.is_necessary === 1 ) {

                    slave_necessity = true;

                }

            }

        }

        if ( master_necessity === false && slave_necessity === true ) {

            pond_master_row.is_necessary = 1;

        }

    }

    this._calculate_and_store_eligibility_on_rows( employeeCollection, calendarCollection, this.todayCalendarRows.getElement( 0 ).date );

};

/**
 * @runs 125 times / day
 * @see DB_Employee.prototype.getFullname @cached
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @returns {void}
 */
RosterEngine.prototype._allocate = function( employee, calendarRow ) {

    // console.log( 'run' );

    if ( employee === null ) {

        // console.warn( 'allocate has received a null employee' );
        return;

    }

    this._allocations.push({
        'id': calendarRow.id,
        'employee_id': employee.id,
        'employee_name': employee.getFullname()
    });

    calendarRow.employee_id = employee.id;
    calendarRow.employee_name = employee.getFullname();

};

/**
 * @runs 197 times / day
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._getPreviousDate = function( dateString ) {

    if ( this._getPreviousDateMap.has( dateString ) ) {

        return this._getPreviousDateMap.get( dateString );

    }

    var date = new Date( dateString );

    date.setDate( date.getDate() - 1 );

    var year = date.getFullYear();
    var month = String( date.getMonth() + 1 ).padStart( 2, '0' );
    var day = String( date.getDate() ).padStart( 2, '0' );

    this._getPreviousDateMap.set( dateString, year + '-' + month + '-' + day );

    return this._getPreviousDateMap.get( dateString );

};

/**
 * @runs ? times / day
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @param {Number} daysNum integer
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._getNextDateByDays = function( dateString, daysNum ) {

    // console.log( 'run' );

    var date = new Date( dateString );

    date.setDate( date.getDate() + daysNum );

    var year = date.getFullYear();
    var month = String( date.getMonth() + 1 ).padStart( 2, '0' );
    var day = String( date.getDate() ).padStart( 2, '0' );

    var formatted = year + '-' + month + '-' + day;

    return formatted;

};

/**
 * @runs 36 times / day
 * @see CalendarCollection.prototype.getByDateAndShiftId
 * @see RosterEngine.prototype._getPreviousDate
 * @param {String} currentDateStr YYYY-MM-DD
 * @param {Number} shiftId 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._getMostRecentCalendarShift = function( currentDateStr, shiftId ) {

    // console.log( 'run' );

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
 * @runs ? times / day
 * @see ShiftsCollection.prototype.getByIdCached
 * @see EmployeesCollection.getById
 * @see RosterEngine.prototype._getMostRecentCalendarShift
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._findEmployeeThatFilledTheSourceShiftUsingTargetShift = function( row ) {

    // console.log( 'run' );

    if ( row.shift_id === null ) { return null; }

    var targetShift = this.shifts.getByIdCached( row.shift_id );

    if ( targetShift === null ) { return null; }

    if ( targetShift.propagate_from_shift_id === null ) { return null; }

    var sourceShift = this.shifts.getByIdCached( targetShift.propagate_from_shift_id );

    var sourceCalendarRow = this._getMostRecentCalendarShift( row.date, sourceShift.id );

    if ( sourceCalendarRow === null ) { return null; }

    if ( sourceCalendarRow.employee_id === null ) { return null; }

    return this.employees.getById( sourceCalendarRow.employee_id );

};

/**
 * @runs ? times / day
 * @see CalendarCollection.prototype.getAllByDate
 * @see EmployeesCollection.removeById
 * @see RosterEngine.prototype._getPreviousDate
 * @param {EmployeesCollection} employees 
 * @param {String} currentDate YYYY-MM-DD
 */
RosterEngine.prototype._removeEmployeesThatHadANightShiftTheDayBefore = function( employees ) {

    // console.log( 'run' );

    var previousDateString = this._getPreviousDate( this.todayCalendarRows.getElement( 0 ).date );

    var previousDateCalendarRows = this.olderCalendarRows.getAllByDate( previousDateString );

    for ( var row of previousDateCalendarRows ) {

        if ( row.shift_times === '21:00-07:00' && row.employee_id !== null ) {

            employees.removeById( row.employee_id );

        }

    }

};

/**
 * @runs 208 times / day
 * @see ShiftPondCollection.prototype.getPondByShiftId @cached
 * @see ShiftPondCollection.prototype.getMasterShiftIdForPondId @cached
 * @see CalendarCollection.prototype.getByShiftId
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {Number|null}
 */
RosterEngine.prototype._getMasterCalendarRowIdBySlaveCalendarRow = function( row ) {

    // console.log( 'run' );

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
 * @runs 29 times / day
 * @see CalendarCollection.prototype.getById
 * @method
 * @private
 * @param {DB_Calendar} row 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow = function( row ) {

    // console.log( 'run' );

    if ( row.hasOwnProperty( '_pondMasterRow' ) === false ) {

        return null;

    }

    if ( row._pondMasterRow === null ) {

        return null;

    }

    return this.todayCalendarRows.getById( row._pondMasterRow );

};

/**
 * @runs 74088 times / day
 * @see TimetablesCollection.prototype.getWeekendIds
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Boolean}
 */
RosterEngine.prototype._employeeHasExcludedWeekendsFromHisPreferences = function( employee ) {

    // console.log( 'run' );

    if ( employee.hasOwnProperty( '_employeeHasExcludedWeekendsFromHisPreferences' ) ) {

        return employee._employeeHasExcludedWeekendsFromHisPreferences;

    }

    var weekendTimetableIds = this.timetables.getWeekendIds();

    var found = false;

    for ( let node of this.employeePreferences ) {

        if ( node.employee_id === employee.id && weekendTimetableIds.includes( node.timetable_id ) ) {

            found = true;

            break;

        }

    }

    // if found it means a preference is found, so he hasnt excluded weekend shifts
    if ( found === true ) {

        employee._employeeHasExcludedWeekendsFromHisPreferences = false;

        return false;

    } else {

        employee._employeeHasExcludedWeekendsFromHisPreferences = true;

        return true;

    }

};

/**
 * @runs 12844 /day
 * @see TimetablesCollection.prototype.getNightIds
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Boolean} 
 */
RosterEngine.prototype._employeeHasExcludedNightsFromHisPreferences = function( employee ) {

    // console.log( 'run' );

    var nightTimetableIds = this.timetables.getNightIds();

    var found = false;

    for ( let node of this.employeePreferences ) {

        if ( node.employee_id === employee.id && nightTimetableIds.includes( node.timetable_id ) ) {

            found = true;

            break;

        }

    }

    // if found it means a preference is found, so he hasnt excluded weekend shifts
    if ( found === true ) {

        return false;

    } else {

        return true;

    }

};

/**
 * @runs 638689 / day
 * @see DB_Role.prototype.getPoolsByPreference @cached
 * @see RolesCollection.prototype.getByIdCached
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {PoolsCollection}
 */
RosterEngine.prototype._getPoolsForCalendarRow = function( calendar_row ) {

    // console.log( 'run' );

    var role = this.roles.getByIdCached( calendar_row.role_id );

    if ( role === null ) {
        
        return new PoolsCollection([]);
    
    }

    return role.getPoolsByPreference( this.pools, this.junctionRolePool );

};

/**
 * @runs 732015 / day
 * @see JunctionEmployeePool.prototype.exists @cached
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {DB_Pool} pool 
 * @returns {Boolean}
 */
RosterEngine.prototype._employeeHasPool = function( employee, pool ) {

    // console.log( 'run' );

    if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

        return true;

    }

    return false;

};

/**
 * @runs 638568 / day
 * @see lib_getHoursBetween
 * @see DB_Employee.prototype.isOnLeaveForDate @cached
 * @see DB_Employee.prototype.isOnDayOffAfterNightShiftForDate @cached
 * @see DB_Calendar.prototype.isWeekendShift @cached
 * @see DB_Calendar.prototype.getNextDayDate @cached
 * @see DB_Calendar.prototype.getShiftEndDatetime @cached
 * @see DB_Calendar.prototype.getShiftBeginDatetime @cached
 * @see DB_Calendar.prototype.getPreviousDayDate @cached
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.getPreviousFridayDate @cached
 * @see DB_Calendar.prototype.getNextSaturdayDate @cached
 * @see RosterEngine.prototype._employeeHasExcludedWeekendsFromHisPreferences
 * @see RosterEngine.prototype._getPoolsForCalendarRow
 * @see RosterEngine.prototype._employeeHasPool
 * @see RosterEngine.prototype._employeeHasExcludedNightsFromHisPreferences
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} shift_calendar_row 
 * @param {CalendarCollection} mixed_calendar_rows 
 * @returns {Boolean}
 */
RosterEngine.prototype._can_employee_fill_this_shift = function( employee, shift_calendar_row, mixed_calendar_rows ) {

    // console.log( 'run' );

    // 1.a
    if ( employee.isOnLeaveForDate( this.leaves, shift_calendar_row.date ) ) {
        
        return false;
    
    }

    // 1.b
    if ( employee.isOnDayOffAfterNightShiftForDate( shift_calendar_row.date, mixed_calendar_rows ) ) {
        
        return false;
    
    }

    // 2
    if ( shift_calendar_row.isWeekendShift() ) {

        // 2.1
        if ( this._employeeHasExcludedWeekendsFromHisPreferences( employee ) ) {

            // 2.1.1
            return false;

        }

    }

    // 3
    var employee_viability = false;

    var shift_calendar_row_pools = this._getPoolsForCalendarRow( shift_calendar_row );

    // 4
    for ( let pool of shift_calendar_row_pools ) {

        // 4.1
        if ( this._employeeHasPool( employee, pool ) ) {

            // 4.1.1
            employee_viability = true;

            // 4.1.2
            break;

        }

    }

    // 5
    if ( employee_viability === false ) {

        // 5.1
        return false;

    }

    // 6
    for ( let row of mixed_calendar_rows ) {

        // 6.1
        if ( row.date === shift_calendar_row.date ) {

            // 6.1.1
            if ( row.employee_id === employee.id ) {

                // 6.1.1.1
                return false;

            }

        }

        // 6.2
        if ( row.date === shift_calendar_row.getNextDayDate() ) {

            // 6.2.1
            if ( row.employee_id === employee.id ) {

                // 6.2.1.1
                if ( lib_getHoursBetween( shift_calendar_row.getShiftEndDatetime(), row.getShiftBeginDatetime() ) < 11 ) {

                    // 6.2.1.1.1
                    return false;

                }

            }

        }

        // 6.3
        if ( row.date === shift_calendar_row.getPreviousDayDate() ) {

            // 6.3.1
            if ( row.employee_id === employee.id ) {

                // 6.3.1.1
                if ( lib_getHoursBetween( row.getShiftEndDatetime(), shift_calendar_row.getShiftBeginDatetime() ) < 11 ) {

                    // 6.3.1.1.1
                    return false;

                }

            }

        }

    }

    // 7
    if ( shift_calendar_row.isNightShift() ) {

        // 7.1
        if ( this._employeeHasExcludedNightsFromHisPreferences( employee ) ) {

            // 7.1.1
            return false;

        }

        // 7.2
        for ( let row of mixed_calendar_rows ) {

            // 7.2.1
            if ( row.date > shift_calendar_row.getPreviousFridayDate() ) {

                // 7.2.1.1
                if ( row.date < shift_calendar_row.getNextSaturdayDate() ) {

                    // 7.2.1.1.1
                    if ( row.isNightShift() ) {

                        // 7.2.1.1.1.1
                        if ( row.employee_id === employee.id ) {

                            // 7.2.1.1.1.1.1
                            return false;

                        }

                    }

                }

            }

        }

    }

    // 8
    return true;

};

/**
 * @runs 9 / day
 * @see RosterEngine.prototype._can_employee_fill_this_shift
 * @param {EmployeesCollection} employees_collection 
 * @param {CalendarCollection} rows_collections 
 * @param {String} cut_off_date 
 */
RosterEngine.prototype._calculate_and_store_eligibility_on_rows = function( employees_collection, rows_collection, cut_off_date ) {

    // console.log( 'run' );

    for ( let row of rows_collection ) {

        if ( cut_off_date > row.date ) {

            continue;

        }

        row._eligibleEmployees = new EmployeesCollection([]);

        for ( let employee of employees_collection ) {

            if ( this._can_employee_fill_this_shift( employee, row, rows_collection ) ) {

                row._eligibleEmployees.push( employee );

            }

        }

    }

};

/**
 * @runs 37 / day
 * @see DB_Employee.prototype.prefersThisShift @cached
 * @see JunctionEmployeePool.prototype.exists @cached
 * @see EmployeesCollection.prototype.sort_byHardShiftWeightAsc
 * @see RosterEngine.prototype._getPoolsForCalendarRow
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_hard_shift = function( calendar_row ) {

    // console.log( 'run' );

    let willing_employees = new EmployeesCollection([]);
    let unwilling_employees = new EmployeesCollection([]);

    for ( let employee of calendar_row._eligibleEmployees ) {

        if ( employee.prefersThisShift( calendar_row, this.shifts, this.employeePreferences ) ) {

            willing_employees.push( employee );

        } else {

            unwilling_employees.push( employee );

        }

    }

    let role_pools_by_preference = [];

    let calendar_row_pools = this._getPoolsForCalendarRow( calendar_row );

    for ( let pool of calendar_row_pools ) {

        let pool_members = new EmployeesCollection([]);

        for ( let employee of willing_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members.push( employee );

            }

        }

        role_pools_by_preference.push( pool_members );

    }

    for ( let pool_by_preference of role_pools_by_preference ) {

        if ( pool_by_preference.length === 0 ) { continue; }

        pool_by_preference.sort_byHardShiftWeightAsc();

        let selected_employee = pool_by_preference.getElement( 0 );

        for ( let employee of pool_by_preference ) {

            if ( employee.inveteracy_coefficient < selected_employee.inveteracy_coefficient ) {

                selected_employee = employee;

            }

        }

        return selected_employee;

    }

    let role_pools_by_preference2 = [];

    for ( let pool of calendar_row_pools ) {

        let pool_members = new EmployeesCollection([]);

        for ( let employee of unwilling_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members.push( employee );

            }

        }

        role_pools_by_preference2.push( pool_members );

    }

    for ( let pool_by_preference of role_pools_by_preference2 ) {

        if ( pool_by_preference.length === 0 ) { continue; }

        pool_by_preference.sort_byHardShiftWeightAsc();

        let selected_employee = pool_by_preference.getElement( 0 );

        for ( let employee of pool_by_preference ) {

            if ( employee.inveteracy_coefficient < selected_employee.inveteracy_coefficient ) {

                selected_employee = employee;

            }

        }

        return selected_employee;

    }

    return null;

};

/**
 * @runs 84 / day
 * @see DB_Employee.prototype.prefersThisShift @cached
 * @see JunctionEmployeePool.prototype.exists @cached
 * @see EmployeesCollection.prototype.sort_byHardShiftWeightAsc
 * @see RosterEngine.prototype._getPoolsForCalendarRow
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_easy_shift = function( calendar_row ) {

    // console.log( 'run' );

    let willing_employees = new EmployeesCollection([]);
    let unwilling_employees = new EmployeesCollection([]);

    for ( let employee of calendar_row._eligibleEmployees ) {

        if ( employee.prefersThisShift( calendar_row, this.shifts, this.employeePreferences ) ) {

            willing_employees.push( employee );

        } else {

            unwilling_employees.push( employee );

        }

    }

    let role_pools_by_preference = [];

    let calendar_row_pools = this._getPoolsForCalendarRow( calendar_row );

    for ( let pool of calendar_row_pools ) {

        let pool_members = new EmployeesCollection([]);

        for ( let employee of willing_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members.push( employee );

            }

        }

        role_pools_by_preference.push( pool_members );

    }

    for ( let pool_by_preference of role_pools_by_preference ) {

        if ( pool_by_preference.length === 0 ) { continue; }

        pool_by_preference.sort_byHardShiftWeightDesc();

        let selected_employee = pool_by_preference.getElement( 0 );

        for ( let employee of pool_by_preference ) {

            if ( employee.inveteracy_coefficient > selected_employee.inveteracy_coefficient ) {

                selected_employee = employee;

            }

        }

        return selected_employee;

    }

    let role_pools_by_preference2 = [];

    for ( let pool of calendar_row_pools ) {

        let pool_members = new EmployeesCollection([]);

        for ( let employee of unwilling_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members.push( employee );

            }

        }

        role_pools_by_preference2.push( pool_members );

    }

    for ( let pool_by_preference of role_pools_by_preference2 ) {

        if ( pool_by_preference.length === 0 ) { continue; }

        pool_by_preference.sort_byHardShiftWeightDesc();

        let selected_employee = pool_by_preference.getElement( 0 );

        for ( let employee of pool_by_preference ) {

            if ( employee.inveteracy_coefficient > selected_employee.inveteracy_coefficient ) {

                selected_employee = employee;

            }

        }

        return selected_employee;

    }

    return null;

};

/**
 * @runs 1 / day
 * @see DB_Calendar.prototype.isFriday @cached
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.isNecessary @cached
 * @see DB_Calendar.prototype.getNextSaturdayDate @cached
 * @see DB_Calendar.prototype.isNotFilled @cached
 * @see DB_Employee.prototype.getFullname @cached
 * @see EmployeesCollection.prototype.removeById
 * @see CalendarCollection.prototype.removeById
 * @see RosterEngine.prototype._assign_employee
 * @method
 * @private
 * @param {EmployeesCollection} employees 
 * @param {CalendarCollection} calendar_rows 
 * @returns {void}
 */
RosterEngine.prototype._autofill_future_nightshifts = function( employees, calendar_rows ) {

    // console.log( 'run' );

    // an einai paraskeui den perimenoume na gyrisei katholoue future night shifts gt den elegxei tis epomenis evdomadas,
    // opote parakatw diafora pragmata tha einai undefined
    if ( this.todayCalendarRows.getElement( 0 ).isFriday() ) {

        return;

    }

    let future_nightshifts = new CalendarCollection([]);

    for ( let row of calendar_rows ) {

        if ( row.isNightShift() && row.isNecessary() && row.date < this.todayCalendarRows.getElement( 0 ).getNextSaturdayDate() && row.date > this.todayCalendarRows.getElement( 0 ).date ) {

            if ( row.isNotFilled() ) {

                future_nightshifts.push( row );

            }

        }

    }

    // this._calculate_and_store_eligibility_on_rows( employees, calendar_rows, this.todayCalendarRows.getElement( 0 ).date );

    let are_we_done = false;

    while ( are_we_done === false ) {

        let shift_to_fill = future_nightshifts.getElement( 0 );

        for ( let night_shift of future_nightshifts ) {

            if ( night_shift._eligibleEmployees.length < shift_to_fill._eligibleEmployees.length ) {

                shift_to_fill = night_shift;

            } else {

                if ( night_shift._eligibleEmployees.length === shift_to_fill._eligibleEmployees.length ) {

                    if ( night_shift.date > shift_to_fill.date ) {

                        shift_to_fill = night_shift;

                    }

                }

            }

        }

        let shift_to_fill_employee = this._assign_employee( shift_to_fill, calendar_rows );

        if ( shift_to_fill_employee !== null ) {

            shift_to_fill.employee_id   = shift_to_fill_employee.id;
            shift_to_fill.employee_name = shift_to_fill_employee.getFullname();

        }

        if ( shift_to_fill_employee !== null ) {

            for ( let night_shift of future_nightshifts ) {

                night_shift._eligibleEmployees.removeById( shift_to_fill.employee_id );

            }

        }

        future_nightshifts.removeById( shift_to_fill.id );

        if ( future_nightshifts.length === 0 ) {

            are_we_done = true;

        }

    }

};

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
    // for ( employee of this.employees ) {

    //     employee._lastAttendance = this.olderCalendarRows.getLastAttendanceForEmployee( employee.id );

    // } console.log( structuredClone( this.employees ) );

    /**
     * this block keeps only the employees that are not on leave today
     */
    // var availableEmployees = this.employees.getWithoutLeaveForDate( this.todayCalendarRows.getElement( 0 ).date, this.leaves ); console.log( structuredClone( this.employees ) );

    /**
     * this block removes all employees that the day before were on a night shift
     */
    // this._removeEmployeesThatHadANightShiftTheDayBefore( availableEmployees );

    /**
     * this block removes all employees that somehow they were already allocated in a shift today
     */
    // this._removeEmployeesThatAlreadyFillAShiftToday( availableEmployees );

    // return availableEmployees;

};




/**
 * @see DB_Employee.prototype.getFullname @cached
 * @see DB_Calendar.prototype.isLinkedTargetShift @cached
 * @see DB_Calendar.prototype.isFilled @cached
 * @see DB_Calendar.prototype.isLinkedSourceShift @cached
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.isNecessary @cached
 * @see DB_Calendar.prototype.isNotFilled @cached
 * @see DB_Calendar.prototype.isPondSlave @cached
 * @see DB_Calendar.prototype.isUnnecessary @cached
 * @see DB_Calendar.prototype.isPondMaster @cached
 * @see EmployeesCollection.prototype.getById
 * @see EmployeesCollection.prototype.removeById
 * @see CalendarCollection.prototype.concatCollection
 * @see CalendarCollection.prototype.getSourceByTarget
 * @see CalendarCollection.prototype.sortByEligibleEmployeesAsc
 * @see CalendarCollection.prototype.removeById
 * @see CalendarCollection.prototype.getAllSlavesForPond
 * @see RosterEngine.prototype._augmentCalendarRows
 * @see RosterEngine.prototype._findEmployeeThatFilledTheSourceShiftUsingTargetShift
 * @see RosterEngine.prototype._allocate
 * @see RosterEngine.prototype._calculate_and_store_eligibility_on_rows
 * @see RosterEngine.prototype._assign_hard_shift
 * @see RosterEngine.prototype._autofill_future_nightshifts
 * @see RosterEngine.prototype._assign_employee
 * @see RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow
 */
RosterEngine.prototype.calculate = function() {

    this._augmentEmployees();

    /**
     * combine today and future and older calendar rows into one collection
     */
    let today_future_calendar_rows = this.todayCalendarRows.concatCollection( this.futureCalendarRows );
    this.mixedCalendarRows = today_future_calendar_rows.concatCollection( this.olderCalendarRows );

    /**
     * attaches extra properties to calendar rows needed for calculating when they needd to be filled
     * and how the eligibility is calculated
     */
    this._augmentCalendarRows( this.mixedCalendarRows, this.employees ); //console.log( structuredClone( this.mixedCalendarRows ) );

    
    
    
    /**
     * @description for every calendar row in today's calendar rows, if the row is a linked target shift,
     * and it is not manually set or already filled, find the employee that filled the source shift,
     * if that employee is eligible for this target shift, fill the target shift with that employee
     * and remove that employee from the eligible employees for today's shifts
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) { //console.log( 'run' );

        if ( todayCalendarRow.isLinkedTargetShift() ) {  //console.log( 'run1' );

            if ( todayCalendarRow.isFilled() ) { continue; }

            let employeeThatFilledTheSourceShift = this._findEmployeeThatFilledTheSourceShiftUsingTargetShift( todayCalendarRow ); //console.log( structuredClone( employeeThatFilledTheSourceShift ) );

            if ( employeeThatFilledTheSourceShift === null ) { continue; } //console.log( 'run3' ); console.log( structuredClone( todayCalendarRow ) );

            /**
             * @todo se periptwsi pou diamartyrithoun tha vgaloume to eligibility check,
             * epeidi twra gia na kanei allocate ton employee pou eixe mpei sto source, prepei na einai eligible sto target
             */
            if ( todayCalendarRow._eligibleEmployees.getById( employeeThatFilledTheSourceShift.id ) ) {

                this._allocate( employeeThatFilledTheSourceShift, todayCalendarRow );

            }

        }

    }




    /**
     * epeidi mpikan sta linked shifts ypalliloi prepei na afairethoun apo ta eligibility twn ypoloipwn tis imeras
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    /**
     * gemizei sti mnimi kai oxi sto allocation ta mellontika linked shifts pou einai targets kai pou exoun source gemismeno
     */
    for ( let row of this.futureCalendarRows ) {

        if ( row.isLinkedTargetShift() ) {

            if ( row.isFilled() ) { continue; }

            let sourceRow = this.mixedCalendarRows.getSourceByTarget( row, this.shifts );

            if ( sourceRow === null ) { continue; }

            if ( sourceRow.isFilled() ) {

                /**
                 * @todo se periptwsi pou diamartyrithoun tha vgaloume to eligibility check,
                 * epeidi twra gia na kanei allocate ton employee pou eixe mpei sto source, prepei na einai eligible sto target
                 */
                if ( row._eligibleEmployees.getById( sourceRow.employee_id ) !== null ) {

                    row.employee_id = sourceRow.employee_id;
                    row.employee_name = sourceRow.employee_name;

                }

            }

        }

    }




    /**
     * exw valei se mellontika night shifts ypallilous pou mporoun na mpoun mia fora tin ebdomada
     * opote vevaiwnmoume oti den tha ksanaboun
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    /**
     * gemizei ta future linked source night shifts ta opoia exoun ksemeinei exontas proigoumenws gemisei ta linked target
     * pairnontas ypopsin to ti targets exoun mpei idi apo ta yprxonta sources wste na tirisoume to eligibility
     * gt mporei kapoioi na exoun mpei se target shift pou einai nyxta kai na mi mporoun na kanoun alli nyxta
     * 
     * sto proigoumeno block gemisame future target shifts. kapoia apo auta mporei na itan night shifts
     * opote se auto to block kanoume iterate sta future source night shifts, gia na doume se poia mporoume na valoume ypallilo
     * o opoios den exei mpei se kapoio night shift sto proigoumeno block
     */
    {

        let future_linked_source_nightshifts = new CalendarCollection([]);

        for ( let row of this.futureCalendarRows ) {

            if ( row.isLinkedSourceShift() && row.isNightShift() ) {

                future_linked_source_nightshifts.push( row );

            }

        }

        future_linked_source_nightshifts.sortByEligibleEmployeesAsc();

        while ( future_linked_source_nightshifts.length > 0 ) {

            let assignedEmployee = this._assign_hard_shift( future_linked_source_nightshifts.getElement( 0 ) );

            if ( assignedEmployee !== null ) {

                future_linked_source_nightshifts.getElement( 0 ).employee_id = assignedEmployee.id;
                future_linked_source_nightshifts.getElement( 0 ).employee_name = assignedEmployee.getFullname();

            }

            future_linked_source_nightshifts.removeById( future_linked_source_nightshifts.getElement( 0 ).id );

            future_linked_source_nightshifts.sortByEligibleEmployeesAsc();

        }

    }

    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    /**
     * sto proigoumeno step valame future source night shifts
     * se auto to step vazoume ta future target shifts gia na sevastoume ta sources pou molis topothetisame
     * wste otan valoume ta ypoloipa night shifts na lavei ypopsi o algorithmos oti oi ypalliloi pou tha pane se auta ta targets tha einai apasxolimenoi gia autes tis meres
     * to step auto einai redenduncy gia asfaleia
     * alla voithaei kai se kati: ?
     */
    for ( let row of this.futureCalendarRows ) {

        if ( row.isLinkedTargetShift() ) {

            if ( row.isFilled() ) { continue; }

            let sourceRow = this.mixedCalendarRows.getSourceByTarget( row, this.shifts );

            if ( sourceRow === null ) { continue; }

            if ( sourceRow.isFilled() ) {

                if ( row._eligibleEmployees.getById( sourceRow.employee_id ) !== null ) {

                    row.employee_id = sourceRow.employee_id;
                    row.employee_name = sourceRow.employee_name;

                }

            }

        }

    }

    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    /**
     * opoio future night shifts exei ksemeinei apo ta proigoumena 3 steps, gemizei edw
     * pairnontas ypopsi ta eligibilities
     */
    this._autofill_future_nightshifts( this.employees, this.mixedCalendarRows );

    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    // 11
    /**
     * gemizw necessary night unfilled non pond slave shifts gia simera
     * xrisimopoioume to isPondSlave gt theloume na gemisoume ola osa den einai se ponds KAI an einai se pond mono tous pond masters
     */
    {

        let today_necessary_night_shift_rows = new CalendarCollection([]);

        for ( let row of this.todayCalendarRows ) {

            if ( row.isNecessary() && row.isNightShift() && row.isNotFilled() && row.isPondSlave() === false ) {

                today_necessary_night_shift_rows.push( row );

            }

        }

        today_necessary_night_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_necessary_night_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_necessary_night_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._allocate( employee_to_fill_row, today_necessary_night_shift_rows.getElement( 0 ) );

            today_necessary_night_shift_rows.removeById( today_necessary_night_shift_rows.getElement( 0 ).id );

            for ( let row of today_necessary_night_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_necessary_night_shift_rows.sortByEligibleEmployeesAsc();

        }

    }

    /**
     * @todo pithano optimization me antikatastasi tou _calculate_and_store_eligibility_on_rows me to calendarCollection.removeEmployeeFromEligible
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    /**
     * mas zitisan na vazoume odo to dynaton prwta ti nyxta
     * se auto to step vazw osa necessary den einai nyxta, dld osa necessary den plirwthikan sto proigoumeno step
     */
    {

        let today_necessary_shift_rows = new CalendarCollection([]);

        for ( let row of this.todayCalendarRows ) {

            if ( row.isNecessary() && row.isNightShift() === false && row.isNotFilled() && row.isPondSlave() === false ) {

                today_necessary_shift_rows.push( row );

            }

        }

        today_necessary_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_necessary_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_necessary_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._allocate( employee_to_fill_row, today_necessary_shift_rows.getElement( 0 ) );

            today_necessary_shift_rows.removeById( today_necessary_shift_rows.getElement( 0 ).id );

            for ( let row of today_necessary_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_necessary_shift_rows.sortByEligibleEmployeesAsc();

        }

    }

    /**
     * @todo pithano optimization me antikatastasi tou _calculate_and_store_eligibility_on_rows me to calendarCollection.removeEmployeeFromEligible
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    // 12
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

            if ( todayCalendarRow.isFilled() ) { continue; }

            let todayMasterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( todayMasterCalendarRow === null ) { continue; }

            if ( todayMasterCalendarRow.isFilled() === false ) { continue; }

            let employeeThatFilledTheMasterCalendarRow = this.employees.getById( todayMasterCalendarRow.employee_id );

            this._allocate( employeeThatFilledTheMasterCalendarRow, todayCalendarRow );

        }

    }




    // 13
    /**
     * gemizei tous unnecessary pond masters
     */
    {

        let today_unnecessary_pond_master_shift_rows = new CalendarCollection([]);

        for ( let row of this.todayCalendarRows ) {

            if ( row.isUnnecessary() && row.isNotFilled() && row.isPondMaster() ) {

                today_unnecessary_pond_master_shift_rows.push( row );

            }

        }

        today_unnecessary_pond_master_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_unnecessary_pond_master_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_unnecessary_pond_master_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._allocate( employee_to_fill_row, today_unnecessary_pond_master_shift_rows.getElement( 0 ) );

            today_unnecessary_pond_master_shift_rows.removeById( today_unnecessary_pond_master_shift_rows.getElement( 0 ).id );

            for ( let row of today_unnecessary_pond_master_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_unnecessary_pond_master_shift_rows.sortByEligibleEmployeesAsc();

        }

    }

    /**
     * @todo pithano optimization me antikatastasi tou _calculate_and_store_eligibility_on_rows me to calendarCollection.removeEmployeeFromEligible
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




    // 14
    /**
     * gemizei ola ta unnenecessary ponds slaves an o pond master einai gematos
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isUnnecessary() && todayCalendarRow.isPondSlave() ) {

            if ( todayCalendarRow.isFilled() ) { continue; }

            let todayMasterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( todayMasterCalendarRow === null ) { continue; }

            if ( todayMasterCalendarRow.isFilled() === false ) { continue; }

            let employeeThatFilledTheMasterCalendarRow = this.employees.getById( todayMasterCalendarRow.employee_id );

            this._allocate( employeeThatFilledTheMasterCalendarRow, todayCalendarRow );

        }

    }




    /**
     * an o pond slave einai gematos kai o master den einai
     * gemizei ton master me auton pou itan ston pond slave
     * kai olous tous ypoloipous slaves me ton idio ypallilo
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isPondSlave() && todayCalendarRow.isFilled() ) {

            let employeeDerivedFromSlaveRow = this.employees.getById( todayCalendarRow.employee_id );

            let masterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( masterCalendarRow === null ) { continue; }

            if ( masterCalendarRow.isNotFilled() ) {

                this._allocate( employeeDerivedFromSlaveRow, masterCalendarRow );

            }

            let samePondSlaveCalendarRows = this.todayCalendarRows.getAllSlavesForPond( todayCalendarRow._pond );

            samePondSlaveCalendarRows.removeById( todayCalendarRow.id );

            for ( let slaveRow of samePondSlaveCalendarRows ) {

                if ( slaveRow.isFilled() ) { continue; }

                this._allocate( employeeDerivedFromSlaveRow, slaveRow );

            }

        }

    }




    // 15
    /**
     * gemizei oti exei ksemeinei apo ta unnecessary
     */
    {

        let today_unnecessary_shift_rows = new CalendarCollection([]);

        for ( let row of this.todayCalendarRows ) {

            if ( row.isUnnecessary() && row.isNotFilled() ) {

                today_unnecessary_shift_rows.push( row );

            }

        }

        today_unnecessary_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_unnecessary_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_unnecessary_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._allocate( employee_to_fill_row, today_unnecessary_shift_rows.getElement( 0 ) );

            today_unnecessary_shift_rows.removeById( today_unnecessary_shift_rows.getElement( 0 ).id );

            for ( let row of today_unnecessary_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_unnecessary_shift_rows.sortByEligibleEmployeesAsc();

        }

    }

    // console.log( this._allocations );

};