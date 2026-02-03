function RosterEngine() {

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
     * @type {Object}
     */
    this.holiday_connections = {
        'Πρωτοχρονιά':      'Χριστούγεννα',
        'Αγίου Πνεύματος':  'Καθαρά Δευτέρα',
        '28η Οκτωβρίου':    '25η Μαρτίου',
        'Άγιον Πάσχα':      'Άγιον Πάσχα'
    };

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
RosterEngine.prototype.set_holidayRows = function( rows ) {

    this.holidayRows = new CalendarCollection( rows );

};

/**
 * @method
 * @public
 * @param {Object} settings 
 * @returns {void}
 */
RosterEngine.prototype.set_settings = function( settings ) {

    if ( this.settings === null ) {

        this.settings = new DB_Settings().hydrate( settings );

    }

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
 * @see DB_Calendar.prototype.isEverydayShift @noncachable
 * @see DB_Calendar.prototype.isMorningShift @cached
 * @see DB_Calendar.prototype.hasDayoffRules
 * @see EmployeesCollection.prototype.removeById @noncachable
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
 * @see DB_Calendar.prototype.isNecessary @noncachable
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
 * @see DB_Calendar.prototype.getPreviousDateBy6Days
 * @see ShiftsCollection.prototype.getByIdCached
 * @see ShiftsCollection.prototype.isLinkedShift
 * @see ShiftsCollection.prototype.isLinkedTargetShift
 * @see ShiftPondCollection.prototype.isPondMasterShift
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
        row._eligibleEmployees      = new EmployeesCollection([]);
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
 *
 * @method
 * @private
 * @see DB_Employee.prototype.getFullname @cached
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
 *
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @param {Number} daysNum integer
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._getNextDateByDays = function( dateString, daysNum ) {

    var key = dateString + ':' + daysNum;

    if ( this._getNextDateByDaysMap.has( key ) ) {

        return this._getNextDateByDaysMap.get( key );

    }

    var date = new Date( dateString );

    date.setDate( date.getDate() + daysNum );

    var year = date.getFullYear();
    var month = String( date.getMonth() + 1 ).padStart( 2, '0' );
    var day = String( date.getDate() ).padStart( 2, '0' );

    this._getNextDateByDaysMap.set( key, year + '-' + month + '-' + day );

    return this._getNextDateByDaysMap.get( key );

};

/**
 * @see lib_getPreviousDate
 * @see CalendarCollection.prototype.getByDateAndShiftId
 * @param {String} currentDateStr YYYY-MM-DD
 * @param {Number} shiftId 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._getMostRecentCalendarShift = function( currentDateStr, shiftId ) {

    // console.log( 'run' );

    var previousDateString = lib_getPreviousDate( currentDateStr );

    for ( var i = 0 ; i < 7 ; i++ ) {

        var olderCalendarRow = this.olderCalendarRows.getByDateAndShiftId( previousDateString, shiftId );

        if ( olderCalendarRow === null ) {

            previousDateString = lib_getPreviousDate( previousDateString );

        } else {

            return olderCalendarRow;

        }

    }

    return null;

};

/**
 * @see ShiftsCollection.prototype.getByIdCached
 * @see EmployeesCollection.getByIdCached
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

    return this.employees.getByIdCached( sourceCalendarRow.employee_id );

};

/**
 * @see lib_getPreviousDate
 * @see CalendarCollection.prototype.getAllByDate
 * @see EmployeesCollection.removeById @noncachable
 * @param {EmployeesCollection} employees 
 * @param {String} currentDate YYYY-MM-DD
 */
RosterEngine.prototype._removeEmployeesThatHadANightShiftTheDayBefore = function( employees ) {

    // console.log( 'run' );

    var previousDateString = lib_getPreviousDate( this.todayCalendarRows.getElement( 0 ).date );

    var previousDateCalendarRows = this.olderCalendarRows.getAllByDate( previousDateString );

    for ( var row of previousDateCalendarRows ) {

        if ( row.shift_times === '21:00-07:00' && row.employee_id !== null ) {

            employees.removeById( row.employee_id );

        }

    }

};

/**
 * @see ShiftPondCollection.prototype.getPondByShiftId
 * @see ShiftPondCollection.prototype.getMasterShiftIdForPondId
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
 *
 * @method
 * @private
 * @see CalendarCollection.prototype.getByIdCached
 * @param {DB_Calendar} row 
 * @returns {DB_Calendar|null}
 */
RosterEngine.prototype._findMasterCalendarRowBySlaveCalendarRow = function( row ) {

    // console.log( 'run' );

    if ( this._findMasterCalendarRowBySlaveCalendarRowCache.has( row.id ) ) {

        // console.log( 'cache hit' );

        return this._findMasterCalendarRowBySlaveCalendarRowCache.get( row.id );

    }

    if ( row.hasOwnProperty( '_pondMasterRow' ) === false ) {

        this._findMasterCalendarRowBySlaveCalendarRowCache.set( row.id, null );

        return null;

    }

    if ( row._pondMasterRow === null ) {

        this._findMasterCalendarRowBySlaveCalendarRowCache.set( row.id, null );

        return null;

    }

    this._findMasterCalendarRowBySlaveCalendarRowCache.set( row.id, this.todayCalendarRows.getByIdCached( row._pondMasterRow ) );

    return this._findMasterCalendarRowBySlaveCalendarRowCache.get( row.id );

};

/**
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
 * @see DB_Role.prototype.getPoolsByPreference
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
 * @see lib_getHoursBetween @cached
 * @see DB_Pool.prototype.hasEmployee @cached
 * @see DB_Employee.prototype.isOnLeaveForDate
 * @see DB_Employee.prototype.isOnDayOffAfterNightShiftForDate
 * @see DB_Calendar.prototype.isWeekendShift @cached
 * @see DB_Calendar.prototype.getNextDayDate @cached
 * @see DB_Calendar.prototype.getShiftEndDatetime
 * @see DB_Calendar.prototype.getShiftBeginDatetime
 * @see DB_Calendar.prototype.getPreviousDayDate
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.getPreviousFridayDate
 * @see DB_Calendar.prototype.getNextSaturdayDate @cached
 * @see RosterEngine.prototype._employeeHasExcludedWeekendsFromHisPreferences
 * @see RosterEngine.prototype._getPoolsForCalendarRow
 * @see RosterEngine.prototype._employeeHasExcludedNightsFromHisPreferences
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} shift_calendar_row 
 * @param {CalendarCollection} mixed_calendar_rows 
 * @param {Boolean} flag_11HoursAreConsidered
 * @returns {Boolean}
 */
RosterEngine.prototype._can_employee_fill_this_shift = function( employee, shift_calendar_row, mixed_calendar_rows, flag_11HoursAreConsidered = true ) {

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

        // department_id = 21, means Τμήμα Ελέγχου Ταξιδιωτών . if they change this, we are fucked
        if ( shift_calendar_row.department_id === this._HALL_ID ) {

            if ( employee._last_weekend_worked === true || employee._one_before_last_weekend_worked === true ) {

                return false;

            }

        }

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
        if ( pool.hasEmployee( employee.id, this.junctionEmployeePool ) ) {

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
        // tsekarei an exei mpei se allo row tis idias imerominias
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
                if ( 
                    ( lib_getHoursBetween( shift_calendar_row.getShiftEndDatetime(), row.getShiftBeginDatetime() ) < 11 ) &&
                    flag_11HoursAreConsidered === true
                ) {

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
                if (
                    ( lib_getHoursBetween( row.getShiftEndDatetime(), shift_calendar_row.getShiftBeginDatetime() ) < 11 ) &&
                    flag_11HoursAreConsidered === true
                ) {

                    // 6.3.1.1.1
                    return false;

                }

            }

        }

    }

    // 7
    if ( shift_calendar_row.isNightShift() ) {

        // 7.1
        if ( shift_calendar_row.isFriday() &&  shift_calendar_row.department_id === this._HALL_ID ) {

            if ( employee._last_weekend_worked === true || employee._one_before_last_weekend_worked === true ) {

                return false;

            }

        }

        // 7.2
        if ( this._employeeHasExcludedNightsFromHisPreferences( employee ) ) {

            // 7.1.1
            return false;

        }

        // 7.3
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
 * @see HolidaysCollection.prototype.getNameByDate @cached
 * @see RosterEngine.prototype._can_employee_fill_this_shift
 * @param {EmployeesCollection} employees_collection 
 * @param {CalendarCollection} rows_collection
 * @param {String} cut_off_date 
 * @param {Boolean} flag_11HoursAreConsidered
 */
RosterEngine.prototype._calculate_and_store_eligibility_on_rows = function( employees_collection, rows_collection, cut_off_date, flag_11HoursAreConsidered = true ) {

    // console.log( 'run' );

    let holidays = [];

    for ( let row of rows_collection ) {

        if ( cut_off_date > row.date ) {

            continue;

        }

        if ( row.isFilled() ) {

            continue;

        }

        if ( row.shift_weekday === 7 ) {

            let holiday_name = this.holidays.getNameByDate( row.date );

            if ( holiday_name !== null && this.holiday_connections.hasOwnProperty( holiday_name ) ) {

                let placed = false;

                for ( let day of holidays ) {

                    if ( day.getElement( 0 ).date === row.date ) {

                        day.push( row );

                        placed = true;

                    }

                }

                if ( placed === false ) {

                    let temp = new CalendarCollection([]);
                    temp.push( row );

                    holidays.push( temp );

                }

            }

        }

        row._eligibleEmployees = new EmployeesCollection([]);

        for ( let employee of employees_collection ) {

            if ( this._can_employee_fill_this_shift( employee, row, rows_collection, flag_11HoursAreConsidered ) ) {

                row._eligibleEmployees.push( employee );

            }

        }

    }

    for ( let day of holidays ) {

        // console.log( holidays );

        let source_holiday_date = this._get_source_holiday_date_by_date( day.getElement( 0 ).date );

        this._remove_employees_that_worked_on_date_from_eligible_of_row_collection( this.holidayRows, day, source_holiday_date );

    }

};

/**
 * @method
 * @private
 * @param {CalendarCollection} source_row_collection 
 * @param {CalendarCollection} target_row_collection 
 * @param {String} date YYYY-MM-DD i imerominia tis source date
 */
RosterEngine.prototype._remove_employees_that_worked_on_date_from_eligible_of_row_collection = function( source_row_collection, target_row_collection, date ) {

    for ( let source_row of source_row_collection ) {

        if ( source_row.date === date ) {

            target_row_collection.removeEmployeeFromEligible( source_row.employee_id );

        }

    }

};

/**
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
 * @see DB_Calendar.prototype.isFriday @cached
 * @see DB_Calendar.prototype.isNightShift @cached
 * @see DB_Calendar.prototype.isNecessary @noncachable
 * @see DB_Calendar.prototype.getNextSaturdayDate @cached
 * @see DB_Calendar.prototype.isNotFilled @noncachable
 * @see DB_Employee.prototype.getFullname @cached
 * @see EmployeesCollection.prototype.removeById @noncachable
 * @see CalendarCollection.prototype.removeById @noncachable
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
 * @returns {void}
 */
RosterEngine.prototype._augmentEmployees = function() {

    /**
     * this block allocates the _hard_shift_weight to all employees
     */
    for ( let employee of this.employees ) {

        employee._hard_shift_weight = 0;
        employee._weekends_worked = [];
        employee._last_weekend_worked = false;
        employee._one_before_last_weekend_worked = false;
        employee._shifts_worked = new Map();

        var previousCalendarShiftsThisEmployeeHasWorkedFor = this.olderCalendarRows.getAllForEmployeeId( employee.id );

        for ( let calendarRow of previousCalendarShiftsThisEmployeeHasWorkedFor ) {

            /**
             * @description den kanoume kateutheian assign sto employee._hard_shift_weight kai to kanoume assign se auto to variable
             *  gia na elegksoume me ton parakatw algorithmo gia tin pithanotita na exei kanei pollaples vardies mesa stin idia mera kai na kratisoume mono to hard shift weight tis pio dyskolis vardias
             *  o logos pou to kanoume auto einai oti yparxoun ta pond shifts pou vazoyn pollaples vardies ston idio ypallilo
             *  kai polles fores oi xristes tis efarmogis vazoune kataxristika ton idio ypallilo se diaforetika wraria
             */
            let rowHardShiftWeight = 0;

            if ( calendarRow.isEverydayShift() ) {

                if ( calendarRow.isEveningShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'eveningVariant' );

                } else if ( calendarRow.isNightShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'nightVariant' );

                }

            } else if ( calendarRow.isWeekendShift() ) {

                employee._weekends_worked.push( calendarRow.date );

                if ( calendarRow.isMorningShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'morningSkVariant' );

                } else if ( calendarRow.isEveningShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'eveningSkVariant' );

                } else if ( calendarRow.isNightShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'nightSkVariant' );

                }

            } else if ( calendarRow.isHolidayShift() ) {

                if ( calendarRow.isMorningShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'morningHolidayVariant' );

                } else if ( calendarRow.isEveningShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'eveningHolidayVariant' );

                } else if ( calendarRow.isNightShift() ) {

                    rowHardShiftWeight = this.settings.getFloat( 'nightHolidayVariant' );

                }

            }

            /**
             * @description o parakatw algorithmos
             */
            if ( employee._shifts_worked.has( calendarRow.date ) ) {

                if ( employee._shifts_worked.get( calendarRow.date ) >= rowHardShiftWeight ) {

                    continue;

                } else {

                    employee._hard_shift_weight -= employee._shifts_worked.get( calendarRow.date );
                    employee._shifts_worked.set( calendarRow.date, rowHardShiftWeight );
                    employee._hard_shift_weight += rowHardShiftWeight;

                }

            } else {

                employee._shifts_worked.set( calendarRow.date, rowHardShiftWeight );
                employee._hard_shift_weight += rowHardShiftWeight;

            }

        }

        for ( let weekend_date of employee._weekends_worked ) {

            let days_since_today = lib_datesDifferenceInDays( weekend_date, this.todayCalendarRows.getElement( 0 ).date );

            if ( this.todayCalendarRows.getElement( 0 ).isWeekendShift() && days_since_today === 1 ) {

                // it’s sunday and we are just looking at satturday
                continue;

            }

            if ( days_since_today <= 7 ) {

                employee._last_weekend_worked = true;

            } else if ( days_since_today <= 14 ) {

                employee._one_before_last_weekend_worked = true;

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
RosterEngine.prototype._get_source_holiday_date_by_date = function( dateString ) {

    let holiday_name = this.holidays.getNameByDate( dateString );

    return this.holidays.getPreviousHolidayDate( dateString, this.holiday_connections[ holiday_name ] );

}




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
 * @see CalendarCollection.prototype.getSourceByTarget
 * @see CalendarCollection.prototype.sortByEligibleEmployeesAsc
 * @see CalendarCollection.prototype.removeById @noncachable
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

            if ( todayCalendarRow.shift_weekday === 7 ) {

                let holiday_name = this.holidays.getNameByDate( todayCalendarRow.date );

                if ( holiday_name !== null && this.holiday_connections.hasOwnProperty( holiday_name ) ) {

                    continue;

                }

            }

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

            if ( row.shift_weekday === 7 ) {

                let holiday_name = this.holidays.getNameByDate( row.date );

                if ( holiday_name !== null && this.holiday_connections.hasOwnProperty( holiday_name ) ) {

                    continue;

                }

            }

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

            for ( let row of future_linked_source_nightshifts ) {

                if ( assignedEmployee === null ) { break; }

                row._eligibleEmployees.removeById( assignedEmployee.id );

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

            if ( row.shift_weekday === 7 ) {

                let holiday_name = this.holidays.getNameByDate( row.date );

                if ( holiday_name !== null && this.holiday_connections.hasOwnProperty( holiday_name ) ) {

                    continue;

                }

            }

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

    this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date );




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

    if ( this._11_HOUR_FLAG === false ) {

        this._calculate_and_store_eligibility_on_rows( this.employees, this.mixedCalendarRows, this.todayCalendarRows.getElement( 0 ).date, this._11_HOUR_FLAG );

        let empty_pond_slave_rows = new CalendarCollection([]);
        let empty_necessary_rows = new CalendarCollection([]);
        let empty_unnecessaty_rows = new CalendarCollection([]);
        let all_empty_rows = new CalendarCollection( [] );

        for ( let row of this.todayCalendarRows ){
        
            if ( row.isFilled() ){

                continue;

            }
            
            if( row.isPondSlave() ){
            
                empty_pond_slave_rows.push( row );
                all_empty_rows.push( row );
                continue;
                
            }
            
            if ( row.isUnnecessary() ){
                
                empty_unnecessaty_rows.push( row );
                all_empty_rows.push( row );
                continue;
                
            }
                
            empty_necessary_rows.push( row );
            all_empty_rows.push( row );
            
        }
        
        //try to fill the necessary rows that are left first
        {
            empty_necessary_rows.sortByEligibleEmployeesAsc();
            
            while( empty_necessary_rows.length > 0 ){
            
                let employee_to_fill_row = this._assign_employee( empty_necessary_rows.getElement( 0 ), this.futureCalendarRows );
                
                this._allocate( employee_to_fill_row, empty_necessary_rows.getElement( 0 ) );
                
                empty_necessary_rows.removeById( empty_necessary_rows.getElement( 0 ).id );
                
                for ( let row of all_empty_rows ) {
                
                    if ( employee_to_fill_row === null ) { break; }
                    
                    row._eligibleEmployees.removeById( employee_to_fill_row.id );
                
                }
                
                empty_necessary_rows.sortByEligibleEmployeesAsc();
                
            }
        }
        
        //try to fill the unnecessary rows that are left last
        {
            empty_unnecessaty_rows.sortByEligibleEmployeesAsc();
            
            while( empty_unnecessaty_rows.length > 0 ){
            
                let employee_to_fill_row = this._assign_employee( empty_unnecessaty_rows.getElement( 0 ), this.futureCalendarRows );
                
                this._allocate( employee_to_fill_row, empty_unnecessaty_rows.getElement( 0 ) );
                
                empty_unnecessaty_rows.removeById( empty_unnecessaty_rows.getElement( 0 ).id );
                
                for ( let row of all_empty_rows ) {
                
                    if ( employee_to_fill_row === null ) { break; }
                    
                    row._eligibleEmployees.removeById( employee_to_fill_row.id );
                
                }
                
                empty_unnecessaty_rows.sortByEligibleEmployeesAsc();
                
            }
        }
        
        // try to fill the pond slaves
        {
            
            while( empty_pond_slave_rows.length > 0 ){
                
                let masterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( empty_pond_slave_rows.getElement( 0 ) );
                
                if ( masterCalendarRow === null ) { 
                    
                    empty_pond_slave_rows.removeById( empty_pond_slave_rows.getElement( 0 ).id );
                    continue; 
                    
                }
                
                if ( masterCalendarRow.isFilled() === false ) {
                
                    empty_pond_slave_rows.removeById( empty_pond_slave_rows.getElement( 0 ).id );
                    continue; 
                
                }
                
                let employeeThatFilledTheMasterCalendarRow = this.employees.getById( masterCalendarRow.employee_id );
                this._allocate( employeeThatFilledTheMasterCalendarRow, empty_pond_slave_rows.getElement( 0 ) )
                empty_pond_slave_rows.removeById( empty_pond_slave_rows.getElement( 0 ).id );
                
            }
            
        }

    }

    // console.log( this._allocations );

};