document.addEventListener('DOMContentLoaded', function() {
  let calendarEl = document.getElementById('calendar');
  let doctor_id = document.getElementById('doctor').value;
  console.log(doctor_id);
  let event = JSON.parse(document.getElementById('event').value);
  console.log(event);
  let eventArray = event;
  let eArray = [
      {
        title: 'All Day Event',
        start: '2019-11-01'
      },
      {
        title: 'Long Event',
        start: '2019-11-07',
        end: '2019-11-10'
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        start: '2019-11-09T16:00:00'
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        start: '2019-11-16T16:00:00'
      },
      {
        title: 'Conference',
        start: '2019-11-11',
        end: '2019-11-13'
      },
      {
        title: 'Meeting',
        start: '2019-11-12T10:30:00',
        end: '2019-11-12T12:30:00'
      },
      {
        title: 'Lunch',
        start: '2019-11-12T12:00:00'
      },
      {
        title: 'Meeting',
        start: '2019-11-12T14:30:00'
      },
      {
        title: 'Birthday Party',
        start: '2019-11-13T07:00:00'
      },
      {
        title: 'Click for Google',
        url: 'http://google.com/',
        start: '2019-11-28'
      }
    ];
  let calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ 'interaction', 'timeGrid' ],
    header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
    },
    editable:true,
    overlap:false,
    selectable: true,
    selectHelper: true,
    weekends:false,
    minTime:'08:00:00',
    maxTime: '18:00:00',
select: function(info){
          let title = prompt('Name your appointment');
          let chief_complaint = prompt('Chief_complaint');
          let dateStart = new Date(info.startStr);
          let dateEnd = new Date(info.endStr)
          if (!isNaN(title.valueOf()) && !isNaN(chief_complaint.valueOf())) { // valid?
            document.getElementById('submitAppointment').setAttribute("display", "block");
            let newEvent = {
              doctor:doctor,
              title: title,
              start: dateStart,
              end: dateEnd,
              chief_complaint: chief_complaint,
            };
            eventArray.push(newEvent);
            calendar.addEvent(newEvent);
            alert('Great. Now, update your database...');
          } else {
            alert('Invalid date.');
          }
    console.log(eventArray);
    let submit = document.getElementById('submitAppointment').addEventListener("click", function(){
      let req = new XMLHttpRequest();
      req.open('POST','/update-appointment',true);
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      req.send('eventArray='+JSON.stringify(eventArray)+'&doctor_id='+doctor_id);
    });
    },
    events: eventArray,
  });

  calendar.render();
  console.log(eventArray);

});