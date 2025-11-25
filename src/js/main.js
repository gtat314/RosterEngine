function RosterEngine() {

    /**
     * @property
     * @public
     * @type {Number} int
     */
    this.shift_low_availability_threshold_number = 3;

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

    // console.log( this._allocations );

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
 * @param {DB_Calendar} todayCalendarRow 
 * @param {EmployeesCollection} availableEmployees
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_employee_old = function( todayCalendarRow, availableEmployees ) {

    // 1
    let eligible_employees = this._getEligibleEmployeesForRole( todayCalendarRow.role_id, availableEmployees ); //console.log( structuredClone( eligible_employees ) );

    if ( eligible_employees.length === 0 ) { return null; }

    // 2
    eligible_employees.removeEmployeesWorkedLast11Hours( todayCalendarRow, this.olderCalendarRows ); //console.log( structuredClone( eligible_employees ) );

    if ( eligible_employees.length === 0 ) { return null; }

    // 3
    if ( todayCalendarRow.isMorningShift() && todayCalendarRow.isEverydayShift() ) {

        // 3.1
        eligible_employees.sort_byHardShiftWeightDesc();

        // 3.2
        let eligible_employees_by_pool_priority = [];

        // 3.3
        let pools_for_this_role = this.junctionRolePool.getPoolsForRoleId( todayCalendarRow.role_id, this.pools );

        for ( let pool of pools_for_this_role ) {

            // 3.3.1
            let eligible_employees_belonging_to_this_pool = this.junctionEmployeePool.getEmployeesForPool( pool, eligible_employees );

            // 3.3.2
            eligible_employees_by_pool_priority.push( eligible_employees_belonging_to_this_pool );

        }

        // 3.4
        for ( let element of eligible_employees_by_pool_priority ) {

            // 3.4.1
            let my_employees = this._remove_necessary_night_shift_employees_from_the_start_of_list( element, this.todayCalendarRows, availableEmployees );

            // 3.4.2
            if ( my_employees.length > 0 ) {

                let employee_with_the_highest_hard_shift_weight = my_employees.getElement( 0 );

                for ( let i = 1 ; i < my_employees.length ; i++ ) { //console.log( my_employees.getElement( i ) ); console.log( i );

                    if ( employee_with_the_highest_hard_shift_weight.inveteracy_coefficient < my_employees.getElement( i ).inveteracy_coefficient ) {

                        if ( this._is_employee_necessary_tonight( my_employees.getElement( i ), this.todayCalendarRows, availableEmployees ) ) {

                            employee_with_the_highest_hard_shift_weight = my_employees.getElement( i );

                        }

                    }

                }

                return employee_with_the_highest_hard_shift_weight;

            }

        }

        eligible_employees_by_pool_priority = [];

        pools_for_this_role = this.junctionRolePool.getPoolsForRoleId( todayCalendarRow.role_id, this.pools );

        for ( let pool of pools_for_this_role ) {

            let eligible_employees_belonging_to_this_pool = this.junctionEmployeePool.getEmployeesForPool( pool, eligible_employees );

            eligible_employees_by_pool_priority.push( eligible_employees_belonging_to_this_pool );

        }

        for ( let element of eligible_employees_by_pool_priority ) {

            let my_employees = element;

            if ( my_employees.length > 0 ) {

                let employee_with_the_highest_hard_shift_weight = my_employees.getElement( 0 );

                for ( let i = 1 ; i < my_employees.length ; i++ ) {

                    if ( employee_with_the_highest_hard_shift_weight.inveteracy_coefficient < my_employees.getElement( i ).inveteracy_coefficient ) {

                        employee_with_the_highest_hard_shift_weight = my_employees.getElement( i );

                    }

                }

                return employee_with_the_highest_hard_shift_weight;

            }

        }

    // 4
    } else {

        // 4.1
        if ( todayCalendarRow.isHolidayShift() === false ) {

            // 4.1.1
            let willing_employees = eligible_employees.getWillingEmployeesForThisShift( todayCalendarRow, this.employeePreferences, this.shifts, this.timetables );

            // 4.1.2
            let unwilling_employees = eligible_employees.getUnwillingEmployeesForThisShift( todayCalendarRow, this.employeePreferences, this.shifts, this.timetables );

            // 4.1.3
            for ( let willing_employee of willing_employees ) {

                

            }

        } 

    }

    return null;

};

/**
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @param {CalendarCollection} calendar_row_collection
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_employee = function( calendar_row, calendar_row_collection ) {

    if ( calendar_row.isEverydayShift() && calendar_row.isMorningShift() ) {

        return this._assign_easy_shift( calendar_row );

    } else {

        if ( calendar_row.hasDayoffRules() ) {

            let copy_of_eligibles_keep = [];

            for ( let eligible_employee of calendar_row._eligibleEmployees ) {

                copy_of_eligibles_keep.push( eligible_employee );

            }

            let copy_of_eligibles = new EmployeesCollection( copy_of_eligibles_keep );

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
 * @method
 * @private
 * @param {EmployeesCollection} employeeList 
 * @param {CalendarCollection} todayCalendarRows
 * @param {EmployeesCollection} employeeList 
 * @returns {EmployeesCollection|null}
 */
RosterEngine.prototype._remove_necessary_night_shift_employees_from_the_start_of_list = function( employeeList, todayCalendarRows, availableEmployees ) {

    if ( employeeList === null ) {

        return new EmployeesCollection([]);
        
    }

    let employee_the_first_of_his_name = employeeList.getElement( 0 );

    if ( employeeList.length === 0 ) {

        return employeeList;

    }

    // 1
    if ( this._is_employee_necessary_tonight( employee_the_first_of_his_name, todayCalendarRows, availableEmployees ) ) {

        // 1.1
        employeeList.removeById( employee_the_first_of_his_name.id );

        // 1.2
        return this._remove_necessary_night_shift_employees_from_the_start_of_list( employeeList, todayCalendarRows, availableEmployees );

    }

    // 2
    return employeeList;

};

/**
 * @method
 * @private
 * @description if employee given is null, returns false
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendar_row
 * @returns {Boolean}
 */
RosterEngine.prototype._is_employee_necessary_for_this_shift = function( employee, calendar_row ) {

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
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {String} target_date YYYY-MM-DD
 * @param {CalendarCollection} calendar_rows 
 * @returns {Boolean}
 */
RosterEngine.prototype._is_the_employee_necessary_for_this_day = function( employee, target_date, calendar_rows ) {

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
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {CalendarCollection} todayCalendarRows 
 * @param {EmployeesCollection} availableEmployees 
 * @returns {Boolean}
 */
RosterEngine.prototype._is_employee_necessary_tonight = function( employee, todayCalendarRows, availableEmployees ) {

    // 1
    for ( let row of todayCalendarRows ) {

        // 1.1
        if ( row.isNightShift() ) {

            // 1.1.1
            if ( row.isNotFilled() ) {

                // 1.1.1.1
                if ( this._is_employee_necessary_for_this_shift( employee, row, availableEmployees ) ) {

                    // 1.1.1.1.1
                    return true;

                }

            }

        }

    }

    // 2
    return false;

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
    for ( let employee of this.employees ) {

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
    for ( let employee of this.employees ) {

        employee._lastAttendance = this.olderCalendarRows.getLastAttendanceForEmployee( employee.id );

    } //console.log( structuredClone( this.employees ) );

    /**
     * this block keeps only the employees that are not on leave today
     */
    var availableEmployees = this.employees.getWithoutLeaveForDate( this.todayCalendarRows.getElement( 0 ).date, this.leaves ); //console.log( structuredClone( this.employees ) );

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
 * @param {CalendarCollection} calendarCollection edw einai kai oi 97 meres
 * @param {EmployeesCollection} employeeCollection autoi einai OLOI oi ypalliloi
 * @returns {void}
 */
RosterEngine.prototype._augmentCalendarRows = function ( calendarCollection, employeeCollection ) {

    for ( let row of calendarCollection ) {

        if ( row.date < this.todayCalendarRows.getElement( 0 ).getPreviousDateByXDays( 6 ) ) {

            continue;

        }

        row._isAPondShift = false;
        row._isAPondMasterShift = false;
        row._pondMasterRow = null;
        row._pond = null;
        row._isALinkedShift = false;
        row._isALinkedTargetShift = false;
        row._linkSourceRow = null;
        row._eligibleEmployees = null;
        row._days_after = null;
        row._days_total = null;

        if ( row.shift_id !== null ) {

            let shift = this.shifts.getById( row.shift_id );

            if ( shift !== null ) {

                row._isALinkedShift = this.shifts.isLinkedShift( row.shift_id );
                row._days_after = shift.days_after;
                row._days_total = shift.days_total;

            }

        }

        if ( row._isALinkedShift ) {

            row._isALinkedTargetShift = this.shifts.isLinkedTargetShift( row.shift_id );

        }

        if ( row._isALinkedShift && row._isALinkedTargetShift ) {

            let targetShift = this.shifts.getById( row.shift_id );

            if ( targetShift !== null ) {

                let sourceShift = this.shifts.getById( targetShift.propagate_from_shift_id );

                if ( sourceShift === null ) {

                    let sourceCalendarRow = this._getMostRecentCalendarShift( row.date, sourceShift.id );

                    if ( sourceCalendarRow === null ) {

                        row._linkSourceRow = sourceCalendarRow.id;

                    }

                };

            }

        }

        if ( row.shift_id !== null ) {

            let shift = this.shifts.getById( row.shift_id );

            if ( shift !== null ) {

                let pondRow = this.shiftPonds.getPondByShiftId( row.shift_id );

                if ( pondRow !== null ) {

                    row._isAPondShift = true;

                }

            }

        }

        if ( row._isAPondShift ) {

            row._isAPondMasterShift = this.shiftPonds.isPondMasterShift( row.shift_id );

        }

        if ( row._isAPondShift ) {

            let pondRow = this.shiftPonds.getPondByShiftId( row.shift_id );

            if ( pondRow !== null ) {

                row._pond = pondRow.pond_id;

            }

        }

        if ( row._isAPondShift && row._isAPondMasterShift === false ) {

            row._pondMasterRow = this._getMasterCalendarRowIdBySlaveCalendarRow( row );

        }

    }

    this._calculate_and_store_eligibility_on_rows( employeeCollection, calendarCollection, this.todayCalendarRows.getElement( 0 ).date );

};

/**
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} calendarRow 
 * @returns {void}
 */
RosterEngine.prototype._fillCalendarRowWithEmployee = function( employee, calendarRow ) {

    if ( employee === null ) {

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
 * @method
 * @private
 * @param {String} dateString YYYY-MM-DD
 * @param {Number} daysNum integer
 * @returns {String} YYYY-MM-DD
 */
RosterEngine.prototype._getNextDateByDays = function( dateString, daysNum ) {

    var date = new Date( dateString );

    date.setDate( date.getDate() + daysNum );

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
 * @param {Number} role_id 
 * @param {EmployeesCollection} employees 
 * @returns {EmployeesCollection}
 * @description load the role data from the role table, using the role_id of the calendar row
 *              load the pools that can accomodate this role, sorted by their sort_index in ascending order
 *              If no pools found for this role, no employee can be assigned, so there is no reason to waste any more time with this shift
 *              load all employees with their data from the employees table, that belong to the pools we deduced previously
 */
RosterEngine.prototype._getEligibleEmployeesForRole = function( role_id, employees ) {

    var role = this.roles.getById( role_id );

    if ( role === null ) {
        
        return new EmployeesCollection([]);
    
    }

    var pools = this.junctionRolePool.getPoolsForRoleId( role.id, this.pools );

    if ( pools.length === 0 ) {
        
        return new EmployeesCollection([]);
    
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

/**
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @returns {Boolean}
 */
RosterEngine.prototype._employeeHasExcludedWeekendsFromHisPreferences = function( employee ) {

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

RosterEngine.prototype._employeeHasExcludedNightsFromHisPreferences = function( employee ) {

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
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {PoolsCollection}
 */
RosterEngine.prototype._getPoolsForCalendarRow = function( calendar_row ) {

    var role = this.roles.getById( calendar_row.role_id );

    if ( role === null ) {
        
        return new PoolsCollection([]);
    
    }

    return role.getPoolsByPreference( this.pools, this.junctionRolePool );

};

/**
 * @method
 * @private
 * @param {DB_Employee} employee 
 * @param {DB_Pool} pool 
 * @returns {Boolean}
 */
RosterEngine.prototype._employeeHasPool = function( employee, pool ) {

    if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

        return true;

    }

    return false;

};

/**
 * 
 * @param {DB_Employee} employee 
 * @param {DB_Calendar} shift_calendar_row 
 * @param {CalendarCollection} mixed_calendar_rows 
 * @returns {Boolean}
 */
RosterEngine.prototype._can_employee_fill_this_shift = function( employee, shift_calendar_row, mixed_calendar_rows ) {

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
 * 
 * @param {EmployeesCollection} employees_collection 
 * @param {CalendarCollection} rows_collections 
 * @param {String} cut_off_date 
 */
RosterEngine.prototype._calculate_and_store_eligibility_on_rows = function( employees_collection, rows_collection, cut_off_date ) {

    // console.time( "my-timer" );

    for ( let row of rows_collection ) {

        if ( cut_off_date > row.date ) {

            continue;

        }

        let eligibleEmployees = [];

        for ( let employee of employees_collection ) {

            if ( this._can_employee_fill_this_shift( employee, row, rows_collection ) ) {

                eligibleEmployees.push( employee );

            }

        }

        row._eligibleEmployees = new EmployeesCollection( eligibleEmployees );

    }

    // console.timeEnd( "my-timer" );

};

/**
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_hard_shift = function( calendar_row ) {

    let willing_employees_keep = [];
    let unwilling_employees_keep = [];

    for ( let employee of calendar_row._eligibleEmployees ) {

        if ( employee.prefersThisShift( calendar_row, this.shifts, this.employeePreferences ) ) {

            willing_employees_keep.push( employee );

        } else {

            unwilling_employees_keep.push( employee );

        }

    }

    let willing_employees = new EmployeesCollection( willing_employees_keep );
    let unwilling_employees = new EmployeesCollection( unwilling_employees_keep );

    let role_pools_by_preference = [];

    let calendar_row_pools = this._getPoolsForCalendarRow( calendar_row );

    for ( let pool of calendar_row_pools ) {

        let pool_members_keep = [];

        for ( let employee of willing_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members_keep.push( employee );

            }

        }

        let pool_members = new EmployeesCollection( pool_members_keep );

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

        let pool_members_keep = [];

        for ( let employee of unwilling_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members_keep.push( employee );

            }

        }

        let pool_members = new EmployeesCollection( pool_members_keep );

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
 * @method
 * @private
 * @param {DB_Calendar} calendar_row 
 * @returns {DB_Employee|null}
 */
RosterEngine.prototype._assign_easy_shift = function( calendar_row ) {

    let willing_employees_keep = [];
    let unwilling_employees_keep = [];

    for ( let employee of calendar_row._eligibleEmployees ) {

        if ( employee.prefersThisShift( calendar_row, this.shifts, this.employeePreferences ) ) {

            willing_employees_keep.push( employee );

        } else {

            unwilling_employees_keep.push( employee );

        }

    }

    let willing_employees = new EmployeesCollection( willing_employees_keep );
    let unwilling_employees = new EmployeesCollection( unwilling_employees_keep );

    let role_pools_by_preference = [];

    let calendar_row_pools = this._getPoolsForCalendarRow( calendar_row );

    for ( let pool of calendar_row_pools ) {

        let pool_members_keep = [];

        for ( let employee of willing_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members_keep.push( employee );

            }

        }

        let pool_members = new EmployeesCollection( pool_members_keep );

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

        let pool_members_keep = [];

        for ( let employee of unwilling_employees ) {

            if ( this.junctionEmployeePool.exists( employee.id, pool.id ) ) {

                pool_members_keep.push( employee );

            }

        }

        let pool_members = new EmployeesCollection( pool_members_keep );

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
 * @method
 * @private
 * @param {EmployeesCollection} employees 
 * @param {CalendarCollection} calendar_rows 
 * @returns {void}
 */
RosterEngine.prototype._autofill_future_nightshifts = function( employees, calendar_rows ) {

    // an einai paraskeui den perimenoume na gyrisei katholoue future night shifts gt den elegxei tis epomenis evdomadas,
    // opote parakatw diafora pragmata tha einai undefined
    if ( this.todayCalendarRows.getElement( 0 ).isFriday() ) {

        return;

    }

    let future_nightshifts_keep = [];

    for ( let row of calendar_rows ) {

        if ( row.isNightShift() && row.isNecessary() && row.date < this.todayCalendarRows.getElement( 0 ).getNextSaturdayDate() && row.date > this.todayCalendarRows.getElement( 0 ).date ) {

            if ( row.isNotFilled() ) {

                future_nightshifts_keep.push( row );

            }

        }

    }

    let future_nightshifts = new CalendarCollection( future_nightshifts_keep );

    this._calculate_and_store_eligibility_on_rows( employees, calendar_rows, this.todayCalendarRows.getElement( 0 ).date );

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




RosterEngine.prototype.calculate = function() {

    let today_future_calendar_rows = this.todayCalendarRows.concatCollection( this.futureCalendarRows );
    let mixed_calendar_rows = today_future_calendar_rows.concatCollection( this.olderCalendarRows );

    /**
     * this block doesnt change, we get rid from available employees,
     * whoever is on leave or has worked a night shift the previous day
     * also whoever employee is already assigned, either manually or anyway else, is removed from employees that are available to work today
     */
    let employees = this._augmentEmployees(); //console.log( structuredClone( employees ) );

    /**
     * this is mainly a helper function
     * but among other things it also assigns a number of eligible employees for each shift and sorts the today's rows in an ascending order
     */
    this._augmentCalendarRows( mixed_calendar_rows, this.employees ); //console.log( structuredClone( mixed_calendar_rows ) );

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
    for ( let todayCalendarRow of this.todayCalendarRows ) { //console.log( 'run' );

        if ( todayCalendarRow.isLinkedTargetShift() ) {  //console.log( 'run1' );

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let employeeThatFilledTheSourceShift = this._findEmployeeThatFilledTheSourceShiftUsingTargetShift( todayCalendarRow ); //console.log( structuredClone( employeeThatFilledTheSourceShift ) );

            if ( employeeThatFilledTheSourceShift === null ) { continue; } //console.log( 'run3' ); console.log( structuredClone( todayCalendarRow ) );

            if ( todayCalendarRow._eligibleEmployees.getById( employeeThatFilledTheSourceShift.id ) ) {

                this._fillCalendarRowWithEmployee( employeeThatFilledTheSourceShift, todayCalendarRow );

                this.todayCalendarRows.removeEmployeeFromEligible( employeeThatFilledTheSourceShift.id );

            }

        }

    }




    /**
     * use all employees because the future shifts don’t care who you have available today this calculation needs to be done again now
     * because we used some employees when filling the linked shifts of today
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, mixed_calendar_rows, this.todayCalendarRows.getElement( 0 ).date );




    /**
     * fill future linked targets and linked shifts that are targets
     * assign employee to link target if there is an employee assigned to the source the employee that gets added to a future shift
     * should not be removed from the available employees for today
     */
    for ( let row of this.futureCalendarRows ) {

        if ( row.isLinkedTargetShift() ) {

            if ( row.isManuallySet() ) { continue; }

            if ( row.isFilled() ) { continue; }

            let sourceRow = mixed_calendar_rows.getSourceByTarget( row, this.shifts );

            if ( sourceRow === null ) { continue; }

            if ( sourceRow.isFilled() ) {

                if ( row._eligibleEmployees.getById( sourceRow.employee_id ) !== null ) {

                    row.employee_id = sourceRow.employee_id;
                    row.employee_name = sourceRow.employee_name;

                }

            }

        }

    }




    /**
     * use all employees because the future shifts don’t care who you have available today this calculation needs to be done again now
     * because we used some employees when filling the linked shifts of today
     */
    this._calculate_and_store_eligibility_on_rows( this.employees, mixed_calendar_rows, this.todayCalendarRows.getElement( 0 ).date );




    {

        let toKeep = [];

        for ( let row of this.futureCalendarRows ) {

            if ( row.isLinkedSourceShift() && row.isNightShift() ) {

                toKeep.push( row );

            }

        }

        let future_linked_source_nightshifts = new CalendarCollection( toKeep );

        future_linked_source_nightshifts.sortByEligibleEmployeesAsc();

        while ( future_linked_source_nightshifts.length > 0 ) {

            let assignedEmployee = this._assign_hard_shift( future_linked_source_nightshifts.getElement( 0 ) );

            if ( assignedEmployee !== null ) {

                future_linked_source_nightshifts.getElement( 0 ).employee_id = assignedEmployee.id;
                future_linked_source_nightshifts.getElement( 0 ).employee_name = assignedEmployee.getFullname();

                future_linked_source_nightshifts.removeEmployeeFromEligible( assignedEmployee.id );

            }

            future_linked_source_nightshifts.removeById( future_linked_source_nightshifts.getElement( 0 ).id );

            future_linked_source_nightshifts.sortByEligibleEmployeesAsc();

        }

    }

    for ( let row of this.futureCalendarRows ) {

        if ( row.isLinkedTargetShift() ) {

            if ( row.isManuallySet() ) { continue; }

            if ( row.isFilled() ) { continue; }

            let sourceRow = mixed_calendar_rows.getSourceByTarget( row, this.shifts );

            if ( sourceRow === null ) { continue; }

            if ( sourceRow.isFilled() ) {

                if ( row._eligibleEmployees.getById( sourceRow.employee_id ) !== null ) {

                    row.employee_id = sourceRow.employee_id;
                    row.employee_name = sourceRow.employee_name;

                }

            }

        }

    }




    // 10
    this._autofill_future_nightshifts( this.employees, mixed_calendar_rows );




    // 11
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
    {

        let today_necessary_night_shift_rows_keep = []

        for ( let row of this.todayCalendarRows ) {

            if ( row.isNecessary() && row.isNightShift() && row.isNotFilled() && row.isPondSlave() === false ) {

                today_necessary_night_shift_rows_keep.push( row );

            }

        }

        let today_necessary_night_shift_rows = new CalendarCollection( today_necessary_night_shift_rows_keep );

        this._calculate_and_store_eligibility_on_rows( this.employees, today_necessary_night_shift_rows, this.todayCalendarRows.getElement( 0 ).date );

        today_necessary_night_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_necessary_night_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_necessary_night_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._fillCalendarRowWithEmployee( employee_to_fill_row, today_necessary_night_shift_rows.getElement( 0 ) );

            today_necessary_night_shift_rows.removeById( today_necessary_night_shift_rows.getElement( 0 ).id );

            for ( let row of today_necessary_night_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_necessary_night_shift_rows.sortByEligibleEmployeesAsc();

        }

    }




    /**
     * BLOCK 5: fill necessay shifts
     * FOR every row in the calendar rows for this day
     *  IF this row is necessary AND NOT night
     *      IF today's shift has been manually set, move on to the next calendar row
     *      IF today's shift is somehow else filled, move on to the next calendar row
     *      IF today's shift is a pond slave shift, move on to the next calendar row
     *      find employees that are available today and eligible to fill this role
     *      IF noone is found, move on to the next calendar row
     *      plainly select the first random employee to fill this today's shift
     *      fill this calendar row with this employee
     *      remove this employee from the available employees we have for filling today's shifts
     */
    {

        let today_necessary_shift_rows_keep = []

        for ( let row of this.todayCalendarRows ) {

            if ( row.id === 48668 ) {

                console.log( structuredClone( row ) );
                console.log( structuredClone( row.isNecessary() ) );
                console.log( structuredClone( row.isNightShift() ) );
                console.log( structuredClone( row.isNotFilled() ) );
                console.log( structuredClone( row.isPondSlave() ) );

            }

            if ( row.isNecessary() && row.isNightShift() === false && row.isNotFilled() && row.isPondSlave() === false ) {

                today_necessary_shift_rows_keep.push( row );

            }

        }

        let today_necessary_shift_rows = new CalendarCollection( today_necessary_shift_rows_keep );

        let custom = today_necessary_shift_rows.getById( '48668' ); console.log( structuredClone( custom ) );

        this._calculate_and_store_eligibility_on_rows( this.employees, today_necessary_shift_rows, this.todayCalendarRows.getElement( 0 ).date );

        today_necessary_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_necessary_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_necessary_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._fillCalendarRowWithEmployee( employee_to_fill_row, today_necessary_shift_rows.getElement( 0 ) );

            today_necessary_shift_rows.removeById( today_necessary_shift_rows.getElement( 0 ).id );

            for ( let row of today_necessary_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_necessary_shift_rows.sortByEligibleEmployeesAsc();

        }

    }




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

            if ( todayCalendarRow.isManuallySet() ) { continue; }

            if ( todayCalendarRow.isFilled() ) { continue; }

            let todayMasterCalendarRow = this._findMasterCalendarRowBySlaveCalendarRow( todayCalendarRow );

            if ( todayMasterCalendarRow === null ) { continue; }

            if ( todayMasterCalendarRow.isFilled() === false ) { continue; }

            let employeeThatFilledTheMasterCalendarRow = this.employees.getById( todayMasterCalendarRow.employee_id );

            this._fillCalendarRowWithEmployee( employeeThatFilledTheMasterCalendarRow, todayCalendarRow );

        }

    }




    // 13
    /**
     * BLOCK 7: fill unnecessary pond master shifts
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
    {

        let today_unnecessary_pond_master_shift_rows_keep = []

        for ( let row of this.todayCalendarRows ) {

            if ( row.isUnnecessary() && row.isNotFilled() && row.isPondMaster() ) {

                today_unnecessary_pond_master_shift_rows_keep.push( row );

            }

        }

        let today_unnecessary_pond_master_shift_rows = new CalendarCollection( today_unnecessary_pond_master_shift_rows_keep );

        this._calculate_and_store_eligibility_on_rows( this.employees, today_unnecessary_pond_master_shift_rows, this.todayCalendarRows.getElement( 0 ).date );

        today_unnecessary_pond_master_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_unnecessary_pond_master_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_unnecessary_pond_master_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._fillCalendarRowWithEmployee( employee_to_fill_row, today_unnecessary_pond_master_shift_rows.getElement( 0 ) );

            today_unnecessary_pond_master_shift_rows.removeById( today_unnecessary_pond_master_shift_rows.getElement( 0 ).id );

            for ( let row of today_unnecessary_pond_master_shift_rows ) {

                if ( employee_to_fill_row === null ) { break; }

                row._eligibleEmployees.removeById( employee_to_fill_row.id );

            }

            today_unnecessary_pond_master_shift_rows.sortByEligibleEmployeesAsc();

        }

    }




    // 14
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

    // 15
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
    {

        let today_unnecessary_shift_rows_keep = [];

        for ( let row of this.todayCalendarRows ) {

            if ( row.isUnnecessary() && row.isNotFilled() ) {

                today_unnecessary_shift_rows_keep.push( row );

            }

        }

        let today_unnecessary_shift_rows = new CalendarCollection( today_unnecessary_shift_rows_keep );

        this._calculate_and_store_eligibility_on_rows( this.employees, today_unnecessary_shift_rows, this.todayCalendarRows.getElement( 0 ).date );

        today_unnecessary_shift_rows.sortByEligibleEmployeesAsc();

        while ( today_unnecessary_shift_rows.length > 0 ) {

            let employee_to_fill_row = this._assign_employee( today_unnecessary_shift_rows.getElement( 0 ), this.futureCalendarRows );

            this._fillCalendarRowWithEmployee( employee_to_fill_row, today_unnecessary_shift_rows.getElement( 0 ) );

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