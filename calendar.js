const isWeb = typeof window != 'undefined';

class CalendarEvent{
    title;
    constructor(title, options){
        this.title = title;
    }
    render(){
        if(!isWeb) return;
    }
}

class CalendarDay extends Date{
    /**
     * @type {Array<CalendarEvent>}
     */
    events=[];
    constructor(...props){
        super(...props);
    }
    /**
     * Adds events to given date
     * @param  {...CalendarEvent} events Events
     */
    addEvents(...events){
        for(let event of events){
            this.events.push(event);
        }
    }
    /**
     * Sets the time, ignores hours
     */
    setTime(props){
        super.setTime(props);
        this.setUTCHours(0, 0, 0, 0);
    }
    /**
     * Clones this object
     * @returns {CalendarDay}
     */
    clone(){
        let d = new CalendarDay()
        d.setTime(this.getTime());
        d.events = this.events;
        return d;
    }
    /**
     * Get next day
     * @returns {CalendarDay}
     */
    getNext(){
        let d = new CalendarDay();
        d.setTime(this.getTime()+(1000 * 60 * 60 * 24));
        return d;
    }
    /**
     * Get previous day
     * @returns {CalendarDay}
     */
    getPrevious(){
        let d = new CalendarDay();
        d.setTime(this.getTime()-(1000 * 60 * 60 * 24));
        return d;
    }
    /**
     * Returns all days of current week
     * @returns {WeekCalendar}
     */
    getWeek(){
        if(this.getDay() == 0) return this.getNext().getWeek();
        let week = new CalendarWeek();
        let day = this.clone();
        // Go to start
        while(day.getDay()!=0){
            week.push(day);
            day = day.getPrevious();
        }
        week.push(day)
        // Get test of days
        while(day.getDay()!=6){
            day = day.getNext();
            week.push(day);
        }
        return week;
    }

    is(day){
        return this.toISOString() == new Date(day).toISOString();
    }

    /**
     * Renders day in weekview
     * @returns {HTMLElement}
     */
    renderWeekViewColumn(){
        if(!isWeb) return;
        let dom = Object.assign( document.createElement('div'), {className: 'calendar-weekview-day'});
        let header = Object.assign(document.createElement('div'), {className: 'calendar-weekview-day-header'});
            header.append(
                Object.assign(document.createElement('p'), {
                    innerText: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][this.getDay()]
                }),
                Object.assign(document.createElement('p'), {
                    innerText: this.toLocaleDateString()
                })
            );
        let events = Object.assign(document.createElement('div'), {className: 'calendar-weekview-day-events'});
        events.append(...this.events.map(e=>e.render()));
        dom.append(header, events);
        if(new Date().toLocaleDateString() === this.toLocaleDateString()) dom.classList.add('today');
        return dom;
    }

    renderMonthViewCell(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('td'), {
            className: 'calendar-monthview-cell',
            innerHTML: this.getDate()
        });
        if(this.events.length!=0) dom.classList.add('event')

        if(new Date().toLocaleDateString() === this.toLocaleDateString()) dom.classList.add('today');
        return dom;
    }

}

class CalendarWeek extends Array{
    /**
     * @type {Set}
     */
    months;
    years;
    constructor(){
        super(7);
        this.months = new Set();
        this.years = new Set();
    }
    /**
     * Dass day to specified index
     * @param {Number} index Number of day of week (0 is Sunday)
     * @param {CalendarDay} day Day object
     */
    push(day){
        this[day.getDay()] = day;
        this.months.add(day.getMonth())
        this.years.add(day.getFullYear())
    }
    /**
     * Clones this object
     * @returns {WeekCalendar}
     */
    clone(){
        let week = new CalendarWeek();
        this.forEach(day=>{week.push(day)});
        return week;
    }
    /**
     * Get previous week
     * @returns {WeekCalendar}
     */
    getPrevious(){
        return this[0].getPrevious().getWeek();
    }
    /**
     * Get next week
     * @returns {WeekCalendar}
     */
    getNext(){
        return this[this.length-1].getNext().getWeek();
    }
    /**
     * Determines if months coincide
     * @param {Set} months Months
     * @returns {Boolean}
     */
    isSameMonth(months){
        return [...months].some( month => this.months.has(month) );
    }
    getMonth(){
        if([...this.months].length==2) return this.getNext().getMonth();
        let month = new CalendarMonth();
        let week = this.clone();
        while( week.isSameMonth(this.months) ){
            week = week.getPrevious();
        }
        week = week.getNext();
        while( week.isSameMonth(this.months) ){
            month.push(week);
            week = week.getNext();
        }
        return month;

    }

    findDay(day){
        let res = this.find(d=>d.is(day))
        return res
    }

    renderWeekView(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('div'), {className: 'calendar-weekview'});
        dom.append( ...this.map(day=>day.renderWeekViewColumn()) );
        return dom;
    }

    renderMonthViewRow(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('tr'), {className: 'calendar-monthview-row'});
        dom.append( ...this.map(day=>day.renderMonthViewCell()) );
        return dom;
    }

}

class CalendarMonth extends Array{
    month;
    year;
    constructor(){
        super();
    }
    clone(){
        let month = new CalendarMonth();
        this.forEach(week=>{
            month.push(week.clone())
        })
        month.month = this.month;
        return month;
    }


    push(week){
        super.push(week);
        let weekMonths = [...week.months];
        let weekYears = [...week.years];
        if(weekMonths.length == 1){
            this.month = weekMonths[0]
            this.year = weekYears[0];
        }
    }

    getPrevious(){
        return this[0].getPrevious().getMonth();
    }
    getNext(){
        return this[this.length-1].getNext().getMonth();
    }

    getYear(){
        let year = new CalendarYear();
        let month = this.clone();
        while(month.month>=1){
            month = month.getPrevious();
        }
        while(month.month<11){
            year.push(month);
            month = month.getNext();
        } 
        year.push(month);
        return year;
    }

    findDay(day){
        let res = this.find(week=>week.findDay(day));
        return res?.findDay(day)
    }

    renderMonthView(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('table'), {className: 'calendar-monthview'});
        let th = Object.assign(document.createElement('th'), {
            colSpan: 7,
            innerHTML: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][this.month] + ' ' + this.year
        })
        dom.append(th)
        dom.append( ...this.map(week=>week.renderMonthViewRow()) )
        return dom;
    }
}

class CalendarYear extends Array {
    constructor(){
        super(12);
    }
    getPrevious(){
        return this[0].getPrevious().getYear();
    }
    getNext(){
        return this[this.length-1].getNext().getYear();
    }
    push(month){
        this[ month.month ] = month;
        this.year = month.year;
    }

    findDay(day){
        let res = this.find( month => month.findDay(day) )
        return res?.findDay(day);
    }

    renderYearView(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('table'), {className: 'calendar-yearview'});
        dom.append( ...this.map(month=>month.renderMonthView()) );
        return dom;
    }

}
