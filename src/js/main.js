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
     * @type {LinksEmployeePool}
     */
    this.linksEmployeePool = null;

    /**
     * @property
     * @public
     * @type {LinksRolePool}
     */
    this.linksRolePool = null;

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

};

/**
 * @method
 * @public
 * @param {RosterCalendar} rosterCalendar 
 * @returns {void}
 */
RosterEngine.prototype.set_inputs = function( rosterCalendar ) {

    this.inputs = rosterCalendar.getInputs(); console.log( this.inputs.length );

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

    this.linksEmployeePool = new LinksEmployeePool( linksEmployeePool );

};

/**
 * @method
 * @public
 * @param {Object} linksRolePool 
 */
RosterEngine.prototype.set_linksRolePool = function( linksRolePool ) {

    this.linksRolePool = new LinksRolePool( linksRolePool );

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




RosterEngine.prototype.calculate = function() {

    /**
     * first iterate over all available shifts for today, that are marked as necessary, meaning they have a slots_min value of non zero
     */
    for ( var input of this.inputs ) {

        var db_calendarRow = input.calendar;

        if ( db_calendarRow.is_necessary === 1 ) {

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case, remove the employee from the available employees we have to assign for this day
             * And move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( db_calendarRow.is_manually_set === 1 ) {

                this.employees.removeById( db_calendarRow.employee_id );

                this.calendarView.progressModal.stepUp();

                continue;

            }

            /**
             * load the role data from the role table, using the role_id of the calendar row
             */
            var db_role = this.roles.getById( db_calendarRow.role_id );

            /**
             * load the pools that can accomodate this role, sorted by their sort_index in ascending order
             */
            var pools = this.linksRolePool.getPoolsForRoleId( db_role.id, this.pools );

            /**
             * If no pools found for this role, no employee can be assigned,
             * so there is no reason to waste any more time with this shift
             */
            if ( pools === null ) {

                this.calendarView.progressModal.stepUp();

                continue;

            }

            /**
             * load all employees with their data from the employees table, that belong to the pools we deduced previously
             */
            var employees = this.linksEmployeePool.getUniqueEmployeesInPools( pools, this.employees ); console.log( employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             */
            if ( employees === null ) {

                this.calendarView.progressModal.stepUp();

                continue;

            }

        }

    }

    /**
     * then iterate over all today's shifts working on the ones that are not considered necessary
     */
    for ( var input of this.inputs ) {

        var db_calendarRow = input.calendar;

        if ( db_calendarRow.is_necessary !== 1 ) {

            /**
             * First check if someone manually assigned beforehand an employee to this shift
             * In this case, remove the employee from the available employees we have to assign for this day
             * And move on to the next shift, since there is no reason to waste any more time with this one
             */
            if ( db_calendarRow.is_manually_set === 1 ) {

                this.employees.removeById( db_calendarRow.employee_id );

                this.calendarView.progressModal.stepUp();

                continue;

            }

            /**
             * load the role data from the role table, using the role_id of the calendar row
             */
            var db_role = this.roles.getById( db_calendarRow.role_id );

            /**
             * load the pools that can accomodate this role, sorted by their sort_index in ascending order
             */
            var pools = this.linksRolePool.getPoolsForRoleId( db_role.id, this.pools );

            /**
             * If no pools found for this role, no employee can be assigned,
             * so there is no reason to waste any more time with this shift
             */
            if ( pools === null ) {

                this.calendarView.progressModal.stepUp();

                continue;

            }

            /**
             * load all employees with their data from the employees table, that belong to the pools we deduced previously
             */
            var employees = this.linksEmployeePool.getUniqueEmployeesInPools( pools, this.employees ); console.log( employees );

            /**
             * if no such employee has been found, it means that either these pools are still empty of employees
             * or that the employees of these pools have already been manually assigned beforehand unbeknownst to us
             * or that all employees have been assigned to the previously necessary shifts
             */
            if ( employees === null ) {

                this.calendarView.progressModal.stepUp();

                continue;

            }

        }

    }

};