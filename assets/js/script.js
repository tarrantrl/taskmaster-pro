var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function(taskEl){
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // convert to moment object at 5pm
  var time = moment(date, "L").set("hour", 17);
  // remove any old classes
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // apply new class if task is near/over due date
  if (moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time,"days")) <= 2){
    $(taskEl.addClass("list-group-item-warning"));
  }
  
}

// edit task on click of task ul
$(".list-group").on("click", "p", function(){
  // get the text from the clicked task
  var text = $(this).text().trim();
  // create a textarea element containing the current text in the task
  var textInput = $("<textarea>").addClass("form-control").val(text);
  // replace p with textarea to edit task
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
})

// save edits to task after task is out of focus
$(".list-group").on("blur", "textarea", function(){
  // get textarea val
  var text = $(this).val().trim();
  // get parent ul's id
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // get the task's position in the list
  var index = $(this).closest(".list-group-item").index();
  // update tasks array
  tasks[status][index].text = text;
  saveTasks();
  // recreate p element to replace textarea
  var taskP = $("<p>").addClass("m-1").text(text);
  // replace textarea with p
  $(this).replaceWith(taskP);
})

// due date click event delegation
$(".list-group").on("click", "span", function(){
  // get current text
  var date = $(this).text().trim();
  // create new input element with current date in it
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  // swap elements
  $(this).replaceWith(dateInput);
  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      // when calendar is closed, force a change event
      $(this).trigger("change");
    }
  });
  // focus on element
  dateInput.trigger("focus");
})

// convert date back to text on change
$(".list-group").on("change", "input[type='text']", function(){
  // get current date in input
  var date = $(this).val().trim();
  // get the parent ul id
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // get task position
  var index = $(this).closest(".list-group-item").index();
  // update task array
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element to replace input
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  // replace input with span
  $(this).replaceWith(taskSpan);
  // pass task's li to auditTask to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
})

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


// make list items draggable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  // triggers once for all connected lists as soon as dragging starts
  activate: function(event){
    //console.log("activate", this);
  },
  // triggers once for all connected lists as soon as dragging stops
  deactivate: function(event){
    //console.log("deactivate", this);
  },
  // triggers when a dragged item enters a connected list
  over: function(event){
    //console.log("over", event.target);
  },
  // triggers when a dragged item leaves a connected list
  out: function(event){
    //console.log("out", event.target);
  },
  // triggers when the contents of a list have changes (items reordered, removed, or added)
  update: function(event){
    //console.log("update", this);
    // children() returns an array of the list element's children, li elements labeled li.list-group-item
    // array to store task data in
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function(){
      var text = $(this).find("p").text().trim();
      var date = $(this).find("span").text().trim();
      //console.log(text, date);
      // add task data to temporary array as object
      tempArr.push({text: text, date: date});
    });
    //console.log(tempArr);
    // trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// make it so tasks can be trashed by dragging into trash zone
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    //console.log("drop");
    // ui contains an object called draggable representing the draggable element
    // remove the draggable element from the DOM
    ui.draggable.remove()
    // removing a task from a list triggers the update function, so we don't need to call saveTasks() again
  },
  over: function(event, ui){
    //console.log("over");
  },
  out: function(event, ui){
    //console.log("out");
  },
});

// add date picker
$("#modalDueDate").datepicker({
  minDate: 1
});