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
RosterEngine.prototype._allocateEmployeeToTodayShift = function( employee, calendarRow ) {

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
 * @param {DB_Calendar} calendarRow 
 * @returns {DB_Calendar|null}
 * @description for a calendar row, checks its shift_id, and if the shift belongs to a pond,
 *      tries to find the pond master shift, and then tries to find the master calendar row in a subset of calendar rows.
 *      if the given calendar row, and the deduced master calendar row are the same, also return null
 */
RosterEngine.prototype._getPondMasterShift = function( calendarRow ) {

    var pondNode = this.shiftPonds.getPondByShiftId( calendarRow.shift_id );

    if ( pondNode === null ) {

        return null;

    }

    var masterShiftId = this.shiftPonds.getMasterShiftIdForPondId( pondNode.pond_id );

    if ( masterShiftId === null ) {

        return null;

    }

    var masterCalendarRow = this.todayCalendarRows.getByShiftId( masterShiftId );

    if ( masterCalendarRow.id === calendarRow.id ) {

        return null;

    }

    return masterCalendarRow;

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
 * @param {CalendarCollection} calendarRows 
 * @returns {void}
 */
RosterEngine.prototype._applyShiftPondRulesToAllTodayCalendarRows = function ( calendarRows ) {

    var row;
    var pond;

    for ( row of calendarRows ) {

        if ( row.shift_id !== null ) {

            pond = this.shiftPonds.getPondByShiftId( row.shift_id );

            if ( pond !== null ) {

                row._shiftPond_id = pond.id;
                row._shiftPond_pond_id = pond.pond_id;
                row._shiftPond_shift_id = pond.shift_id;

            }

        }

    }


    var groups = {};
    var pondId;

    for ( row of calendarRows ) {

        if ( row._shiftPond_pond_id === undefined || row._shiftPond_pond_id === null ) {

            row._shiftPond_slave = null;
            row._shiftPond_master = null;

        }
        else {

            pondId = row._shiftPond_pond_id;

            if ( groups[ pondId ] === undefined ) {

                groups[ pondId ] = [];

            }

            groups[ pondId ].push( row );

        }

    }


    var group;
    var minIdRow;
    var i;

    for ( pondId in groups ) {

        group = groups[ pondId ];
        minIdRow = null;

        for ( i = 0; i < group.length; i += 1 ) {

            if ( minIdRow === null ) {

                minIdRow = group[ i ];

            }
            else {

                if ( group[ i ]._shiftPond_id < minIdRow._shiftPond_id ) {

                    minIdRow = group[ i ];

                }

            }

        }


        for ( i = 0; i < group.length; i += 1 ) {

            if ( group[ i ] === minIdRow ) {

                group[ i ]._shiftPond_slave = false;
                group[ i ]._shiftPond_master = true;

            }
            else {

                group[ i ]._shiftPond_slave = true;
                group[ i ]._shiftPond_master = false;

            }

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




RosterEngine.prototype.calculate = function() {

    /**
     * first, keep in the entire scope, only the employees that are not in any kind of leave for today
     */
    let employees = this._removeEmployeesWhoAreOnLeaveToday();

    /**
     * then remove every employee that the day before filled a night shift: 21:00-07:00.
     * this is not a dayoff, it's just an internal rule they have and doesnt count as day off
     */
    this._removeEmployeesThatHadANightShiftTheDayBefore( employees );

    /**
     * iterate over all today calendar rows, and apply shift pond rules, for easier iteration later
     */
    this._applyShiftPondRulesToAllTodayCalendarRows( this.todayCalendarRows );

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

        /**
         * If this shift belongs to a pond and is not the master of that pond, there is no point in trying to fill it at this point.
         * Lets fill the other shifts first, necessary or not, and then if there are leftover employees we fill it with them,
         * otherwise we fill it with the employee that filled the master pond shift, if any
         */
        if ( todayCalendarRow.isAPondSlaveShift() === true ) { continue; }

        if ( todayCalendarRow.is_necessary === 1 ) {

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case, move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( todayCalendarRow.is_manually_set === 1 ) { continue; }

            /**
             * this one takes a calendar row, and determines from its role_id, the role row, and from there using both junction tables,
             * determines which employees, from a given subset of employees given, are associated and available for this role
             * and this calendar row specifically
             */
            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

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

        /**
         * If this shift belongs to a pond and is not the master of that pond, there is no point in trying to fill it at this point.
         * Lets fill the other shifts first, necessary or not, and then if there are leftover employees we fill it with them,
         * otherwise we fill it with the employee that filled the master pond shift, if any
         */
        if ( todayCalendarRow.isAPondSlaveShift() === true ) { continue; }

        if ( todayCalendarRow.is_necessary !== 1 ) {

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( todayCalendarRow.is_manually_set === 1 ) { continue; }

            /**
             * this one takes a calendar row, and determines from its role_id, the role row, and from there using both junction tables,
             * determines which employees, from a given subset of employees given, are associated and available for this role
             * and this calendar row specifically
             */
            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

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

    /**
     * final iteration over shifts that have been previously marked as pond slaves
     */
    for ( let todayCalendarRow of this.todayCalendarRows ) {

        if ( todayCalendarRow.isAPondSlaveShift() === true ) {

            /**
             * this one takes a calendar row, and determines from its role_id, the role row, and from there using both junction tables,
             * determines which employees, from a given subset of employees given, are associated and available for this role
             * and this calendar row specifically
             */
            let associatedEmployees = this._getAssociatedEmployeesForCalendarRow( todayCalendarRow, employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             * or that all employees have been assigned to the previous iterations
             * In this scenario, attempt to find the pond master shift for this day, and if there is, and if it's filled, fill with the same employee that filled the master pond calendar row
             * in any case if no appropriate associated employees are found at this stage, this is a hail mary, so after this bail this calendar row completely
             */
            if ( associatedEmployees === null ) {

                let masterCalendarRow = this._getPondMasterShift( todayCalendarRow );

                if ( masterCalendarRow !== null ) {

                    if ( masterCalendarRow.employee_id !== null ) {

                        let employeeToAssign = this.employees.getById( masterCalendarRow.employee_id );
                        this._allocateEmployeeToTodayShift( employeeToAssign, todayCalendarRow );

                    }

                }

                continue;

            }

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
    console.log( this.shiftPonds );
    console.log( this.todayCalendarRows );

};