document.addEventListener('DOMContentLoaded', function() {
  let calendarEl = document.getElementById('calendar');
  let doctor_id = document.getElementById('doctor').value;
  let event = JSON.parse(document.getElementById('event').value);
  let eventArray = event;
  let newEvent = {};
  let dateStart;
  let dateEnd;
  let calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ 'interaction', 'timeGrid' ],
    header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
    },
    editable:true,
    selectable: true,
    selectHelper: true,
    weekends:false,
    minTime:'08:00:00',
    maxTime: '18:00:00',
select: function(info){
    document.getElementById("modal-text").style.display="block";
    dateStart = new Date(info.startStr);
    dateEnd = new Date(info.endStr)
    },
    events: eventArray,
  });

  const cancle = document.getElementsByClassName("close")[0];
  cancle.addEventListener("click",function(){
    const block = document.getElementById("modal-text");
    block.style.display = "none";
  });
  const make_app = document.getElementById("create-app");
  make_app.addEventListener("click",function(){
    let title =  document.getElementById("question-title").value.trim()
    let chief_complaint =  document.getElementById("question-chief_complaint").value.trim()
  if (title.valueOf() && chief_complaint.valueOf()) { // valid?
    newEvent = {
      doctor:doctor,
      title: title,
      start: dateStart,
      end: dateEnd,
      chief_complaint: chief_complaint,
      overlap:false,
    };
    calendar.addEvent(newEvent);
    alert('Great. Now, update your database...');
    let req = new XMLHttpRequest();
    req.open('POST','/update-appointment',true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    req.send('newEvent='+JSON.stringify(newEvent)+'&doctor_id='+doctor_id);
  } else {
    alert('Invalid date.');
  }
  document.getElementById("modal-text").style.display = "none";

  });
    console.log(eventArray);

  calendar.render();
  console.log(eventArray);

});