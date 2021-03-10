const isWeb = typeof window != 'undefined';

class CalendarEvent{
    constructor(){}
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
            this.events.push();
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
        // Ignore if is sunday
        if(this.getDay()==0) return this.getNext().getWeek();
        let week = new CalendarWeek();
        let day  = this.clone();
        // Get previous days
        while(day.getDay()<=0){
            week.addDay(day);
            day = day.getPrevious();
        }
        week.addDay(day);
        // Get rest of week
        while(day.getDay()!=6){
            day = day.getNext();
            week.addDay(day);
        }
        return week;
    }


    getMonth(month, direction=1){
        if(month<0 || month>11 || direction!=1 || direction!=-1) return;
        let month = this.getWeek().getMonth();
        if(month==undefined) return this.getWeek().getMonth();
        if(direction = 1){
            while(month.month != month) month = month.getNext();
            return month;
        }
        if(direction = -1){
            while(month.month != month) month = month.getPrevious();
            return month;
        }
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
        let dom = Object.assign(document.createElement('div'), {
            className: 'calendar-monthview-cell',
            innerHTML: this.getDate()
        });
        if(new Date().toLocaleDateString() === this.toLocaleDateString()) dom.classList.add('today');
        return dom;
    }

}

class CalendarWeek extends Array{
    /**
     * @type {Set}
     */
    months = new Set();
    constructor(){
        super(7);
        this.months = new Set();
    }
    /**
     * Dass day to specified index
     * @param {Number} index Number of day of week (0 is Sunday)
     * @param {CalendarDay} day Day object
     */
    addDay(day){
        this[day.getDay()] = day;
        this.months.add( day.getMonth() );
    }
    /**
     * Clones this object
     * @returns {WeekCalendar}
     */
    clone(){
        let week = new CalendarWeek();
        this.forEach((day, index)=>{
            week[index] = day.clone(); 
        });
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
    /**
     * Return rest of weeks in this month
     * @returns {CalendarMonth}
     */
    getMonth(){
        let month = new CalendarMonth();
        let week = this.clone();
        while( week.isSameMonth( this.months ) ){
            week = week.getPrevious();
        }
        week = week.getNext();
        while( week.isSameMonth( this.months ) ){
            month.push(week);
            week = week.getNext();
        }
        
        month.month = [...week.getPrevious().months][0];
        return month;
    }

    renderWeekView(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('div'), {className: 'calendar-weekview'});
        dom.append( ...this.map(day=>day.renderWeekViewColumn()) );
        return dom;
    }

    renderMonthViewRow(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('div'), {className: 'calendar-monthview-row'});
        dom.append( ...this.map(day=>day.renderMonthViewCell()) );
    }

}

class CalendarMonth extends Array{
    month;
    constructor(month){
        super();
        this.month = month;
    }
    clone(){
        let month = new CalendarMonth();
        this.forEach(week=>{
            month.push(week.clone())
        })
        return month;
    }
    getPrevious(){
        return this[0][0].getPrevious().getWeek().getMonth();
    }
    getNext(){
        return this[this.length-1][6].getNext().getWeek().getMonth();
    }

    renderMonthView(){
        if(!isWeb) return;
        let dom = Object.assign(document.createElement('div'), {className: 'calendar-monthview'});
        dom.append( ...this.map(week=>week.renderMonthViewRow()) )
    }



}
