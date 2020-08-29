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
  // focus on element
  dateInput.trigger("focus");
})

// convert date back when out of focus
$(".list-group").on("blur", "input[type='text']", function(){
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


