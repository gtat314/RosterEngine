function RosterEngine() {

    /**
     * @property
     * @public
     * @type {CalendarCollection}
     */
    this.calendar = null;

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

};

/**
 * @method
 * @public
 * @param {Object} calendar 
 */
RosterEngine.prototype.set_calendar = function( calendar ) {

    this.calendar = new CalendarCollection( calendar );

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




RosterEngine.prototype.calculate = function() {

    /**
     * first iterate over all available shifts for today, that are marked as necessary, meaning they have a slots_min value of non zero
     */
    for ( var input of this.inputs ) {

        var db_calendarRow = input.calendar;

        if ( db_calendarRow.is_necessary === 1 ) {

            this.calendarView.progressModal.stepUp();

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case, remove the employee from the available employees we have to assign for this day
             * And move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( db_calendarRow.is_manually_set === 1 ) {

                this.employees.removeById( db_calendarRow.employee_id );

                continue;

            }

            /**
             * load the role data from the role table, using the role_id of the calendar row
             */
            var db_role = this.roles.getById( db_calendarRow.role_id );

            /**
             * load the pools that can accomodate this role, sorted by their sort_index in ascending order
             */
            var pools = this.junctionRolePool.getPoolsForRoleId( db_role.id, this.pools );

            /**
             * If no pools found for this role, no employee can be assigned,
             * so there is no reason to waste any more time with this shift
             */
            if ( pools === null ) {

                continue;

            }

            /**
             * load all employees with their data from the employees table, that belong to the pools we deduced previously
             */
            var employees = this.junctionEmployeePool.getUniqueEmployeesInPools( pools, this.employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             */
            if ( employees === null ) {

                continue;

            }

            /**
             * For all the employees deduced above, check which one of them is not on leave this day and keep only those
             */
            var employeesNotOnLeaveThisDay = employees.getWithoutLeaveForDate( db_calendarRow.date, this.leaves );

            /**
             * if no such employee has been found, it means that all suitable employees for this role for this day, are on leave
             * so there is no reason to waste any more time with this shift
             */
            if ( employeesNotOnLeaveThisDay === null ) {

                continue;

            }

            var selectedEmployee = employeesNotOnLeaveThisDay.getElement( 0 );

            this._allocations.push({
                'id': db_calendarRow.id,
                'employee_id': selectedEmployee.id,
                'employee_name': selectedEmployee.getFullname()
            });

            this.employees.removeById( selectedEmployee.id );

        }

    }

    /**
     * then iterate over all today's shifts working on the ones that are not considered necessary
     */
    for ( var input of this.inputs ) {

        var db_calendarRow = input.calendar;

        if ( db_calendarRow.is_necessary !== 1 ) {

            this.calendarView.progressModal.stepUp();

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case, remove the employee from the available employees we have to assign for this day
             * And move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( db_calendarRow.is_manually_set === 1 ) {

                this.employees.removeById( db_calendarRow.employee_id );

                continue;

            }

            /**
             * load the role data from the role table, using the role_id of the calendar row
             */
            var db_role = this.roles.getById( db_calendarRow.role_id );

            /**
             * load the pools that can accomodate this role, sorted by their sort_index in ascending order
             */
            var pools = this.junctionRolePool.getPoolsForRoleId( db_role.id, this.pools );

            /**
             * If no pools found for this role, no employee can be assigned,
             * so there is no reason to waste any more time with this shift
             */
            if ( pools === null ) {

                continue;

            }

            /**
             * load all employees with their data from the employees table, that belong to the pools we deduced previously
             */
            var employees = this.junctionEmployeePool.getUniqueEmployeesInPools( pools, this.employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             * or that all employees have been assigned to the previously necessary shifts
             */
            if ( employees === null ) {

                continue;

            }

            /**
             * For all the employees deduced above, check which one of them is not on leave this day and keep only those
             */
            var employeesNotOnLeaveThisDay = employees.getWithoutLeaveForDate( db_calendarRow.date, this.leaves );

            /**
             * if no such employee has been found, it means that all suitable employees for this role for this day, are on leave
             * so there is no reason to waste any more time with this shift
             */
            if ( employeesNotOnLeaveThisDay === null ) {

                continue;

            }

            var selectedEmployee = employeesNotOnLeaveThisDay.getElement( 0 );

            this._allocations.push({
                'id': db_calendarRow.id,
                'employee_id': selectedEmployee.id,
                'employee_name': selectedEmployee.getFullname()
            });

            this.employees.removeById( selectedEmployee.id );

        }

    }

    console.log( this._allocations );

};